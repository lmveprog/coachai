"""
Judge Service — Exécution isolée de code et évaluation de soumissions.

Chaque soumission tourne dans un container Docker éphémère avec :
- Réseau désactivé (--network none)
- Limite CPU et mémoire stricte
- Timeout d'exécution
- Filesystem read-only (sauf /tmp)
"""
import asyncio
import json
import os
import tempfile
import threading
import time
from enum import Enum
from typing import Optional

import docker
import redis.asyncio as aioredis
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel

JUDGE_SECRET = os.getenv("JUDGE_SECRET", "judge_internal_secret")
REDIS_URL = os.getenv("REDIS_URL", "redis://:redis_dev@redis:6379/0")

app = FastAPI(title="CoachAI Judge", version="0.3.0")
# Use a long timeout so container.wait() never hits the HTTP socket timeout
docker_client = docker.DockerClient(base_url="unix://var/run/docker.sock", timeout=300)


class Language(str, Enum):
    PYTHON = "python"
    SQL = "sql"
    R = "r"


class TestCase(BaseModel):
    input_data: Optional[str] = None
    expected_output: Optional[str] = None
    points: int = 10


class JudgeRequest(BaseModel):
    submission_id: str
    language: Language
    code: str
    challenge_id: str
    time_limit_seconds: int = 30
    memory_limit_mb: int = 512
    test_cases: list[TestCase] = []
    evaluation_config: dict = {}


class TestCaseResult(BaseModel):
    passed: bool
    points: int
    expected: str = ""
    got: str = ""
    error: str = ""


class JudgeResult(BaseModel):
    submission_id: str
    status: str
    score: float = 0.0
    stdout: str = ""
    stderr: str = ""
    execution_time_ms: int = 0
    memory_used_mb: float = 0.0
    test_case_results: list[TestCaseResult] = []


LANGUAGE_IMAGES = {
    Language.PYTHON: "coachai-sandbox-python:latest",
    Language.SQL: "coachai-sandbox-sql:latest",
    Language.R: "coachai-sandbox-r:latest",
}

LANGUAGE_FILE_EXT = {
    Language.PYTHON: ".py",
    Language.SQL: ".sql",
    Language.R: ".r",
}

LANGUAGE_COMMANDS = {
    Language.PYTHON: "python /code/solution.py",
    Language.SQL: "python /usr/local/bin/sql_runner.py /code/solution.sql",
    Language.R: "Rscript /code/solution.r",
}


def _check_secret(x_judge_secret: str):
    if x_judge_secret != JUDGE_SECRET:
        raise HTTPException(status_code=403, detail="Invalid judge secret")


@app.get("/health")
async def health():
    try:
        docker_client.ping()
        docker_ok = True
    except Exception:
        docker_ok = False
    return {"status": "ok" if docker_ok else "degraded", "docker": docker_ok}


@app.post("/judge", response_model=JudgeResult)
async def judge_submission(
    request: JudgeRequest,
    x_judge_secret: str = Header(...),
):
    _check_secret(x_judge_secret)

    image = LANGUAGE_IMAGES.get(request.language)
    if not image:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {request.language}")

    file_ext = LANGUAGE_FILE_EXT[request.language]
    command = LANGUAGE_COMMANDS[request.language]

    if request.test_cases:
        fn = _run_with_test_cases
        args = (image, request.code, file_ext, command, request.test_cases,
                request.time_limit_seconds, request.memory_limit_mb)
    else:
        fn = _run_single
        args = (image, request.code, file_ext, command,
                request.time_limit_seconds, request.memory_limit_mb)

    result = await asyncio.get_event_loop().run_in_executor(None, fn, *args)

    # Publish to Redis so backend can poll
    try:
        redis = await aioredis.from_url(REDIS_URL, decode_responses=True)
        await redis.setex(
            f"judge:result:{request.submission_id}",
            300,
            json.dumps(result),
        )
        await redis.aclose()
    except Exception:
        pass

    return JudgeResult(submission_id=request.submission_id, **result)


# ── helpers ────────────────────────────────────────────────────────────────

def _write_temp_file(content: str, suffix: str) -> str:
    with tempfile.NamedTemporaryFile(mode="w", suffix=suffix, delete=False, dir="/tmp") as f:
        f.write(content)
        return f.name


def _normalize(s: str) -> str:
    return "\n".join(line.strip() for line in s.strip().splitlines())


def _run_container(
    image: str,
    code_path: str,
    ext: str,
    command: str,
    time_limit: int,
    memory_mb: int,
    extra_volumes: dict | None = None,
) -> dict:
    start = time.time()
    bind_target = f"/code/solution{ext}"
    volumes = {code_path: {"bind": bind_target, "mode": "ro"}}
    if extra_volumes:
        volumes.update(extra_volumes)

    container = None
    try:
        container = docker_client.containers.run(
            image=image,
            command=command,
            volumes=volumes,
            network_mode="none",
            mem_limit=f"{memory_mb}m",
            memswap_limit=f"{memory_mb}m",
            cpu_quota=100000,
            read_only=True,
            tmpfs={"/tmp": "size=64m,exec"},
            detach=True,
        )

        # Start a kill timer; container.wait() has no socket timeout dependency
        kill_timer = threading.Timer(time_limit + 2, container.kill)
        kill_timer.daemon = True
        kill_timer.start()

        try:
            result = container.wait()  # blocks until container exits or is killed
        except Exception:
            result = {"StatusCode": -1}
        finally:
            kill_timer.cancel()

        elapsed_ms = int((time.time() - start) * 1000)

        # If we exceeded time limit (timer fired = elapsed > time_limit * 1000)
        if elapsed_ms >= time_limit * 1000:
            return {"ok": False, "stdout": "", "stderr": "", "elapsed_ms": elapsed_ms, "status": "time_limit"}

        logs = container.logs(stdout=True, stderr=True)
        output = logs.decode("utf-8", errors="replace") if isinstance(logs, bytes) else ""

        exit_code = result.get("StatusCode", -1)
        if exit_code != 0:
            return {"ok": False, "stdout": "", "stderr": output[:5000], "elapsed_ms": elapsed_ms, "status": "runtime_error"}

        return {"ok": True, "stdout": output[:10000], "stderr": "", "elapsed_ms": elapsed_ms}

    except docker.errors.ImageNotFound:
        elapsed_ms = int((time.time() - start) * 1000)
        return {"ok": False, "stdout": "", "stderr": f"Image not found: {image}", "elapsed_ms": elapsed_ms, "status": "runtime_error"}
    except Exception as e:
        elapsed_ms = int((time.time() - start) * 1000)
        return {"ok": False, "stdout": "", "stderr": str(e)[:500], "elapsed_ms": elapsed_ms, "status": "runtime_error"}
    finally:
        if container:
            try:
                container.remove(force=True)
            except Exception:
                pass


def _run_with_test_cases(
    image: str, code: str, ext: str, command: str,
    test_cases: list[TestCase], time_limit: int, memory_mb: int,
) -> dict:
    code_path = _write_temp_file(code, ext)
    tc_results = []
    total_points = sum(tc.points for tc in test_cases)
    earned_points = 0
    total_elapsed = 0
    last_stderr = ""

    try:
        for tc in test_cases:
            # For SQL challenges: write context.json with setup SQL from input_data
            ctx_path = None
            extra_volumes: dict = {}
            if ext == ".sql" and tc.input_data:
                ctx_path = _write_temp_file(
                    json.dumps({"setup_sql": tc.input_data}), ".json"
                )
                extra_volumes = {ctx_path: {"bind": "/code/context.json", "mode": "ro"}}

            run = _run_container(image, code_path, ext, command, time_limit, memory_mb, extra_volumes or None)
            total_elapsed += run["elapsed_ms"]

            if ctx_path:
                try:
                    os.unlink(ctx_path)
                except Exception:
                    pass

            if not run["ok"]:
                status_str = run.get("status", "runtime_error")
                err = "Time limit exceeded" if status_str == "time_limit" else run["stderr"][:300]
                tc_results.append(TestCaseResult(passed=False, points=tc.points, error=err))
                last_stderr = run["stderr"]
                continue

            got = _normalize(run["stdout"])
            expected = _normalize(tc.expected_output or "")
            passed = got == expected
            if passed:
                earned_points += tc.points
            tc_results.append(TestCaseResult(
                passed=passed, points=tc.points,
                expected=expected[:500], got=got[:500],
            ))
    finally:
        try:
            os.unlink(code_path)
        except Exception:
            pass

    score = round(earned_points / total_points * 100, 2) if total_points > 0 else 0.0
    all_passed = earned_points == total_points
    status = "accepted" if all_passed else ("score_below_threshold" if score > 0 else "wrong_answer")

    return {
        "status": status,
        "score": score,
        "stdout": "",
        "stderr": last_stderr,
        "execution_time_ms": total_elapsed,
        "memory_used_mb": 0.0,
        "test_case_results": [r.model_dump() for r in tc_results],
    }


def _run_single(
    image: str, code: str, ext: str, command: str, time_limit: int, memory_mb: int,
) -> dict:
    code_path = _write_temp_file(code, ext)
    try:
        run = _run_container(image, code_path, ext, command, time_limit, memory_mb)
        if run["ok"]:
            return {
                "status": "accepted", "score": 100.0,
                "stdout": run["stdout"], "stderr": "",
                "execution_time_ms": run["elapsed_ms"],
                "memory_used_mb": 0.0, "test_case_results": [],
            }
        return {
            "status": run.get("status", "runtime_error"), "score": 0.0,
            "stdout": "", "stderr": run["stderr"],
            "execution_time_ms": run["elapsed_ms"],
            "memory_used_mb": 0.0, "test_case_results": [],
        }
    finally:
        try:
            os.unlink(code_path)
        except Exception:
            pass

"""
Chat router — Site-wide AI assistant powered by Groq (free tier).

POST /chat/message   → Send a message, get a response

Uses Groq's free API (llama-3.1-8b-instant) via httpx — no extra package needed.
Sign up free at https://console.groq.com to get an API key.
"""
from __future__ import annotations

import httpx
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.config import settings
from app.models.user import User
from app.services.auth import get_current_user_optional

router = APIRouter()

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"  # Free, fast

SYSTEM_PROMPT = """Tu es CoachAI Assistant, l'assistant intelligent de la plateforme CoachAI.
CoachAI est une plateforme d'apprentissage data/IA gamifiée : challenges SQL, Machine Learning, Deep Learning, NLP, Computer Vision, Data Engineering, avec un système ELO, des formations structurées, et un leaderboard.

Tu aides les utilisateurs avec :
- Les challenges (SQL, Python, ML, etc.) : indices, explications de concepts, review de code
- Les formations : explications de cours, clarifications théoriques
- La plateforme : navigation, fonctionnalités, abonnement Pro
- Data science en général : pandas, scikit-learn, PyTorch, SQL avancé

Règles :
- Tu es concis et pédagogique
- Tu donnes des exemples de code quand c'est utile (markdown code blocks)
- Tu ne donnes PAS la solution complète d'un challenge directement — tu guides par des indices
- Tu réponds en français sauf si l'utilisateur écrit en anglais
- Tu es encourageant et bienveillant
"""


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    context: str | None = None


@router.post("/message")
async def chat_message(
    body: ChatRequest,
    current_user: Annotated[User | None, Depends(get_current_user_optional)] = None,
):
    if not settings.groq_api_key:
        raise HTTPException(status_code=503, detail="AI assistant not configured (set GROQ_API_KEY)")

    if len(body.messages) > 50:
        raise HTTPException(status_code=400, detail="Too many messages in context")

    system = SYSTEM_PROMPT
    if body.context:
        system += f"\n\nContexte actuel : {body.context[:1000]}"
    if current_user:
        system += f"\n\nUtilisateur connecté : {current_user.username} (ELO: {current_user.elo}, Rank: {current_user.rank})"

    messages = [{"role": "system", "content": system}]
    messages += [{"role": m.role, "content": m.content} for m in body.messages[-20:]]

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {settings.groq_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": GROQ_MODEL,
                    "messages": messages,
                    "max_tokens": 1024,
                    "temperature": 0.7,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return {"content": data["choices"][0]["message"]["content"]}
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Groq API error: {e.response.text[:200]}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI error: {str(e)[:200]}")

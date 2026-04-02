"""
Simple Redis-based rate limiter for auth endpoints.
Sliding window: tracks requests per IP per window.
"""
from __future__ import annotations

from fastapi import HTTPException, Request
from app.core.redis import get_redis


async def check_rate_limit(
    request: Request,
    key_prefix: str,
    max_requests: int = 10,
    window_seconds: int = 60,
) -> None:
    """Raise 429 if rate limit exceeded for the client IP."""
    client_ip = request.client.host if request.client else "unknown"
    redis_key = f"rl:{key_prefix}:{client_ip}"

    redis = await get_redis()
    current = await redis.incr(redis_key)
    if current == 1:
        await redis.expire(redis_key, window_seconds)

    if current > max_requests:
        ttl = await redis.ttl(redis_key)
        raise HTTPException(
            status_code=429,
            detail=f"Trop de tentatives. Réessaie dans {max(ttl, 1)}s.",
        )

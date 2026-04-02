from __future__ import annotations
import time
from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.rate_limit import check_rate_limit
from app.core.redis import get_redis
from app.models.user import User
from app.schemas.auth import (
    AccessTokenResponse,
    ForgotPasswordRequest,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
)
from app.schemas.user import UserPublic
from app.services.email import send_password_reset_email, send_welcome_email
from app.services.auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
    hash_password,
    verify_password,
)

router = APIRouter()


def _build_token_response(user: User) -> TokenResponse:
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token(str(user.id))
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserPublic.model_validate(user),
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(request: Request, body: RegisterRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    await check_rate_limit(request, "register", max_requests=5, window_seconds=300)
    existing_email = await db.execute(select(User).where(User.email == body.email))
    if existing_email.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    existing_username = await db.execute(select(User).where(User.username == body.username))
    if existing_username.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        email=body.email,
        username=body.username,
        hashed_password=hash_password(body.password),
        elo=1000,
        rank="Rookie",
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    await send_welcome_email(user.email, user.username)
    return _build_token_response(user)


@router.post("/login", response_model=TokenResponse)
async def login(request: Request, body: LoginRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    await check_rate_limit(request, "login", max_requests=10, window_seconds=60)
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not user.hashed_password or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivated")
    return _build_token_response(user)


@router.post("/refresh", response_model=AccessTokenResponse)
async def refresh_token(body: RefreshRequest):
    payload = decode_token(body.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    redis = await get_redis()
    blacklisted = await redis.get(f"blacklist:refresh:{payload.get('jti')}")
    if blacklisted:
        raise HTTPException(status_code=401, detail="Token revoked")

    access_token = create_access_token({"sub": user_id})
    return AccessTokenResponse(access_token=access_token)


@router.get("/me", response_model=UserPublic)
async def me(current_user: Annotated[User, Depends(get_current_user)]):
    return UserPublic.model_validate(current_user)


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
async def forgot_password(request: Request, body: ForgotPasswordRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    """Send password reset email. Always returns 202 to prevent email enumeration."""
    await check_rate_limit(request, "forgot", max_requests=3, window_seconds=300)
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if user and user.is_active:
        # Create a short-lived token (1 hour)
        import uuid as _uuid
        reset_jti = str(_uuid.uuid4())
        token = create_access_token(
            {"sub": str(user.id), "type": "reset", "jti": reset_jti},
            expires_delta=timedelta(hours=1),
        )
        await send_password_reset_email(
            to=user.email,
            username=user.username,
            reset_token=token,
            frontend_url=settings.frontend_url,
        )
    return {"detail": "If this email exists, a reset link has been sent."}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(body: ResetPasswordRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    """Reset password using token from email."""
    payload = decode_token(body.token)
    if payload.get("type") != "reset":
        raise HTTPException(status_code=400, detail="Invalid reset token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    # Check if token was already used
    jti = payload.get("jti")
    if jti:
        redis = await get_redis()
        used = await redis.get(f"used:reset:{jti}")
        if used:
            raise HTTPException(status_code=400, detail="Reset link already used")
        # Mark as used (expire after 1h)
        await redis.setex(f"used:reset:{jti}", 3600, "1")

    import uuid as _uuid
    result = await db.execute(select(User).where(User.id == _uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    user.hashed_password = hash_password(body.new_password)
    await db.flush()
    return {"detail": "Password has been reset successfully."}


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(body: RefreshRequest):
    try:
        payload = decode_token(body.refresh_token)
        jti = payload.get("jti")
        exp = payload.get("exp")
        if jti and exp:
            redis = await get_redis()
            ttl = int(exp - time.time())
            if ttl > 0:
                await redis.setex(f"blacklist:refresh:{jti}", ttl, "1")
    except HTTPException:
        pass

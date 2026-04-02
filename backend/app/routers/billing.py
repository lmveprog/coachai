"""
Billing router — Stripe integration for Pro subscriptions.

Endpoints:
  POST /billing/checkout        → Create a Stripe Checkout session
  POST /billing/webhook         → Handle Stripe webhook events
  GET  /billing/portal          → Customer portal (manage/cancel subscription)
  GET  /billing/status          → Current subscription status for the logged-in user
"""
from __future__ import annotations

import stripe
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.services.auth import get_current_user
from app.services.email import send_pro_welcome_email, send_subscription_cancelled_email

router = APIRouter()

stripe.api_key = settings.stripe_secret_key


# ── helpers ────────────────────────────────────────────────────────────────

async def _get_or_create_customer(user: User, db: AsyncSession) -> str:
    """Return the Stripe customer ID, creating one if needed."""
    if user.stripe_customer_id:
        return user.stripe_customer_id

    customer = stripe.Customer.create(
        email=user.email,
        name=user.username,
        metadata={"user_id": str(user.id)},
    )
    user.stripe_customer_id = customer["id"]
    await db.commit()
    return customer["id"]


async def _apply_subscription(user: User, sub: dict, db: AsyncSession, send_email: bool = False) -> None:
    """Set is_premium / premium_until based on a Stripe subscription object."""
    status = sub.get("status")
    active = status in ("active", "trialing")
    was_premium = user.is_premium
    user.is_premium = active
    if active:
        period_end = sub.get("current_period_end")
        if period_end:
            user.premium_until = datetime.fromtimestamp(period_end, tz=timezone.utc)
    else:
        user.premium_until = None
    await db.commit()
    if send_email:
        if active and not was_premium:
            await send_pro_welcome_email(user.email, user.username)
        elif not active and was_premium:
            await send_subscription_cancelled_email(user.email, user.username)


# ── routes ─────────────────────────────────────────────────────────────────

@router.post("/checkout")
async def create_checkout_session(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    if not settings.stripe_secret_key or not settings.stripe_price_id_pro:
        raise HTTPException(status_code=503, detail="Stripe not configured")

    customer_id = await _get_or_create_customer(current_user, db)

    session = stripe.checkout.Session.create(
        customer=customer_id,
        mode="subscription",
        line_items=[{"price": settings.stripe_price_id_pro, "quantity": 1}],
        subscription_data={"trial_period_days": 7},
        success_url=f"{settings.frontend_url}/billing/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{settings.frontend_url}/pricing",
        allow_promotion_codes=True,
        metadata={"user_id": str(current_user.id)},
    )
    return {"url": session.url}


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")

    if not settings.stripe_webhook_secret:
        raise HTTPException(status_code=503, detail="Stripe webhook not configured")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig, settings.stripe_webhook_secret
        )
    except stripe.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    etype = event["type"]
    data = event["data"]["object"]

    # Events that carry a subscription object
    if etype in (
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
    ):
        customer_id = data.get("customer")
        result = await db.execute(select(User).where(User.stripe_customer_id == customer_id))
        user = result.scalar_one_or_none()
        if user:
            await _apply_subscription(user, data, db, send_email=True)

    elif etype == "checkout.session.completed":
        # Ensure customer_id is persisted even if subscription event fires first
        customer_id = data.get("customer")
        user_id = data.get("metadata", {}).get("user_id")
        if customer_id and user_id:
            import uuid as _uuid
            try:
                uid = _uuid.UUID(user_id)
            except ValueError:
                return {"received": True}
            result = await db.execute(select(User).where(User.id == uid))
            user = result.scalar_one_or_none()
            if user and not user.stripe_customer_id:
                user.stripe_customer_id = customer_id
                await db.commit()

    elif etype in ("invoice.payment_succeeded", "invoice.payment_failed"):
        # Refresh subscription state
        sub_id = data.get("subscription")
        if sub_id:
            sub = stripe.Subscription.retrieve(sub_id)
            customer_id = sub.get("customer")
            result = await db.execute(select(User).where(User.stripe_customer_id == customer_id))
            user = result.scalar_one_or_none()
            if user:
                await _apply_subscription(user, sub, db, send_email=True)

    return {"received": True}


@router.get("/portal")
async def customer_portal(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=503, detail="Stripe not configured")
    if not current_user.stripe_customer_id:
        raise HTTPException(status_code=404, detail="No subscription found")

    session = stripe.billing_portal.Session.create(
        customer=current_user.stripe_customer_id,
        return_url=f"{settings.frontend_url}/profile",
    )
    return {"url": session.url}


@router.get("/status")
async def billing_status(
    current_user: Annotated[User, Depends(get_current_user)],
):
    return {
        "is_premium": current_user.is_premium,
        "premium_until": current_user.premium_until.isoformat() if current_user.premium_until else None,
        "has_payment_method": current_user.stripe_customer_id is not None,
    }

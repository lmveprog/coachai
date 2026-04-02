from pydantic_settings import BaseSettings
from functools import lru_cache

_INSECURE_SECRETS = {"change-me-in-production", "secret", "changeme", "your-secret-here", ""}


class Settings(BaseSettings):
    # App
    environment: str = "development"
    frontend_url: str = "http://localhost:3000"

    # Database
    database_url: str

    # Redis
    redis_url: str

    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60
    jwt_refresh_token_expire_days: int = 30

    # Judge
    judge_url: str = "http://judge:8001"
    judge_secret: str

    # Supabase (optional, for OAuth)
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_id_pro: str = ""

    # Anthropic / Claude (for file evaluation)
    anthropic_api_key: str = ""

    # Groq (free chatbot — https://console.groq.com)
    groq_api_key: str = ""

    # Resend (transactional emails — https://resend.com, free tier: 3000/month)
    resend_api_key: str = ""

    def validate_production_secrets(self) -> None:
        """Raise on startup if insecure placeholder secrets are used in production."""
        if self.environment != "production":
            return
        if self.jwt_secret.lower() in _INSECURE_SECRETS or len(self.jwt_secret) < 32:
            raise RuntimeError(
                "JWT_SECRET is insecure or too short. Set a random 32+ character secret in production."
            )
        if self.judge_secret.lower() in _INSECURE_SECRETS:
            raise RuntimeError("JUDGE_SECRET must be changed from the default in production.")

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    s = Settings()
    s.validate_production_secrets()
    return s


settings = get_settings()

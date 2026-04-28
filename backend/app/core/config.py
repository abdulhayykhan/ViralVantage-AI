from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)

    app_name: str = "ViralVantage-AI Backend"
    app_env: str = Field(default="development")
    app_debug: bool = Field(default=False)

    api_v1_prefix: str = "/api/v1"
    allowed_origins: str = Field(default="http://localhost:3000,http://127.0.0.1:3000")

    supabase_url: str = Field(default="")
    supabase_anon_key: str = Field(default="")
    supabase_service_role_key: str = Field(default="")
    supabase_storage_bucket: str = Field(default="creator_content")

    gemini_api_key: str = Field(default="")
    gemini_model: str = Field(default="gemini-1.5-pro")
    gemini_api_base_url: str = Field(default="https://generativelanguage.googleapis.com")

    max_upload_mb: int = Field(default=50, ge=1, le=250)
    request_timeout_seconds: int = Field(default=60, ge=5, le=180)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()

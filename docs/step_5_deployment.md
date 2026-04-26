# Step 5: Runtime Review, Dual-Server Boot Commands, and CORS Fix

## Codebase Review Findings

### Finding 1 (High): Local CORS mismatch could block frontend API calls

- Previous backend CORS allowed only `http://localhost:3000`.
- Frontend is configured to call backend at `http://127.0.0.1:8000` and may be opened from `http://127.0.0.1:3000` in some local setups.
- Result: Browser can block requests due to origin mismatch.

### Applied Fix

CORS is now configurable via environment variable and supports both common local origins by default.

## Exact File Paths Modified

- `backend/app/core/config.py`
- `backend/app/main.py`
- `backend/.env.example`
- `docs/step_5_deployment.md`

## CORS Fix Code (FastAPI)

### `backend/app/core/config.py`

```python
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)

    app_name: str = "ViralVantage-AI Backend"
    app_env: str = Field(default="development")
    app_debug: bool = Field(default=False)

    api_v1_prefix: str = "/api/v1"
    frontend_cors_origins: str = Field(default="http://localhost:3000,http://127.0.0.1:3000")

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
```

### `backend/app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.services.ai_scorer import AIScorerService, AnalyzeRequest, AnalyzeResponse

settings = get_settings()
ai_scorer_service = AIScorerService(settings)
cors_origins = [origin.strip() for origin in settings.frontend_cors_origins.split(",") if origin.strip()]

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.post("/api/analyze", tags=["analysis"])
async def analyze_video(payload: AnalyzeRequest) -> AnalyzeResponse:
    return await ai_scorer_service.analyze(video_url=str(payload.video_url), user_id=payload.user_id)


@app.get("/", tags=["root"])
async def root() -> dict[str, str]:
    return {"service": settings.app_name, "status": "running"}
```

### `backend/.env` example addition

```bash
FRONTEND_CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## Exact Terminal Commands to Boot Both Servers Simultaneously (Windows PowerShell)

Run these from project root:

```powershell
# 1) Frontend terminal
Start-Process pwsh -ArgumentList '-NoExit','-Command','cd "c:\Users\USER\OneDrive\Desktop\ViralVantage-AI\frontend"; npm install; npm run dev'

# 2) Backend terminal
Start-Process pwsh -ArgumentList '-NoExit','-Command','cd "c:\Users\USER\OneDrive\Desktop\ViralVantage-AI\backend"; if (-not (Test-Path .venv)) { py -3.10 -m venv .venv }; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt; uvicorn app.main:app --reload --host 127.0.0.1 --port 8000'
```

## Verification Checklist

1. Frontend available at `http://localhost:3000`.
2. Backend health responds at `http://127.0.0.1:8000/api/v1/health`.
3. Analyze request from frontend to backend succeeds without browser CORS errors.
4. If you open frontend at `http://127.0.0.1:3000`, analyze still succeeds.

## Notes

- Keep `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000` in frontend env.
- If you deploy preview environments, add their origins to `FRONTEND_CORS_ORIGINS` as comma-separated values.

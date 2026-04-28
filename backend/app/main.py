from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.services.ai_scorer import AIScorerService, AnalyzeRequest, AnalyzeResponse

settings = get_settings()
ai_scorer_service = AIScorerService(settings)
cors_origins = [origin.strip() for origin in settings.allowed_origins.split(",") if origin.strip()]

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

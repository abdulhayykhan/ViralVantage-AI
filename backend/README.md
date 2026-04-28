# Backend

FastAPI service that orchestrates Gemini AI inference, Supabase audit logging, and request validation for ViralVantage-AI.

## Stack

- **FastAPI** — async HTTP, Pydantic v2 request/response validation
- **httpx** — async Gemini API calls with timeout control
- **supabase-py** — audit log read/write via service role key
- **pydantic-settings** — `.env` config with type coercion

## Service Structure

```
app/
├── main.py                  FastAPI app, CORS, route wiring
├── core/config.py           Settings via pydantic-settings + lru_cache
├── api/
│   ├── router.py            API router aggregation
│   └── routes/health.py     GET /api/v1/health
└── services/
    └── ai_scorer.py         Full AI pipeline: validate → call → parse → audit
```

## AI Pipeline (`ai_scorer.py`)

**Request flow:**

1. Validate `video_url` is a Supabase Storage URL
2. Insert `processing` row in `ai_audit_logs`
3. Call Gemini 2.5 Flash with structured `responseSchema`
4. On 429/503: retry up to 3× with exponential backoff (2s → 4s → 8s)
5. On primary exhaustion: fall back to Gemini 1.5 Flash
6. Validate response against Pydantic `AnalyzeResponse` schema
7. Update audit log to `completed` or `failed`

**Strict output enforced (Pydantic + Gemini responseSchema):**

```python
overall_score: int  # 0–100
hook_strength: HookStrength  # score 0–10, analysis string ≥20 chars
pacing_analysis: str  # ≥30 chars
caption_optimization: str  # ≥20 chars
actionable_feedback: list[str]  # exactly 3 non-empty items
trending_recommendations: list[str]  # 4–8 items, must include Audio: and Hashtag: prefixes
```

Extra keys forbidden (`extra="forbid"`). Schema violations return HTTP 502.

## Error Codes

| Code | Cause |
|------|-------|
| 400  | Invalid/non-Supabase video URL |
| 502  | Gemini returned invalid/non-JSON/schema-mismatched output |
| 503  | Gemini congestion after retry + fallback exhaustion |
| 504  | (legacy) Gemini timeout (now returns 503 after retries) |
| 500  | Unexpected backend error |

## Environment Variables

```env
APP_NAME=ViralVantage-AI Backend
APP_ENV=development
APP_DEBUG=true
API_V1_PREFIX=/api/v1
FRONTEND_CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET=creator_content

GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com

MAX_UPLOAD_MB=50
REQUEST_TIMEOUT_SECONDS=60
```

## Local Run

```powershell
cd backend
py -3.10 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API docs: `http://127.0.0.1:8000/docs`  
Health check: `http://127.0.0.1:8000/api/v1/health`

## Deployment (Railway)

Start command:
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Set all env vars in Railway dashboard. `FRONTEND_CORS_ORIGINS` must include the Vercel production URL.

**Note:** `AIScorerService` initializes at app startup — if `GEMINI_API_KEY` or Supabase credentials are missing, Railway deploy will fail before accepting traffic. Always set all required env vars before deploying.

## 📄 License

This project is open-source and available for educational and commercial use under the MIT License.

---

**Made with ❤️ by [Abdul Hayy Khan](https://www.linkedin.com/in/abdulhayykhan/)**
# Backend

This directory contains the FastAPI service that orchestrates upload handling, analysis requests, and response shaping for the ViralVantage-AI pipeline.

## Service Structure

The backend is intentionally split into focused layers:

- `app/main.py` wires the FastAPI application, routes, and startup behavior.
- `app/api/` exposes HTTP endpoints that the frontend calls.
- `app/services/` contains the business logic for scoring, retries, fallbacks, and provider interaction.
- `app/models/` defines request and response schemas.
- `app/core/` holds configuration and shared utilities.

That separation keeps the request handlers thin and makes the analysis logic testable outside the transport layer.

## Resilience Logic

The core resilience work lives in `app/services/ai_scorer.py`.

It uses two protective layers:

- Exponential backoff for transient Gemini or network failures.
- Model fallback from Gemini 2.5 Flash to Gemini 1.5 Flash when the primary model is unavailable or returns a hard failure.

The goal is to preserve demo continuity while still trying the highest-quality model first.

## Environment Variables

Set the following variables before running the backend:

- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Local Run

From the backend directory:

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Notes

The backend is designed to support a stable hackathon demo first, then scale into a cleaner service boundary if the project grows after submission.
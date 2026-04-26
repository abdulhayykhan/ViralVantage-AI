# Step 2: FastAPI Analyze Endpoint + Gemini Integration + Supabase Audit Logging

## What Was Built

Phase 2 implemented the backend AI analysis flow for ViralVantage-AI.

- Added POST endpoint `/api/analyze` in FastAPI.
- Endpoint accepts a Supabase Storage URL for a video and an optional user UUID.
- Added `AIScorerService` to:
  - Validate URL format and enforce Supabase Storage origin.
  - Call Gemini 1.5 Pro API asynchronously.
  - Enforce strict JSON output schema for response consistency.
  - Handle timeout/API error edge cases.
- All requests are logged to `public.ai_audit_logs` in Supabase:
  - Inserted at request start with `processing` status.
  - Updated to `completed` with model output and latency.
  - Updated to `failed` with error details and latency on any failure.

## Exact File Paths Modified

- `backend/app/main.py`
- `backend/app/services/ai_scorer.py`
- `backend/app/core/config.py`
- `backend/.env.example`
- `docs/step_2_backend.md`

## API Contract

### Endpoint

- `POST /api/analyze`

### Request JSON

```json
{
  "video_url": "https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/creator_content/sample-video.mp4",
  "user_id": "00000000-0000-0000-0000-000000000000"
}
```

Notes:
- `video_url` is required and must be a Supabase Storage URL.
- `user_id` is optional and should be a UUID string when provided.

### Strict Response JSON

```json
{
  "overall_score": 87,
  "hook_strength": "Strong opening visual and immediate context draw attention quickly.",
  "pacing_analysis": "Fast initial pacing with slight slowdown in the middle segment and strong finish.",
  "actionable_feedback": [
    "Move the key payoff statement into the first 3 seconds.",
    "Trim 1-2 slower mid-sequence shots to maintain momentum.",
    "Add a bold on-screen CTA in the final 2 seconds."
  ]
}
```

The backend enforces these exact keys and rejects malformed or extra-key AI output.

## Required Environment Variables

Create/update `backend/.env`:

```bash
APP_NAME=ViralVantage-AI Backend
APP_ENV=development
APP_DEBUG=true
API_V1_PREFIX=/api/v1

SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET=creator_content

GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-1.5-pro
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com

MAX_UPLOAD_MB=50
REQUEST_TIMEOUT_SECONDS=60
```

## How To Test Locally

1. Install backend dependencies.

```bash
cd backend
python -m venv .venv
# PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Start FastAPI.

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

3. Send an analysis request (replace URL and UUID values).

```bash
curl -X POST "http://127.0.0.1:8000/api/analyze" \
  -H "Content-Type: application/json" \
  -d "{\"video_url\":\"https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/creator_content/sample.mp4\",\"user_id\":\"00000000-0000-0000-0000-000000000000\"}"
```

4. Verify outputs.

- API returns strict JSON with `overall_score`, `hook_strength`, `pacing_analysis`, `actionable_feedback`.
- In Supabase table `public.ai_audit_logs`, verify row lifecycle:
  - `processing` at request start.
  - `completed` with `output_payload` and `latency_ms` on success.
  - `failed` with `error_message` on error paths.

## Edge Cases Covered

- Invalid/non-Supabase URL is rejected early.
- Gemini timeouts return HTTP 504 and are logged.
- Gemini HTTP/network errors return HTTP 502 and are logged.
- Non-JSON or schema-invalid model output returns HTTP 502 and is logged.
- Unexpected backend errors return HTTP 500 and are logged.

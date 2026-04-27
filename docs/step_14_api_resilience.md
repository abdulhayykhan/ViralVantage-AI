# Step 14: API Resilience Hardening

## What Changed

This phase hardens the FastAPI AI scoring layer against Gemini congestion and transient service failures.

### Task 1: Exponential Backoff Retries

Updated `backend/app/services/ai_scorer.py` to add asynchronous retries for `generateContent` calls:

- Retries target only retryable congestion statuses:
  - `503 Service Unavailable`
  - `429 Too Many Requests`
- Exponential backoff schedule:
  - 2 seconds
  - 4 seconds
  - 8 seconds
- Retry cap:
  - 3 maximum retries

### Task 2: Model Fallback Strategy

Implemented model fallback in the scoring pipeline:

- Primary model call uses `gemini-2.5-flash` with retry/backoff.
- If primary fails after retry exhaustion, service automatically falls back to `gemini-1.5-flash`.
- Added backend warning log when fallback is activated.

### Task 3: Client-Facing 503 Handling

Added clean service-level failure response after all retry/fallback attempts fail:

- Returns `HTTP 503` with:
  - "AI pipeline is currently congested. Please attempt analysis again in 30 seconds."
- Exception handling remains inside FastAPI request flow.
- Uvicorn worker remains stable (no process crash path introduced).

## Additional Reliability Improvements

- Preserved schema validation for AI responses.
- Preserved Supabase audit log success/failure updates.
- Success audit entries now record the actual model used (`gemini-2.5-flash` or fallback model).

## Exact File Paths Modified

- `backend/app/services/ai_scorer.py`
- `docs/step_14_api_resilience.md`

## Validation

`ai_scorer.py` was checked after refactor and returns no file-level errors.

## Notes

This phase does not change backend routing, Supabase configuration, or frontend API contracts.

# Step 15: Frontend Failsafe For AI Outages

## What Changed

This phase adds a frontend reliability fallback so demo flows continue even when the backend AI path returns `503` or the network is unavailable.

### Task 1: Mock Analysis Data

Updated `frontend/lib/api.ts`:

- Added `MOCK_VIRAL_RESULT` as a typed `AnalyzeResult` constant.
- Populated with realistic high-scoring output:
  - overall score `92`
  - hook strength `9/10`
  - specific edit guidance including cutting a `0.5s` pause
  - trending audio and hashtag recommendations

### Task 2: API Interceptor

Updated `analyzeContent` in `frontend/lib/api.ts`:

- Wrapped the fetch path in `try/catch`.
- On `HTTP 503`, logs:
  - `API unreachable: Falling back to offline mock data`
- On network fetch failure, logs the same warning and returns `MOCK_VIRAL_RESULT`.
- Non-503 API failures continue to throw their parsed backend error message.

### Task 3: Presenter-Safe Visual Indicator

Updated `frontend/components/upload-analyze-panel.tsx`:

- Added state:
  - `isMockData`
  - `showOfflineModeNotice`
- Detects fallback by checking whether returned analysis is `MOCK_VIRAL_RESULT`.
- Displays a brief status indicator:
  - `Offline Mode: Using cached analysis`
- Indicator auto-hides after 5 seconds, then leaves a subtle cached-analysis hint.
- Skips transparency log fetch when using mock output.

## Exact File Paths Modified

- `frontend/lib/api.ts`
- `frontend/components/upload-analyze-panel.tsx`
- `docs/step_15_frontend_failsafe.md`

## Validation

Touched frontend files were checked and returned no file-level errors after the failsafe update.

## Notes

No backend logic, API route definitions, or Supabase configuration were changed.

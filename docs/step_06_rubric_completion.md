# Step 6: Rubric Completion - Caption Optimization + Trending Recommendations

## What Was Built

Phase 6 completed two missing hackathon rubric capabilities in the intelligence and presentation layers:

- Caption optimization suggestions
- Trending audio/hashtag recommendations

### Backend Enhancements

`backend/app/services/ai_scorer.py` was upgraded so Gemini now returns strict JSON including:

- `caption_optimization` (string)
- `trending_recommendations` (list of strings)

The strict output contract is enforced in three layers:

1. Prompt-level JSON contract in system instructions
2. Gemini `responseSchema` constraints
3. Pydantic validation in `AnalyzeResponse`

Additional validation guarantees:

- `caption_optimization` must be a non-empty detailed string
- `trending_recommendations` must contain 4-8 entries
- At least one entry must start with `Audio:`
- At least one entry must start with `Hashtag:`

### Frontend Enhancements

`frontend/components/results-dashboard.tsx` now renders two new sections:

- **Caption Optimization**
- **Trending Audio and Hashtags**

UI remains dark-themed and consistent with the existing dashboard system.

## Exact File Paths Modified

- `backend/app/services/ai_scorer.py`
- `frontend/lib/api.ts`
- `frontend/components/results-dashboard.tsx`
- `docs/step_6_rubric_completion.md`

## API Output Schema (Now Enforced)

```json
{
  "overall_score": 0,
  "hook_strength": {
    "score": 0,
    "analysis": ""
  },
  "pacing_analysis": "",
  "caption_optimization": "",
  "actionable_feedback": [
    "",
    "",
    ""
  ],
  "trending_recommendations": [
    "Audio: ...",
    "Audio: ...",
    "Hashtag: ...",
    "Hashtag: ..."
  ]
}
```

## Required Environment Variables

No new variables were introduced in this phase.

Existing backend variables must remain configured:

```bash
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-1.5-pro
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com
REQUEST_TIMEOUT_SECONDS=60
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

Existing frontend variables must remain configured:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=creator_content
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## How To Test Locally

1. Start backend:

```bash
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

2. Start frontend:

```bash
cd ../frontend
npm run dev
```

3. Run an analysis from the dashboard with a valid video.

4. Verify API response includes:

- `caption_optimization`
- `trending_recommendations`

5. Verify UI shows both new sections in Results Dashboard.

6. Verify strict validation behavior by testing malformed responses (if mocking):

- Missing `caption_optimization` should fail with backend schema error.
- Missing `Audio:` or `Hashtag:` recommendation should fail validation.

## Notes

This step closes the rubric gap for content publishability and trend alignment by combining prompt directives, schema constraints, and UI rendering for actionable creator outputs.

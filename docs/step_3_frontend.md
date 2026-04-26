# Step 3: Next.js Dashboard + Direct Supabase Upload + Analyze Flow

## What Was Built

Phase 3 implemented the frontend dashboard and end-to-end client workflow.

- Built a Shadcn-style dashboard layout in Next.js App Router.
- Added a drag-and-drop upload zone with click-to-select fallback.
- Enforced client-side file checks:
  - Video-only MIME validation.
  - Hard file-size cap at 50MB.
- Uploaded videos directly from browser to Supabase Storage bucket (`creator_content` by default), bypassing FastAPI for bandwidth efficiency.
- Retrieved Supabase public URL from uploaded object.
- Called FastAPI `POST /api/analyze` with the public URL.
- Added clear loading states for both phases:
  - Uploading to Supabase.
  - Analyzing with Gemini.
- Added robust error handling for:
  - Oversized files.
  - Supabase RLS/permission failures.
  - Missing URL generation.
  - API request failures.

## Exact File Paths Modified

- `frontend/package.json`
- `frontend/.env.example`
- `frontend/app/page.tsx`
- `frontend/components/dashboard-layout.tsx`
- `frontend/components/upload-analyze-panel.tsx`
- `frontend/components/ui/button.tsx`
- `frontend/components/ui/card.tsx`
- `frontend/lib/api.ts`
- `frontend/lib/supabase-client.ts`
- `frontend/lib/utils.ts`
- `docs/step_3_frontend.md`

## Required Environment Variables

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=creator_content
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## Dependency Added

In `frontend/package.json`:

- `@supabase/supabase-js`

## Local Testing Steps

1. Install frontend dependencies.

```bash
cd frontend
npm install
```

2. Ensure backend Phase 2 API is running.

```bash
cd ../backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

3. Run frontend.

```bash
cd ../frontend
npm run dev
```

4. Open dashboard.

- Navigate to `http://localhost:3000`

5. Functional verification checklist.

- Drag and drop a video file under 50MB.
- Confirm upload begins and shows `Uploading to Supabase Storage...`.
- Confirm analysis phase shows `Analyzing with Gemini 1.5 Pro...`.
- Confirm result card shows:
  - overall score
  - hook strength
  - pacing analysis
  - actionable feedback list

6. Error-path verification.

- Upload a file larger than 50MB and confirm immediate client-side rejection.
- Upload unsupported non-video file and confirm validation message.
- Trigger unauthenticated upload under restrictive bucket policies and confirm permission error message.
- Stop backend and confirm analyze call error handling is displayed.

## Notes

- This phase intentionally bypasses FastAPI for file upload to minimize local CPU/network overhead.
- If your Supabase bucket is private with strict RLS, authenticated client sessions are required for successful uploads.

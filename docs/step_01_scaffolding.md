# Step 1: Project Scaffolding (Next.js + FastAPI + Supabase Schema)

## What Was Built

Phase 1 created a lightweight, cloud-first scaffold for ViralVantage-AI, optimized for an Intel i5-7200U + 8GB RAM machine.

- Frontend scaffolded with Next.js 15 App Router + Tailwind CSS + Shadcn config baseline.
- Backend scaffolded with FastAPI in a modular structure for future async AI inference endpoints.
- Dependency manifests added for both runtimes.
- Supabase SQL script created to provision:
  - `public.ai_audit_logs` table with RLS and indexes.
  - `storage` bucket `creator_content` with strict per-user folder policies and 50 MB file limit.

No heavy local processing is required; inference/storage/db are designed to run on cloud APIs.

## Exact File Paths Modified

- `frontend/package.json`
- `frontend/next.config.ts`
- `frontend/tsconfig.json`
- `frontend/postcss.config.mjs`
- `frontend/tailwind.config.ts`
- `frontend/next-env.d.ts`
- `frontend/app/globals.css`
- `frontend/app/layout.tsx`
- `frontend/app/page.tsx`
- `frontend/components.json`
- `frontend/.env.example`
- `backend/requirements.txt`
- `backend/.env.example`
- `backend/app/main.py`
- `backend/app/api/router.py`
- `backend/app/api/routes/health.py`
- `backend/app/core/config.py`
- `supabase/step1_schema.sql`
- `docs/step_1_scaffolding.md`

## Required Environment Variables

### Frontend (`frontend/.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

### Backend (`backend/.env`)

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

MAX_UPLOAD_MB=50
REQUEST_TIMEOUT_SECONDS=60
```

## Supabase SQL To Run (Exact)

Run the entire script in Supabase SQL Editor:

- `supabase/step1_schema.sql`

## How To Test Locally

1. Install frontend dependencies.

```bash
cd frontend
npm install
```

2. Install backend dependencies (Python 3.10+ virtual environment).

```bash
cd ../backend
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

3. Start backend API.

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

4. In a second terminal, start frontend.

```bash
cd ../frontend
npm run dev
```

5. Verify endpoints/UI.

- Frontend page loads at `http://localhost:3000`
- Backend health endpoint returns JSON at `http://127.0.0.1:8000/api/v1/health`
- FastAPI docs available at `http://127.0.0.1:8000/docs`

## Notes For Next Phase

- Next phase should wire authenticated Supabase uploads into `creator_content/<user_id>/...` paths.
- AI inference endpoint should enforce timeout + payload size checks before calling Gemini.

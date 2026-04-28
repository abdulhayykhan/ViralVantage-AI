# ViralVantage-AI

AI-powered short-form video virality analyzer. Upload a video, get scored on hook strength, pacing, caption optimization, and trending recommendations — powered by Gemini 2.5 Flash with Supabase storage and audit logging.

## Architecture

```
Browser → Supabase Storage (direct upload, no FastAPI bandwidth cost)
       → FastAPI /api/analyze → Gemini 2.5 Flash (primary) / 1.5 Flash (fallback)
       → Supabase ai_audit_logs (full request lifecycle audit)
       → Next.js Results Dashboard
```

**Frontend:** Next.js 15 App Router · Tailwind CSS · Framer Motion · Shadcn UI  
**Backend:** FastAPI · Pydantic v2 · httpx · exponential backoff + model fallback  
**AI:** Gemini 2.5 Flash → 1.5 Flash fallback · structured JSON output schema  
**Infra:** Supabase Storage · Supabase Postgres (RLS) · Railway (backend) · Vercel (frontend)

## Features

- Drag-and-drop video upload (50MB cap, client-side validated)
- AI analysis: overall score, hook strength (0–10), pacing, caption optimization, trending audio + hashtag recommendations
- Animated SVG score gauge with count-up animation
- Staggered Framer Motion card reveals
- AI Transparency panel (raw Gemini reasoning from audit logs)
- Offline demo failsafe (mock result on 503 / network failure)
- Dynamic system status indicator (ONLINE / OFFLINE)
- Dark/light theme toggle
- Supabase audit log: `processing → completed / failed` lifecycle per request
- Gemini retry: 3× exponential backoff on 429/503, then model fallback

## Repository Layout

```
├── frontend/          Next.js App Router application
├── backend/           FastAPI service + AI scoring logic
├── supabase/          SQL schema (run once in Supabase SQL Editor)
└── docs/              Step-by-step build notes (steps 1–24)
```

## Quick Start

**Prerequisites:** Node ≥ 20.11.1, Python ≥ 3.10, Supabase project, Gemini API key.

```powershell
# Backend (PowerShell)
cd backend
py -3.10 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# copy .env.example → .env and fill in keys
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Frontend (second terminal)
cd frontend
npm install
# copy .env.example → .env.local and fill in keys
npm run dev
```

Open `http://localhost:3000`. Backend docs at `http://127.0.0.1:8000/docs`.

## Environment Variables

### Backend (`backend/.env`)

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com
FRONTEND_CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
MAX_UPLOAD_MB=50
REQUEST_TIMEOUT_SECONDS=60
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=creator_content
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## Supabase Setup

Run `supabase/schema.sql` in the Supabase SQL Editor once. Creates:

- `public.ai_audit_logs` table with RLS policies and updated_at trigger
- `creator_content` storage bucket with upload/read policies

## API Contract

```
POST /api/analyze
Body: { "video_url": "<supabase-storage-url>", "user_id": "<uuid | null>" }

Response:
{
  "overall_score": 0–100,
  "hook_strength": { "score": 0–10, "analysis": "..." },
  "pacing_analysis": "...",
  "caption_optimization": "...",
  "actionable_feedback": ["...", "...", "..."],
  "trending_recommendations": ["Audio: ...", "Audio: ...", "Hashtag: ...", "Hashtag: ..."]
}
```

Non-Supabase URLs are rejected. Schema mismatches return HTTP 502. Gemini congestion returns HTTP 503 after retry exhaustion.

## Deployment

**Backend (Railway):**

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Set `FRONTEND_CORS_ORIGINS` to your Vercel production URL.

**Frontend (Vercel):** Point to repo, set env vars, deploy. `NEXT_PUBLIC_API_BASE_URL` must point to Railway backend.

## 📄 License

This project is open-source and available for educational and commercial use under the MIT License.

---

**Made with ❤️ by [Abdul Hayy Khan](https://www.linkedin.com/in/abdulhayykhan/)**
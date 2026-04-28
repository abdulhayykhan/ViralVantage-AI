# Step 25: Production Readiness

Summary
- Locked the repository for production deployment on Vercel (frontend) and Railway (backend).
- Applied compiler optimizations, CORS security hardening, and deployment configuration.
- Created environment templates for both frontend and backend.

What changed

1. Frontend console optimization
- Created `frontend/next.config.mjs` (replacing the TypeScript version).
- Added compiler configuration to automatically remove `console.log` statements in production builds.
- Preserved `console.warn` and `console.error` so the offline interceptor continues to log failures.

2. Backend CORS security
- Updated `backend/app/core/config.py` to read from `ALLOWED_ORIGINS` environment variable instead of hard-coding origins.
- Fallback defaults to `http://localhost:3000,http://127.0.0.1:3000` for local development.
- Updated `backend/app/main.py` to use the renamed `allowed_origins` field from settings.

3. Railway deployment
- Created `backend/railway.toml` with the production start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- Ensured `--reload` is strictly omitted (hot-reload is only for development).

4. Environment templates
- Created `frontend/.env.example` listing `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`.
- Created `backend/.env.example` listing `GEMINI_API_KEY`, `GEMINI_MODEL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_ORIGINS`, `APP_ENV`, and `APP_DEBUG`.

Files created/modified
- `frontend/next.config.mjs` (new)
- `frontend/.env.example` (new)
- `backend/railway.toml` (new)
- `backend/.env.example` (new)
- `backend/app/core/config.py` (updated field name)
- `backend/app/main.py` (updated reference)

Deployment notes
- For **Vercel**: Set `NEXT_PUBLIC_API_BASE_URL` to your Railway backend URL (e.g., `https://railwayapp.com`).
- For **Railway**: Set `ALLOWED_ORIGINS` to your Vercel frontend URL and any custom domains (comma-separated).
- Both services read from `.env` files on startup. Use the example files as templates to configure production secrets securely.

Next steps
- Push to GitHub.
- Deploy frontend to Vercel and backend to Railway.
- Monitor logs for any CORS or configuration issues on first boot.
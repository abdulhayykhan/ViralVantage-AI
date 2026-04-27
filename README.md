# ViralVantage-AI

The multimodal AI analyzer for short-form video retention.

ViralVantage-AI is a hackathon-ready system for evaluating creator videos, extracting actionable retention insights, and presenting them through a premium dual-theme interface. The product is designed for fast demoability, clear architecture boundaries, and a polished presentation layer that survives real-world edge cases.

## Architecture

### Defense in Depth Backend
The backend is organized as a FastAPI service that keeps external calls isolated behind service-layer abstractions. That design makes retries, fallbacks, validation, and observability easier to reason about under load or API degradation.

### Dual-Theme Ultimate Glass UI
The frontend uses a high-contrast glassmorphism system that supports both light and dark themes without losing hierarchy. Panels, chips, widgets, and floating controls share the same visual language so the demo feels cohesive instead of assembled from unrelated components.

### Edge-to-Gemini Processing Pipeline
Files are uploaded in the browser, passed through the API layer, and evaluated with Gemini 2.5 Flash. When the live path fails, the system can fall back to a safe demo result so the presentation remains stable.

## Tech Stack

- Next.js 15
- FastAPI
- Gemini 2.5 Flash
- Supabase

## Quick Start

Run the frontend and backend from separate terminals:

```powershell
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

```powershell
cd frontend
npm run dev
```

## Repository Layout

- `backend/` contains the FastAPI service, scoring logic, and environment configuration.
- `frontend/` contains the Next.js App Router application, the glass UI system, and the demo failover path.
- `docs/` contains the build-up notes used to document the hackathon delivery.

## Submission Focus

The implementation is optimized for the Code Pulse Hackathon 2026 submission criteria: visible product value, clear architecture, strong resilience, and a polished first-run experience.
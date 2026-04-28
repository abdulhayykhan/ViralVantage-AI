# Frontend

Next.js 15 App Router application for ViralVantage-AI. Handles video upload, AI analysis trigger, results rendering, and demo failsafe.

## Stack

- **Next.js 15** — App Router, server components, typed routes
- **Tailwind CSS** — CSS variables, dark/light theme, custom glass utilities
- **Framer Motion** — staggered card reveals, SVG gauge animation, hover physics
- **Supabase JS** — direct browser-to-storage upload, audit log reads
- **next-themes** — dark/light toggle via `class` attribute

## App Structure

```
app/
├── layout.tsx              Root layout, global CSS
├── page.tsx                Main page: DashboardLayout + UploadAnalyzePanel
├── globals.css             Glass design system (CSS vars, utilities)
└── icon.svg                App favicon

components/
├── dashboard-layout.tsx    Full-width grid, header, theme toggle, status indicator
├── upload-analyze-panel.tsx Upload zone + analysis trigger + results composition
├── results-dashboard.tsx   Staggered analysis cards, OverallScore, TransparencyPanel
├── overall-score.tsx       Animated SVG ring gauge (Framer Motion strokeDashoffset)
├── animated-score.tsx      Count-up number animation (rAF easing)
├── transparency-panel.tsx  Raw AI reasoning + model/timestamp from audit log
├── interactive-guide.tsx   Floating usage guide pill (bottom-right)
├── system-notes-widget.tsx Floating runtime context pill (bottom-left)
└── ui/
    ├── button.tsx          CVA button variants
    └── card.tsx            Compound card primitives

lib/
├── api.ts                  analyzeContent(), MOCK_VIRAL_RESULT, offline fallback
├── supabase-client.ts      Supabase browser client
└── utils.ts                cn() via clsx + tailwind-merge
```

## Design System (`globals.css`)

Custom glass utilities used across components:

| Class | Purpose |
|-------|---------|
| `.glass-panel` | Primary card surface — `backdrop-blur(36px)`, subtle border |
| `.glass-subtle` | Inner section surface — lighter blur, nested within glass-panel |
| `.glass-chip` | Compact badge/pill — header status, theme toggle |
| `.glass-lift` | Hover physics — `translateY(-6px) scale(1.01)` |
| `.glass-mesh` | Background mesh — radial gradient ambient blobs |
| `.brand-h1/h2` | Typography scale — tight tracking, bold weight |
| `.accent-primary` | Teal/green color utility — maps to `--primary` |
| `.bg-accent-primary` | Gradient fill — used for score highlight backgrounds |

Light mode overrides all glass surfaces to white-based translucency with increased shadow.

## Upload → Analyze Flow

1. User drops video (client validates: video/* MIME, ≤50MB)
2. Supabase anonymous or authenticated upload to `creator_content/<userId|anonymous>/<timestamp>-<filename>`
3. Get public URL from Supabase storage
4. `POST /api/analyze` with `{ video_url, user_id }`
5. On success: render `ResultsDashboard`, fetch transparency data from `ai_audit_logs`
6. On 503 or fetch failure: return `MOCK_VIRAL_RESULT`, dispatch `system-status-offline` event

## Offline Failsafe

`analyzeContent()` in `lib/api.ts`:

- HTTP 503 → log warning, dispatch `system-status-offline`, return `MOCK_VIRAL_RESULT`
- Network `Failed to fetch` → same path
- Any other non-OK response → throw error (shown to user)

The dashboard header listens for `system-status-offline` and flips the status dot from green to red.

## Environment Variables (`frontend/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=creator_content
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

**Warning:** `lib/api.ts` throws at module load if `NEXT_PUBLIC_API_BASE_URL` is missing — set it before `next build` or Vercel will fail.

## Local Run

```bash
cd frontend
npm install
npm run dev        # dev server at http://localhost:3000
npm run build      # production build check
npm run typecheck  # tsc --noEmit
```

## Deployment (Vercel)

Point to repo root, set all `NEXT_PUBLIC_*` env vars in Vercel dashboard. `NEXT_PUBLIC_API_BASE_URL` must be the Railway backend URL (not localhost).

## 📄 License

This project is open-source and available for educational and commercial use under the MIT License.

---

**Made with ❤️ by [Abdul Hayy Khan](https://www.linkedin.com/in/abdulhayykhan/)**
# Frontend

This directory contains the Next.js App Router application for ViralVantage-AI. It presents the upload flow, the analysis dashboard, the floating helper widgets, and the visual language that defines the hackathon demo.

## App Router Structure

The frontend follows the Next.js App Router model:

- `app/layout.tsx` sets up the root shell and global providers.
- `app/page.tsx` composes the main experience.
- `app/globals.css` defines the visual system and shared design tokens.
- `components/` contains the dashboard shell, upload panel, results dashboard, and floating widgets.

This layout keeps route-level composition simple while letting the reusable UI live in components.

## Ultimate Glass System

The UI is built around a glass-first Tailwind CSS system branded as the "Ultimate Glass" theme.

Key traits:

- Layered translucent panels with consistent blur and border treatment.
- Strong contrast tokens for both light and dark modes.
- Reusable utility classes such as `glass-panel`, `glass-chip`, `glass-subtle`, and `glass-lift`.
- Atmospheric backgrounds and accent gradients that preserve readability under motion.

The result is a premium presentation layer that feels deliberate rather than default.

## Offline Demo Failsafe

The frontend includes an API interceptor driven by `MOCK_VIRAL_RESULT`.

When that environment-backed demo path is enabled, the UI can render a safe fallback result even if the live backend request is unavailable. This keeps the hackathon presentation stable when network or API conditions are imperfect.

## Local Run

From the frontend directory:

```powershell
npm run dev
```

## Notes

The frontend is optimized for demo clarity: the main dashboard should be readable at a glance, the helper widgets should stay isolated, and the theme switch should not disturb the presentation flow.
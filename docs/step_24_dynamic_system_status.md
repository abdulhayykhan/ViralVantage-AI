# Step 24: Dynamic System Status

Summary
- Replaced the static header status treatment with a dynamic online/offline indicator.
- The frontend interceptor now broadcasts a `system-status-offline` event whenever Gemini is unavailable and the app falls back to mock demo data.

What changed

1. API fallback event
- In `frontend/lib/api.ts`, the `analyzeContent` fallback path now dispatches a `system-status-offline` event before returning `MOCK_VIRAL_RESULT`.
- This happens in both the `503` branch and the `catch` fallback for fetch failures.

2. Header state
- In `frontend/components/dashboard-layout.tsx`, the header listens for `system-status-offline` and flips the global status to offline.
- The status dot now switches from `bg-primary` to `bg-red-500` when the app is offline.
- The label now renders as `SYSTEM STATUS: ONLINE` or `SYSTEM STATUS: OFFLINE`.

3. Production cleanup
- Removed the static `Phase 17` pill from the header to keep the production layout focused on live system health.

Files modified
- `frontend/lib/api.ts`
- `frontend/components/dashboard-layout.tsx`
- `docs/step_24_dynamic_system_status.md`

Notes
- The offline state is one-way in this implementation because the requirement only defines a failure broadcast.
- If a recovery state is needed later, add a companion `system-status-online` event and reset `isOnline` accordingly.
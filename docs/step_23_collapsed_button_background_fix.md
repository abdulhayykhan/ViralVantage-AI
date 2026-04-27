# Step 23: Collapsed Button Background Fix

Summary
- Added solid glass background and isolation to collapsed widget trigger buttons to prevent visual collisions with underlying text.

What I changed

1. Collapsed button base
- Added `bg-background/95 backdrop-blur-md border border-border shadow-lg z-[100]` to the collapsed `motion.button` elements in both widgets.
- Kept `px-4 py-2.5 rounded-full` padding to preserve the pill appearance.
- Ensured `w-auto` and `whitespace-nowrap` remain to prevent wrapping and allow natural width.

2. Visual result
- Collapsed buttons now render as solid, legible pills above page content without transparency bleed.
- Hover behavior and icon rotation are unchanged.

Files modified
- `frontend/components/system-notes-widget.tsx`
- `frontend/components/interactive-guide.tsx`

Notes
- If you prefer a slightly more translucent collapsed button, reduce `bg-background/95` to `bg-background/90` or `bg-white/90 dark:bg-slate-950/90`.
- The z-index `z-[100]` ensures the collapsed buttons sit above most layout layers; adjust if you introduce higher overlays.

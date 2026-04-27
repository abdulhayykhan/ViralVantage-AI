# Step 18: Build Fixes — Tailwind & CSS corrections

Summary
- Fixed invalid Tailwind utilities and missing CSS variables in `frontend/app/globals.css` that caused Next.js/Tailwind compilation failures.

What I changed

1. Replaced non-standard Tailwind utilities
- `.glass-lift` previously used `duration-450` and a custom `ease-[cubic-bezier(...)]` value which Tailwind didn't recognize. Replaced with standard utilities:
  - `duration-500`
  - `ease-out`

2. Restored missing CSS variables referenced by components
- Added the following variables to `:root` (dark) and `.light` (light) so component theme tokens map correctly:
  - `--card`
  - `--card-foreground` (set to `210 40% 98%` in dark and `222 47% 11%` in light)
  - `--border`
  - `--muted-foreground`
  - `--primary-foreground`

These ensure that classes like `text-card-foreground`, `border-border`, and others resolve to valid HSL tokens.

3. Final syntax sweep
- Verified no remaining `duration-450`, `ease-[...]` or other non-standard Tailwind utility usages remain in `globals.css`.
- Ensured `@apply` directives use only valid Tailwind utilities.

Why this fixes the build
- Tailwind rejects unknown utility names during JIT compilation; replacing illegal tokens with valid ones prevents compilation errors.
- Restoring missing CSS variables prevents runtime styling fallbacks and ensures consistent theming across dark/light modes.

Files modified
- `frontend/app/globals.css` — corrected utilities and added variables.

Next steps (optional)
- If your Tailwind config uses a safelist, add the new custom utility names (`glass-panel`, `glass-subtle`, `glass-chip`, `glass-lift`, `glass-mesh`, `brand-h1`, `brand-h2`, `bg-accent-primary`) to avoid purge removal.
- Re-run the dev server: `cd frontend && npm run dev` and report any further warnings.


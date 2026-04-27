# Step 19: Widget Isolation Fix — Opacity & Z-Index Corrections

Summary
- Fixed opacity bleed and z-index collisions in floating widgets ("System Notes" and "Usage Guide") that were causing text overlap and readability issues.

What I changed

1. Upgraded z-index hierarchy
- Both widget containers changed from `z-50` to `z-[100]` to ensure they layer above all other UI elements and avoid collision with main content.

2. Replaced transparent glass with solid backgrounds
- Expanded state panels previously used `surface-panel` (glass with transparency), which was causing opacity bleed into the underlying layout.
- Updated both widgets to use a nearly-solid background: `bg-background/95 backdrop-blur-xl border-border shadow-2xl`.
- This ensures text is always readable against the panel background, without transparency artifacts.

3. Added strict width constraints
- System Notes Widget: `max-w-sm` (24rem) to prevent text spillover.
- Interactive Guide: `max-w-xs` (20rem) for compact bottom-right placement.
- Removed the responsive `w-[min(...)]` constraint that was too loose.

4. Improved close button visibility
- Changed close (X) buttons from `variant="outline"` to solid styling: `bg-muted/50 hover:bg-muted text-foreground`.
- Buttons are now visually distinct and easier to locate in the top-right corner of each expanded panel.

5. Maintained accessibility
- Kept `aria-expanded`, `aria-label` attributes for screen readers.
- Smooth animations (0.28s ease-out) preserved for visual feedback.

Files modified
- `frontend/components/system-notes-widget.tsx`
- `frontend/components/interactive-guide.tsx`

Result
- Expanded widget panels are now fully opaque and isolated, preventing text overlap with the upload/results panels.
- Close buttons are more discoverable and visible.
- Z-index stacking is explicit and prevents layer collisions.

Next steps (optional)
- If you notice the panels are cutting off on smaller screens, you can adjust `max-w-sm` / `max-w-xs` to `max-w-[calc(100vw-3rem)]` for responsive mobile support.
- Consider adding an outer `backdrop-brightness-50` overlay if you want a modal-like darkening effect when panels are expanded.

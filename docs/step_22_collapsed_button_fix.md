# Step 22: Collapsed Button Fix — Text Wrapping & Width

Summary
- Fixed text wrapping and layout squashing in the collapsed trigger buttons for both floating widgets by adding width constraints and whitespace prevention.

What I changed

1. Added `whitespace-nowrap` to text spans
- Applied `whitespace-nowrap` class to the text span in both widgets
- System Notes: `<span className="whitespace-nowrap">System Notes</span>`
- Interactive Guide: `<span className="whitespace-nowrap">Usage Guide</span>`
- This prevents the button text from wrapping onto multiple lines

2. Added `w-auto` to motion.button containers
- Updated the button's className from `flex items-center gap-2...` to `flex w-auto items-center gap-2...`
- This allows the button to naturally expand to fit its content (text + icon)
- The button width is no longer constrained by fixed width values

3. Preserved existing styling
- Kept `px-4 py-2` padding unchanged
- Hover physics (`whileHover={{ y: -2 }}`) remain intact
- Glass styling (`surface-chip solid-lift`) preserved
- Icon rotation animation on expand unchanged

Files modified
- `frontend/components/system-notes-widget.tsx`
- `frontend/components/interactive-guide.tsx`

Result
- Collapsed buttons now display text on a single line without wrapping
- Button containers expand naturally to accommodate the text width
- Visual hierarchy and interaction patterns unchanged
- No more text overlap or squashing when button is collapsed

Technical notes
- `w-auto` works with flexbox to size the button based on flex item content
- `whitespace-nowrap` is applied only to the span, not the entire button, allowing the chevron icon to remain responsive
- The button will expand/contract based on viewport and theme-specific text rendering

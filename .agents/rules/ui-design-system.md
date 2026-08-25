---
trigger: always_on
---

# UI Design System & Component Rules

Whenever generating or modifying UI components in this repository, strictly adhere to these design rules:

1. **Card Containers**:
   - Primary Cards: Use className `glass-shell` with `rounded-3xl` or `rounded-2xl` and `p-4 sm:p-6`.
   - Sub-Containers: Use className `glass-subpane` with `rounded-xl` or `rounded-2xl`.

2. **Typography**:
   - Titles & Headers: Use `"Racing Sans One"` (automatically applied to `h1`-`h6`).
   - Sila Answers & Hand-written responses: Use class `mali-regular` or `mali-medium`.
   - Regular Text: Use `text-slate-800 dark:text-zinc-200 text-sm leading-relaxed`.

3. **Buttons & Controls**:
   - Chip / Pill Buttons: Use `theme-toggle-btn rounded-full px-3 py-1.5`.
   - Primary Action Buttons: `bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl active:scale-95 transition-all`.
   - Icons: Always import from `iconsax-react` (e.g. `Heart`, `Send2`, `Refresh`, `Message`, `Coffee`, `Sun1`, `Moon`).

4. **Audio Feedback**:
   - Integrate `sounds` from `src/utils/soundEffects.js` on user interactions:
     - Submitting forms: `sounds.playSuccess()`
     - Tab switching / clicks: `sounds.playClick()`
     - Reaction pop: `sounds.playPop(freq)`
     - Reaction remove: `sounds.playUnreact()`
     - Answer likes: `sounds.playSparkle()`

5. **Reactions**:
   - Always reuse `<ReactionButton />` from `src/components/ReactionButton.jsx`.

6. **Modals & Dialogs**:
   - **Center Dialog Modals**: Animate in from top (`-translate-y-[100vh]`) to center (`translate-y-0`) and exit to bottom (`translate-y-[100vh]`).
   - **No Top-Right Close Button**: Do not render close 'X' buttons on top right for center modals. Close via backdrop tap, ESC, or bottom action buttons.
   - **Sheet Modals**: Bottom sheets slide up from bottom with drag handle.

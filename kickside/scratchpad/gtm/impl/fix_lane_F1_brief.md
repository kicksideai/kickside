Fix lane F1 — platform/workflows/ui visual-canon defects.

Read scratchpad/gtm/impl/ui_state_sweep_static.md. You own defect rows: 1,2,3,4,5,6,7,8,9,10,11,12,23,26,27,28,31,32,33 (workflows files only),34,37. Fix every one in platform/workflows/ui.

Canon: 8px buttons/inputs/controls; 6px chips/tags; 999px true pills/toggles only; 14px cards/modals/popovers; 11px icon tiles; 10px alerts/result blocks. Button rows: >=8px vertical padding, >=6px gap. Colors via --p-* tokens.

Scoping rules:
- Row 1: split action buttons out of .wf-chip--ghost properly — a dedicated 8px action-button class used by ALL listed call sites (Accept/Undo, Back to editing, View details, Diff, Restore, Re-run, Export, Add field, Keeper actions); keep a pill class only for non-interactive status tags. Update every usage; no dead classes left.
- Row 28 (vueflow border-radius:0 reset): fix carefully — keep zero-radius ONLY on the positioning wrapper; verify nodes still render correctly after build.
- Rows 31/32: replace every #fff/#000/rgba CONTRAST and SHADOW literal with --p-* derived values (color-mix ok). Functional status hues (success/warn/error/awaiting) may remain defined ONCE in styles/tokens.css as the component token layer — do not repaint the canvas palette.
- Row 33: token-aware select chevron (CSS mask with currentColor or a tokened background) in workflows files.
- Row 34: "incoming envelopes" -> "incoming events".
- Row 37: map hue names to stylesheet classes; inline style may carry geometry only. Note hues are user-selectable — a class per hue name is fine.
- Extend the existing radius-canon guardrail test (src/radius-canon.test.ts, shared factory in platform/widgets/ui/src/app/radiusCanon.ts if applicable) so every class you fixed is asserted at its canonical value — the guardrail failed to catch these because it never asserted these classes.

Discipline: no editorial comments; present-tense minimal comments only where a constraint needs stating; no massive files; match existing code style.

Verify: cd platform/workflows/ui && npx vitest run (all green) && npm run build (must succeed; build output goes wherever package.json says — do not touch app/static/app/main, do not restart any server, do not run git commit).

Deliverable: write scratchpad/gtm/impl/fix_lane_F1.md — per-row fix summary (row #, files touched, what changed), test output tail, build result. Write this file LAST, only after tests+build pass.

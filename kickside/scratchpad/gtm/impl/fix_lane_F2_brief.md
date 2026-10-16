Fix lane F2 — platform/widgets/ui + platform/automation/ui + platform/recipes/ui visual-canon defects.

Read scratchpad/gtm/impl/ui_state_sweep_static.md. You own defect rows: 13,14,15,16,17,18,19,20,21,22,24,25,29,30,33 (automation/recipes files only),35,36,38,39. Do NOT touch platform/workflows/ui (another lane owns it). Row 40 is deferred — skip it.

Canon: 8px buttons/inputs/controls; 6px chips/tags; 999px true pills/toggles only; 14px cards/modals/popovers; 11px icon tiles; 10px alerts/result blocks. Button rows: >=8px vertical padding, >=6px gap. Colors via --p-* tokens (color-mix ok); shadows derived, defined once.

Scoping rules:
- Rows 38/39 (duplication drift): consolidate properly — one shared stylesheet/base for the picker family in platform/widgets/ui, imported by channel/connection/component pickers; PickerSelect option/panel family becomes the single source, automation imports it. No parallel copies left behind. These are shadow-DOM bundles — verify the build/import mechanism each package already uses for shared css (see how existing shared styles are wired) and follow it.
- Rows 35/36: depth padding via CSS custom property set inline (geometry only) with padding rule owned by the stylesheet.
- Row 21: explicit radius rule for checkbox inputs in all three shared patterns.
- Extend each package's radius-canon guardrail test so every class you fixed is asserted at its canonical value.

Discipline: no editorial comments; no massive files; match existing code style.

Verify: in EACH touched package (platform/widgets/ui, platform/automation/ui, platform/recipes/ui): npx vitest run (all green) && npm run build (must succeed). Do not touch app/static/app/main, do not restart any server, do not run git commit.

Deliverable: write scratchpad/gtm/impl/fix_lane_F2.md — per-row fix summary (row #, files touched, what changed), test output tails, build results. Write this file LAST, only after all tests+builds pass.

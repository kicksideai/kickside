# Modal and picker live QA — 2026-07-11

Current localhost `:8085`, hard-reloaded after the 15:48 workflow rebuild. Read-only drive; no workflow, automation, or agent was created. Console/page errors: **0**.

## Coverage

16 driven states:

- Workflow list: New workflow at 320 light and 360 dark; Templates at 520 dark; Import at 320 light.
- Automations: Add automation at 320 light; From a workflow at 520 dark.
- Workflow editor: embedded Add Trigger at 360 dark.
- Agents: New agent at 520 light.
- Shared pickers: Icon and Model at top-left, top-right, bottom-left, and bottom-right anchors across 320/360/520, light and dark.
- Modal probes included initial focus, forward Tab wrap, Shift+Tab, Escape, focus containment, body scroll lock, inert background, viewport geometry, and console errors.

## Blocking defects

### 1. Embedded Add Trigger is unusable at 360px

The dialog rendered at `x=-19`, width `136px`, height `2419.9px`, bottom `2459.9px` in a `358×738` component viewport. The automation assembler is squeezed into a narrow strip and grows thousands of pixels vertically. Text, mapper cards, and controls become a one-word-per-line column. It is focus-contained and Escape restores focus to Add Trigger, but composition is broken.

Evidence: `workflow_add_trigger_360_dark.png`, `results_deep_0.json`.

### 2. New Agent does not behave as a modal

On open, focus remains on `BODY`; focus is not contained after Tab; `body.style.overflow` remains unlocked; no background nodes become inert; Escape leaves the dialog open. The dialog also lacks an accessible name (`aria-label` is null).

At 520px the left navigation overlays the Description field: Prompt/Model are drawn over the textarea/label area instead of occupying a separate non-overlapping region.

Evidence: `agent_create_520_light.png`, `results_deep_0.json`.

## Passing behavior

- New workflow, Templates, Import, Add automation, and From a workflow dialogs remained fully onscreen at the tested compact widths.
- Those workflow/automation dialogs placed initial focus inside, trapped forward and reverse Tab, set body overflow to hidden, inerted background content, and closed on Escape.
- Focus restoration was re-driven with the opener genuinely focused: New workflow returned focus to the New workflow button.
- Shared Icon picker stayed onscreen at all four viewport edges. Measured bounds:
  - 320 TL: `8,40 → 310,288`
  - 360 TR: `46,40 → 350,290`
  - 320 BL: `8,430 → 310,678`
  - 520 BR: `206,468 → 510,718`
- Shared Model picker stayed onscreen at all four viewport edges. Measured bounds:
  - 320 TL: `8,44 → 310,423`
  - 360 TR: `8,44 → 328,423`
  - 320 BL: `8,296 → 310,674`
  - 520 BR: `8,336 → 328,714`
- Both picker types focused their search input and rendered at z-index 1200.

## Honest limits

- The live model catalog contained only one individual model, so a genuinely long model option was not available to drive.
- The nested Trigger-point picker inside the already-broken Add Trigger assembler was not separately opened before the requested stop; its parent composition is already a blocker.
- Focus restoration was directly re-driven only for New workflow after correcting the synthetic click harness to focus its opener. The other modal families share the same focus utility, but their restoration was not independently replayed with that corrected harness.

Raw evidence: `results.json`, `results_deep_0.json`, `results_basic_0.json`, and the PNG files in this directory.

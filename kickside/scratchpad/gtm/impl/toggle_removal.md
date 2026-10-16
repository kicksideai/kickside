# Workflows UI: agent-tool toggle removal + native-select styling

Lane: FRONTEND only, `platform/workflows/ui`. Built on ui HEAD 1eef1516. Commit 21dbab4b (not pushed).

## 1. Removed the "Use as agent tool" toggle (W17 amendment)

Owner ruling: any published workflow is a tool by design via the agent traits; per-workflow opt-in is retired vocabulary. `params.agent_tool` is no longer written from the FE (stored values left untouched — backend retirement is a separate codex lane).

- `WorkflowCanvas.vue`: removed the `workflow-settings` import, the whole `// ── Workflow settings ──` script block (`settingsOpen`, `agentToolEnabled`, `toggleSettings`, `onAgentToolToggle`), and the settings-gear button + popover template. The popover held only the checkbox + its hint, so the entire popover chrome was removed.
- Deleted `src/app/workflow-settings.ts` and `src/app/workflow-settings.test.ts` (existed solely for this feature).
- `styles.css`: removed the orphaned `.wf-settings-pop` and `.wf-check-row` rules (used only by that popover).
- Verified before deleting shared chrome: version history is a separate popover (`VersionHistoryPanel`, its own gear/button) sitting beside Publish per 5dc7828e — untouched. Shared popover classes (`.wf-sim-pop/.wf-sim-head/.wf-sim-hint/.wf-sim-backdrop`, used by runs/sim/history) kept.
- The Publish button copy ("callable as an automation, a Call node, or an agent tool") is left as-is: it now reads as the correct statement of the new model (published = tool), not a per-workflow opt-in.

## 2. Styled the native selects (deferred cluster, design_wc_gaps.md)

Applied the platform's established `appearance:none` + chevron pattern (reference: `platform/automation/ui/src/styles.css:187-189`), tokens-only box.

- `select.wf-input` (was cursor-only): `appearance:none; -webkit-appearance:none; padding-right:30px;` + data-URI chevron. Covers all six NodeConfigPanel selects — for_each continue-on-error, combine mode, combine output mode, agent tool-calling mode, human timeout unit, human field type.
- `.wf-label-select` (WorkflowList header label filter) given the same pattern for one-system consistency (padding-right 28px, chevron).
- Box colors stay on `--p-*`/`--wf-*` tokens (already were). The chevron glyph uses the platform's neutral stroke inside the data URI (same as the automation reference; data URIs can't take CSS vars).

## Verification

- vitest: 351 -> 347, 34 files. Arithmetic: 351 - 4 (workflow-settings.test.ts held exactly 4 `it`s) = 347; files 35 - 1 = 34. Removal, not relaxation.
- vue-tsc: touched files (WorkflowCanvas.vue, styles.css) clean. Pre-existing errors remain in untouched files only (widgets/ui ports.ts, WorkflowSetup.vue, workflow_setup.ts) — not in this lane.
- `npm run build`: green (167 modules; new styles chunk styles-BCWflEFW).
- Live check @ 8085 (real running server, authenticated admin session):
  - Served bundle over HTTP: `styles-BCWflEFW.js` contains `select.wf-input{appearance:none;...chevron}`; old chunk 404 (swapped); served `index.js` has 0 "Use as agent tool".
  - Rendered a for_each node config panel ("Enrich in parallel", select aria-label "If an item fails") via the live builder: computed `appearance:none`, chevron background present, `padding-right:30px`. `[aria-label="Use as agent tool"]` absent; `.wf-settings-pop` absent.

## Scope

Committed only: WorkflowCanvas.vue, styles.css, the two deleted workflow-settings files, and the rebuilt `platform/workflows/static/` (the HEAD commit 1eef1516 committed static alongside ui, so this matches package convention; static was pristine before the build). Did NOT touch platform/workflows/src, app/wippy.lock, or other modules.

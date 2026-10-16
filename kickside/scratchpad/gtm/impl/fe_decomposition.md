# platform/workflows/ui — behavior-frozen decomposition

Zero behavior change. Test count held at 420 (42 files) at every stage; vue-tsc held at
the 3 pre-existing errors; build green; the inlined CSS chunk stayed byte-identical
(`styles-B18RHa76.js`, same content hash) through every commit; live smoke on :8085 passed.

## Commits (reviewable stages, not pushed)

1. `87e6fe7c` organize app/ into folders
2. `d24db4e3` split styles.css into per-domain sheets
3. `dd1d41c7` split api.ts behind a barrel
4. `6662c3e1` decompose NodeConfigPanel
5. `652ca1c8` decompose WorkflowList
6. `71266f9d` extract WorkflowCanvas interaction into composables + dialog

(Interleaved commits from a concurrent backend worker on the same branch touch only
`.lua`/`.yaml`; no overlap with `ui/`.)

## Folder map (src/app/)

Flat 90+ files → role folders derived from the actual import graph:

| folder | contents | files |
| --- | --- | --- |
| (root) | WorkflowBuilder.vue, WorkflowSetup.vue, types.ts, `__fixtures__/` | 3 |
| catalog/ | catalog, kinds, labels, Palette | 6 |
| nodes/ | *-node.ts kind logic + node card SFCs + frame + logic-copy + workflow-call | 22 |
| panels/ | NodeConfigPanel + per-kind panels + SchemaEditor + form/assist/ext | 22 |
| list/ | WorkflowList + header/table/modals + row/labels/create/template-lineage | 15 |
| runs/ | RunsPanel, RunNodeOutput, RunPayload, run-*, VersionHistoryPanel, publish-issues | 18 |
| mapping/ | graph-sync, sync, connect-validation, placement, portable | 10 |
| api/ | api barrel + http/defs/labels/runs/versions/export/templates + commands + http-error | 12 |
| embed/ | EmbedWorkflow + picker + embed-props/run | 7 |
| canvas/ | WorkflowCanvas + canvas-* composables + RunWithInputDialog + keymap | 7 |

`styles/` (new): tokens, controls, runs, list, canvas, palette, panels, nodes, vueflow,
schema, dialogs, embed — a contiguous split, order pinned by an `@import` manifest in
`styles.css`.

## Hot files — before/after

| file | before | after | extracted children/modules |
| --- | --- | --- | --- |
| WorkflowCanvas.vue | 1156 | **745** | canvas-connect 149, canvas-placement 136, canvas-run 219, canvas-keyboard 46, RunWithInputDialog 58 |
| NodeConfigPanel.vue | 805 | **377** | LogicNodePanel 152, HumanNodePanel 198, EdgePanel 117, NotePanel 66 (AgentNodePanel already existed) |
| WorkflowList.vue | 799 | **331** | WorkflowListHeader 70, WorkflowTable 224, TemplatesModal 185, ImportModal 106 |
| api.ts | 522 | **14** (barrel) | http 59, defs 123, labels 15, runs 118, versions 118, export 53, templates 65 |
| styles.css | 1634 | **12** (manifest) | 12 domain sheets (largest nodes.css 365) |

Biggest file: 1634 → 745. Largest remaining source: WorkflowCanvas.vue at 745 (kept as the
orchestrator: reactive core — engine/selection/apply/rebuild/publish — plus its 235-line
template; the interaction logic is in composables). All other new units < 400.

## Notes / decisions

- Public entry points unchanged: vite lib entries (index/workflow_setup/workflow_embed),
  custom-element tags, `webComponent()`/`define`. workflow_embed's `./app/EmbedWorkflow.vue`
  import auto-rewrote to `./app/embed/EmbedWorkflow.vue`.
- api split preserves the exact public surface: barrel re-exports the originally-exported
  names only (internal helpers stay module-private or are re-exported just for cross-module
  use, not through the barrel except `humanError`).
- CSS split is a contiguous cut on section boundaries (no reordering); concatenation is
  byte-identical to the original and Vite's `?inline` resolves the `@import` manifest to the
  same bundled string (verified by the unchanged chunk content hash).
- Radius-canon guardrail walks `src/` recursively, so it picked up the moved SFCs and the new
  `styles/*.css` with no discovery change; still green.
- WorkflowCanvas run/overlay refs (`runState`, `viewingRun`) stay in the orchestrator because
  the editor core reads them; the run composable receives them via ctx. Each composable owns
  its own lifecycle side-effects (connect's window pointerup, run's poll clear).

## Verification evidence

- vitest: 420 passed / 42 files (identical to baseline) after each stage.
- vue-tsc: 3 pre-existing errors only (widgets/ports.ts, WorkflowSetup.vue, workflow_setup.ts);
  no new errors.
- build: green; `styles-B18RHa76.js` byte-identical (diff empty) at every stage.
- live smoke (:8085, admin session, isolated Chrome), 0 console errors throughout:
  list loads (5 workflows, header + table + label cell) · builder opens (16 nodes / 27 edges,
  toolbar + palette) · node panel opens (Combine → LogicNodePanel, copy intact) · run drawer
  opens (Past runs → RunsPanel populated).

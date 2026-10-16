# HFR frontend fix round — report

Working dir: `platform/workflows/ui`. Scope: FE-fixable set from `holistic_flow_review.md`.
`platform/workflows/src` (codex lane) and `app/wippy.lock` untouched. CONVENTIONS.md honored;
tokens-only; no emoji in code.

## Per-fix

1. **Partial species purged from the surface (W9).** Removed the Blank-vs-Partial create
   split (single "New workflow" path), the `PARTIAL` row tag, the Partials filter tab, the
   "N partials" counter, and the Call-picker's "Partial" badges + "published partials"
   wording ("Search published workflows", "No published workflows available"). The
   `WorkflowRow` model no longer carries `isPartial`/`partialLabel`; the pure
   `isPartial`/`partialLabel`/`schemaCountText` helpers (surface-only) were removed with
   their tests. API fields (`is_partial`, `partial: 'published'`, the
   `kickside.workflows.partial:<id>` deep-link id) are left intact FE-side — backend cleanup.

2. **Version history made findable.** The header version-history control is now a labeled
   `History` button (was a bare `tabler:versions` icon a reviewer missed) opening the same
   `VersionHistoryPanel`. One component, second entry point, reuses `wf-btn` (+ `.wf-btn.active`).

3. **Single create path + placement.** One create dialog: Name + optional Label + a
   placement line shown only when the host provides `parent-id`. Every new workflow scaffolds
   Start/Finish/Error (folds the two empty-draft create entries). `createWorkflow(title,
   parentId)`; a label writes via the existing `setWorkflowLabels` after create (fails soft).
   Template install now threads `parentId` too. Parent-id read inline (camel-first) rather
   than via `@widgets/useParentId` — that cross-package Ref trips this project's vue-tsc.

4. **List clutter.** New pure `rowSubline(steps, runs)` emits only non-zero fragments, so a
   zero-run workflow reads "8 steps" (never "0 steps · 1 run" / "· 0 runs"); empty when both
   zero, then no sub-line renders.

5. **Error polish (W13).** New pure `parseRunError` folds a run error (JSON `{code,message}`,
   the `Node [uuid] failed:` wrapper, a plain sentence, or a bare token) into `{message, code?,
   generic}`. The run top-toast renders the message + the code as a small `.wf-err-code` chip,
   never raw JSON. Assist failures route through a shared `humanizeAssistError`: the backend
   `message` wins, `assist_unavailable` maps to a directed sentence, other snake_case codes
   degrade to a fallback — the bare `assist_unavailable` token no longer surfaces.

6. **Canvas.** (a) Collision-aware placement: new pure `freePosition`/`overlaps` nudge a
   click-to-place or free drop off any node it would land on top of (drops into a
   loop/parallel body keep their point). (b) Palette: the ~122-tool Tools category folds into
   collapsed module sub-headings (new pure `moduleLabel`/`subgroupByModule`, threshold
   `PALETTE_SUBGROUP_MIN`), derived from the tool ref namespace — jira+confluence fold under
   Atlassian, hub.scan+hub.tools under Hub, etc. Search opens sub-groups.

7. **Template lineage (W14.6).** New pure `parseTemplateLineage`/`templateLineageNote` read
   `state.template_lineage`; the builder header shows a read-only "From template X" note (raw
   ref + version on hover) when present, nothing otherwise (honest absence).

## Tests

Vitest: 347 → 375 (+28), 34 → 36 files. New: `assist-error.test.ts`, `template-lineage.test.ts`;
added `parseRunError`, `rowSubline`, `moduleLabel`/`subgroupByModule`, `freePosition`/`overlaps`
coverage; updated `assist-schema.test.ts` (human message over the bare code) and
`workflow-row`/`workflow-labels` fixtures for the row-model change. All green.

vue-tsc: touched files clean; only the 3 pre-existing errors remain (`ports.ts`,
`WorkflowSetup.vue`, `workflow_setup.ts`). `npm run build` OK → `platform/workflows/static`
(served live at :8085, no-cache disk fs).

## Live check (isolated headless Chrome, :8085, admin@wippy.local)

- List: header "3 workflows" (no partial counter), no Partials filter, no partial vocabulary;
  rows "15 steps · 2 runs" / "6 steps · 2 runs" / "8 steps" (0-run workflow, no "· 0 runs").
- Create: single "New workflow" dialog, Name + "Label optional", scaffold copy, no Blank/Partial.
- Builder header: `Run · Automate · History · Publish`; History opens the version panel (v3/v2/v1,
  Current marker, read-only interface).
- Palette Tools (122) expands into module sub-headers: Atlassian (4 = jira+confluence), Google (14),
  Hub (4), Knowledge (13), Kb10 (10), Slack, Discord, Github, ...
- Run failure toast: "No models found for class: fast" + chip "AGENT_EXEC_FAILED", no raw JSON.
- Lineage: absent on the non-template workflow (honest).

## Backend follow-ups (noted, not done — FE-only round)
- `is_partial` / `is_published_partial` API fields + "published partials" API wording + the
  `kickside.workflows.partial:<id>` component-id prefix still carry the retired "partial"
  semantics; FE ignores them. Owner decision needed on how far to purge the contract/id layer.

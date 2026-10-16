# W18 grouping UI + agent-node panel restructure (FRONTEND)

Lane: FRONTEND, `platform/workflows/ui`. Built on ui HEAD `bb710062` (list redesign, vitest
baseline 324). No `platform/workflows/src` or `app/wippy.lock` touched.

## Scope 1 — W18 grouping

Labels are flat, definition-owned organization metadata (backend contract frozen at
`16775fa9`): `labels: string[]` folded onto each `GET /api/v1/workflows` row, and
`POST /api/v1/workflows/{id}/labels { labels }` writing through the def undo stream.

- **API client** (`api.ts`): `listWorkflows` now maps `labels` (normalized). New
  `setWorkflowLabels(id, labels)` posts the folded set and returns it, normalized. Both
  route through the one canonical rule in `workflow-labels.ts`.
- **Pure grouping module** (`workflow-labels.ts`, new): `normalizeLabels` (trim + drop
  empties + case-insensitive dedup, first casing wins), `allLabels`, `addLabel`,
  `removeLabel`, `hasLabel`, `filterByLabel`, `groupByLabel` (multi-label workflows appear
  under each label, alphabetical, un-labeled collect under a single honest `No label`
  group rendered last). Named distinctly from the pre-existing `labels.ts` (that one is
  title-derivation, unrelated).
- **Row model** (`workflow-row.ts`): `WorkflowRow.labels` added, normalized in
  `toWorkflowRow`.
- **List page** (`WorkflowList.vue`): a Labels column with chips + inline add/remove editor
  (focus-managed input, `@click.stop` so it never triggers row navigation, per-row saving
  state, error banner); a label filter select in the header chrome (shown only when a
  vocabulary exists; All / each label / No label); a Flat | Grouped view toggle; grouped
  view interleaves group headers via a single `listItems` sequence so one row template
  serves both views. Empty states account for the label filter.
- **Styles** (`styles.css`): tokens-only chips, dashed add-affordance, group header,
  filter select, disclosure; table grid widened to 5 columns.

### Location column — dropped, gap filed (backend follow-up)

Investigated end to end. There is **no** cheap, access-checked, UI-reachable read that maps
a workflow to its workspace-tree location without N+1 or coupling:

- `GET /api/v1/workflows` (`repo.list` + `enrich_rows`) carries **no** placement field
  (`parent_id`/`path`/`breadcrumb`). The actor-scoped `component.query` path it uses
  cannot even return placement: `read_port.build`
  (`core/component/src/persist/read_port.lua`) forwards only `meta`/`private_context`/
  `access` to `include_options` and **drops** the `placement` include flag, so
  `include = { placement = true }` is inert through that port.
- No HTTP endpoint returns a batch actor-scoped id→{parent, name} map. The only batch
  id→path primitive (`component.resolve_path_prefixes`) bypasses access control and yields
  encoded path strings without display names — unsafe and unusable for display.
- No module UI renders a per-row workspace location today; `mcp` builds a breadcrumb only by
  accumulating as the user drills into folders (one call per level), never reverse-resolving
  an arbitrary component's ancestry. No shared breadcrumb/path widget exists.
- Resolving each workflow's parent via `list_children`/browse or per-id reads is exactly the
  N+1 to avoid, and couples workflows to the workspace tree.

Since the backend is frozen this round, per the task's escape hatch I show **nothing** rather
than a permanently-empty column of dashes (an empty column is dishonest clutter against the
calm/honesty bar). The column is not shipped.

**Backend fix when unfrozen (either shape, resolution stays server-side + single-call):**
(a) wire `inc.placement` through `read_port.build` so `component.query` returns
`parent_id`/`path`, then resolve parent ids → display names in one batched pass inside
`repo.list` and add `parent_id` + `parent_name`/`breadcrumb` to each list row; or (b) add a
dedicated batch endpoint returning `id → { parent_id, parent_name }` for the actor's
workflows. Once a name/breadcrumb lands on the list row, the UI wiring is a one-line cell
(`WorkflowRow.location`).

## Scope 3 — create placement

- Create call (`api.ts createWorkflow`) already accepts and threads `parent_id`; template
  path (`instantiateTemplate`) already threads `parent_id`. Locked with unit tests
  (thread-when-passed, omit-when-absent).
- `WorkflowSetup.vue` (the workspace "+" create-view) already threads placement via
  `useParentId(props)` — the camelCase-first helper (`parentId` first, `parent-id`
  fallback), so the `useProps` gotcha is handled at the shared-helper level (its own spec
  in `widgets/ui`). No change needed there.
- The list-embedded template installer (`WorkflowList.vue`) passes no parent: the builder
  component only receives a `route` prop and is the module's own standalone management
  surface — there is no host parent-id to thread, so root placement is correct ("if the
  host passes it").

## Scope 2 — agent panel restructure (`NodeConfigPanel.vue`)

Two tiers in the agent section:

- **PRIMARY (always visible):** agent identity picker (shared identity block, above) +
  **Output shape** — the exit-schema `SchemaEditor` promoted directly under identity, plain
  label + one-line neutral hint, assist affordance intact (`surface=
  "workflow.agent.exit_schema"`).
- **ADVANCED (collapsed by default):** tool-calling mode, model override, additional tools,
  run context, behind a `wf-disclosure` toggle whose open state is kept **per node id**
  (persists across node switches in a session).
- Copy moved to `agent-node.ts` (new) as exported, unit-tested constants (CONVENTIONS
  "honest copy as testable data"). The tool-calling hint references the primary Output shape
  by proximity ("the Output shape above") instead of the old "Any requires the exit schema
  below" paragraph. Enforcement wording is deliberately neutral — the auto-implies-enforce
  vs refuse decision is pending in the codex lane; `AGENT_OUTPUT_SHAPE_HINT` is the single
  constant that round updates.

## Verify

- **Tests:** 324 → **351 passing** (35 files), +27. New: `workflow-labels.test.ts` (13 —
  normalize/vocab/add/remove/filter/group incl. multi-label + No-label-last + case-fold),
  `agent-node.test.ts` (4 — copy neutrality), `NodeConfigPanel.test.ts` (2 — mounted panel:
  Output shape primary + advanced collapsed by default, reveals on expand), plus `api.test.ts`
  (+6: labels map, default-empty, create parent_id thread/omit, setWorkflowLabels dedup,
  template parent_id) and `workflow-row.test.ts` (+2: labels normalized on the row).
- **vue-tsc:** clean in all touched files. The 3 remaining errors are the same pre-existing
  ones in untouched files (`widgets/ui ports.ts`, `WorkflowSetup.vue`, `workflow_setup.ts`).
- **Build:** `npm run build` succeeds; static bundle rebuilt.
- **Live (8085):** app up; workflows module is source-served (existing wippy.lock
  replacement), so the rebuilt UI serves live. The **W18 backend labels route/field is not
  reloaded yet** (per `w18_batch.md`, reload not performed), so live label editing +
  grouping-against-real-data is **deferred to post-reload QA**; with no labels present the
  UI degrades honestly (empty labels → everything under "No label", filter hidden, add
  affordance shown). Feature logic verified against fixtures/tests.

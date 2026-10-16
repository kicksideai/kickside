# Workflow list: scroll fix + rich table redesign

Lane: FRONTEND (platform/workflows/ui). Commit `889ac9a3` (source only, not pushed).

## Scroll bug — root cause

The list did not scroll: rows past the fold were clipped and unreachable.

Mechanism (measured live, 47 workflows, viewport 1440x820):
- The list mount is pinned to a definite height: `.wf` is `position:absolute; inset:0`
  (styles.css:83-89) and `.wf-list` is `position:absolute; inset:0` (styles.css:380),
  so `.kx { height:100% }` resolves to a fixed pixel height.
- `.kx-body { flex:1; min-height:0 }` (styles.css:430) consumes exactly the remaining
  height (measured 646px), so the `.kx` root's `overflow-y:auto` never engages.
- The bordered table card `.kx-list` had `overflow:hidden` (styles.css:442). Because
  its overflow is not `visible`, its flex auto-minimum collapses to 0, so `flex-shrink`
  shrank the card to fit (clientHeight 618) while its content was 2762px — the extra
  ~2144px of rows were clipped, not scrollable anywhere.

Siblings (agents/knowledge) use the identical `kx-*` chrome but scroll because their
root is not nested in an absolute full-frame canvas host — `.kx` grows and the shell
scrolls. Workflows shares the frame with the builder canvas, so it must scroll internally.

Fix (styles.css:508-527): make the table card the scroll region — `.wf-table { overflow:auto }`
(was `overflow-x:auto`) and pin the column header with `position:sticky; top:0` + an
opaque background. One-line essence: the card now scrolls its rows with a sticky header
instead of clipping them under a body that can never overflow.

## Table redesign

Owner's chosen 4-column dense table (was 5-col with a Partial + actions column):

`Name | Status | Last run | Updated`

- Name: route/components icon + title + a `Partial` tag when composable; sub-line
  `N steps · M runs` (+ interface `in -> out` for partials).
- Status: version + draft chip — `v3` (published, calm), `v3 · draft` with a pencil
  icon (published with unpublished edits), or `Draft` (unpublished). Draft state rides
  the server `has_draft_changes` field, never re-derived client-side.
- Last run: real engine outcome — circle-check (ok) / alert-triangle (error) /
  spinning loader (running), tone-colored, + relative time; `— No runs` (muted) when
  never run. A failed last run shows the true error outcome.
- Updated: relative time, or `No edits`.

Header chrome unchanged (count, search, All/Partials filter, Templates, New-workflow
menu, install modal + WcMount slot pickers). Whole row clicks through to the builder.

The per-row create-automation button was dropped with the actions column (owner's
design); the create-automation path remains reachable from the workflow's own canvas
(`WorkflowBuilder.createAutomation` still wired to `WorkflowCanvas`). The unused
`create-automation` emit and its `WorkflowList` binding were removed (no dead path).

## Row model (pure TS)

`platform/workflows/ui/src/app/workflow-row.ts` — no Vue, no API. Consolidates the
status/partial/last-run/updated logic that previously lived as ad-hoc functions inside
`WorkflowList.vue`.

- `rowStatus(wf) -> { published, publishedVersion, version, hasDraft, label, tone }`
- `rowLastRun(wf, now) -> { present, tone, icon, label, status, title }`
- `isPartial(wf)`, `partialLabel(wf)`, `schemaCountText(n)`
- `toWorkflowRow(wf, now)` / `mapWorkflowRows(list, now) -> WorkflowRow[]`

Reuses `run-history.ts` (`runStatusTone`, `runStatusLabel`, `relativeTime`) — the same
vocabulary the runs panel uses.

## API gap flagged (backend follow-up, not blocking)

The list API (`GET /api/v1/workflows`) already returns `last_run` per workflow
(run_id, status, error, started_at, finished_at) — so the Last-run column needs **no
N+1 runs query**. Gap: `last_run` does **not** carry the run's `version`. Only the
per-run endpoint (`.../runs`) has it. The chosen Last-run design is outcome + time, so
this is not needed today; but if a future design wants "last run executed v3" on the
list, the backend should add `last_run.version` to the list payload rather than the UI
issuing one runs query per visible row.

## Test delta

- Baseline: 307 passing (31 files).
- Added `workflow-row.test.ts` (17 tests): status chip (v3 / v3·draft / Draft, driven by
  server flag), last-run outcomes (ok/error/pending/none + no-timestamp fallback),
  partial detection + `in -> out` label + `any` for unconstrained boundaries, full
  row fold + order preservation.
- After: **324 passing (32 files)**, +17.
- vue-tsc: clean in all touched files (WorkflowList.vue, workflow-row.ts,
  workflow-row.test.ts, WorkflowBuilder.vue). The 3 remaining vue-tsc errors are
  pre-existing and in untouched files (widgets/ui ports.ts, WorkflowSetup.vue,
  workflow_setup.ts).

## Build + live verification

`npm run build` succeeded (rebuilt `platform/workflows/static/index.js` + `styles-*.js`).
Verified live at http://localhost:8085 (admin@wippy.local), isolated Chrome:
- `.wf-table` now `overflow-y:auto`, `canScroll:true`; `scrollTop` moved 0 -> 1854
  (scrolled through all rows); sticky header stays pinned (top offset 1px after scroll).
- Columns render Name / Status / Last run / Updated over 42 rows.
- Real states confirmed: `v2` chip; `v1 · draft` / `v2 · draft` with pencil; `Partial`
  tag + `5 -> any`; failed last run shown as red alert-triangle + relative time;
  Draft + `— No runs` for unpublished/never-run workflows. Search/filter intact.

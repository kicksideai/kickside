# Final frontend stitch — workflows UI

Lane: FRONTEND, `platform/workflows/ui`, built on ui HEAD `97933563` (vitest baseline 375).
No `platform/workflows/src`, `app/wippy.lock`, `platform/recipes/ui`, or `platform/automation/ui`
touched. Contracts: `final_backend_batch.md` + `vocab_cleanup.md`.

## Per-item

1. **Export** — `exportWorkflow(id)` in `api.ts` reads `GET /workflows/{id}/export` (the
   `{ success, portable }` source artifact), `portable.ts` derives an honest
   `<slug>.workflow.json` filename + does the Blob download. Surfaced two ways: a per-row
   overflow (kebab) menu in `WorkflowList.vue`, and an icon button in the builder header
   (`WorkflowCanvas.vue`). Both are published-only per the contract (backend `export` requires
   a published version) — disabled on a draft with a directed hint ("Publish this workflow
   first…"). The builder gates on a `publishedVersion` loaded via `listWorkflowVersions` on
   mount + updated on publish; the list row gates on `row.status.published`.

2. **Import** — `importWorkflow(portable)` posts the portable object to `POST /workflows/import`
   and maps `{ workflow_id, title }` → navigates to the new draft. An "Import" affordance sits
   next to New workflow: a modal with a file pick (native input) and a JSON paste area. Malformed
   JSON is caught client-side; a backend `portable_invalid` 400 renders the server's own directed
   message (W13).

3. **Location column** — `WorkflowSummary` gains `parent_id/parent_name/breadcrumb` (mapped in
   `api.ts`, present only on placed+readable rows). `workflow-row.ts` folds them into
   `WorkflowRow.location` (`{ present, label, title }`); the list renders a compact, truncated
   breadcrumb cell that shows nothing (never a dash) when unplaced. Grouped-by-label view
   unaffected (same row template). Table grid widened 5→7 columns (added Location + a narrow
   actions column).

4. **Publish-gate errors on the node** — `publishWorkflow` now throws a `PublishError` carrying
   the structured `{ code, message, node_id }` issues (previously flattened + discarded). New
   `publish-issues.ts` (honest-copy-as-data): `nodeIssueMessage` peels the redundant "node <id>"
   prefix leaving the directed instruction, `issuesByNode` groups by node id (dropping whole-graph
   reasons to the banner), `PUBLISH_GATE_HINT` is the copy constant. `WfNodeData.issue` threads
   through `buildFlowData`; `WorkflowNode.vue` renders a danger outline + corner alert mark with
   the reason in a tooltip. Marks clear on load + on successful publish. The `node_config_missing`
   code from the batch report maps to this surface.

5. **is_partial sweep** — removed the dead list-level `is_partial`/`is_published_partial` reads
   from `api.ts` + `WorkflowSummary` (types.ts), the `is_partial` field from `WorkflowVersionDetail`
   + its mapping, and the `summary.is_partial === true ||` tolerance in `workflow-call.ts`
   (partiality now derives solely from the graph interface `!!iface`). `WorkflowCallCandidate.is_partial`
   (a derived local field) and the unrelated `is_partial_call` (call-node port decoration) are
   retained. `partial: 'published'` request param kept (CONVENTIONS-documented; client-side narrowing
   still holds).

## Tests

375 → **389** green (+14). New: `portable.test.ts` (3, filename slug/fallback), `publish-issues.test.ts`
(4, prefix-peel + code fallback + node grouping), `api.test.ts` (+5: placement fold/omit, export read,
import map, malformed-import directed message, PublishError issues), `workflow-row.test.ts` (+2,
breadcrumb→location present/absent). Removed the retired `is_partial`/`is_published_partial` assertions
from the two api.test cases; added `location` to the workflow-labels/workflow-row row fixtures.

vue-tsc: clean in all touched files. The 3 remaining errors are the same pre-existing ones in untouched
files (`widgets/ui ports.ts`, `WorkflowSetup.vue`, `workflow_setup.ts`) noted by the W18 lane.
`npm run build`: succeeds; static bundle rebuilt.

## Deferred to backend reload (live 8085 predates tonight's src commits)

- Export/import REST round-trip, the list-row `parent_id/parent_name/breadcrumb` fields, and the
  `node_config_missing` publish-gate refusal are served by the new (unreloaded) src. Live-verify after
  reload. Client-side behavior (import modal, overflow menu, empty-when-unplaced Location cell,
  node-mark rendering given issues) is covered by build + unit tests.

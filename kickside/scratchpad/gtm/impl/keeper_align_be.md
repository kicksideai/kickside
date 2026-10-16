# Keeper-aligned workflows backend: run state and version history

## Outcome

This slice keeps workflow definitions, versions, and run rows in the workflow
module/database, while aligning runtime inspection with Keeper's dataflow
contract. It adds read-gated run linkage, a workflow-scoped raw timeline and
export, immutable version diffs, and restore-as-a-new-draft provenance.

## Packaged Keeper provenance check

The app lock pins `keeper/keeper` at `0.5.51`. Before choosing a reuse path, the
live application on `:8085` was read using an admin token issued through
`POST /api/public/user/token` (credentials were never written to output).

- `GET /api/v1/dataflows` returned `200` and `{ success, dataflows, count }`.
- `GET /api/v1/dataflows/{id}` returned `200` and the packaged runtime shape
  `{ success, dataflow, nodes, data }`.
- `dataflow` includes `dataflow_id`, status/type/timestamps and runtime metadata;
  node rows include engine node and parent-node identities; data rows are raw
  engine records.
- No verified packaged run-scoped timeline HTTP route was available. Candidate
  event/audit paths resolved to the HTML app shell rather than a JSON timeline.

The live app did not hot-load the newly declared workflow endpoints during this
read-only session; no restart was requested or performed.

## APIs / FE contract

All paths are under `/api/v1`; `{id}` is the workflow id.

### 1. Run ↔ engine linkage

`GET /workflows/{id}/runs/{run_id}` is READ-gated and now returns:

```json
{
  "success": true,
  "run": { "run_id": "…", "dataflow_id": "…", "parent_run_id": "…", "call_node_id": "…", "depth": 1 },
  "execution": {
    "dataflow_id": "…",
    "parent_dataflow_id": "…",
    "parent_run_id": "…",
    "children": [{ "run_id": "…", "workflow_id": "…", "dataflow_id": "…", "status": "…" }],
    "process": { "id": "…", "host": "…", "pid": "…" }
  },
  "nodes": [{ "engine_node_id": "…", "parent_engine_node_id": "…", "def_node_id": "…", "status": "…" }]
}
```

`execution.process`, engine snapshot fields, and nodes are omitted/empty when
older runs have no dataflow or the engine has no process identity. The canonical
generic runtime inspector link is `/api/v1/dataflows/{dataflow_id}`.

### 2. Run event timeline

`GET /workflows/{id}/runs/{run_id}/events?limit=100&offset=0` is READ-gated.
`limit` is clamped to 1–200. The response is:

```json
{
  "success": true,
  "timeline": {
    "events": [{ "seq": 1, "occurred_at": "…", "source": "workflow_run|engine", "type": "run.started|node.created|node.updated|data.<engine-type>", "engine_node_id": "…", "raw": {} }],
    "count": 0,
    "limit": 100,
    "offset": 0,
    "next_offset": 100
  }
}
```

`raw` is the FE expansion payload. Workflow run projection supplies lifecycle
events; the engine's persisted node/data records supply the remaining events.
Secret-shaped keys are redacted before emission.

Decision: **duplicate a thin workflow timeline, link the generic inspector**.
Keeper 0.5.51's verified dataflow detail is reused through the `dataflow_id`
deep link, but its packaged surface did not provide a verified run-scoped
timeline contract. A workflow-owned adapter is necessary to retain the workflow
run lifecycle and pinned-version context.

### 3. Run export

`GET /workflows/{id}/runs/{run_id}/export` is READ-gated and returns:

```json
{ "success": true, "export": { "schema_version": 1, "kind": "workflow_run_export", "run": {}, "execution": {}, "dataflow": {}, "nodes": [], "data": [] } }
```

This is the full engine-debug record available to the run inspector, with
secret/token/password/credential/cookie/key-shaped fields redacted. It excludes
engine actor context and actor id, so it does not expose additional identity
data beyond the workflow inspector.

### 4. Version diff and restore-as-new-draft

`GET /workflows/{id}/versions/diff?from_version=N&to_version=M` is READ-gated:

```json
{ "success": true, "diff": { "from_version": 1, "to_version": 2, "interface": { "before": {}, "after": {}, "changes": [] }, "graph": { "nodes": { "added": [], "removed": [], "changed": [{ "id": "…", "before": {}, "after": {} }] }, "edges": { "added": [], "removed": [], "changed": [] } } } }
```

`interface.changes` is the existing W14 compatibility-diff machinery; graph
delta uses stable node/edge IDs and carries before/after values for changes.

`POST /workflows/{id}/versions/{n}/restore` is WRITE-gated. It creates an
unpublished, distinct workflow draft and returns:

```json
{ "success": true, "workflow": { "workflow_id": "new-id", "status": "draft", "published": false, "restored_from": { "workflow_id": "old-id", "version": 1, "def_seq": 4 } } }
```

The source version is never altered. The destination definition stream appends
`kickside.workflows.events:version.restored`; its state exposes
`version_lineage` with source identity/version/sequence and restore attribution.

## Verification

- Baseline: chunked `make test` green, **13/13 test entries**.
- Final: chunked `make test` green, **13/13 test entries**.
- Added three assertions/cases: version graph/interface diff, restore lineage,
  and engine linkage/timeline/export redaction.
- Focused checks passed for `versions_test`, `definitions_api_test`, and the
  new run-debug case in `runs_test`.

No UI files, app restarts, git checkout/stash/push, or `app/wippy.lock` hunks
were changed.

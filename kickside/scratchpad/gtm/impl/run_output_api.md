# Run output on run detail API

## Shapes found

- The existing endpoint is `GET /workflows/{id}/runs/{run_id}` in `platform/workflows/src/api/exec_api.lua:275-287`. Its unchanged gate is `guard(res, id, repo.ACCESS.READ)` at line 280; `guard` returns 401 without an actor and 403 when `repo.require_access` denies the requested mask (`exec_api.lua:37-50`).
- The read-model mapper already returns the pinned run `version` and the existing run-level `error` (`platform/workflows/src/runs.lua:166-189`, especially lines 170 and 177). The original storage schema makes `version` non-null and stores `error` on `workflow_runs` (`platform/workflows/src/migrations/03_workflow_runs.lua:12-24`). No version storage was added.
- Terminal states are `completed`, `failed`, `cancelled`, and `terminated` (`platform/workflows/src/types.lua:50-65`). A successful Finish is represented by `completed`, not a stored `finished` status.
- `runs.output_for_run` accepts only completed runs and returns `output_sample_for(dataflow_id)` (`platform/workflows/src/runs.lua:1084-1114`). `await_result` exposes that same value as `output_sample` (`runs.lua:1116-1140`).
- The detail helper and existing handler now live at `platform/workflows/src/api/exec_api.lua:118-133` and `:275-287`. It adds `run.output` only when `run.status == "completed"`; the handler's READ guard is unchanged.

## Response contract

All pre-existing `run` fields retain their existing shape. The following are exact representative JSON responses; optional legacy run fields remain omitted when absent.

Completed (the successful/"finished" case):

```json
{
  "success": true,
  "run": {
    "run_id": "run-123",
    "workflow_id": "wf-123",
    "version": 7,
    "dataflow_id": "df-123",
    "trigger_kind": "manual",
    "origin": "published",
    "status": "completed",
    "started_at": "2026-07-09T12:00:00Z",
    "finished_at": "2026-07-09T12:00:01Z",
    "depth": 0,
    "workflow_stack": [],
    "output": {
      "result": {
        "score": 0.82
      }
    }
  },
  "nodes": []
}
```

Failed:

```json
{
  "success": true,
  "run": {
    "run_id": "run-124",
    "workflow_id": "wf-123",
    "version": 7,
    "dataflow_id": "df-124",
    "trigger_kind": "manual",
    "origin": "published",
    "status": "failed",
    "error": "finish exploded",
    "started_at": "2026-07-09T12:00:00Z",
    "finished_at": "2026-07-09T12:00:01Z",
    "depth": 0,
    "workflow_stack": []
  },
  "nodes": []
}
```

Running:

```json
{
  "success": true,
  "run": {
    "run_id": "run-125",
    "workflow_id": "wf-123",
    "version": 7,
    "dataflow_id": "df-125",
    "trigger_kind": "manual",
    "origin": "published",
    "status": "running",
    "started_at": "2026-07-09T12:00:00Z",
    "depth": 0,
    "workflow_stack": []
  },
  "nodes": []
}
```

`output` is deliberately absent, rather than `null`, for failed and non-terminal runs. The existing run-level `error` is unchanged; successful/running examples omit it when it has no stored value.

## Truncation decision

`output_sample_for` directly returns the dataflow client's `:output(dataflow_id)` value and this module neither persists nor truncates it (`runs.lua:1084-1105`). Therefore `run.output` uses the raw Finish payload returned by `output_for_run` (the same value that `await_result.output_sample` contains), not a renamed or invented sample/truncation format. If the dataflow client itself bounds a payload, that returned value is passed through unchanged.

## Tests

- Baseline before this change: 207 total tests, including 206 workflows tests (the requested historical 205 baseline was already exceeded in the worktree).
- Added four cases in `platform/workflows/src/runs_test.lua:1389-1462`: completed output equals `await_result.output_sample` and keeps version; failed error/no output; running no output/error; unauthenticated endpoint remains 401.
- `cd platform/workflows/test && wippy run test` after implementation: 211 total tests, including 210 workflows tests, all passing (+4).

## Live-service note

The live app on port 8085 was not queried, rebuilt, or restarted. Applying this backend source change to that live process requires its normal module reload/redeploy/restart; no UI static rebuild is required.

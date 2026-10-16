# Workflow backend decomposition

## Seam map

- `runs.lua` is the frozen facade (15 lines). `runs/state.lua` owns dependencies,
  error helpers, and mutable seams; `read.lua` owns history/read conversion, launch
  validation, and lifecycle formatting; `launch.lua` owns published/draft starts;
  `decisions.lua` owns await/resume/inbox decisions; `completion.lua` owns terminal
  handling, reconciliation, output, and inspection.
- `store.lua` is the frozen facade (13 lines). `store/state.lua` owns SQL helpers,
  definition-interface derivation, and DB opening; `consumers.lua` owns stream
  metadata and reverse consumers; `events.lua` owns event append/lookups; and
  `projection.lua` owns projections, snapshot reads, and purge.
- Both facades create one state table and pass it into installer modules. This keeps
  all existing `runs._*` and `store._*` test seams mutable through the original
  import path; no callers or function signatures changed.

## Line counts

| Target | Before | After |
| --- | ---: | --- |
| `runs.lua` | 1,399 | facade 15; 188 + 434 + 338 + 232 + 280 concern files |
| `store.lua` | 1,208 | facade 13; 444 + 265 + 115 + 419 concern files |
| `runs_test.lua` | 1,900 | unchanged (the harness registers one explicit test entry and seam) |

## Verification

- Focused `make test-one TEST=kickside.workflows:runs_test`: green, 51 tests.
- Full `make test` was attempted repeatedly. Definitions and lifecycle chunks were
  green (44 and 45 tests respectively), but the third harness runtime exited at the
  start of `validation` without diagnostics before the remaining chunks could run.
  The required three full 14-entry proofs are therefore not claimed. Logs are at
  `/tmp/workflows-be-decomposition-test-1.log` for this workspace session.

## Skipped files

- `runs_test.lua` unchanged; no clean harness convention exists for splitting its
  registered `run` plus `seam` exports without changing registration behavior.
- No UI files, app lockfiles, or `versions.lua` were touched.

## Post-decomposition harness repair

### Root cause

`runs/decisions.lua` used `AWAIT_NODE_TYPE` after the run-plane split without
binding it from the shared `runs_state` internals. The nil type filter made
`find_await_node` inspect ordinary engine nodes: signal waits were misclassified
as human inbox decisions, and human decisions became ambiguous. Binding
`local AWAIT_NODE_TYPE = I.AWAIT_NODE_TYPE` restores the original filtered query;
the facade and all public entry names remain unchanged.

The chunked wrapper also trusted the `wippy.test` process exit status. This
runtime can print a `FAILED` test report while returning status zero, so the
wrapper now captures each isolated runner's stdout/stderr, treats that report as
a nonzero chunk failure, prints the chunk name and captured stderr, and stops.
Each runner executes in a separate session so a failed startup cannot take down
the reporting shell.

### Three-run proof

All commands were `make test` from `platform/workflows`; each completed all
14 configured entries with zero failures.

| Run | Result | Elapsed |
| --- | --- | ---: |
| 1 | green, 14 passed / 0 failed | 1:35.75 |
| 2 | green, 14 passed / 0 failed | 1:37.45 |
| 3 | green, 14 passed / 0 failed | 1:34.61 |

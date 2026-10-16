# W18 backend batch

No live process was restarted or written to. Each change below requires the next module/app reload to take effect on port 8085.

## Task 1 — definition labels and opaque placement

- What: added flat, definition-owned string labels through the ordinary workflow CQRS stream (`labels.set`), including validation, snapshot/list folding, undo, and `POST /workflows/{id}/labels`. Labels carry no hierarchy or access semantics. `parent_id` is passed unchanged from create and template instantiation into component registration, with absent values retaining standalone behavior.
- Where: `platform/workflows/src/types.lua:114`, `platform/workflows/src/workflow.lua:245`, `platform/workflows/src/store.lua:452`, `platform/workflows/src/repo.lua:129`, `platform/workflows/src/api/write_api.lua:112`, and `platform/workflows/src/template.lua:415`; coverage at `platform/workflows/src/workflow_test.lua:75` and `platform/workflows/src/access_test.lua:44`.
- Verification: baseline `wippy run test` was 249; after Task 1, 252 passed (+3). Commit `16775fa9 workflows: add definition labels`.
- Reload required: yes (new API route and module code); not performed.

## Task 2 — HITL reconciliation terminal orphan retirement

- What: reconciliation now recognizes durable `workflow_reconciliation_failure` notices as terminal records, and retires a resolved decision whose missing workflow-run has an already-terminal dataflow. It emits one durable failure notice only if none exists; later scans classify it as retired instead of repeatedly failing.
- Where: `platform/workflows/src/hitl_reconciliation.lua:347` and `platform/workflows/src/hitl_reconciliation.lua:429`; reproduction coverage at `platform/workflows/src/runs_test.lua:1061`.
- Live DB diagnosis (read-only): the four rows cited by the 30-second log are `workflow_reconciliation_failure` notices (one approved, three dismissed), which intentionally have no repair contract. Their four linked `workflow_decision` records are approved and reference completed engine dataflows, but there are no matching `workflow_runs` rows. They are historical items from before the run-projection migration, not deleted parents or repairable awaits. Disposition: four notices are terminal (`retired_failure_notices=4`) and their four source decisions are terminal historical orphans (`retired_missing_run=4`, reported); neither is retried.
- Verification: after Task 2, 253 passed (+1 / +4 from baseline). Commit `e91576d2 workflows: retire terminal hitl orphans`.
- Reload required: yes (reconciler code); not performed.

## Task 3 — single-prefix run errors

- What: normalized only an immediately nested, identical node envelope at workflows' completion boundary. The full inner engine reason, including multiline diagnostics, is retained; a different inner node remains unchanged as causal context.
- Where: `platform/workflows/src/runs.lua:1192` and `platform/workflows/src/runs.lua:1226`; exact live-shape coverage for run `59a02258-d459-4d08-8cbf-331fe2324c8a` at `platform/workflows/src/runs_test.lua:644`.
- Verification: the new test first failed against the duplicated error and then the full suite passed 254 (+1 / +5 from baseline).
- Reload required: yes (completion-path code); not performed.

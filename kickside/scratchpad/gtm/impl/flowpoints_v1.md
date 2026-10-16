# Flow Points v1 implementation report

## Stage 1 — platform behavior module

Added `platform/flowpoints`: versioned typed `flow.point` declaration validation,
sparse instance `flow.binding` persistence, revision-invalidated negative resolver
cache, fixed authority envelope, `invoke -> kickside.runnable:launch` descriptor,
and bounded `await`. The module owns its migration, lock, and standalone harness.

## Stage 2 — workflows contribution

Added workflows contracts for graph-derived target inspection, materialized
`flow.binding` consumer rows, and observation promoted from `runs.await_result`.
`suspension: forbidden` rejects published Await/human graphs. Timeout observation
now asks the dataflow client to terminate when `cancel_on_timeout` is set.

## Stage 3 — REST contract

Added the component-hosted REST shape for point list, exact bind, and unbind:
`GET /flow-points/{component_id}`, `PUT|DELETE /flow-points/{component_id}/{point_id}/binding`.
This is the FE WC contract: list rows expose declaration/default/current binding;
the follow-up client renders Customize only for workflow defaults and bind/unbind
from these routes.

## Verification

- Flowpoints harness: 3/3 passing.
- Focused workflows flow-point suites: 8/8 passing (including setup).
- `platform/flowpoints` lint: clean, 14 entries.
- Full workflows lint is currently red in pre-existing unrelated entries; focused
  runnable/flow-point harnesses pass.

## Wiring required before loading

The orchestrator must add the `kickside/flowpoints` replacement to the app lock,
wire its `target_db`, load it before consumers, and add the workflows dependency
needed to bind `kickside.workflows:flow_point_target_inspection`,
`kickside.workflows:flow_point_consumers`, and `kickside.workflows:run_observation`.
No app/wippy.lock hunk was changed here.

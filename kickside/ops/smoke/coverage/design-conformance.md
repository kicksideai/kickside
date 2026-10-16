# Reliability design conformance

## DC-12: runtime LLM configuration

Issue `DESIGN-LLM-INERT-CONFIGURATION`; guard `sync_llm_configuration`.
The baseline declaration exposes generation settings but `strategy_llm.apply`
sends only the model and temperature zero. The strategy now resolves one request
from direct fields and the policy's runtime fields before authorization or generation.
Its `describe` method applies the same validation during sync install/reconfigure.
`wippy.llm:llm` owns model resolution, provider capabilities and actual generation.

Runtime policy values retain the published v1 paths `model.selector`,
`sampling.temperature`, `budgets.runtime` and `prompts.runtime`. These paths come
from `4146178ad:platform/transform/src/generation_policy.lua:runtime_options`;
the current item strategy replaces that retired runtime caller. A policy is optional,
including its type/version labels. Flat model, sampling and budget fields agree with policy values when both
are supplied; an explicit prompt overrides the policy prompt. Existing generation-time policy metadata remains stored.

Omitted values retain `class:fast`, the concise-summary prompt, temperature zero,
and no caller token-budget override. Published poll names remain accepted and
map to the same `round.page_size`, `round.max_pages`, and `round.max_items`.
This preserves the acquisition vocabulary under the current no-break owner rule,
which supersedes removal wording in OWNERSHIP A36.

The guard installs actual sync components, reads their durable drive declarations,
then calls the item strategy through the native LLM library to a capturing provider.
It proves each setting at the provider request, omission defaults and poll bounds.
The directly affected transform suite proves malformed settings perform no effect.
SQLite/PostgreSQL red evidence reports temperature 0.7 reaching the provider as 0;
green evidence reports all 28 sync-kind checks passing. Evidence lives under
`scratchpad/sol-lanes/dc-p2/evidence/` outside the repository.

## DC-10: native workflow recovery

Issues `DESIGN-WORKFLOW-NATIVE-EVIDENCE-CONFORMANCE` and
`WORKFLOW-ADMITTED-PENDING-REACTIVATION`; guard `workflow_native_recovery`.

The owner brief limits repairs to reliability and preserves the published API.
The frozen sources are FINAL-DESIGN-v5 §7.3, CONTRACTS §16–17, DDL Dataflow 10
and WFL-01–05 in ACCEPTANCE-IDS. Their explicit `admission_key`,
`ever_activated`, fixed same-key generation and `ack_terminal` ABI remains
absent from the published native engine. The operational decision uses the
existing native owners below; it does not introduce the frozen parallel protocol.

One observation defect is reproducible. An admitted workflow can observe native
`pending` between durable activation and the engine's running-status write.
The baseline adapter calls `start` again, advancing the activation generation.
The native admission crash guard reports generation 2 instead of 1 on SQLite
and Postgres; the deterministic pending-observation guard reports one start
instead of zero. The adapter now treats an admitted pending flow as outstanding
execution without creating, starting or executing it again. Admission records a
successful durable request; the native overseer retains responsibility for it.
The row continues to occupy capacity and receive indexed completion checks.

The tests do not show duplicated node results or lost runs from this extra
activation in the linear fixture. The repair removes the observer's mutation of
engine intent and preserves the original admission generation. The native fencing
that absorbs repeated unadmitted requests remains the engine's responsibility.

| Frozen concern | Native owner and evidence | Decision |
|---|---|---|
| admission_key / same-key creation | [admission.reserve](https://github.com/kicksideai/kickside/blob/main/platform/workflows/src/runs/admission.lua) commits one unique workflow/trigger/dedup row and its exact creation payload before calls; Dataflow primary key fences duplicate create. Concurrent retries return one run/dataflow and one result per node. | Preserve published keys and API. |
| ever_activated / terminal evidence | [engine_api](https://github.com/kicksideai/kickside/blob/main/platform/workflows/src/runs/engine_api.lua) reads public status/output. Missing admitted flows are never recreated; read errors retain the reservation. Callback and checker share the nonterminal CAS in [admission.merge](https://github.com/kicksideai/kickside/blob/main/platform/workflows/src/runs/admission.lua). Native failed/completed/cancelled/terminated history remains terminal. | Preserve native outcomes; no new evidence decoder or column. A manually cancelled pre-start flow remains cancelled history rather than a replacement activation. |
| activation generation | Dataflow `src/persist/activation_repo.lua:235` advances the lifecycle fence on requests. `src/runner/overseer_state.lua:272` retains a monitored named owner across generations; `src/runner/orchestrator.lua:1293` adopts the durable fence before execution. | Generation is an engine lifecycle fence, not a frozen admission generation. Admitted completion observation now sends no start; unadmitted concurrent requests still use native fencing. |
| terminal acknowledgment / retention | Dataflow `src/retention/sweeper.lua:5` only prunes diagnostics/applied commit history. It retains status, public inputs/outputs and node results without an acknowledgment deadline. The live guard ages 25 completed flows, proves diagnostics are pruned, then recovers every pending workflow from retained output. | Retention protects the sole proof without ack_terminal. No evidence deletion or new cleanup protocol. |
| callback/admission ordering | Six caller-death boundaries cover insert, create, start, terminal, native callback and admission. The checker preserves completed history, commits admission, and publishes one event. | Native callback remains a latency hint. |
| capacity / lost callbacks | Exactly 25 native completions have no callback; the 26th reservation returns capacity. Indexed recovery finalizes all 25, then the 26th admits and same-key retry returns the same row. | Preserve the native admission gate and bounds. |
| event append / acknowledgment | [maintenance](https://github.com/kicksideai/kickside/blob/main/platform/workflows/src/runs/maintenance.lua) commits claims before append and clears pending by token CAS. The guard loses the response after durable append, retries, and observes one external event identity and one live subscribed notification. | Preserve the existing publication protocol. |

The focused smoke guard also hard-restarts the real runtime while a native Review
wait is durable, resumes the same decision, then hard-restarts after completion.
The same run id, terminal status and output survive; run history remains singular.
The workflow module's native tests cover interrupted publication and retention.
Native test gates use runtime 083d662, fresh Hub versions and local sibling mains.
Observation, admission, capacity and publication checks use four registered test
entries. All 20 cases and the native 30-second per-entry deadline remain intact;
the guard invokes every entry plus the supervised-maintenance entry.

These proofs cover the specified workflow boundaries. They do not claim arbitrary
provider side effects become exactly once, nor that the unpublished frozen ABI is
implemented. Dataflow's same-runtime owner-loss policy is a fenced terminal failure
(`src/runner/overseer_state.lua:3`); boot recovery and durable external waits remain
engine-owned. The public Workflow/Dataflow API and native stored shapes stay intact.

## Compatibility

DC-12 removes no registry entry, contract, endpoint, field, or stored data. There
is no migration. Declarations omitting generation settings retain their behavior.
Explicit accepted generation values now change the provider request. Invalid
numeric types/nonfinite temperatures/nonpositive or fractional token budgets,
unsupported policy labels, and disagreeing flat/policy values fail validation
before an effect. Valid published v1 runtime paths remain accepted. Policy metadata
outside the item-runtime fields remains stored and does not create another runtime.

DC-10 adds no migration or public field. Pending observation after durable
admission retains the reservation and completion schedule without another start.
Existing unadmitted recovery, terminal outcomes, cancellation, callback handling,
publication identity and retention remain unchanged. No C-only conversion.

## Upstream

Runtime 083d662 rejects the Dataflow main replacement's test symlink
`test/node_decode_fixture.lua` as a nonreproducible module tree. Verification uses
a lane-local copy of that local main with the symlink dereferenced. The Dataflow
land tree and every off-limits upstream remain unchanged.

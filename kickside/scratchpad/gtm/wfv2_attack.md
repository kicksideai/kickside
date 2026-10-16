# Workflows v2 design — adversarial review (attack)

Target: `scratchpad/gtm/workflows_v2_design.md`. Charter: `workflows_v2_decisions.md`
(W1-W5). Ground truth: `workflows_v2_recon.md` + spot-checks of `platform/workflows`,
`platform/automation`, `crm`. GTM canon: `decisions.md` (A3, A4, A6, A7, A10).

Verdict up front: the event-side triad is sound and correctly anchored. The design fails
the W5 litmus on the NODE side, mis-models nested execution against the real engine, and
under-specifies three contracts (runnable descriptor, dispatch-time authority, A4 recovery
for nested AWAIT) that GTM P1 and A10 canon require. Nine of the design's code anchors are
accurate; four are spun and two are contradicted by code (detailed inline).

---

## Findings

### F1 — Inline child-run accounting has no state-transition driver. BLOCKER
Design §7.11-16 has `invoke_definition` create a `workflow_runs` row (`inline=true`,
`parent_run_id`) that "starts" on control-command return and "finishes when the parent func
node completes from child outputs," plus per-child `run.started/finished/failed` (§7.1).
The engine does not work this way. Fold-in creates children as **nodes in the parent
dataflow**, not a child run: `func/node.lua:256-289` splices `_control.commands` via
`n:command(cmd)`; there is no child dataflow, no child run. Every platform run transition is
driven only by the **top-level** dataflow: `runs.lua:416-417` (RUNNING before
`cli:start`), `on_complete` hook wired at `runs.lua:404/408/417`, terminal via
`run_completed` `runs.lua:698-724`, and the 30s reconciler `runs.lua:726-749`. Nothing
observes an inner func node completing, so an inline child row can be inserted but **never
transitioned**, and its lifecycle events have no emitter. Failure is worse: an
error-discriminated child leaf fails the **parent** func node with `CHILD_WORKFLOW_FAILED`
(`func/node.lua:136-144`) — the platform sees the whole parent dataflow fail with no signal
identifying which nested def failed.
- Scenario: nest `research` inside `precall` (sync). The inline child row sits PENDING
  forever; `run.finished` never fires; any chain/dashboard bound to it (the design's own
  §7.8 selling point) silently never triggers; the runs UI shows a phantom pending child.
- Correction: for W-A, drop inline child rows and per-child lifecycle events — account
  nested execution only at the parent run and document fold-in as invisible-inline (matches
  engine reality). Per-child accounting needs a per-node completion hook the engine does not
  expose; do not assert it as if it exists.

### F2 — W5's palette-node contribution is undesigned; the litmus fails on the leg recon flagged weakest. BLOCKER
W5 requires CRM to contribute `Resolve contact` as a sweep-discovered palette node with
typed I/O, its own config WC, read-your-write output, feeling native. Verified: CRM
contributes **zero** `kickside.workflows.node` entries (grep clean across `crm/`). The node
meta model has `output_schema` but **no `input_schema`** (`node_kinds.lua:52`;
`node_validation.lua:13-32` NODE_META_FIELDS) — a business node cannot declare a typed
INPUT, so a mapping *into* a node cannot be schema-checked, which directly defeats W5(3)
"typed outputs flow across module boundaries through the mapping primitive." The design's
four artifacts (Definition, Trigger Point, Binding, Mapping) do **not** include the
domain-node contribution contract; §13 snap-together omits the node→definition seam
entirely; §8.1 fixes node schema but is scheduled W-B; §12 puts the CRM node at GTM P1
"W-B ready." Yet §14 step 5 asserts "First node is CRM Resolve contact, declared as a
business workflow node" as if the grammar exists. (Recon C.3 already called node schema "the
weak leg"; the reference node that DOES exist — `wapps/research/src/workflow/_index.yaml:21`,
using `wc-agent-picker` — still declares output only.)
- Scenario: a design review runs the W5 trace; the only artifact that makes CRM's capability
  a native palette node with typed input for the mapping to target is not in W-A, so the
  litmus cannot be walked end to end natively — it is walked on the trigger/binding half and
  hand-waved on the node half.
- Correction: elevate the domain node-kind declaration grammar to a W-A first-class contract:
  `meta.input_schema` + `meta.output_schema` + config-WC convention (per-node, like the
  binding-creator WC) + read-your-write checkpoint on output (A10 canon 2 / A1(d)); the
  mapping primitive validates against node `input_schema`. Add the node→definition seam to
  §13. Without this the litmus is not expressible and F4 (mapping needs typed inputs) has no
  ground.

### F3 — Run lifecycle events are a workflows dialect, not the A10 canon-4 shape. MAJOR
A10 item 4 mandates ONE canonical `run.started/finished/failed` schema "reusable by
jobs/agents." Design §7.1 registers them under `kickside.workflows.events` and emits on the
workflow-definition component thread. Agents run, tusker jobs run (per MEMORY), A6 promotion
runs — all need the same shape. Minting a workflows-namespaced event is exactly the parallel
dialect A10 forbids ("new components may not ship parallel dialects of any of the six").
- Scenario: P5 agent_eval / delegation need run lifecycle events; they either re-invent a
  second schema (dialect sprawl) or borrow `kickside.workflows.events` under the wrong owner.
- Correction: declare the run-lifecycle schema as a platform-canonical entry (core/shared
  runnable-events namespace); workflow runs are its first *emitter*, not its *owner*.

### F4 — Runnable descriptor/discovery is an implicit convention, not a declared contract. MAJOR
§1.12 says workflows/agents/tools/sinks/recipes "can expose runnable descriptors" and §6
defines `runnable_ref` + `kickside.runnable:launch` (the call), but there is **no declared
registry grammar** for how a module advertises "I am runnable with THIS input/output schema"
and **no catalog contract** the binding creator's runnable picker enumerates. §13's
"Binding→Runnable" row cites only the launch call, not discovery. Contrast the source/sink
side, which HAS a real declared catalog: `automation.lua:1248-1275` `build_catalog` derives
descriptors from `kickside.automation.port` entries + `contract.binding` class
(`:1190-1243`). The runnable side has no equivalent — so "same picker regardless of module"
(W5(4)) rests on each module hand-wiring ad hoc.
- Scenario: `kickside-binding-creator` (§5.13) with `allowed-runnable-kinds=
  workflow_definition,agent,tool` cannot list all compatible runnables with schemas without a
  per-module bespoke endpoint — the WC becomes N glue paths, not one.
- Correction: declare a runnable-descriptor registry meta (kind, portable_key,
  input_schema, output_schema, invoke ref, allowed contexts) with a `build_catalog` analog;
  §6 launch consumes descriptors from it.

### F5 — M4 trigger migration hides a double-fire-or-flag-day dilemma. MAJOR
§3.1 dual-run: shadow binding from `state._trigger`, keep legacy active, compare
delivery/dedup, then pause legacy + enable binding. Dedup is `(workflow_id, trigger_id,
dedup_key)` (§3.2, `migrations/03_workflow_runs.lua:27-30`) and the migrated binding uses
`trigger_id=binding_id` (§3.3). Therefore the same source event carries a **different
`trigger_id` on each path**, so the dedup index does NOT dedupe across legacy vs shadow.
Enabled shadow ⇒ every event runs the workflow twice with real side effects. Observe-only
shadow ⇒ no live parity signal and "enable binding" is a hard flag-day. Worse, delivery runs
under a frozen installer identity (`trigger_subscription.lua:241-244, 339`
`_run_as(frozen,...)`), and the shadow runs under whatever identity the binding uses, so
side-effect parity is not even identity-equivalent.
- Scenario: migrate a live `Lost`-stage revival play; either double-run every lost deal
  (double HubSpot write + double email) or flip blind with no proven parity.
- Correction: shadow shares the legacy `trigger_id` (or a cross-path dedup key) so the index
  suppresses the duplicate; run shadow in a side-effect-suppressed compare mode (record the
  intended launch, do not dispatch the runnable) until parity; then swap trigger ownership
  atomically under one identity.

### F6 — Sync reconcile parity is the unproven load-bearing assumption behind the vocabulary gate. MAJOR
§3.5 / M5.6: "sync executor may remain an internal lowering until binding executor reaches
reconcile parity." But W3's gate (and §11) requires the sync vocabulary to DIE as an
operator concept. If the binding executor lacks cursor/backfill/high-water-mark parity
(sync's real capability), a binding created via the generic creator cannot do what sync did
— so either the operator still needs the sync surface (gate FAIL) or bindings silently
under-deliver. The design defers the hardest half and still claims the gate passes.
- Scenario: HubSpot first-install backfill is an A7-P0 hard requirement (initial pull BEFORE
  writeback, throttled, projection-lag visible). Expressed as binding(collection trigger
  point, sink runnable, poll config) with no reconcile parity, the P0 backfill contract
  breaks.
- Correction: make reconcile state a first-class part of the collection-trigger-point
  lowering with acceptance tests (cursor, backfill, lag metric) BEFORE M7 hides the sync
  label; gate M7 on a real backfill running as a binding.

### F7 — Binding authority ≠ runnable transitive side-effect authority; and A3 dispatch revalidation does not exist. MAJOR (escalation seam)
§5.7 checks the creator has WRITE on binding scope + READ on source slots + "permission to
invoke runnable." §5.8-9: `execution_policy ∈ {component_owner, automation_service_principal}`
with dispatch-time revalidation "aligned with A3." Two defects:
1. "Invoke runnable" is shallow. A workflow-definition runnable transitively calls sinks/tools
   (Gmail send, HubSpot write) whose authority is never checked against the binding creator.
   Under a service principal (broad), dispatch validates the principal, not the creator — so
   user X, with only WRITE on a CRM record-action trigger point, binds a workflow that sends
   email as the service principal, escalating past X's grants. For the cross-module case the
   attack names (CRM record action → workflow touching other components), §4.1.4 renders the
   action to anyone who can VIEW the record and emits context on click, but specifies **no
   invoke-access gate on the click** — only `bind.required_access=write` at creation time. A
   read-only CRM viewer can trigger consequential cross-component side effects.
2. The A3 dispatch-time revalidation the design leans on **does not exist today**: identity is
   captured/frozen once at install (`automation.lua:1875` `capture_execution_identity`,
   stored `:1928`) and replayed verbatim at every dispatch (`trigger_subscription.lua:243`
   `from_row` → `:339` `run_as`); grep for `revalidat|check_permission|can_access` in
   automation src is empty. So §5.9's "revalidated before side effects, aligned with A3" is
   net-new, non-trivial machinery presented as an alignment note.
- Correction: (a) bind-time closure check — validate the creator's grants against the
  runnable's declared transitive side-effect scope (refs/slots), not just "invoke"; (b)
  declare an explicit invoke-access rule on `ui_action` trigger points separate from bind
  access; (c) build the A3 dispatch-time permission+connection revalidation as real W-A work,
  and if service-principal execution is used, require the runnable's side-effect scope ⊆ the
  binding's declared authority.

### F8 — Nested child paused on AWAIT breaks A4 stranded-run recovery. MAJOR (HITL)
A4 mandates a platform reconciliation worker mapping resolved inbox items (via workflow trace
context) to parked runs, retrying `runs.resume` idempotently; "no consequential workflow
ships before this worker exists." The design preserves the arm seam (verified extensible via
`resume_trigger.arm_ref`, `await/process.lua:225-236` — inbox is only the default branch)
and lists it must-not-break, but **never designs the A4 worker**, and never addresses it for
inline nested children. `runs.resume` targets `(dataflow_id, signal_id)` and `find_await_node`
scans AWAIT nodes in that dataflow by **exact** signal_id (`runs.lua:538-559`); signal ids
are flat, first-match delivery (`workflow_state.lua:775-778`), materialized as
`signal_id=str(def_id)` (`materialize.lua:153`). An inline child shares the parent
`dataflow_id`; its AWAIT signal is namespaced only if the nested materializer prefixes it
(§7.12), and that namespaced id is minted at RUNTIME inside `invoke_definition` — but nothing
persists the `(parent dataflow_id, namespaced signal_id, inline linkage)` mapping the
reconciler needs, and the inline child has no own run row to key on (see F1).
- Scenario: `precall` (sync) nests a `research` def containing a `brief_review` AWAIT; the
  human resolves the inbox item days later; the arm recorded `str(def_id)` but the folded
  instance needs the namespaced id + parent dataflow — resume finds no node or resumes the
  wrong one; the run is stranded, and A4 has no run to reconcile.
- Correction: the arm must persist the runtime-namespaced signal_id + owning dataflow_id +
  inline linkage into the inbox item correlation; the A4 reconciler is W-A (or at minimum
  precedes any nested-AWAIT workflow); forbid fold-in of AWAIT-containing defs until this
  exists.

### F9 — Runtime recompile-under-nested-session violates the immutable-published-version invariant. MAJOR
§1.3 asserts published versions are immutable and reproducible; §9.4 makes the document the
authority and compiled_commands debug-only. §7.8-11: `invoke_definition` loads the published
DOCUMENT and recompiles under nested session at RUNTIME. Recompiling re-runs
`graph.lua`/`materialize.lua` against the CURRENT registry (node-kind sweep, ref resolution;
`materialize.lua:119-175` bakes refs verbatim). If a referenced node-kind/agent/tool entry
drifted since publish, the nested run compiles **differently** from the pinned version — no
longer reproducible from the frozen `compiled_commands`. The rejected alternative (§7.9,
command-stream rewrite `WORKFLOW_INPUT/OUTPUT → NODE_INPUT/OUTPUT` on frozen commands)
PRESERVES reproducibility and is recon D.7 route (b); the design rejects it for "bakes local
ids," but local ids are correct for local execution — only portability needs rewrite, done
separately at import.
- Scenario: publish v7, later upgrade an agent node kind; a nested call of v7 silently runs
  new lowering while a top-level call of v7 (frozen commands) runs old — same version, two
  behaviors.
- Correction: for local nested execution, transform the frozen `compiled_commands` (route b)
  so nesting inherits pinned lowering; reserve document recompile for import/promotion.

### F10 — `finish_with_children`'s 100 ms output poll can silently complete the parent with empty output. MAJOR
`func/node.lua:127-165`: after yield-resume it polls NODE_OUTPUT 10×10 ms then falls back to
`n:complete(fallback_result)`. For `invoke_definition` the cleaned result is `{}` (the func
returns only `_control`), so if the child's NODE_OUTPUT is not query-visible within 100 ms of
resume (store lag, large output), the parent completes with **empty output — no error**. §7.16
treats "finishes from child outputs" as guaranteed.
- Scenario: nested research returns a large brief; under store lag the parent proceeds with
  `{}`, downstream mapping reads null contact fields, `brief_review` renders blank — no failure
  surfaces.
- Correction: `invoke_definition` must not rely on the vendor bounded-poll for correctness —
  block on a deterministic child-output readiness signal or FAIL (not fallback-complete) when
  NODE_OUTPUT is absent post-yield; flag the vendor fallback as unsafe for definition
  invocation.

### F11 — Recursion/depth guard covers only the synchronous fold-in stack. MINOR
§7.18: `workflow_stack` + max depth 8 + static `allow_set.workflows` (`graph.lua:542-547`).
`allow_set` is the DIRECT-call static set from one compile, not the transitive graph, and
async Call-workflow (§7.20, separate run via `run_workflow`, verified fire-and-forget
`dispatch.lua:44-67`) does not share the fold-in stack. Engine has no guard (recon D.6). So
A→B(async)→A(async) cycles and version-pinned indirect cycles evade depth-8.
- Correction: carry `workflow_stack` across async launches (in the invocation context / run
  row) and enforce depth on both sync and async launch in the runnable contract.

### F12 — Vocabulary gate is honestly 4 artifacts, but hides guard_expr, execution_policy, and a two-variable mapping split. MINOR
§11 claims 4 operator artifacts, and the count is defensible. But the binding carries
`guard_expr` (a second operator-facing expression surface distinct from mapping; it reuses
the existing `filter.expr` mechanism, `trigger_subscription.lua:305-331` — pre-existing, not
new, but parallel to the "single schema-connect primitive" W2 promised) and `execution_policy`
(a new operator choice, F7). Mapping runs two variable conventions during migration — new
specs read `input`, legacy edge specs read `output` (§2.6-7, §8.7) — a dialect split inside
the "one" mapping primitive. None breaks the count of 4; all enlarge the surface an operator
must grasp beyond what §11 advertises.
- Correction: fold guard into mapping as a boolean-output mode (or explicitly document guard
  as a binding sub-field, not a parallel expr artifact); commit to one mapping variable and
  migrate legacy `output` specs at M0 rather than carrying both.

### F13 — Trigger-point `context_schema` is free only for the event kind; other kinds are net authoring. MINOR
§4 requires `meta.context_schema` on every trigger point and §4 item 8 promises existing
`kickside.automation.port` entries "convert through a compatibility adapter." Verified: ports
carry **no `context_schema`** today — an events port derives only an `output_schema` from the
referenced event entry (`automation.lua:1176-1185, 1222-1227`); store/collection ports carry
`input_schema`/`output_schema` only; there is no per-port context schema at all. So the
adapter is near-1:1 for the EVENT kind (output face = event body = context) but `ui_action`,
`lifecycle`, and `collection_poll` context schemas are authored from scratch, not adapted.
- Correction: scope the "adapter" claim to event ports; treat ui_action/lifecycle/poll
  context schemas as new declaration work in the trigger-point grammar.

---

## What survives
The event-side triad is real and correctly grounded: the trigger-point declaration grammar
(event context derives from event entries, `automation.lua:1176-1185/1222-1227`; prefix law
`binding_validation.lua:110-111`; schedule grammar `resolver.lua:89-99`), binding-owned state
replacing the `_trigger`-on-consumer inversion (`kind.lua:57-87`, single-writer
`automation.lua:1810`), the single reusable sink dispatch seam (`automation.lua:1421-1453`),
the extensible AWAIT `arm_ref` seam (`await/process.lua:225-236`), the fold-in engine
mechanism itself for sync nesting (`func/node.lua:256-289`; `is_nested` reads
`session_context.dataflow_id`, `flow/compiler.lua:974`; async `:start()` blocked in nested
context `flow.lua:391-392`), empty `events.output` correctly identified (`_index.yaml:617-618`),
and A6 portability. The definition/binding split and the reduction to four operator artifacts
are achievable.

---

## Three changes to force before implementation
1. **Make the domain business-node contribution a W-A first-class contract** — `input_schema`
   + `output_schema` + per-node config-WC + read-your-write checkpoint on output — and add the
   node→definition seam to §13. This is the only thing that makes the W5 litmus expressible
   (F2) and is the same typed input the mapping primitive must target (F4). Today CRM ships
   zero workflow nodes and the node model has no input schema.
2. **Reconcile nested execution with engine reality**: drop inline child run rows and
   per-child lifecycle events (the engine has no per-node run/hook), use the frozen-command
   `NODE_INPUT/OUTPUT` transform instead of runtime document recompile for local nesting, make
   `invoke_definition` fail rather than fallback-complete on absent child output, and define A4
   stranded-run recovery for nested AWAIT before any consequential nested workflow ships
   (F1, F8, F9, F10).
3. **Close the migration + authority gaps**: cross-path dedup + side-effect-suppressed shadow
   for M4, reconcile-parity acceptance tests gating M7's hiding of the sync label, and a
   bind-time transitive side-effect authority closure + `ui_action` invoke gate — plus build
   the A3 dispatch-time revalidation the design assumes but which does not exist in code today
   (F5, F6, F7).

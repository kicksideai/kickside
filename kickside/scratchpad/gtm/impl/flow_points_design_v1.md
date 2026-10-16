# W21 — Flow Points: the canonical behavior seam (design v1, for sol argumentation)

Owner intent (2026-07-10, verbatim spirit): dataflows are already everywhere; make it easy to
run flow code sync or async under the CALLER's conditions from one contract; defaults come from
components' declared functions/DAGs; the workflows product can interpose — "instead of just
running your hard-coded dataflow, let the user tweak it" — without exposing a component's
hundreds of internal flows; CRM/GTM/PM/ERP are all derivatives of this glue layer.

## The one sentence

A **flow point** is a component-declared, named invocation site with a typed interface and a
default artifact; callers invoke the POINT through one canonical contract (sync or async, under
their identity and deadline), and users may REBIND the point to their own workflow — cloned
from the default — without the owning component knowing.

## The contract (one seam)

`flow.start(point_ref, input, opts) -> result | run_handle`

- `opts.mode`: `sync` (bounded await, caller deadline) | `async` (spawned run handle, the
  existing runner semantics). The POINT declares what it can honor (below).
- `opts.identity`: caller actor / execution_identity; the point declares run-as-caller vs
  run-as-owner.
- `opts.dedup_key`, timeout: caller conditions, normalized across artifact kinds.
- Result/error: the stable `{code, message}` + typed output per the point's interface. One
  error vocabulary, no artifact-specific leakage.

Direct artifact invocation (today's runner contract) remains for the workflow-artifact case;
`flow.start` is the CALLER-facing seam and routes internally. No third path ever.

## The declaration (registry, everything declarative)

```yaml
- name: stage_scoring            # kind: flow.point
  interface: {input: …, output: …, error: …}   # declared, or derived when default is a workflow
  default: crm.scoring:score_dag      # func: | dag/dataflow entry | workflow ref | (future) workflow-lua
  rebindable: true                    # false = pure internal, invisible forever
  visibility: internal                # internal points NEVER appear in the workflows list
  execution: {sync: allowed, run_as: caller}
```

## Rebinding semantics (the interposition)

- Resolution order: user binding > workspace binding > declared default. Unbind = default.
- A rebind target must be a PUBLISHED workflow whose graph-derived interface satisfies the
  point's interface — checked by the W14 compat machinery at bind time, and re-checked when
  either side republishes (the consumer index gains a `flow_point` consumer type; breaking
  publishes warn with the point named).
- "Tweak it" UX (scenario 16): the shared WC on the component's config surface shows the point,
  its default, and **Customize** → clones the default into an editable draft (export/import
  round-trip when the default is a workflow; for func/DAG defaults, clone = a generated
  workflow scaffold wrapping the default as a single intrinsic node — you edit AROUND it) →
  publish → bound. The workflows list shows ONLY workflows the user materialized this way,
  never the component's internals.

## Sync under caller conditions (the invariant that makes it sound)

The engine runner is async-only today; `flow.start(sync)` adds bounded await. Soundness rule:
a point declaring `sync: allowed` refuses (at BIND time, via the publish/compat gate) any
workflow containing interaction nodes (human approval/AWAIT) — sync callers can never deadlock
on a human. Async points accept anything. This is enforceable statically because interfaces
and node kinds are graph-derived (W9).

## Artifact-agnosticism

The point's default may be code (func), a declared DAG, a visual workflow, or later
workflow-Lua (temporal-like). The contract normalizes: func → direct call (sync natural);
dag/workflow → engine run (sync = await, async = handle). One engine executes everything;
`flow.start` is routing + policy, NOT a second engine.

## What it absorbs (W8: absorb, don't rewrite)

- Runner contract: stays as the workflow-artifact executor; `flow.start` routes to it.
- Poller `via:contract` sinks/sources, recurrent_action, webhook triggers, sync destinations:
  all become flow-point callers over time — each migration is a declaration change, no flag day.
- Template slots + endpoint patterns: unchanged; a template may DECLARE points.

## Non-goals

No second execution engine. No exposure of component internals by default. No new mapping
grammar (edge/expr transforms stay the one grammar). No per-call code handout (W19 stands).

## Open questions (sol: attack here)

1. HOME: engine-level (dataflow) vs platform-module (workflows) for the contract — the engine
   knows nothing of registry/bindings/access; the workflows module knows nothing the engine
   runs internally. Where does `flow.start` live without inverting a dependency?
2. BINDING SCOPE: per component-INSTANCE (this CRM's stage_scoring) vs per component-KIND vs
   per workspace? Instinct: per-instance, stored with the instance's config, access-cascaded.
3. INTERFACE EVOLUTION: component upgrades its default (new interface) while user rebinds
   exist — warn-and-block the upgrade? auto-unbind with notification? version-pin the point?
4. SYNC BACKPRESSURE: bounded await on spawned runs at scale (hundreds of sync points under
   load) — is await-on-run acceptable or does sync demand an in-process fast path with
   different durability semantics (and is THAT split honest)?
5. CLONE-OF-CODE: wrapping a func/DAG default as a single intrinsic node inside a scaffold —
   genuinely useful customization, or a foot-gun that invites cargo-cult graphs around a black
   box? Alternative: rebindable=false for code defaults until they're ported to workflows?

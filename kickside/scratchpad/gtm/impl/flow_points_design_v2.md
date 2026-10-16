# W21 — Flow Points design v2 (post-sol; recon findings pending merge)

Sol's critique accepted on every structural count (flow_points_sol_critique.log). v1's idea
survives; v1's packaging does not.

## The primitive, corrected

TWO runtime artifacts, ONE product flow — never conflated:

1. **flow.point** (registry declaration, component-owned): a stable, VERSIONED, typed behavior
   slot. Declares its OWN interface (never derived from the default), execution/effect
   requirements, substitution envelope, authority policy, observation policy, limits.
2. **flow.binding** (separate sparse artifact, instance-scoped): resolves one point on one
   component instance to one exact-version runnable. Key: (component_instance_id, point_id,
   interface_version). No user/workspace precedence in v1 — background callers (pollers,
   webhooks, automations) must resolve identically regardless of who is looking.
3. Customize/clone is PRODUCT UX (workflows module territory), not runtime semantics.

## Invocation — no new executor

flow_points.invoke(point_ref, input, opts)
  -> resolve binding (sparse lookup, negative-cached, revision-invalidated)
  -> enforce point policy (authority, envelope, limits)
  -> kickside.runnable:launch(resolved_runnable, input, launch_opts)   # THE existing seam

The runnable catalog gains function/DAG adapters so code defaults ride the same seam.
Observation is separate from execution: invoke returns a descriptor; await(invocation_id,
deadline) boundedly waits with admission control + cancellation. Inline-capable runnables may
return terminal descriptors immediately; callers can never force a durable workflow inline.

## Execution honesty (sol's core correction)

The point declares required effects — durability, suspension allowed, side-effect declaration —
and a capability ceiling (scopes). A substitution target must satisfy the envelope, not just
the schemas: a sync-observed point with suspension:forbidden statically rejects human-bearing
workflows (graph-derived, checkable at bind); a rebind can never exceed the point's declared
scope ceiling (kills the privilege side-channel); authority is fixed point policy
(caller | component_owner [+ require_reviewed_target, require_exact_version]), never caller opts.

## Home

A small platform behavior module adjacent to the runnable contract owns: point kind, binding
artifact, resolver, invoke/await facade. Dataflow stays a dumb engine. Workflows contributes:
the workflow_definition runnable adapter, bind-time compat inspection (W14 machinery; the
consumer index gains flow.binding rows for materialized bindings only), the Customize/clone UX
(clone default workflow via export/import; code defaults get honest 'replacement' framing — a
wrapper never pretends to edit the black box), and consumer reporting.

## Evolution

point_id carries a major version (crm.stage_scoring.v1). Additive evolution keeps the version;
breaking evolution mints .v2 while v1 bindings keep working against the kept v1 adapter/default.
No auto-unbind (silent behavior change), no upgrade veto (one customization cannot block a
security fix). Upgrade tooling reports remaining v1 bindings. Every run records the resolved
runnable + version (debuggability + audit).

## The CRM story (unchanged, now sound)

CRM declares N points with defaults = its internal funcs/DAGs/workflows. Nothing appears in the
workflows list. The component's config surface (shared WC) lists its points; Customize clones
the default (or scaffolds an honest replacement for code) into an editable draft; publish;
bind — exact version. Unbind restores the default. Hundreds internal, tweak one on demand.

## Strip-to-simplest (v1 ship list)

point kind + binding artifact + resolver + invoke/await on runnable:launch + workflow adapter +
bind-time envelope/compat check + the config-surface WC + clone-for-workflow-defaults. DEFER:
function/DAG adapters beyond passthrough, kind/workspace bulk bindings, reviewed-target
workflow, cross-instance binding tooling, workflow-Lua.

## Ground truth merged (flow_point_recon.md §3/§5) — FINAL

- `kickside.runnable:launch`: EXTEND, never replace — recon and sol converged independently;
  the resolver terminates in it, the runnable catalog gains adapters.
- Recipe lowering (recon §3.1) is the rebind LINEAGE: flow_template XOR workflow_ref producing
  one runnable artifact is the point/binding split in embryo — flow points generalize it to a
  platform primitive; recipes later re-express over it. Generalize, don't invent.
- `await(invocation_id, deadline)` ends real existing drift: session/delegate.lua and
  runs.await_result are two hand-rolled near-identical sync-poll wrappers today — both migrate
  onto the one capability (with admission control, deadline, cancellation).
- NOT absorbed (recon correction to v1's claim): poller `kickside.data:pullable/writable` —
  idempotent write-effects with engine-owned cursor/dedup state are a DIFFERENT consistency
  model from run-and-observe; they stay a sibling contract a point may target as its effect
  path. The HTTP control surface (observe/signal) likewise sits above, untouched.
- Flow-DSL inline call sites (8 production sites building ad-hoc DAGs imperatively, e.g.
  agent_invoke.lua): HIGH friction — each must become a declaration before it can be a point;
  explicitly OUT of v1.
- Node kinds (W5/W16.2) unchanged; a later step may let a declared node-kind also be
  standalone-invocable as a point default.

Status: design FINAL pending owner sign-off; W20 scenario 9 becomes the reference
implementation when approved.

# Design peer session: the ONE mounting model (kill parallel abstractions)

You are the design peer. Argue hard; your deliverable is `kickside/scratchpad/gtm/mounting_model_design.md` — a design the owner can sign off.

## The owner's directive (verbatim intent)
"Ensure everything John wants is in application, customizable, configurable, has perfect UI, is using the correct intrinsic workflows that users can use and redefine; there are no more parallel abstractions like installable playbooks versus the general provided abstractions that you can mount declaratively by the component."

## The problem
Two parallel mounting vocabularies grew beside the general one:
1. `kickside.automation.installable` (platform/automation-catalog): its own type with install_via: binding|sync|script|manual, binding_spec, sync_spec, script_ref, manual_spec, config_schema, publication/groups. ~19 declarations across wapps/providers. The System > Automations page renders THIS type.
2. `kickside.automation.suggested_binding` (wapps/precall): another one-off.
Meanwhile the GENERAL abstractions exist and are owner-hardened (platform/workflows + platform/automation + kickside components):
- `kickside.flow.point` + flow bindings: behavior slots on components, sparse per-instance bindings, shipped defaults, substitution policy, await correlation, audit series, config surface (owner commits 3bc2a291..435f6dcb).
- trigger points + automation bindings (kickside.automation): watch/schedule triggers → runnable dispatch with mapping_spec.
- `kickside.workflows.flow_template` + template slots: template-backed declared workflows.
- sync source/sink ports (poller architecture).
- published workflow definitions (user-created, the four faces).

## Design question
Define the ONE model where a component declares its mountable behaviors purely in the general vocabulary, and "Automations"/"Setup" UI is a VIEW rendered from those declarations. Resolve:
1. What does a shipped one-click automation BECOME? (e.g. a declared flow.point with default template + a declared trigger binding suggestion? a "blueprint" that is just a flow.binding declaration with unbound slots the setup form fills?) The one-click Set up UX must survive — John clicks Set up, fills a small form (connection, CRM thread, workflow override), and it's live.
2. Where does the catalog metadata live (title, blurb, group, trigger→outcome line, publication) — as meta ON the general declaration, not a separate type. Which declaration carries it for each of the 4 current install_via modes (binding→?, sync→?, script→?, manual→?).
3. Config: one story — flow.binding slot bindings + trigger_config from the declared schema. No second config_schema dialect. What renders the form (existing wc-schema-form / slots UI).
4. Redefinability: every mounted behavior must be backed by a workflow the user can OPEN in the builder and REPLACE (constraint: workflows are the intrinsic, redefinable unit; flow.point substitution is the mechanism). Which current behaviors are code-paths that must gain a default template (score/qualify/research/extract...) vs. which legitimately stay contracts (pure data plumbing)?
5. Migration: mechanical mapping for all ~19 installables + suggested_binding; what UI changes in platform/automation-catalog (does the module shrink to a pure view/service over general declarations — or dissolve into platform/automation entirely?); enabled-state/audit continuity for already-installed bindings.
6. The GTM noun "playbook" = published workflow template (gallery view) — confirm no separate playbook registry survives anywhere.

## Constraints (binding)
- kickside/scratchpad/gtm/constraints.md — esp. #2 (composition surfaces), #3 (declarative rewiring), #10 (primitive discipline: generic primitive, not per-module), #11 (extend platform over special-casing), #13 (business-level nodes), #16 (demoable live).
- Declarative everywhere; ~300-line files; no new abstraction without two real consumers; the owner's flow_points implementation in platform/workflows is CANON (do not redesign it — compose on it).
- Study the actual code first: platform/workflows/src/flow_points.lua + flow point config surface, platform/automation (trigger_subscription, automation.lua binding kind), platform/automation-catalog/src/catalog.lua, a representative installable (wapps/precall/src/templates/_index.yaml fireflies + calendar entries, gtm_core market_watch cadences, providers sync installables).

Deliverable format: the model (short), per-mode mapping table, migration list, UI delta, open questions for the owner (max 3). Keep it terse and decisive — no essay.

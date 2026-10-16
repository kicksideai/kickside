# ONE mounting model — sign-off design

## Model

**Decision:** a mount is not an artifact. It is the act of creating or changing the
existing artifacts:

1. optional `flow.binding` — component instance + `flow.point` -> exact published
   workflow definition;
2. optional `automation.binding` — trigger point + `trigger_config` -> runnable +
   `mapping_spec`;
3. or a sync instance — source port -> transform -> sink port.

Components/modules advertise one-click setup by adding optional `meta.mounts[]` to the
general declaration that owns the behavior: `kickside.flow.point`,
`kickside.workflows.flow_template`, or `kickside.automation.port`. `mounts[]` is a
read-only annotation, not a `meta.type`, runtime, table, config store, or lifecycle.
It contains only `key`, card copy (`title`, `blurb`, `group`, `effect`, `publication`),
and prefilled canonical refs (`trigger_point_id`, `mapping_spec`, or `sink_port`).
Multiple cards may live on one declaration.

There is no `binding_spec`, `sync_spec`, `script_ref`, `manual_spec`, requirements
dialect, or catalog `config_schema`. The carrier already supplies the truth:

- workflow inputs: the flow template's typed `definition.slots`;
- component: the flow point's `owner_impl_id` and component ACL;
- trigger fields: the selected trigger point/port `config_schema`;
- sync fields: source and sink port `config_schema` plus the sync trigger;
- workflow override: the canonical published-workflow picker, compatibility checked;
- mappings/policy: the ordinary automation binding fields.

`Set up` performs one canonical lowering:

- **template carrier:** bind slots and instantiate/publish the template (or select a
  compatible published workflow), then create an `automation.binding`;
- **flow-point carrier:** select the owning component; optionally instantiate the
  declared default template and put a sparse `flow.binding` (or bind a selected
  published workflow); then create an `automation.binding` whose runnable is
  `{kind: flow_point, point_id, component_instance}`;
- **port carrier:** open the existing Sync setup with source and suggested sink
  preselected, then create the ordinary sync instance.

The saved setup state is only `flow.binding` target/mappings, template slot bindings,
and automation/sync trigger config. There is no opaque second config blob. Extend the
general `automation.binding` control plane with CAS revisioned replacement of trigger,
runnable, mapping, and policy; record revisions generically for every binding. Do not
special-case mounted bindings.

Package defaults must satisfy the canonical flow-point resolver: package install seeds
each shipped template as an immutable published workflow definition under a stable
package-owned workflow id; `flow.point.default_runnable` pins its exact version.
`default_template_ref` remains clone/customize provenance only. Current declarations
that label a registry template as `kind: workflow_definition` are invalid and must be
reseeded, not grandfathered.

## Per-mode mapping

| Retired mode | General carrier | What `Set up` creates | Where card metadata lives |
|---|---|---|---|
| `binding` | `flow_template` for a standalone workflow; `flow.point` when it is component behavior | published workflow (unless override), optional `flow.binding`, then ordinary `automation.binding` | that template/point's `meta.mounts[]` |
| `script` | `flow.point` | periodic trigger -> `{kind: flow_point, ...}` ordinary `automation.binding`; **no script automation** | point's `meta.mounts[]` |
| `sync` | source `automation.port` | ordinary sync instance with the declared sink preselected | source port's `meta.mounts[]`; title may specialize a fixed object type |
| `manual` | new/existing `flow_template` containing business-level mapper/action nodes | workflow + event/watch trigger `automation.binding` | template's `meta.mounts[]`; **no setup URL** |
| `suggested_binding` | `flow_template` or `flow.point`, by the same ownership rule | same lowering as `binding`, optionally initially paused | carrier's `meta.mounts[]`; **no suggestion type** |

Sync is the sole no-workflow case: pullable source, deterministic transform/mapping,
and writable sink are data plumbing contracts. The moment a route decides, scores,
researches, drafts, approves, or causes a business side effect, it is a workflow.

## Redefinability boundary

Every business behavior opens to a real workflow graph and can be replaced through the
flow point or automation binding. A function may implement a visible business node; it
may not remain the hidden top-level behavior.

Must be routed through completed default templates (several declarations exist today
but their Lua callers still bypass them, or their graphs are Start -> Finish shells):

- GTM score/qualify: `score.score_fit`, suppression, ranking, qualification, review,
  and promotion; add a score flow point owned by the vertical-profile component and
  make import qualification call the existing `import.qualify.v1` point;
- pre-call: lead research and call-intelligence extraction, then the brief/follow-up
  compositions that consume them;
- market watch: digest, scan, signal sweep, deep scan, and source — replace all five
  shell templates with the declared business nodes before exposing their cards;
- stalled-deal evaluation, job-change handling, and LinkedIn rank/draft review;
- approved-brief/re-engagement delivery: visible `Write to HubSpot`, `Create Gmail
  draft`, and `Notify review channel` workflow nodes/templates, with HITL upstream.

Legitimate contracts: provider clients, pullable source ports, writable sink ports,
CRM/KB readers and writers, event ports, identity resolution, and deterministic field
mapping. They remain selectable plumbing beneath business-level nodes or Sync.

## Mechanical migration

1. Add `meta.mounts[]` projection/validation to `platform/automation`; validate each
   carrier with its existing validator and reject unresolved refs. Add no registry type.
2. Seed exact package-owned default workflow definitions; fix every flow point's
   `default_runnable`; remove reliance on template ids masquerading as definitions.
3. Move the four binding cards:
   - contacts `job_change_reconnect_review` -> `job_change_observed` flow point;
   - GTM `promoted_candidate_to_pre_call_brief` -> inbound pre-call flow template;
   - pre-call Fireflies -> `fireflies_call_to_intelligence` flow template;
   - pre-call Calendar -> `calendar_meeting_to_pre_call_brief` flow template.
4. Move `suggested_binding.inbound_lead_webhook` to a second mount on the inbound
   pre-call flow template; preserve its default-paused choice as ordinary binding state.
5. Move the seven script cards to points and delete script lowering:
   - market `digest`, `scan`, `deep_scan`, `source`, and `signal_sweep`;
   - content-engagement `curated_linkedin_monitor`;
   - deal-intelligence `stall_evaluation`.
6. Move the five sync cards to source ports:
   - HubSpot CRM source: contacts, companies, deals mounts with fixed `object_type`;
   - WebScout candidates and PhantomBuster candidates: acquisition-intake sink mounts.
7. Replace the four manual cards with workflow templates and event triggers:
   pre-call HubSpot write, pre-call Gmail draft, pre-call review notification, and
   deal-intelligence Gmail draft. Their mapper functions become node implementations.
8. Migrate instances by stable `portable_key`/old declaration-id map:
   - existing standard automation bindings keep `binding_id`, enabled state, workflow
     consumer row, run history, and current pinned workflow;
   - script instances are converted in place to standard binding rows with the same
     component/binding id; detach the old schedule only after the new disabled lowering
     validates, then restore the prior enabled state;
   - sync instances remain untouched; update only generic declaration lineage;
   - manual cards created no instance, so have no state to migrate.
9. Rewrite old `meta.origin` to generic declaration lineage `{declaration_ref,
   mount_key, portable_key}`. Keep a read-only alias map for one release so status finds
   pre-migration instances. Never fork audit series; append a `migrated` revision/event.
10. Delete all `kickside.automation.installable` and
    `kickside.automation.suggested_binding` declarations, validators, tests, and scans.
    Add an invariant test that those types and `install_via` do not exist.

## UI/module delta

- **Dissolve `platform/automation-catalog`.** Moving it to a “thin service” still makes
  a second owner. Its page, API, origin matcher, validator, and UI are deleted.
- `platform/automation` owns one Automations page: installed bindings/syncs plus a
  **Set up automation** gallery projected from `meta.mounts[]` on general declarations.
  No catalog table is introduced. `/system/automations` becomes an alias/redirect to
  this canonical surface for old manual links and bookmarks.
- The setup drawer composes existing UI: trigger-config, workflow template slots,
  published-workflow picker, component picker, `wc-schema-form`, and Sync create.
  Remove the catalog's string-only `<input v-for>` form.
- Each live card exposes `Open workflow`, `Replace workflow`, `Configure trigger`,
  pause/resume, runs, and binding revision history. Flow-point cards also expose
  `Restore default`. Sync cards expose source, transform/mapping, sink, and schedule.
- Move the useful Recipe lowering into the canonical automation/workflow setup service,
  then retire the Recipes product noun/module and `kickside-recipe-config`; it must not
  become the next parallel mounting vocabulary.

## GTM noun

**Playbook means a published `kickside.workflows.flow_template` shown in the workflow
template gallery.** Installing it creates an ordinary editable workflow definition.
There is no playbook type, registry, instance table, installer, runtime, or config
dialect anywhere else.

## Open questions for the owner

1. Approve stable package-owned seeded workflow ids for exact flow-point defaults
   (recommended), or require generated workspace ids plus an install-time declaration
   rewrite?
2. Approve retiring the public Recipes module after its lowering moves into the
   canonical setup service (recommended), or retain only its private library/API as a
   compatibility shim for one release?


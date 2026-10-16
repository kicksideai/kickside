# Component-hosted Workflows

## Authoring rule

A component author exposes event Ports, declares Behaviors only where the
component itself calls a replaceable default, and mounts
`kickside-component-workflows` with the component instance id. There is no
per-component workflow manifest or editor implementation.

The mount selects Workflows by their stable interface. It does not depend on a
DAG: Loop, Parallel, Signal, Human review, agent, and tool control remain inside
the selected Workflow implementation.

## Outcome

A component owner can open CRM—or any future complex component—and manage how it
behaves without changing that component's code:

- see the workflows the component calls internally;
- customize or replace a shipped default;
- see workflows that run from this component's events;
- add an event workflow by selecting an event, a published Workflow, and a mapping;
- pause, resume, inspect, or remove it;
- open the exact Workflow graph and its runs.

The same saved artifacts remain visible in the global Workflows and Automations
pages. The component UI is a scoped control surface, not another engine.

## Existing platform truth

This design composes only mechanisms that already exist:

| Need | Existing mechanism |
|---|---|
| Component identity and access | component instance + ACL |
| Internal event | output Port on the component binding |
| Event subscription | Trigger resolved from that Port |
| Executable graph | exact published Workflow version |
| Event reaction | Automation binding |
| Swappable internal call | Behavior binding |
| Component ownership of an Automation | binding component `parent_id` |
| Trigger-to-Workflow shape conversion | Automation `mapping_spec` |
| UI for replacing an internal default | `kickside-behaviors` |
| UI for assembling Trigger → Workflow | `kickside-automation-config` |
| UI for control and inspection | `kickside-automation-manager` |

CRM already publishes its meaningful internal events as Ports, including record
created/updated/deleted, activity logged, relation changes, pipeline changes,
merge decisions, schema changes, and external-write outcomes. Nothing CRM-specific
must be added to the Automation engine.

## One user-facing area

Complex component pages expose one tab or section named **Workflows**.

It contains two ordinary groups:

### Defaults

Rendered by the existing Behavior surface. These are steps the component itself
invokes and for which the module ships an exact default Workflow.

Each row shows:

- human title and input → output summary;
- `Using default` or `Customized`;
- Customize, Choose workflow, Edit, and Restore default;
- incompatibility and authority failures as directed messages.

No event, schedule, or Automation is created here. A Behavior remains a typed call
site owned by the component.

### Automations

Rendered by the existing Automation surface, scoped to binding components whose
`parent_id` is this component instance.

Each row shows:

- When: the component event;
- Runs: exact Workflow and version;
- Map: pass-through or mapped expression;
- Authority;
- state, last run, next run, and failure when available;
- pause/resume, open Workflow, runs, edit, and delete.

`Add automation` opens the existing Automation builder in component scope.

## Component-scoped creation

The scoped builder receives only:

```text
component_id = exact component instance
```

It reads the component's implementation and derives available event Triggers by
filtering the ordinary Trigger catalog to source Ports backed by that implementation.
For CRM, this yields only CRM events. No second event catalog is introduced.

The builder freezes the exact component thread into the ordinary Trigger config and
creates the Automation binding with:

```text
parent_id = component_id
```

The user then chooses either:

- an existing published Workflow; or
- a shipped Workflow template, which is instantiated and published through the
  existing Workflow service.

The existing field mapper maps the event schema to the Workflow Start schema. The
existing assembly service creates the Workflow, when needed, and the ordinary
Automation binding.

## Default event workflows

An event reaction is never called a Behavior and does not gain a second "default"
binding type. A component or application that should work out of the box creates an
ordinary child Automation during its existing setup path through the canonical
Automation assembly service.

That child binding is indistinguishable from one created by the UI:

- it has a stable `portable_key`;
- it pins an exact Workflow version;
- it is parented to the component instance;
- it can be paused, edited, or deleted;
- its Workflow can be cloned or replaced;
- future runs use the new version; existing runs retain their snapshot.

The package may ship a Workflow template, but the template is not an Automation and
does not carry trigger configuration.

## Minimal platform changes

### 1. Scoped Automation reads

Extend the existing Automation list with optional `parent_id` filtering and return
the component parent in the row projection. Use the component service relationship;
do not inspect trigger JSON to infer ownership.

### 2. Scoped Automation manager

Allow `kickside-automation-manager` to receive `component-id`:

- list only Automations parented to that component;
- pass that id as `parent_id` during creation;
- omit the global page header and catalog noise;
- keep the same row controls and detail disclosure.

### 3. Scoped Automation builder

Allow `kickside-automation-config` to receive `component-id`:

- load the component implementation;
- retain only event Triggers whose source binding matches it;
- bind the exact component instance in Trigger config;
- retain the existing Workflow/template pickers and mapper.

Schedule can be offered separately as `Also run on a schedule`; it must not obscure
the component's own event list.

### 4. Reusable component view

Publish one reusable view component, visually titled **Workflows**, that composes:

```text
kickside-behaviors(component-instance-id)
kickside-automation-manager(component-id)
```

This view owns no API and no state. CRM, Deal Intelligence, Contacts, and future
components mount the same view. A component with only one group simply hides the
empty group.

### 5. CRM mounting

Add a Workflows tab to the CRM aggregate UI and pass its CRM component id to the
reusable view. Do not add CRM workflow APIs, CRM automation tables, or CRM-specific
workflow configuration.

Record-detail pages remain record views. Component Workflows are configured at the
CRM aggregate level because the event thread and its Automations belong to the CRM
component, not to an individual record shell.

## What the CRM owner can then do

From CRM → Workflows:

1. Select **CRM activity logged**.
2. Choose or create a Workflow.
3. Map `record_id`, `activity_type`, and content into its Start input.
4. Add any registered Agent, Tool, destination Port, approval, or child Workflow.
5. Publish and enable it.
6. Inspect runs or pause it from the same CRM page.

The contact-memory example becomes one possible Workflow, not a platform feature:

```text
CRM activity logged
  → resolve the contact's knowledge component
  → prepare the activity text
  → Add to Knowledge Base
```

Another user can instead build:

```text
CRM opportunity stage changed
  → research the account
  → score risk
  → ask for review
  → write an activity
```

Both use the same UI and artifacts.

## Authority and safety

- Reading the section requires READ on the component.
- Creating, replacing, pausing, or deleting requires WRITE/DELETE on the child
  Automation as already enforced.
- Component-scoped creation uses component-owner execution authority and cannot bind
  an unrelated component instance.
- Workflow compatibility and capability ceilings remain authoritative.
- Exact Workflow versions are pinned; changes affect future runs only.
- Loop suppression remains the responsibility of the CRM write boundary and the
  Automation guard/mapping, not this UI.

## Acceptance test

The design is complete only when this can be demonstrated without source edits:

1. Open CRM → Workflows.
2. Add an Automation from **CRM record created**.
3. Choose a published test Workflow and map `record_id`.
4. Create a person in CRM.
5. See one Workflow run linked from the CRM Workflows area.
6. Customize the Workflow graph, publish a new version, and select it.
7. Create a second person and prove only the new run uses the new version.
8. Pause the Automation and prove a third person creates no run.
9. Resume and replay safely.
10. Confirm the same Automation appears in the global Automations page with identical
    id, version, state, mapping, authority, and run history.

## Explicitly rejected

- no CRM workflow engine;
- no "CRM flow" or "rule" noun;
- no event recipe/catalog object;
- no component-specific trigger declaration language;
- no second binding table;
- no trigger JSON heuristics for ownership;
- no hidden function as the top-level business workflow;
- no per-record Automation copies.

The vocabulary stays: **Workflow, Trigger, Automation, Port, Behavior**.

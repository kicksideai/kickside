# W16.2 — template-backed declarative workflow nodes

## Declaration grammar

One registry entry is the entire node declaration:

```yaml
kind: registry.entry
meta:
  type: kickside.workflows.node
  kind: <stable_node_kind>
  title: <palette_name>
  category: <palette_category>
  icon: <icon>
  flow_template: <namespace:flow_template.entry>
```

`flow_template` is mutually exclusive with a node-local `lowering`,
`config_schema`, `config_required`, `ports`, `input_schema`, and
`output_schema`. Those faces are derived from the named
`kickside.workflows.flow_template` declaration:

- `definition.slots` becomes the node configuration schema and required fields.
- The template graph's `Start`, `Finish`, and `Error` boundary schemas become the
  node input, Finished, and Failed interfaces.
- Name/category/icon/blurb remain the shipping module's palette declaration.

This means a module declares the component-facing name once while the graph remains
the only interface source of truth.

## Instantiation policy

Chosen policy: **per-workspace automatic instantiation at first publish or draft
simulate use**. The version plane resolves a template-backed canvas node before it
opens the parent publish transaction. It invokes the existing template-instantiation
function, which creates and publishes the ordinary editable workflow definition.

The child records existing `template.instantiated` lineage with
`template_node = { parent_workflow_id, parent_node_id, instance_version }` plus its
slot bindings. On a later publish/simulate, that lineage tuple
`(parent workflow, canvas node, template ref, slot bindings)` is reused. A slot change
selects a new immutable child instance; prior published parents remain pinned to their
old child version.

This is less new state than install-time materialization: it adds no installation
mapping, table, migration, or new installer lifecycle. The template lineage stream
already exists, is workspace-scoped through the parent workflow identity, and is the
durable audit record of the instance.

## Lowering chain

```text
module registry declaration
  -> node-kind catalog sweep
  -> slots + Start/Finish/Error interface derived from template graph
  -> first publish/simulate: template.instantiate -> published child instance + lineage
  -> compiler rewrites only the compiled IR to call_workflow(child_id, pinned v1)
  -> existing Await arm kickside.runnable:arm_workflow_call
  -> existing kickside.workflows:runner / spawned child run
```

The stored parent canvas remains the declarative extension kind; only its frozen
compiled artifact contains the workspace-local child id. No alternate engine node,
runner, or execution path was added.

## Catalog integration and FE contract

No FE work is required. The backend puts template-backed entries into the same
`kickside.workflows.node` sweep as ordinary extension nodes. The existing
`GET /api/v1/workflows/node-kinds` endpoint serves their derived schemas; the existing
`catalog.ts` already maps every returned extension kind into the palette and forwards
`config_schema` onto the generic extension-node panel. Its normal configuration form
therefore renders the template slots without a new UI contract.

The UI does not need to know a workspace workflow id, and none is sent back in the
canvas command. That id is deliberately resolved server-side at materialization so it
does not pollute the portable declaration/document.

## Shipped example

`kickside.workflows:flow_template.template_echo` and
`kickside.workflows:template_node.template_echo` live in
`platform/workflows/src/_index.yaml`. The node exposes the template's required
`prefix` slot and invokes a minimal Start -> Echo -> Finish/Error graph.

## Test delta

Baseline: 242 tests.

After: 247 tests (+5), via:

```text
cd platform/workflows/test && wippy run test
```

Coverage includes declaration validation, catalog-derived slots/boundary schemas,
failure without a materialized instance, lowering to the standard pinned
`call_workflow` arm, and a live harness run. The live proof also confirms the lineage
fields and that a second parent publish reuses the same child instance.

## Reload

This ships on the next workflows module reload. The application on port 8085 was not
restarted, so it does not contain these Lua/declaration changes yet.

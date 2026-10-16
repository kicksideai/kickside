# Workflows Builder — Frontend Conventions

These rules extend the platform frontend conventions in
[`app/src/app/docs/kickside-development/frontend/best-practices.md`](https://github.com/kicksideai/docs/blob/main/building-modules/frontend.md).

## Small vocabulary

The builder exposes Start, Finish, Error, Block, Workflow, Agent, Function, Tool,
Condition, Loop, For each, Combine, Signal, Automation, and Note. Do not add aliases,
deprecated kinds, private extension kinds, or UI-only executable concepts.

Reusable business steps are Blocks discovered from the shared Block registry. A Workflow
palette item stores an exact published Workflow reference. Start, Finish, Error, and
Condition are virtual authoring nodes; the UI must never imply that they execute a
placeholder function.

Product copy and documentation use Workflow and Workflows. The existing wire identifiers
`kickside.flow/v1`, `kind: "flow"`, `flow_ref`, `flow-id`, and `.flow.json` remain unchanged
for compatibility. They must not be exposed as alternate product vocabulary or renamed
without an explicit versioned migration.

## Ports must explain themselves

- Condition uses `true` and `false` ports and stores its predicate on the node.
- Loop and For each label both their body and completion ports directionally.
- Failed is the only generalized failure port. Its payload is exactly
  `{ code: string, message: string }`.
- A named port must match the compiler contract exactly. Unknown ports are invalid, not
  aliases.
- Mapping assistance compares the actual source/output schema with the target/input
  schema and remains visible until required fields are mapped.

## Honest copy

User copy describes what runs and what data continues. It does not expose compiler
terms such as lowering, reminting, spawned runs, or internal contracts. Copy constants
live in testable TypeScript modules beside their node semantics.

## Canonical documents only

The frontend reads and writes one current document shape. Renames require an explicit
data migration before release; they must not introduce alias-on-read, heal-on-edit, or
silent fallback code in the builder.

## Workflow interface

Pinned Start, Finish, and Error nodes are the only source of a Workflow's input, result, and
failure schemas. There is no second metadata editor. These boundaries cannot be deleted
and compile to routing/schema information rather than Dataflow functions.

Only published Workflows appear in Workflow pickers, agent catalogs, Automations, and the embed
component. Drafts run only through the builder's explicit draft simulation.

## One execution seam

Automations, the writable Run Workflow port, agent tools, the embed component, and direct API
launches all use the published Workflow execution facade. An authored Workflow node is different:
it composes the exact referenced Workflow into the current Dataflow instead of launching a
second run.

## Embed component

`<kickside-workflow-embed>` is the reusable published-Workflow surface for other modules.

| Attribute | Meaning |
| --- | --- |
| `flow-id` | Optional published Workflow id; omitted shows the published picker. |
| `input` | Optional JSON object; omitted renders the Start-schema form. |
| `mode` | `run` waits for and renders the result; `dispatch` returns after launch. |
| `label` | Optional button text; defaults to `Run Workflow`. |

Use theme tokens and shared widgets throughout. Any hardcoded visual semantic, dangling
port, duplicated server error, or unlabeled mapping state fails frontend review.

# Workflows source

This package implements the optional visual Workflow definition, publish, and run lifecycle.
Its architecture and canonical vocabulary are documented in [`../README.md`](../README.md).

Workflow and Workflows are the product terms. Internal wire compatibility remains
`kickside.flow/v1`, `kind: "flow"`, `flow_ref`, `flow-id`, and `.flow.json`; these
identifiers must not be renamed or removed without an explicit versioned migration.

Reusable executable steps belong to the `kickside.blocks:block` registry contract.
Workflows consumes that contract; it does not define private node extension systems.

Block providers own their execution adapters and any configuration web components.
Workflows discovers those declarations at runtime and remains installable without any
particular provider.

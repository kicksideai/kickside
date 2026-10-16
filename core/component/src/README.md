# kickside/component

Component service and registry for user-owned resources (kickside fork).

## Features

- Component registration and discovery
- Access control and ownership validation (user + group subjects)
- Hierarchy/placement (lexorank ordering + materialized/ltree paths)
- Secure component access library

Backed by the `kickside_components`, `kickside_component_meta`, and
`kickside_component_access` tables. Depends on the `kickside.contract:*` base
contracts (`component`, `deletable`).

## Owner metadata floors

A module reserves a public read-model key with a `registry.entry` whose
`meta.type` is `kickside.component.owned_meta_key` and whose `meta.key` is the
exact field name. Public registration, metadata writes and deletion reject that
key; fields without a reservation retain their existing behavior. Reservations
contain no host resources or caller identities.

Trusted owners use `component_ops.raise_meta_floor(tx, component_id, key, value)`
in their transaction after checking component access. The operation locks the
component before its metadata, keeps the maximum finite nonnegative integer,
and retains existing row identity and creation time. It reports corrupt stored
values instead of replacing them. It adds no table, requirement or migration.

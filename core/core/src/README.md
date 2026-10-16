# KickSide Core

Append-only thread/event engine for Wippy. Threads are immutable event logs;
projections derive views over them. Retention sweeps expired events, the lifecycle reaper tears down owned
subtrees, and thread notifications fan out changes. Core owns projection advancement and cursor state. The sibling
`kickside/jobs` module owns durable dispatch, leases, retries, and wake demand.

Access control is delegated entirely to the `kickside.component:component_service`
contract (group resolution included). Component writes use that contract;
provisioning reads existing component rows to reconcile declared kinds. The `threads` slice registers each thread as a component, gates every
read/write on the contract's access context, and removes the component on delete.

## Slices (`src/`)

| Slice | Responsibility |
|---|---|
| `threads` | Thread + event aggregate; implements the `kickside.core:threads` contract; access via the component contract. |
| `projections` | Derived views, cursors, catch-up, projection-worker execution (function + supervised process). |
| `retention` | Per-thread retention policy and sweeper. |
| `lifecycle` | Owner-delete cascade reaper. |

## Dependency interface

The host wires these `ns.requirement`s via `ns.dependency`:

- `target_db` — required SQL database for all `kickside_*` tables and
  all runtime persistence, routed through the module's injected `db_config`.

Child slices declare their own required process-host, router, and security-scope
requirements where needed.

The `threads` slice additionally consumes the `kickside.component:component_service`
contract (the component module is a sibling dependency) for ownership, access, and
hierarchy.

## Testing

From the module root:

```sh
make test
```

The standalone application harness (`test/`) provisions an in-memory database,
a process host, a permissive scope, and the component module, then runs its
harness-owned suites. Suites also run against PostgreSQL by pointing
`target_db` at a `db.sql.postgres` resource.

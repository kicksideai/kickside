# kickside/jobs

Durable job slots, leases, worker supervision, and persisted wake demand.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/jobs
wippy install
```

Apply host bindings and migrations through the application install plan.
Review the manifest and registry requirements before enabling the module.
Host resources and security groups bind through the install plan.


## Requirements

For repository validation, use the Wippy release pinned in
[CI](https://github.com/kicksideai/kickside/blob/main/.github/workflows/ci.yml). Use current Hub dependencies
for the contracts declared by the module.
The standalone harness uses SQLite and declares a PostgreSQL test profile.
Development uses Make and the Wippy CLI.

## Development

From this module directory:

```sh
make lockrefresh
make lint
make test
(cd test && wippy test --profile postgres --set vars.pg_database=kickside_readme_test)
```

Create a dedicated PostgreSQL database before the profile run and drop it
afterward. Set the `pg_host`, `pg_port`, `pg_username`, and `pg_password`
variables in the harness configuration for your test server.

## Use

Enqueue work through the existing domain owner, using an exact worker entry ID and immutable payload. Workers retain the enclosing deadline and resolve owner-held execution identity. Use transactional enqueue when a durable fact and its job must commit together.
Optional `replace = true` atomically cancels a pending job with changed immutable
inputs and inserts its successor for the same owner. A running predecessor
returns a retryable conflict with its job ID. See the dependency interface for
the optional `replaced_job_id` result.

After a caller-owned `jobs.enqueue_tx(tx, dbtype, params)` transaction commits,
call `jobs.nudge_workers()` to notify the worker pool. Retired slot owners call
`jobs.purge_slot({ namespace = namespace, scope = scope, key = key })` and honor
its bounded cleanup continuation errors. Both operations use the public
`kickside.core.jobs:jobs` facade without persistence call grants. See the
[dependency interface](src/README.md#dependency-interface) for return values,
authorization, and retry semantics.


Termination recovery keeps the active identity until the execution ends. A
termination marker invalidates the lease even when a future deadline schedules
another liveness check. Cancellation clears the heartbeat timestamp, which
persists as its intent while the lease deadline schedules termination rechecks.
Expiry settlement returns the job to pending, while cancellation settlement
makes it cancelled. Committed `lease_lost` history remains immutable.

`reclaim_expired` returns the number of expired rows fenced in its scan, so
callers can drain every page independently of asynchronous child settlement.
`reclaim_terminated` retains its settled count and adds a third result counting
processed rows, including live-child rechecks; the pool drains on this progress.

The row data budget reserves separate bounded space for safety control values:
a running job's termination marker (prefix plus at most 36 token bytes) and its
two deadline timestamps (at most 40 bytes each), or a lost run's status, finish
timestamp (at most 40 bytes), and diagnostic (at most 256 bytes). These values
can exceed `max_row_bytes` by their bounded encoded size during termination;
application data remains subject to the configured limit. This also permits
termination of existing rows admitted before this reserve applies, without
rewriting or truncating their data.

## Reference

- [Module reference](src/README.md)

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.core.jobs:target_db`](src/_index.yaml) | Host supplies the value |
| [`kickside.core.jobs:process_host`](src/_index.yaml) | Host supplies the value |
| [`kickside.core.jobs.security:user_security_scope`](src/security/module_access/_index.yaml) | `kickside.security.groups:members` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/jobs)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

Administrators tune the worker pool, leases, retries and the execution limit
in **System → Settings** when the host installs Settings. Postgres uses 4
general workers and a 10-minute execution limit by default. Changes apply to the
running pool without a restart; see
[the runtime policy](src/README.md#live-performance-policy) for precedence,
bounds and graceful slot retirement.

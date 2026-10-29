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
[CI](../../.github/workflows/ci.yml). Use current Hub dependencies
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

After a caller-owned `jobs.enqueue_tx(tx, dbtype, params)` transaction commits,
call `jobs.nudge_workers()` to notify the worker pool. Retired slot owners call
`jobs.purge_slot({ namespace = namespace, scope = scope, key = key })` and honor
its bounded cleanup continuation errors. Both operations use the public
`kickside.core.jobs:jobs` facade without persistence call grants. See the
[dependency interface](src/README.md#dependency-interface) for return values,
authorization, and retry semantics.

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

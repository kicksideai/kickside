# kickside/core

Durable threads, events, projections, retention, and lifecycle cleanup.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/core
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

Declare a kind’s exact input/output events and append them through the Threads contract. Projection workers materialize committed facts and advance only after their writes commit. Realtime wakes readers to refetch; it does not replace the stored event or read model.

A component kind declares lifecycle projections with `meta.projections[].on: lifecycle`. Workers receive committed `kickside.component.events:created`, `updated`, and `deleted` events under the framework system identity. The cursor persists across updates and deletion. Use `on: child.lifecycle` to observe children; omit `on` to use the primary thread.

## Reference

- [Module reference](src/README.md)

### Contracts

| Definition | Methods |
| --- | --- |
| [`kickside.core:source_delete_fence`](src/_index.yaml) | `fence` |
| [`kickside.core:read_models`](src/registry/read_models/_index.yaml) | `get` |
| [`kickside.core:threads`](src/registry/thread_contract/_index.yaml) | `create`, `ensure_thread`, `emit`, `purge`, `find`, `upsert`, `update`, `delete`, `list`, `list_events`, `prune_boundary`, `find_event_by_external`, `append_events`, `append_event`, `list_children`, `list_edges`, `list_classes`, `register_projection`, `list_projections`, `get_projection_cursor`, `catch_up_projection`, `pause_projection`, `resume_projection`, `remove_projection` |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.core:target_db`](src/_index.yaml) | Host supplies the value |
| [`kickside.core.lifecycle:process_host`](src/lifecycle/_index.yaml) | Host supplies the value |
| [`kickside.core.lifecycle:user_lifecycle_grant`](src/lifecycle/_index.yaml) | Host supplies the value |
| [`kickside.core.lifecycle:admin_lifecycle_grant`](src/lifecycle/_index.yaml) | Host supplies the value |
| [`kickside.core.projections:api_router`](src/projections/_index.yaml) | Host supplies the value |
| [`kickside.core.retention:process_host`](src/retention/_index.yaml) | Host supplies the value |
| [`kickside.core.retention:user_security_scope`](src/retention/_index.yaml) | `kickside.security.groups:members` |
| [`kickside.core.retention:api_router`](src/retention/_index.yaml) | Host supplies the value |
| [`kickside.core.security:user_security_scope`](src/security/module_access/_index.yaml) | `kickside.security.groups:members` |
| [`kickside.core.threads:user_security_scope`](src/threads/_index.yaml) | `kickside.security.groups:members` |
| [`kickside.core.threads:process_host`](src/threads/_index.yaml) | Host supplies the value |
| [`kickside.core.threads:api_router`](src/threads/_index.yaml) | Host supplies the value |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/core)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

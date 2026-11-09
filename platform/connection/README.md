# kickside/connection

Provider connections, credentials, and reply targets.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/connection
wippy install
```

Apply host bindings and migrations through the application install plan.
Review the manifest and registry requirements before enabling the module.
Host resources and security groups bind through the install plan.


`kickside.connection:endpoints` resolves `get(descriptor_id, key)` from a
provider declaration's `endpoints` map. Providers declare namespace requirements
that target those fields. Deployments supply values through `.wippy.yaml`
profile overrides and vars; published declarations retain official defaults.
The resolver preserves URL paths and queries, rejects missing or malformed
values, and leaves outbound authorization to the runtime's egress policies.
Endpoint configuration belongs to the deployment. Credentials carry the
connection's authentication data and product-owned resource identity.

`base_connection.plan_workers(workers, connections)` plans transport starts,
credential rotations and stops from a committed connection snapshot. Lifecycle
projections use `kickside.connection:reconcile_workers` with
`worker_config.hub_name` to wake the provider hub through the consistent process
registry. A failed wake leaves the lifecycle cursor retryable.

## Requirements

For repository validation, use the Wippy release pinned in
[CI](https://github.com/kicksideai/kickside/blob/main/.github/workflows/ci.yml). Use current Hub dependencies
for the contracts declared by the module.
The standalone harness uses SQLite and declares a PostgreSQL test profile.
Frontend development also uses Node.js 22, npm, and Make.

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
Edit frontend source under `ui/` and run `make -C ../../ build MOD=connection` from this directory;
commit regenerated tracked assets with the source.

## Use

Open **Connections → Connect app** and select an installed provider. The provider supplies credential fields or OAuth authorization. Select the resulting resource on the consuming capability or Automation and share it when needed. Installing a provider does not connect an external account.

## Reference

- [Module reference](src/README.md)

### Contracts

| Definition | Methods |
| --- | --- |
| [`kickside.connection:reply_provider`](src/_index.yaml) | `send_reply`, `update_reply`, `send_status` |
| [`kickside.connection:connection`](src/_index.yaml) | `get_status`, `test_connection`, `discover_resources` |
| [`kickside.connection:connections`](src/_index.yaml) | `register`, `find`, `upsert`, `update`, `delete`, `list`, `validate` |
| [`kickside.connection:reply_providers`](src/_index.yaml) | `create`, `find`, `upsert`, `update`, `delete`, `list` |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.connection:api_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.connection:ui_server`](src/_index.yaml) | Host supplies the value |
| [`kickside.connection.security:user_security_scope`](src/security/module_access/_index.yaml) | `kickside.security.groups:members` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/connection)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

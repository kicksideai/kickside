# kickside/component

Owned resources, component hierarchy, metadata, and access grants.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/component
wippy install
```

Apply host bindings and migrations through the application install plan.
Review the manifest and registry requirements before enabling the module.
Host resources and security groups bind through the install plan.


## Requirements

Wippy 0.3.x; repository validation uses the latest stable Wippy release. Use current Hub dependencies
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

Use Component for independently owned, shared, placed, or deleted resources. Open instances through the actor-bound client with the required READ, WRITE, DELETE, or ADMIN mask. Keep configuration private and safe display state in public metadata; delete through the owning lifecycle.

## Reference

- [Module reference](src/README.md)

### Contracts

| Definition | Methods |
| --- | --- |
| [`kickside.component:lifecycle`](src/_index.yaml) | `created`, `updated`, `deleted` |
| [`kickside.component:declaration_owner`](src/_index.yaml) | `verify_identity_command` |
| [`kickside.component:component_service`](src/registry/service_contract/_index.yaml) | `register`, `export`, `import`, `get`, `get_access_context_by_meta`, `get_access_context`, `list_access`, `set_meta`, `update`, `list`, `query`, `count`, `delete`, `set_placement`, `list_children`, `grant_subtree`, `revoke_subtree`, `adopt` |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.component:target_db`](src/_index.yaml) | Host supplies the value |
| [`kickside.component:lifecycle_impl`](src/_index.yaml) | `kickside.component:component_lifecycle_unwired` |
| [`kickside.component:api_router`](src/registry/host_requirements/_index.yaml) | Host supplies the value |
| [`kickside.component.security:user_security_scope`](src/security/module_access/_index.yaml) | `kickside.security.groups:members` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/component)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

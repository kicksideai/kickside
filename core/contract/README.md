# kickside/contract

Shared contracts for components, providers, and data capabilities.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/contract
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

Import shared contracts and error, paging, or writable-origin helpers from their declared entries. A contract definition owns its method schemas; each binding maps methods to exact function IDs. Resource instances open through Component so access and private context remain bound to the selected resource.

## Reference

- [Module reference](src/README.md)

### Contracts

| Definition | Methods |
| --- | --- |
| [`kickside.contract:component`](src/_index.yaml) | `get_status` |
| [`kickside.contract:content_provider`](src/_index.yaml) | `get_content`, `get_info` |
| [`kickside.contract:deletable`](src/_index.yaml) | `delete` |
| [`kickside.contract:portable`](src/_index.yaml) | `export`, `import_into` |
| [`kickside.data:pullable`](src/data/_index.yaml) | `pull` |
| [`kickside.data.records:external_record_writer`](src/data/records/_index.yaml) | `describe`, `update_record` |
| [`kickside.data:definable`](src/data/registry/definable_contracts/_index.yaml) | `types`, `define` |
| [`kickside.data:loadable`](src/data/registry/loadable_contracts/_index.yaml) | `list`, `describe`, `describe_scope`, `begin`, `append`, `commit`, `rehearse`, `discard` |
| [`kickside.data:readable`](src/data/registry/readable_contracts/_index.yaml) | `list`, `describe`, `plan`, `query`, `lookup` |
| [`kickside.data:writable`](src/data/registry/writable_contracts/_index.yaml) | `write` |
| [`kickside.contract:resource_registry`](src/registry/resource_contracts/_index.yaml) | `list`, `count` |
| [`kickside.contract:scope_resolver`](src/registry/resource_contracts/_index.yaml) | `resolve` |
| [`kickside.contract:group_members`](src/registry/resource_contracts/_index.yaml) | `members` |
| [`kickside.contract:embeddable`](src/registry/resource_contracts/_index.yaml) | `embed_content`, `embed_reference` |
| [`kickside.contract:queryable`](src/registry/resource_contracts/_index.yaml) | `query` |
| [`kickside.contract:realtime`](src/registry/runtime_contracts/_index.yaml) | `broadcast`, `notify` |
| [`kickside.contract:realtime_batch`](src/registry/runtime_contracts/_index.yaml) | `notify` |
| [`kickside.contract:directory`](src/registry/runtime_contracts/_index.yaml) | `search`, `resolve`, `exists`, `groups` |
| [`kickside.contract:security_scopes`](src/registry/runtime_contracts/_index.yaml) | `list` |
| [`kickside.contract:installable`](src/registry/runtime_contracts/_index.yaml) | `install` |
| [`kickside.contract:runtime_reader`](src/registry/runtime_contracts/_index.yaml) | `list`, `get` |
| [`kickside.contract:connection_capacity`](src/registry/runtime_contracts/_index.yaml) | `check`, `record` |
| [`kickside.trigger:round_consumer`](src/trigger/_index.yaml) | `deliver` |
| [`kickside.trigger:source_schema`](src/trigger/_index.yaml) | `describe` |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.contract:host_credential_guard`](src/_index.yaml) | Empty string |
| [`kickside.contract.http:user_security_scope`](src/http/_index.yaml) | `kickside.security.groups:members` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/contract)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

# kickside/oauth

OAuth connections with PKCE, encrypted token storage, and refresh.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/oauth
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

## Reference

- [Module reference](src/README.md)

### Contracts

| Definition | Methods |
| --- | --- |
| [`kickside.oauth.discovery:provider_discovery`](src/discovery/_index.yaml) | `list_available_providers`, `get_provider_info`, `get_connector_contract`, `get_component_contract` |
| [`kickside.oauth:connector`](src/registry/connection/_index.yaml) | `init_oauth`, `handle_callback`, `refresh_token` |
| [`kickside.oauth:oauth_connection_contract`](src/registry/connection_contracts/_index.yaml) | `get_access_token`, `get_info` |
| [`kickside.oauth.runtime:connection`](src/runtime/_index.yaml) | `get_config` |

Providers read private runtime options through `kickside.oauth.runtime:connection`.
Open it under the current actor and scope, then call `get_config({component_id = id})`.
OAuth checks Component READ access and returns only `provider`, `connection_state`,
and the provider's `config`. Tokens, client credentials, profile, and negotiation
state stay behind OAuth's existing lifecycle. Public `get_info` remains metadata-only.
Providers must not import OAuth persistence libraries.

Initialization reports success only after the spawned negotiator's callback name
is visible. Readiness has a five-second deadline; a failed startup returns 503
without publishing an authorization URL.

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.oauth:target_db`](src/_index.yaml) | Host supplies the value |
| [`kickside.oauth:api_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.oauth:public_api_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.oauth:process_host`](src/_index.yaml) | Host supplies the value |
| [`kickside.oauth.security:user_security_scope`](src/security/module_access/_index.yaml) | `kickside.security.groups:members` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/oauth)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

# kickside/identity

Links between external provider accounts and KickSide users.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/identity
wippy install
```

Apply host bindings and migrations through the application install plan.
Review the manifest and registry requirements before enabling the module.
Host resources and security groups bind through the install plan.


## Requirements

Wippy 0.3.x; repository validation uses 0.3.47a. Use current Hub dependencies
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
Edit frontend source under `ui/` and run `make -C ../../ build MOD=identity` from this directory;
commit regenerated tracked assets with the source.

## Use

Link an external provider account to a KickSide user through a short-lived code issued in the dashboard. The provider-neutral link identifies an inbound sender; it does not grant module access or change an Automation’s execution principal.

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.identity:credential_eligibility`](src/_index.yaml) | Empty string |
| [`kickside.identity:target_db`](src/_index.yaml) | Host supplies the value |
| [`kickside.identity:api_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.identity:ui_server`](src/_index.yaml) | Host supplies the value |
| [`kickside.identity.security:user_security_scope`](src/security/module_access/_index.yaml) | `kickside.security.groups:members` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://kicksideai.github.io/docs/building-modules/)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/identity)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

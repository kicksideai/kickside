# kickside/settings

Typed registry defaults and database-backed administration overrides.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/settings
wippy install
```

Apply host bindings and migrations through the application install plan.
Review the manifest and registry requirements before enabling the module.
Host resources and security groups bind through the install plan.


## Requirements

Wippy 0.3.x; repository validation uses the latest stable Wippy release. Use current Hub dependencies
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
Edit frontend source under `ui/` and run `make -C ../../ build MOD=settings` from this directory;
commit regenerated tracked assets with the source.

## Use

**System → Settings** edits registry-declared application settings. The database stores overrides; resetting a value restores its declared default. Secret fields expose presence metadata in lists and remain encrypted at rest. Runtime addresses and database selection belong to deployment profiles.

## Reference

- [Module reference](src/README.md)

### Contracts

| Definition | Methods |
| --- | --- |
| [`kickside.settings:settings`](src/_index.yaml) | `get`, `set`, `unset`, `list`, `get_namespace` |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.settings:target_db`](src/_index.yaml) | Host supplies the value |
| [`kickside.settings:api_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.settings:ui_server`](src/_index.yaml) | Host supplies the value |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/settings)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

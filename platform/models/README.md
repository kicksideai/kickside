# kickside/models

Model catalog, provider profiles, model classes, and resolver bindings.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/models
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
Edit frontend source under `ui/` and run `make -C ../../ build MOD=models` from this directory;
commit regenerated tracked assets with the source.

## Use

In **System → Models**, create a provider profile, configure its credentials, discover or add model cards, and assign model classes. Profiles and discovered cards live in the database; registry declarations provide adapters and presets. Agents can select a model or an administrator-assigned `class:<name>`.

## Reference

- [Module reference](src/README.md)

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.models:target_db`](src/_index.yaml) | Host supplies the value |
| [`kickside.models:api_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.models:ui_server`](src/_index.yaml) | Host supplies the value |
| [`kickside.models:process_host`](src/_index.yaml) | Host supplies the value |
| [`kickside.models.security:user_security_scope`](src/security/module_access/_index.yaml) | `kickside.security.groups:members` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/models)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

# kickside/ui

Navigation discovery and appearance administration.

Logo uploads accept PNG, JPEG (`.jpg` and `.jpeg`), WebP, and GIF, up to 2 MB.
The filename extension and MIME type must agree. Uploaded SVG is excluded because
logos are served on the application origin without an SVG sanitizer; bundled,
trusted application SVGs remain available. `BRANDING_UPLOAD` in `src/types.lua`
declares the upload contract returned by `GET /nav/list?manage=1` and used by the
Appearance editor for its file picker and hint.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/ui
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
Edit frontend source under `ui/` and run `make -C ../../ build MOD=ui` from this directory;
commit regenerated tracked assets with the source.

## Reference

- [Module reference](src/README.md)

### Contracts

| Definition | Methods |
| --- | --- |
| [`kickside.ui:nav_provider`](src/_index.yaml) | `list` |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.ui:api_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.ui:public_api_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.ui:ui_server`](src/_index.yaml) | Host supplies the value |
| [`kickside.ui:branding_fs`](src/_index.yaml) | `kickside.ui:legacy_branding_fs` |
| [`kickside.ui:facade_resolver_handler_settings_contract_policy`](src/registry/facade/_index.yaml) | `kickside.ui:public_branding_settings_contract` |
| [`kickside.ui:facade_resolver_handler_settings_registry_policy`](src/registry/facade/_index.yaml) | `kickside.ui:public_branding_settings_registry` |
| [`kickside.ui:facade_resolver_handler_settings_cache_policy`](src/registry/facade/_index.yaml) | `kickside.ui:public_branding_settings_cache` |
| [`kickside.ui:facade_resolver_handler_static_read_policy`](src/registry/facade/_index.yaml) | `kickside.ui:facade_resolver_static_read` |
| [`kickside.ui:facade_resolver_handler_content_fs_policy`](src/registry/facade/_index.yaml) | `kickside.ui:facade_resolver_content_fs_read` |
| [`kickside.ui:facade_resolver_handler_contract_policy`](src/registry/facade/_index.yaml) | `kickside.ui:facade_resolver_contract_access` |
| [`kickside.ui.security:admin_scope`](src/security/_index.yaml) | Host supplies the value |
| [`kickside.ui.security:user_security_scope`](src/security/module_access/_index.yaml) | `kickside.security.groups:members` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/ui)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

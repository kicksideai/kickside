# kickside/renderers

Isolated content viewers for Markdown, PDF, and images.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/renderers
wippy install
```

Apply host bindings and migrations through the application install plan.
Review the manifest and registry requirements before enabling the module.
Host resources and security groups bind through the install plan.


## Requirements

For repository validation, use the Wippy release pinned in
[CI](https://github.com/kicksideai/kickside/blob/main/.github/workflows/ci.yml). Use current Hub dependencies
for the contracts declared by the module.
Host persistence uses SQLite or PostgreSQL. This module has no standalone SQL dialect matrix.
Frontend development also uses Node.js 22, npm, and Make.

## Development

From this module directory:

```sh
wippy install
wippy lint
make -C ../.. install MOD=renderers
make test
```

Edit frontend source under `ui/` and run `make -C ../../ build MOD=renderers` from this directory;
commit regenerated tracked assets with the source.

## Use

Consumers resolve the installed renderer matching a content type. Renderers display supported content in isolated web components and read through the owning content interface; installing a renderer supplies no access to private source data.

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.renderers:ui_server`](src/_index.yaml) | Host supplies the value |
| [`kickside.renderers:user_security_scope`](src/_index.yaml) | `kickside.security.groups:members` |
| [`kickside.renderers:api_router`](src/_index.yaml) | Host supplies the value |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/renderers)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

Image embeds accept `--rv-image-padding`; the default is `16px`. Compact image previews can set it to `0` alongside `--rv-pad`.

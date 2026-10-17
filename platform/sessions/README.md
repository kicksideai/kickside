# kickside/sessions

Chat-session listing, preview, rename, resume, and deletion.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/sessions
wippy install
```

Apply host bindings and migrations through the application install plan.
Review the manifest and registry requirements before enabling the module.
Host resources and security groups bind through the install plan.


## Requirements

Wippy 0.3.x; repository validation uses 0.3.47a. Use current Hub dependencies
for the contracts declared by the module.
Host persistence uses SQLite or PostgreSQL. This module has no standalone SQL dialect matrix.
Frontend development also uses Node.js 22, npm, and Make.

## Development

From this module directory:

```sh
wippy install
wippy lint
```

Edit frontend source under `ui/` and run `make -C ../../ build MOD=sessions` from this directory;
commit regenerated tracked assets with the source.

## Use

Open **Sessions** to resume, rename, favorite, restart, preview, or delete an accessible chat. The module renders the session runtime’s state and artifacts; the runtime owns the conversation and execution.

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.sessions:api_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.sessions:ui_server`](src/_index.yaml) | Host supplies the value |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://kicksideai.github.io/docs/building-modules/)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/sessions)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

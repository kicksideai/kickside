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

## Key concepts

Registry declarations define the public entries, dependencies, and host requirements.
See [src/](src/) for registry declarations and implementation.

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
make -C ../.. install MOD=renderers
make test
```

Edit frontend source under `ui/` and run `make -C ../../ build MOD=renderers` from this directory;
commit regenerated tracked assets with the source.

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://kicksideai.github.io/docs/building-modules/)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/renderers)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

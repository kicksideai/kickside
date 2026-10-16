# KickSide frontend documentation

KickSide's frontend documentation describes the application shell and
module-owned UI. Wippy framework mechanics are documented by Wippy; use the
references in the [frontend source-of-truth directive](../../src/app/docs/kickside-development/07-frontend-and-web-components.md)
and match them to the runtime and frontend packages used by your application.

## Application documentation

- [Developer handbook](../../src/app/docs/kickside-development/developer-handbook.md):
  module contracts, components, ports, threads, events, and application architecture.
- [Frontend handbook](../../src/app/docs/kickside-development/frontend/frontend-handbook.md):
  frontend documentation entry point and framework references.
- [Frontend and web components](../../src/app/docs/kickside-development/07-frontend-and-web-components.md):
  host boundaries and module UI conventions.

## Module UI

Module UI source lives under `platform/<module>/ui/src`; its served bundle lives
with the module, usually under `static/`. Registry entries with
`meta.type: view.component` declare how the host mounts it. Build through the
checked-in Makefiles and commit regenerated tracked bundles with their source.
See the [repository README](https://github.com/kicksideai/kickside/blob/main/README.md) for build and test commands.

# kickside/ui-kit

Shared frontend CSS vocabulary for KickSide modules, packaged as a build-time artifact.

The [package/](package/) directory is the deliverable. Consumers materialize it
as `@kickside/ui-kit` and import its styles through ordinary npm resolution.
The [vocabulary reference](VOCABULARY.md) describes the classes and their ownership.

## Quick start

In this monorepo, add the consumer to `UI_KIT_CONSUMERS` in the root Makefile and
its Windows counterpart. Run from the repository root:

```sh
make ui-kit MOD=uploads
```

The target resolves the build-input dependency, materializes the package, and
wires the consumer's npm workspace. For an independent module, declare
`kickside/ui-kit` as a build dependency and materialize its package filesystem:

```sh
wippy artifacts materialize ui-kit.wapp kickside.ui_kit:package_fs --root .wippy
```

The consumer's `package.json` links `./.wippy/npm/@*/*` as a workspace and declares
`@kickside/ui-kit` with a compatible dependency range.

## Key concepts

Import tokens before the styles that use them:

```css
@import "@kickside/ui-kit/kx-tokens.css";
@import "@kickside/ui-kit/kx-card.css";
```

The package provides cards, headers, modal headers, state displays, focus
styles, animation, tag sizing, and decorative category tones. Theme severity
colors remain the responsibility of the Wippy theme. Replace duplicated local
rules when adopting a shared class.

The application runtime graph and the build-input graph are separate.
`build-inputs/` supplies this package to frontend builds; it has no database or
served runtime bundle.

## Requirements

Wippy 0.3.x; repository validation uses 0.3.47a. Materialization requires the
runtime artifact command. Consumers use Node.js 22, npm, and Make. SQLite and
PostgreSQL are host persistence choices; the UI kit has no SQL storage.

## Development

Edit CSS in `package/` and validate a consumer through the root Makefile:

```sh
make typecheck MOD=uploads
make build MOD=uploads
```

Run the consumer's tests and Wippy lint after resolving its dependencies.
Persistence changes in consuming modules require SQLite and PostgreSQL tests.
There is no build target in this module: the package directory is embedded as-is.

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://kicksideai.github.io/docs/building-modules/)
- [Wippy documentation](https://wippy.ai)

## License

[KickSide Community License 1.0](LICENSE).

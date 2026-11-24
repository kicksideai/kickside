# kickside/ui-kit

Shared frontend styles, controls, and component deletion tracking for KickSide
modules, packaged as a build-time artifact.

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

## Rails and disclosure

Import each Vue file from `@kickside/ui-kit`. Add the corresponding styles
to the consumer's stylesheet. In a web component, include those styles in
its shadow root stylesheet.

```css
@import "@kickside/ui-kit/kx-settings-rail.css";
/* ListRail uses the shared split layout. */
@import "@kickside/ui-kit/kx-tokens.css";
@import "@kickside/ui-kit/kx-shell.css";
@import "@kickside/ui-kit/kx-disclosure.css";
```

| Component | Props | Events and slots |
|---|---|---|
| `SettingsRail` | `label: string` names the navigation landmark. `value: string` selects the current item. `groups: readonly SettingsRailGroup[]` supplies ordered groups. Optional `leadingItem: SettingsRailItem` sits above the groups. | `update:value` emits the selected item's string value. |
| `ListRail` | `title: string` names the rail. Optional `count: number` adds a count beside the title. | The `actions` slot sits beside the title, `toolbar` sits above the scroll body, and the default slot contains the entity list. |
| `Disclosure` | `label: string` names the toggle. Optional `open: boolean` starts closed by default and supports `v-model:open`. | `update:open` emits the next open state. The default slot contains the disclosed content, which stays mounted while collapsed. |

`SettingsRailGroup` has an optional `heading: string` and an ordered
`items: readonly SettingsRailItem[]`. An item has a unique `value: string`,
a `label: string` and an optional Iconify `icon: string`. Put section status
in the content header. Values are unique across the entire rail, including
the leading item. Both types are exported by `SettingsRail.vue`.

For URL-backed sections, derive `value` from the current route and handle
`update:value` by navigating in the host. Use `v-model:value` for local
selection. The host renders the selected pane and puts the rail and pane in a
flex container that changes from row to column at 640 CSS px.

## Grouped settings lists

Import `kx-settings-group.css` where the lists render. System Settings and the
admin plugin sections use these, so grouped settings look the same everywhere.

| Export | API |
|---|---|
| `SettingsGroup.vue` | Optional `title: string` and `count: number`. The title renders as a caps heading above one bordered card; the default slot holds the rows. Without a title the card renders alone. |
| `SettingsItem.vue` | `title: string`, optional `description: string`, `expandLabel: string` (defaults to `Details`) and `keepMounted: boolean`, with `v-model:open`. Slots: `status` beside the title, `meta` under the description, `actions` at the row end, and the default slot as the expandable body. The body mounts on first open unless `keepMounted` is set. |
| `settingsGroups` | `groupByCategory(rows, category, on)` groups rows by a declared category, orders groups by title with uncategorized rows last under "Other", returns one untitled group when nothing declares a category, and puts rows that are on first. `listNames(names)` joins names as prose. |

Put `ListRail` and its detail pane inside `.kx-shell`. The shell stacks them
at 760 CSS px. Supply entity rows, selection and actions from the host.

The rail uses the `@iconify/vue` peer for icons. Disclosure uses the PrimeVue
Accordion with the consumer's PrimeVue configuration.

## Component deletion tracking

The package also ships TypeScript and Vue source that consumers compile with
their own Vite, Vitest and vue-tsc toolchain. The sources import only the peers
`vue`, `@wippy-fe/proxy` and, for the component, `primevue`.

| Export | Provides |
|---|---|
| `@kickside/ui-kit/useComponentDeletion` | `useComponentDeletion(rows, id, onDeleted?, onDeletionFinished?)` and `ComponentDeletionState` |
| `@kickside/ui-kit/ComponentDeletion.vue` | The deleting/failed status with a `retry` event |
| `@kickside/ui-kit/component-deletion.css` | Styles for that status; import into the consumer's inline stylesheet |
| `@kickside/ui-kit/componentRealtime` | Parsing of `component.meta.changed`, `component.deleting` and `component.deleted` deliveries, and `subscribeComponentMeta` |
| `@kickside/ui-kit/latestRequest` | Ordering of overlapping reads of one resource |
| `@kickside/ui-kit/errMsg` | Message extraction from API error shapes |

A list row extends `ComponentDeletionState` with the component's `deleting_at`,
`deletion_job_id` and `deletion_job` fields as the components API returns them.
The hook keeps a marked row in the list, reads its deletion progress from
`/api/v1/components/{id}`, and removes it on `component.deleted`. Pass the list
loader as `onDeletionFinished`; call `acceptDeletion(id, result)` with the
delete response so the row tracks the accepted job.

The application runtime graph and the build-input graph are separate.
`build-inputs/` supplies this package to frontend builds; it has no database or
served runtime bundle.

## Requirements

For repository validation, use the Wippy release pinned in
[CI](https://github.com/kicksideai/kickside/blob/main/.github/workflows/ci.yml). Materialization requires the
runtime artifact command. Consumers use Node.js 22, npm, and Make. SQLite and
PostgreSQL are host persistence choices; the UI kit has no SQL storage.

## Development

Edit the package in `package/`. `make test` runs the package contract checks and
the Vitest suite; `make typecheck` runs vue-tsc over the sources. The root
`package.json` carries only that toolchain and is not published. Validate a
consumer through the root Makefile:

```sh
make typecheck MOD=uploads
make build MOD=uploads
```

Run the consumer's tests and Wippy lint after resolving its dependencies.
Persistence changes in consuming modules require SQLite and PostgreSQL tests.
There is no build target in this module: the package directory is embedded as-is.

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)

## License

[KickSide Community License 1.0](LICENSE).

The library chrome is split by ownership: `kx-shell.css` owns the rail and
reader layout, `kx-controls.css` owns native controls, and `kx-overlay.css`
owns notices, confirm surfaces and drawers. `kx-state.css` provides empty and
loading layouts, including spacious reader variants. Import only the sheets a
surface uses, after `kx-tokens.css`, and delete the corresponding local rules.
These sheets do not implement Vue components or dialog behavior.

Run the package contract checks with `make test`. They validate package exports,
theme colors, the focus contract, the existing surface-state defaults, and the
deletion tracking sources.

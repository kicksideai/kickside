# kickside/ui

Admin UI surfaces for a KickSide app. Currently the **Appearance** editor: a
self-contained web component (`kickside-appearance`) that mounts as a **System**
tab and edits the navigation appearance.

It edits the nav layout (vertical / horizontal), custom categories, custom items,
and per-surface overrides (hide / reorder / relabel / re-icon), then persists them
to `kickside.ui` settings over `/nav/config`.

## Shape

- `src/_index.yaml` — namespace `kickside.ui`. Declares the nav aggregation API,
  the `nav_provider` contract and its registry implementation, settings
  definitions, UI mount (`fs.directory` + `http.static`), the `view.component`,
  and a `ui.settings_tab` so the System page discovers the tab without any
  app-side edit.
- `ui/` — the Vue 3 web component. Builds to `static/index.js`.

## Where nav items come from

Every item on `/nav/list` arrives through an implementation of
`kickside.ui:nav_provider` — including the declared ones: `registry_nav_provider`
scans the `ui.nav_item` / `ui.nav_category` registry entries and is always collected
first. A module whose surfaces exist only at runtime (pages per entity kind,
per-tenant sections) binds the same contract and is asked on every request, so
nothing needs to be declared statically.

- `list({ locale, manage, timeout_ms }) -> { items, categories }`. Items use the `ui.nav_item`
  field shape plus a stable `id`. A provider contributes raw fields and the core
  validates them (`nav.normalize_provided` / `nav.normalize_category`) — one
  normalizer for every source, the registry scan included, so a provider cannot
  inject an unsafe path or tag and a bad declaration cannot be quietly repaired into
  an item pointing at `/`. `nav.lua` opens no contract and merges only collected items.
- Providers run under the **caller's** actor and scope — a provider may (and should)
  filter its surfaces by what that user can see.
- Remaining providers run in deterministic priority order, then binding id;
  `nav.effective` resolves duplicate `path` / `route_name` first-wins, so a declared
  surface always beats a dynamic item that would shadow it.
- Providers are capped at `ui_types.NAV_LIMITS.PROVIDERS` and run concurrently through
  cancellable contract futures under one short deadline. Each receives the same
  cooperative `timeout_ms` budget. A failed, timed-out, or malformed provider makes
  navigation unavailable. Contributions over a provider's item or category cap are
  dropped and logged with their count. The endpoint returns the stable public
  `nav_unavailable` error, while raw details remain logs-only.
- Future cancellation is best-effort: it bounds the request's wait for normal Wippy
  operations but cannot preempt CPU-bound code that never yields. Installed in-process
  provider code is therefore privileged and reviewed like every other Wippy module;
  its binding metadata, returned items/categories, and errors remain untrusted input
  and are revalidated, capped, sanitized, and never exposed verbatim. Hostile-code
  isolation requires a separate runtime/process boundary and is not provided by this
  in-process extension contract.
- `nav_providers.collect` caps each provider's items and categories and reports
  drops. Provenance is derived by the collector: only the registry binding can
  produce `source: declared`; a provider payload cannot claim it.

## Data

The editor reads `/nav/list` and writes `/nav/config`. Those compatibility routes
are owned by this module; internally, persisted navigation controls live under
the `kickside.ui` settings namespace.

## Splash

A `ui.splash` registry entry declares optional `meta.presentation`:

| Value | Presentation |
| --- | --- |
| `fullscreen` (default) | Full-screen wizard with a step rail. |
| `dialog` | Compact centered modal over the running app, without a rail. |

Unknown values are declaration errors: splash resolution returns a typed `Invalid` error and `/nav/list` answers 503 `nav_unavailable` with the cause logged. Presentation changes only rendering;
`meta.scope` continues to determine whose completion record is written. The
instance setup wizard keeps the default `fullscreen` presentation.

```yaml
meta:
  type: ui.splash
  id: first_agent
  scope: user
  presentation: dialog
```

Dialog content sizes to its steps within a maximum width and viewport height.
The native modal dialog traps focus, carries `aria-modal` and a labelled title,
and leaves the app visible through a light backdrop. Its visible close button
and Escape dismiss it through `POST /api/v1/ui/splash/{id}/seen`. Dismissal and
step completion keep it open on persistence failure and show the error for retry.
A user-scoped dialog appears once per user, including after reload or on another
device, unless an explicit replay action clears its seen record.

### Eligibility

Declarative `ui.splash` entries support optional `meta.eligibility`, a function
reference that returns a boolean under the caller's actor and scope. The
resolver evaluates it after scope state and audience checks. `false` omits the
splash for that request; it does not mark the splash complete. Errors and
nonboolean results return a typed error from resolution. Entries without the field keep their existing
behavior.

User-scoped splashes store seen IDs in the caller's `kickside.ui:seen_splashes`
profile field through the users profile owner. Instance-scoped splashes use the
settings owner. `POST /ui/splash/{id}/seen` marks the current scope complete;
`DELETE /ui/splash/{id}/seen` clears the mark. The shell persists completion
before honoring a component step's `navigate` event.

## Build

```bash
make build      # cd ui && npm install && npm run build  -> static/index.js
make lint       # wippy lint
```

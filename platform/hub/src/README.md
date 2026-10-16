# kickside/hub

The module-management surface for a KickSide app: a self-contained web component
(`kickside-hub`) that mounts as a **System** tab (labeled Modules) and drives the
keeper hub.

It browses the hub catalog (scoped to project tags or the full hub), shows a
per-module detail page (README, provided entries, versions), plans transitive
installs and binds their requirements, runs install / update / uninstall with a
migration policy, and lists installed modules.

## Shape

- `src/_index.yaml` — namespace `kickside.hub`. Declares the UI mount
  (`fs.directory` + `http.static`), the `view.component`, and a `ui.settings_tab`
  so the System page discovers the tab without any app-side edit.
- `ui/` — the Vue 3 web component. Builds to `static/index.js`.

## Data

All data comes from existing app endpoints — the keeper hub API
(`/api/v1/keeper/hub/*`), the registry-entry search
(`/api/v1/keeper/registry/entries`), and `/api/v1/user/me`. This module ships no
backend functions or routers of its own; it only serves a static bundle and
declares a System tab.

The onboarding component discovers starter profiles from `registry.entry`
declarations with `meta.type: kickside.hub:onboarding_profile`. Profile display
fields and ordered package roots are entry data; source ownership is never
inferred from `meta.module` or a hard-coded namespace. Declared roots are
intersected with the live installable catalog before the shared Keeper review is
opened. The Hub owns this consumer contract but deliberately ships no concrete
profiles: the consuming application or another composition module declares the
presets appropriate to that product. Profile roots are component identities,
never version pins; Keeper resolves the current installable versions during
review. Administrators can instead choose packages manually or ask the
configured onboarding model to rank the same catalog allowlist.

Discovery uses the filtered registry list endpoint for profile IDs, then reads
each full registry entry from the single-entry endpoint. This is deliberate: the
list response is a summary (`id`, `kind`, `meta`) and does not expose entry data.

## Build

```bash
make build      # cd ui && npm install && npm run build  -> static/index.js
make lint       # wippy lint
```

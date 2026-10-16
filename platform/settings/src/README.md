# kickside/settings

Runtime, admin-editable, DB-backed application settings — exposed as the
`kickside.settings:settings` contract. **Not env**: env is deploy-time wiring;
settings are edited by an admin at runtime and persist in the database.

## How it works

- A module **declares** each of its settings as a registry entry:
  ```yaml
  - name: setting.max_items
    kind: registry.entry
    meta:
      type: kickside.settings:definition
    namespace: kickside.mymodule
    key: max_items
    value_type: int          # string | int | bool | duration | json | secret
    default: 50
    description: Items returned per page.
    scope: global
    editable: true
    # ── optional declarative fields ──
    visible: true            # false: backend-manageable but hidden from the admin UI
    title: Page size
    category: Paging
    order: 10
    owner: My module
    ui: my-setting-editor
    read_access: admin        # optional: only admins can read this value
    schema:                  # JSON-schema; the UI renders + validates the field from it
      type: integer
      minimum: 1
      maximum: 100
    validate_func: kickside.mymodule:validate_max   # ns:name called before persist
  ```

- **Optional declarative behavior**, all read off the definition entry:
  - `read_access: admin` — `get` requires admin Settings list access and
    `get_namespace` omits the key for other callers. Unset means ordinary
    contract reads are allowed; unknown read restrictions deny access.
  - `visible: false` — the setting stays readable/writable through the contract
    and PUT API but is excluded from `list` so the settings page never renders it.
  - `schema` — a JSON-schema for the value; `list` returns it per setting and the
    UI renders the field + validates against it (inline errors) before a save.
  - `validate_func` — a func id (`ns:name`) the writer calls
    (`funcs.call(validate_func, { key, value, old_value, definition })`) before
    persisting any change; it returns `(ok, err)` or `{ valid, error }` and can
    reject the write. The returned message surfaces on the field in the UI.
- The **DB stores only overrides.** Reads fall back to the declared default, so a
  default change in a module upgrade propagates immediately, and "reset to
  default" is just deleting the override row.
- Declarations are **registry-discovered** (`registry.find`), so the admin UI
  renders every declared setting with its current value, default, and
  provenance — no central list to maintain.

## Contract `kickside.settings:settings`

- `get({ namespace, key }) -> { success, value }`
- `set({ namespace, key, value, actor_id }) -> { success }` (validates against the declared type)
- `unset({ namespace, key }) -> { success }` (revert to default)
- `list({ namespace? }) -> { success, settings[] }` (declarations merged with overrides + provenance)
- `get_namespace({ namespace }) -> { success, values }`

A consumer reads a setting through the contract; e.g. a retention sweeper reads
`get({ namespace = "kickside.vacuum", key = "global_retention_days" })`.

## API

- `GET /settings[?namespace=]` — list for the admin UI.
- `PUT /settings` — set one `{namespace,key,value}` or many `{values:[...]}`;
  `value: null` clears the override.

Both are **admin-only** by the app-owned positive allowlist:
`app.security:user` has no `kickside.settings.api:*` endpoint access, while
`app.security:admin` has root access. The host router's `endpoint_firewall`
enforces this; handlers do no in-code permission checks.

## Admin views

The Settings page offers All settings across namespaces and section editors.
Both views use the same controls, validation, save and reset operations.
All settings searches titles, keys, namespaces, descriptions and owners.
`list` carries `title`, `category`, `order`, `owner` and `ui` from each definition.
An unset owner displays the block title for its namespace, or the namespace.

## Requirements

- `target_db` — required database backing `kickside_settings`.
- `api_router` — required firewall-protected router for the admin API.

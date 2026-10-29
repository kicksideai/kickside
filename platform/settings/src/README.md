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

## Performance

The `performance` Settings block mounts `kickside-settings-performance`, built
and served with this module as `performance.js`. Its four groups cover workers,
claiming and fairness, leases and retries, and execution limits. Source badges,
inline validation, proportional queue shares, and deferred per-field reset use
one atomic save. Reset removes the Admin override and reveals Host configuration
when present. Realtime refresh preserves unsaved drafts and coalesces notifications into one active refresh and one pending refresh.
Retry delays display and edit as durations while the API stores milliseconds.
The active database's worker count appears first; the other count stays editable
and is marked as unused by this installation.
The shared Settings toolbar supplies save/discard controls and inline saved
feedback. All Settings components use the UI kit's body and heading font tokens.
The shipped execution limit is 60m; a job's declared limit takes precedence.

`GET /api/v1/settings/performance` returns effective Jobs policy fields with
sources and live pool state. `PUT /api/v1/settings/performance` accepts
`{ values: { "worker.count_postgres": 20 }, unset: ["worker.claim_batch"] }`.
The authenticated router firewall checks the two exact endpoint resources;
handlers do no endpoint permission checks. The selectable `performance_admin` policy grants only those
two endpoint identities and includes the Jobs policy write capability. Member
module access grants neither endpoint. Jobs also enforces its write capability
for direct library callers.

Jobs owns the override table and revision, validation, singleton runtime
snapshot and notification path. These values never enter `kickside_settings`. The UI subscribes to
`kickside.jobs.performance.changed` and `kickside.jobs.policy.changed` before its first load and refetches the GET
endpoint on notifications and host visibility changes. PUT responses supply the authoritative fields. Rejected HTTP responses retain
native classification and committed fields. The editor shows **Applying** until
SQL's `applied_revision` reaches the committed revision, and displays the recorded
native apply error. A failed GET preserves that pending state; a realtime refresh
clears it after application succeeds. Saves never wait for the owner and there
is no empty-write retry action. Status reads persisted owner state and queue
counts without process messaging. No toolbar action is enabled before the first
baseline. The editor uses no polling.
Busy surplus slots finish before retirement; lease timing and execution changes
apply to subsequent executions. No restart is required.

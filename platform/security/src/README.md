# KickSide Security

The admin surface for app-owned **roles**, **scopes**, and **policy composition**.

- A **policy** (`security.policy`) is a grant declared by its owning package. A
  policy tagged `meta.private = true` is internal and is never offered when
  composing a scope; only **public** policies are selectable.
- A **scope** (`security.scope`) is a named set of policy ids, resolved at runtime
  by `security.named_scope`. Built-in scopes are implicit groups
  (`app.security:*`); **custom scopes** are admin-authored, DB-backed, and
  projected into `security.scope` registry entries by the projection service.
- A **role** is a policy group; the roles surface composes groups from policies.

Internal/system scopes (e.g. `app.security:ingress`) and private policies are
hidden from the admin UI.

## Slice layout

Hexagonal layers under the `kickside.security` prefix; children import the root,
never the reverse:

- `kickside.security` — shared vocabulary (`consts`, `types`), the requirement
  interface (`api_router`, `ui_server`, `target_db`, `process_host`), the DB
  resolver (`db_config`), and the UI mount.
- `kickside.security.persist` — `scope_store`: DB CRUD for custom scopes
  (`kickside_security_scopes`). The only layer that touches SQL.
- `kickside.security.service` — `scope_projection.service`: the supervised process that
  **owns** the DB → `security.scope` projection. Boot-reconciles and listens for
  admin write notifications,
  idempotently. The only layer that spawns and writes the registry; it runs under
  a dedicated trust group because `wippy.security:process` denies registry writes.
- `kickside.security.api` — `scope_catalog` (read model) plus the admin endpoints
  for scopes, policies, and roles.
- `kickside.security.migrations` — schema.

## API (admin-only; firewalled `api_router`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/security/scopes` | scope/role catalog (internal hidden unless `?include_internal`) |
| POST | `/security/scopes` | create/update a custom scope |
| DELETE | `/security/scopes?slug=` | remove a custom scope |
| GET | `/security/policies` | public policy catalog (`?include_private` to include private) |
| GET | `/security/roles` | roles + policy assignments + user counts |
| POST | `/security/roles` | create a role by assigning a group to policies |

Custom-scope writes hit the DB only; the projection service projects them into
`security.scope` registry entries on its next reconcile.

Group projection compares effective native policy coverage before fencing sessions
and delegated authority. Adding actions or resources to an existing allow, moving
an equivalent rule to another binding, or dividing a rule into fully covering
bindings preserves authority when the other policy constraints stay identical.
The registry entry ids and stored fingerprint shape remain unchanged. Lost
allow coverage, narrowed conditions, added denies and group deletion retain the
existing reduction protocol. A change with no provable covering rule remains
restrictive; previously revoked delegated authority is not restored.

## Requirements

- `target_db` — required database backing `kickside_security_scopes`.
- `process_host` — required host for the projection service.
- `api_router` — required firewalled router for the endpoints.
- `ui_server` — required HTTP server for the UI bundle.

## Generated execution delegation

The native writer shares Execution's canonical policy IDs/resources and the existing
native group evaluator. Configure the optional `delegation_validator` function to
validate live ordinary-user targets and execution roots; empty keeps generated
saves unavailable. Security administration and per-policy native registry-write
authority are both required. POST/DELETE `/security/delegations` accept a
principal, root and explicit operator groups; GET returns safe provenance. A failed
request returns its error and the same request can be sent again. Revocation retains policy IDs and composed references without granting
native authority. Revocation remains available when a target/root disappears or
host validation is unavailable. Existing scopes and unmanaged declarations keep their behavior.

Group-policy invalidation supplies optional previous changed-group rules from the
same projection plan before and after apply. Users reuses its unchanged-group
coverage proof to preserve delegation epochs when the original authority remains
covered. Prior effective fingerprints resolve only against available native and
previous generated binding bodies; incomplete evidence and pending-fence recovery
remain conservative. This evidence is ephemeral; stored fingerprint metadata,
credential payloads and registry identities remain unchanged.

Policy coverage lives in `kickside.security:policy_coverage`. The projector
compares group policy fingerprints there; Users supplies before/after membership
sets and optional historical group bodies to the same comparison. Native policy
evaluation remains authoritative for access.

The projector uses the separate `delegation_fencer` requirement, which defaults
to `kickside.users.persist:delegation_fencer`. Hosts can bind another fencing
operation. Existing `sessions_invalidator` bindings retain session/account
revocation and require no changes or pairing metadata.

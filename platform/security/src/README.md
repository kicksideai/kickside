# KickSide Security

The admin surface for app-owned **roles**, **scopes**, and **policy composition**.

- A **policy** (`security.policy`) is a grant declared by its owning package. A
  policy tagged `meta.private = true` is internal and is never offered when
  composing a scope; only **public** policies are selectable.
- A **scope** is a set of source policy IDs. Built-in groups resolve through
  `security.named_scope`; custom scopes are admin-authored rows in
  `kickside_security_scopes`. Their `security.scope` registry entries are catalog
  descriptors, not native runtime scope handlers.
- A **role** is a named membership used by the scope catalog and Users.

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
  idempotently. It writes descriptors only, and runs under
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
| GET | `/security/projection` | current scope resolution status |

Custom-scope writes fence affected users and persist the DB selection. The
projection service updates their `security.scope` catalog entries on reconcile.

Session minting unions native policies from every built-in membership with the
source IDs selected by the user's custom scopes, then creates one native scope.
It creates no policy copies, metadata grants, or union-group entries. The scope
catalog continues to merge DB selections, role descriptors, and built-in groups.

The projector resolves group declarations into native group references and source
IDs. Descriptor `data.policies` retains the complete catalog selection;
`data.groups` contains its native group references, `data.direct_policies` its
other declaration selections, and `data.scope_sources` its DB selection keys
and owning groups. These fields contain identifiers only. Native policies remain owned and evaluated by
the runtime. Group composition does not inspect their rule bodies.

The Users subject lookup reads live DB selections in one primary-key query for
all held custom scopes, checking the current target and enabled state before
using each row. Memberships without DB selections require no additional query. Native token
validation unions these source IDs with current native group policies and applies the credential ceiling. Existing stored sessions use the
same live lookup and keep their bearer tokens.

Changes to a custom scope's policy set, target, or enabled state fence affected
users through the existing authority epochs before the write. Membership changes
also advance those epochs. Policy-body coverage proofs are not part of this
protocol. Native policy edits take effect through native policy resolution.
The separate explicit session-invalidation API retains its existing `allow_only`
coverage contract for native groups; custom-scope writes do not call it.

The forward migration removes managed binding and metadata policies in registry
commits of at most 200 deletions. It is idempotent and resumes from the remaining
entries after interruption. The retired group-set table and its data remain in
place; session minting and validation no longer read or write it.

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

The projector uses the existing `delegation_fencer` requirement, which defaults
to `kickside.users.persist:delegation_fencer`. Hosts can bind another fencing
operation. Existing `sessions_invalidator` bindings retain session and account
revocation. Execution identity resolves current source IDs and captures those
IDs in new authority snapshots; existing snapshots remain issuance audit data.

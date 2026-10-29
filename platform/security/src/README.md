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
  idempotently. It retains legacy group-set bindings during staged consumer upgrades and runs under
  a dedicated trust group because `wippy.security:process` denies registry writes.
- `kickside.security.api` — `scope_catalog` (read model) plus the admin endpoints
  for scopes, policies, and roles.
- `kickside.security.runtime` — public live group-selection boundary.
- `kickside.security.projection` — Security-owned routing keys and derived entries.
- `kickside.security.migrations` — schema.

## API (admin-only; firewalled `api_router`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/security/scopes` | scope/role catalog (internal hidden unless `?include_internal`) |
| POST | `/security/scopes` | create/update a custom scope |
| DELETE | `/security/scopes?slug=` | remove a custom scope |
| GET | `/security/policies` | public policy catalog (`?include_private` to include private) |
| GET | `/security/projection` | current scope resolution status |

`GET /security/projection` resolves the caller's native groups and live selected
policy IDs through the same resolver and scope constructor as Users. `current`
reports whether that authority is available without writing registry entries or
registering a legacy group set. `scope_name` keeps the stable group-set identifier;
readiness does not require a materialized union scope. Resolution errors propagate
through the API error response.

Custom-scope writes fence affected users and persist the DB selection. The
projection service updates their `security.scope` catalog entries on reconcile.

Session minting unions native policies from every built-in membership with the
source IDs selected by the user's custom scopes, then creates one native scope.
It creates no per-login union-group entries. Native compatibility bindings
remain projected for existing application calls to `security.named_scope`. The
scope catalog continues to merge DB selections, role descriptors, and built-in groups.

The projector writes Security-owned custom-scope descriptors and derived routing
entries in `kickside.security.projection`. It never updates another owner's
`security.scope` fields, including `groups`, `policies`, or metadata. Each
routing entry holds only local source IDs and group references; runtime follows
those references live with bounded cycle detection. The catalog's derived
policy list is display data and is not an authorization source.

Users calls `kickside.security.runtime:resolve_groups`. This Security-owned
function carries its own configured database and registry authority. Users
neither imports Security persistence nor takes its private DB policy, so the
modules can use different databases. The resolver reads all held custom-scope
selections in one primary-key query, checking target and enabled state before
using each row. Internal reads use only Security's database and registry policies;
the caller's inspection denials remain on its own execution scope. Calling the
internal reader directly grants no additional authority.
Memberships without DB selections require no SQL query. Native token
validation unions these source IDs with current native group policies and applies the credential ceiling. Existing stored sessions use the
same live lookup and keep their bearer tokens.

Changes to a custom scope's policy set, target, or enabled state fence affected
users through the existing authority epochs before the write. Membership changes
also advance those epochs. These pre-write fences do not use policy-body
coverage proofs. Native compatibility projection retains its existing reduction
fencing and coverage evidence for callers using named scopes.
The separate explicit session-invalidation API retains its existing `allow_only`
coverage contract for native groups; custom-scope writes do not call it.

During staged upgrades, the existing
`kickside.security.binding:materialize_group_set` entry point, group-set table,
and registered bindings remain supported. Older Users versions continue to
receive a stable scope containing the union of all their memberships. The legacy
projector retains reduction fencing and binding identities for these registered
sets. New resolver callers do not register union groups. Native bindings for
composed application scopes and custom scopes remain available through
`security.named_scope`; the resolver reads their source IDs instead of
using the generated copies as its authorization input. This rollout contains no
retirement migration. Removing the old API/table or native bindings requires a
separate compatibility decision.

## Requirements

- `target_db` — required database backing `kickside_security_scopes`.
- `process_host` — required host for the projection service.
- `api_router` — required firewalled router for the endpoints.
- `ui_server` — required HTTP server for the UI bundle.

## Generated execution delegation

The native writer shares Execution's canonical policy IDs/resources and the existing
native group evaluator. A save requires an active ordinary user, named by its
canonical user ID through `kickside.contract:directory`, and an existing
component root (or `*`). Component checks existence in its own configured database
and returns only a boolean. Security administration and per-policy native registry-write
authority are both required. POST/DELETE `/security/delegations` accept a
principal, root and explicit operator groups; GET returns safe provenance. A failed
request returns its error and the same request can be sent again. Revocation retains policy IDs and composed references without granting
native authority. Revocation remains available when a target/root disappears or
the directory is unavailable. Existing scopes and unmanaged declarations keep their behavior.

The projector uses the existing `delegation_fencer` requirement, which defaults
to `kickside.users.persist:delegation_fencer`. Hosts can bind another fencing
operation. Existing `sessions_invalidator` bindings retain session and account
revocation. Execution identity resolves current source IDs and captures those
IDs in new authority snapshots; existing snapshots remain issuance audit data.

## Runtime compatibility

The live source-policy API is qualified on released Runtime 0.3.54a or newer.
Use that Runtime before switching Users to selected-policy authority. The
retained materialization entry point supports staged Users upgrades.

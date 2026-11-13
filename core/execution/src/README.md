# kickside/execution

Execution identity: the principal codec, actor keys, delegation encoding and the live
capture/resolve/bind/run_as path; and the execution trace context (`kickside.execution:trace`): the
canonical trace_context vocabulary, its row codec and the opaque correlation token. A leaf module: it
depends on no KickSide module.

User credential executions check current status, pending policy fences and optional
provider authority epochs through the Users-owned `kickside.contract:scope_resolver`.
MCP captures the issuing native policy ids and security groups for new credentials,
and reconstructs that finite scope together with its control-plane denies. Component
subtree restrictions and dispatcher tool ceilings only narrow authority. Access
expansion requires normal reissue; canonical reductions permanently revoke old
delegations even when membership or policy access returns.

`execution_identity.capture_authority(identity)` checks canonical admission and the
ambient issuing actor, then returns `{policy_ids, groups, epochs?}`. The durable
credential provider stores this protected snapshot and returns it through credential
restrictions. Required epoch omission or mismatch refuses admission. Resolver
providers may expose optional `authority_epochs` and `initial_authority_epochs`
maps of provider keys to nonnegative generations. Providers without the capability
retain their existing behavior. Legacy credentials without snapshots bind to the
initial epochs; unavailable historical issuing policies cannot be reconstructed.

Users owns the durable generations and advances them in reduction, password/status
mutation and deletion transactions. Deletion retains generation tombstones. Normal
logout-all remains independent of durable MCP credentials. Snapshot resolution uses
the optional `authority_only` hint to avoid materializing current group policies;
status, membership and pending policy-fence checks remain active. No runtime-private
session record is rewritten.

`execution_identity.authorize(identity, opts)` validates a declared principal through
that same Users resolver and applies live credential/link restrictions. It returns
the principal and authoritative metadata without creating an actor or scope.
Declaration ACL checks use this method. `resolve` authorizes through it and then
checks actor-create permission before constructing the execution frame. Options
retain the existing execution-root and trusted deferred-owner admission.

Ordinary session requests keep their login-minted policies and group snapshots.
Declared-principal authorization does not rebuild session policies per request.

## SPEC: Framework maintenance actors

`execution_identity.is_maintenance_key` is the single exact membership classifier
for both current actors and persisted owner/grant keys. Each owning module adds
one `registry.entry` per framework actor with
`meta.type: kickside.execution.maintenance_actor` and the exact `meta.actor_id`.
Only administrator-installed registry declarations contribute; ordinary actor
creation declarations, actor metadata, and component-instance metadata do not.
The actor ID must use the `system:` namespace and contain only letters, digits,
underscores, dots or hyphens after the colon. Membership compares raw IDs without
trimming or other normalization; the prefix alone grants nothing.

Execution's trusted reader explicitly binds its own registry-read scope,
independently of the caller's registry visibility, including explicit denials. It caches the validated exact set per registry
version, replacing it after install, update or uninstall; removed declarations
also cease recognizing persisted owner/grant keys. Only the owner-scope read populates the cache; a direct visibility-restricted
read cannot contaminate it. Read or declaration failures remain visible errors,
never an empty-set cache. Execution carries no inventory
of other modules' actors. Hosts reserve declared actor creation to trusted
framework code; declarations grant no actor-minting, delegation, registry, or
other native capability. Separate capability checks remain required.

Existing owners, grants and thread owners whose declarations remain installed
keep their classification without migration. Unlisted keys (including `system:knowledge.injection`) receive ordinary
caller checks, remain visible in grant enumeration and count in last-admin checks.
They still cannot encode a selectable v2 principal, whose ID cannot contain colons.
Remove obsolete injection grants through authorized sharing operations; recover
legacy work only by verifying its owner and refreshing its protected identity
through supported identity/convergence operations. Quarantine unverifiable stored
execution rows; never clear their identity to obtain framework execution.

# kickside/execution

Execution identity (IDENTITY-1): the principal codec, actor keys, delegation encoding and the live
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

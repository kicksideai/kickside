# Security delegation journal retirement

Owner approval: `2026-10-15 owner: remove compensation machinery for single actions`.

Published baseline: kickside/security 0.2.6. Delegation save and revoke no
longer keep a prepared/complete audit row, a registry receipt, an
`operation_id` or a recovery endpoint. Each request authorizes, applies the
native policy change and reconciles in the request. A failed step returns its
error and the same request is sent again; a registry change between the
snapshot and the apply returns CONFLICT. The unused non-http duplicates of the
save, revoke and list functions, the receipt write policy, the audit library and
migration `06_authorization_audit` are removed. The HTTP endpoints
`POST/DELETE/GET /security/delegations` keep their paths and methods.

The `kickside_security_authorization_audit` table on existing installations is
dropped by the single manual installation script. No delegation policy changes.

Proof: `platform/security/test/src/delegation_admin_test.lua` (stale registry
returns CONFLICT with nothing written, the same request then succeeds) and
`platform/security/test-bot-accounts/src/delegation_http_test.lua`.

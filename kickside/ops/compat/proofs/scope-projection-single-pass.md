# Security scope projection single pass

Owner approval: `2026-10-15 owner: no race machinery; conflicts return to the caller`.

Published baseline: kickside/security 0.2.6. A projection pass plans once
against one registry snapshot, applies, fences the groups whose authority it
reduced once after the apply, and records the registry revision its group sets
reflect. A registry commit between the snapshot and the apply returns the
registry CONFLICT to the waiting callers; that commit's own registry event starts
the next pass. A failed pass returns its error to the requests it answers and
the projector keeps serving. A login whose group set is current with the
registry resolves it without the projector.

The durable session fence queue is removed: delegations name the groups to fence
in their projection request instead of queueing them. Its table
`kickside_security_session_fences` is no longer created; migrations
`02_session_fences` and `03_session_fence_options` are removed and existing
installations drop the table through the manual installation script. The
pending-reduction pre-check `kickside.security.binding:check_group_authority`
and its grants `kickside.security.service:authority_fence_db` and
`kickside.security.service:authority_fence_config` are removed.

kickside/users stops calling `check_group_authority` in the same change.
kickside/security and kickside/users ship together in the release through the
application lock, so no installation runs one without the other.

Proof:
- `platform/security/test/src/scope_projection_test.lua` (reductions fence once
  after the apply; the unconfigured host fencer returns its error).
- `platform/security/test/src/scope_projector_lifecycle_test.lua` (a group set
  current with the registry resolves without the projector; module policy
  replacements project and fence once after their registry commit; a request
  queued behind a failed pass is answered and the projector keeps serving).
- `platform/security/test/src/run_as_projection_test.lua` (concurrent requests
  for one group set share one projection pass).
- `platform/users/test/suites/login_scope_test.lua` (logins keep their saved
  authority through policy reductions and the delegation fencer).

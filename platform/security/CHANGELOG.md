# Changelog

## 0.2.9 (2026-10-17)

- Refresh packaged frontend assets and documentation.

## 0.2.8 (2026-10-16)

- Project stored groups over available policies and expose the complete assignable scope catalog.

## 0.2.6 (2026-10-14)

- Complete pending delegation fences before taking the projection snapshot so ongoing registry changes permit scope projection completion and convergence.

## 0.2.5 (2026-10-13)

- Assign covering projected grants once, preserve captured binding identities and delegation fences, and prove resource-prefix coverage through the shared policy helper.

## 0.2.2 (2026-10-09)

- Preserve native HTTP failures and acknowledge committed scope and membership changes.

## 0.2.1 (2026-10-09)

- Preserve native persistence, membership, scope and materialization errors with their retryability and cause.
- Build frontend assets with the current published UI Kit stylesheet.

## 0.2.0 (2026-10-08)

- fix(security): scope reuse closes on reductions of composed source groups and ignores expansion-only fences (c5acea157)
- fix(users): revoke removed group ACL authority across membership writers (099d27cc2)
- fix(security): honor fences on materialized group sets (524deb0fd)
- fix(identity): check reduction fences for every live group scope (0f79e3e9e)
- fix(security): refuse group resolution while a reduction is pending (f54cf4ef1)
- fix(users): preserve sessions for membership expansions and no-ops (62a385d25)
- Add checked scope projection materialization (3ee1880d6)
- Grant the scope reconcile clients the reconcile request function (6ae9c85c5)
- Deliver scope reconcile, OAuth, upload and profile signals under service identities (90ce38da7)
- Fail a scope projection pass only against the registry it read (29754006c)
- Plan each scope projection pass against one registry snapshot (c99c81f93)
- Keep the scope projector serving under queued and departed callers (62a509745)
- fix: bind transitive Security requirements in hosts and Hub plans (235fdf804)
- build: rebuild bundles from source (6c884fef9)
- chore: refresh locks to latest published dependencies (243b4bdff)
- Remove session token-data rewrite; access expansions keep sessions, new access arrives at next login (d4c5e888d)
- Complete Users management: scoped System tabs, scope catalog and declared memberships (829cb91b7)
- Preserve member tokens and refresh native grants on access expansions (9980e8ede)
- Keep group policy projection canonical across restarts (a58bb51e7)
- Declare platform Members scope and installed module composition (d064a0121)
- Grant materializer transport on resolved process identities (1cc500075)
- Authorize scope projection transport inside the materializer (8e17d2209)
- Project deterministic native security groups for membership sets (a0ae17dcd)
- Complete module policies for SSO and dynamic scope resources (a694563bf)
- Enforce component module authority and preserve unchanged unrestricted sessions (072f7e01a)
- Declare module access bundles and invalidate changed group sessions (602c31f9d)
- fix(security): reserve producer capabilities for module services (59bede7cd)
- feat(security): compose application groups from module policies (0fc8b5e18)
- feat: project native policy groups and app membership defaults (bffdd401a)
- Run native PostgreSQL gates through isolated module targets (3ddb9c541)
- Await projector teardown between reconciliation cases (a3418a628)
- fix(frontend): consolidate retained rollout styles and sticky layer (884ee6454)
- fix(cluster): scope durable actor ownership and retain standby contenders (1ec81dcb0)
- fix(security): acknowledge scope reconciliation after admin writes (02809876d)

## 0.1.38

Current published Hub version.

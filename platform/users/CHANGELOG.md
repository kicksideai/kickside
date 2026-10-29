# Changelog

## [0.2.13](https://github.com/kicksideai/kickside/compare/users-v0.2.12...users-v0.2.13) (2026-10-29)


### Bug Fixes

* **security:** preserve native delegation through composed roles ([#218](https://github.com/kicksideai/kickside/issues/218)) ([80c8747](https://github.com/kicksideai/kickside/commit/80c87475c238d8782ad422aafef249ea24b12a2b))
* **users:** require canonical IDs for directory group lookup ([1a4b3ac](https://github.com/kicksideai/kickside/commit/1a4b3acd7ad729a2afa97bc3428fd3b381b7dad0))

## [0.2.12](https://github.com/kicksideai/kickside/compare/users-v0.2.11...users-v0.2.12) (2026-10-28)


### Bug Fixes

* align System account and permission administration ([#197](https://github.com/kicksideai/kickside/issues/197)) ([fb19352](https://github.com/kicksideai/kickside/commit/fb1935229cba380343c98b252e132cf7ecbce6f3))
* **users:** read profile membership configuration with owner authority ([#200](https://github.com/kicksideai/kickside/issues/200)) ([2c19801](https://github.com/kicksideai/kickside/commit/2c19801d06efc6975ccee28637f06a03d2e96ffd))

## [0.2.11](https://github.com/kicksideai/kickside/compare/users-v0.2.9...users-v0.2.11) (2026-10-28)


### Bug Fixes

* consolidate default account roles ([aafe19c](https://github.com/kicksideai/kickside/commit/aafe19cd2ac7d58ed04f4d035cef91995eab8dce))
* consolidate default account roles ([02b9f4b](https://github.com/kicksideai/kickside/commit/02b9f4bc47efb852b9f20c2f08edebb9c6d28972))
* **users:** preserve deferred sharing after role consolidation ([102c926](https://github.com/kicksideai/kickside/commit/102c926b2bea879ab25cbf540c364bb7579e7394))
* **users:** preserve deferred sharing identities after role consolidation ([1ec9d29](https://github.com/kicksideai/kickside/commit/1ec9d293ac22a9f07311ca3c8413cff376852e97))
* **users:** retain live ACL aliases without mint-time defaults ([488a15b](https://github.com/kicksideai/kickside/commit/488a15b31993452eb4b0a6aafd2de5122f1e2763))

## [0.2.9](https://github.com/kicksideai/kickside/compare/users-v0.2.8...users-v0.2.9) (2026-10-28)


### Bug Fixes

* **security:** resolve live scopes through Security-owned projections ([adad7ee](https://github.com/kicksideai/kickside/commit/adad7ee499f7dfbd1134c57c06368aa440a0ab07))
* **users:** map live authority to Runtime policies ([2dc0120](https://github.com/kicksideai/kickside/commit/2dc01208793ea8b3779a87b0497b06e70d1d00c2))
* **users:** omit configured bootstrap passwords from runtime logs ([9bf7a4f](https://github.com/kicksideai/kickside/commit/9bf7a4f34d9d5e8c66888f86fc6dfd9be6dec9c7))
* **users:** preserve saved login scope metadata during validation ([d7cc51e](https://github.com/kicksideai/kickside/commit/d7cc51e9573b9c6b1d39fcb7780e5b614d336b2e))
* **users:** preserve session projection resolver access ([#176](https://github.com/kicksideai/kickside/issues/176)) ([6a391ab](https://github.com/kicksideai/kickside/commit/6a391ab8abc3be5c9905f56484a3e2fac50e2d79))
* **users:** require released source-scope implementations ([a2d5271](https://github.com/kicksideai/kickside/commit/a2d52713ec37a6580dfc56da353532d57659670c))
* **users:** resolve live source-policy authority through Security ([e7b1fb1](https://github.com/kicksideai/kickside/commit/e7b1fb19655bcca882e71b523c229ac1223d2216))

## [0.2.8](https://github.com/kicksideai/kickside/compare/users-v0.2.7...users-v0.2.8) (2026-10-22)


### Bug Fixes

* preserve execution failure and session acquisition semantics ([#76](https://github.com/kicksideai/kickside/issues/76)) ([2df07e3](https://github.com/kicksideai/kickside/commit/2df07e32a36bb5cf2f20a2eaf030c7d12a4ccb08))
* return typed execution construction failures ([#73](https://github.com/kicksideai/kickside/issues/73)) ([1219db2](https://github.com/kicksideai/kickside/commit/1219db2e21623b8e578c2fb4bafe2bc199ea1968))
* **uploads:** preserve completion checkpoints and redact structured diagnostics ([518920e](https://github.com/kicksideai/kickside/commit/518920e63ef6f512949da0d0b79cf9cd7a03a161))
* **users:** restore modal account dialogs and align Users with system pages ([2d40caf](https://github.com/kicksideai/kickside/commit/2d40cafff8b6f677fe50f2939cf02af24059da9c))

## 0.2.7 (2026-10-17)

- Refresh packaged frontend assets and documentation.

## 0.2.6 (2026-10-16)

- Verify password hashes from earlier releases and upgrade them after successful authentication.

## 0.2.2 (2026-10-09)

- Keep the email-grant migration independent of later user schema, so updates from older installs apply (33436d34d).

## 0.2.1 (2026-10-09)

- fix(mcp): retain issuing authority and revoke reduced delegations (fd9953e90)
- Preserve native Users administrative failures and classify stable codes (013eede85)
- Build frontend assets with the current published UI Kit stylesheet.

## 0.2.0 (2026-10-08)

- test: guard user-visible issue behavior through the browser (dd2f3d834)
- fix(identity): include live group metadata in authorizer evaluation (259f008e3)
- fix(users): preserve the numeric group-update revocation result (7f9234a75)
- fix(identity): check reduction fences for every live group scope (0f79e3e9e)
- fix(users): preserve sessions for membership expansions and no-ops (62a385d25)
- fix: evaluate deferred delegation in live authorizer scope (9671d4ed6)
- Reserve session authority metadata and guard membership token retention (e5c4d8b8e)
- build: rebuild bundles from source (6c884fef9)
- chore: refresh locks to latest published dependencies (243b4bdff)
- fix(users): enroll default groups under the account lock order (92f382bec)
- fix(users): order session invalidation on account row locks (38d7153e7)
- Remove session token-data rewrite; access expansions keep sessions, new access arrives at next login (d4c5e888d)
- Complete Users management: scoped System tabs, scope catalog and declared memberships (829cb91b7)
- Gate System navigation and settings tabs by their declared capabilities (c39276bbe)
- Preserve member tokens and refresh native grants on access expansions (9980e8ede)
- Declare selectable Users management and gate shell contributions by capability (ffc32f170)
- Default module member requirements to platform Members (a05332552)
- Issue sessions from current account generation after policy reconciliation (6eac2a9ac)
- Keep wildcard sessions whose excluded actions a change cannot grant (00465b116)
- Fence enrolled groups before native scope projection (d457201d1)
- Resolve the native group projector as a fresh Users dependency (e6561d734)
- Mint and recover one named scope for every membership set (80d837cbd)
- Enforce component module authority and preserve unchanged unrestricted sessions (072f7e01a)
- Declare module access bundles and invalidate changed group sessions (602c31f9d)
- feat: project native policy groups and app membership defaults (bffdd401a)
- Execute registered API, transform, policy and picker test cases (e319c69c8)
- Keep cluster name and directory read authority in owning modules (97da56fd2)
- users: supply the member database selector grant through host scope (f330f0ad1)
- users: search the complete principal directory with continuation (6b8444608)
- users: preserve whole account membership at authentication boundaries (5b7e84f57)
- fix(users): own group member expansion runtime identity (2de942be0)
- Bind Keeper MCP authentication to live Users groups (7a2c5c9e6)

## 0.1.51

Current published Hub version.

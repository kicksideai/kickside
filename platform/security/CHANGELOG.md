# Changelog

## [0.2.19](https://github.com/kicksideai/kickside/compare/security-v0.2.18...security-v0.2.19) (2026-10-29)


### Bug Fixes

* **security:** isolate role source reads from caller denials ([#233](https://github.com/kicksideai/kickside/issues/233)) ([3ab6915](https://github.com/kicksideai/kickside/commit/3ab6915c56448b63a525ddcf1f8e1f7c460b4d7a))

## [0.2.18](https://github.com/kicksideai/kickside/compare/security-v0.2.17...security-v0.2.18) (2026-10-29)


### Bug Fixes

* **security:** preserve native delegation through composed roles ([#218](https://github.com/kicksideai/kickside/issues/218)) ([80c8747](https://github.com/kicksideai/kickside/commit/80c87475c238d8782ad422aafef249ea24b12a2b))

## [0.2.17](https://github.com/kicksideai/kickside/compare/security-v0.2.16...security-v0.2.17) (2026-10-28)


### Bug Fixes

* align System account and permission administration ([#197](https://github.com/kicksideai/kickside/issues/197)) ([fb19352](https://github.com/kicksideai/kickside/commit/fb1935229cba380343c98b252e132cf7ecbce6f3))

## [0.2.16](https://github.com/kicksideai/kickside/compare/security-v0.2.15...security-v0.2.16) (2026-10-28)


### Bug Fixes

* consolidate default account roles ([aafe19c](https://github.com/kicksideai/kickside/commit/aafe19cd2ac7d58ed04f4d035cef91995eab8dce))
* consolidate default account roles ([02b9f4b](https://github.com/kicksideai/kickside/commit/02b9f4bc47efb852b9f20c2f08edebb9c6d28972))

## [0.2.15](https://github.com/kicksideai/kickside/compare/security-v0.2.14...security-v0.2.15) (2026-10-28)


### Bug Fixes

* **security:** read projection readiness from native authority ([#178](https://github.com/kicksideai/kickside/issues/178)) ([ec25552](https://github.com/kicksideai/kickside/commit/ec255523e03a42f89eccb7871053c29724e7d3a5))

## [0.2.14](https://github.com/kicksideai/kickside/compare/security-v0.2.13...security-v0.2.14) (2026-10-28)


### Bug Fixes

* **security:** omit deleted policies from registry previews ([819712e](https://github.com/kicksideai/kickside/commit/819712e42935b0e8cc027add0dd32ba0ee1cd91d))
* **security:** project module access in the same registry version as an install ([20152e2](https://github.com/kicksideai/kickside/commit/20152e288a994e4c48e59b43ca1bd89b55444be0))
* **security:** project module access in the same registry version as an install ([049ff9e](https://github.com/kicksideai/kickside/commit/049ff9e6ccf9666d95274d0faebe669e2008c7e6))

## [0.2.13](https://github.com/kicksideai/kickside/compare/security-v0.2.12...security-v0.2.13) (2026-10-26)


### Bug Fixes

* **security:** expose live scope resolution during staged upgrades ([db3c54d](https://github.com/kicksideai/kickside/commit/db3c54d66cc2dfc17da33040357e1decee522bf8))
* **security:** expose live scope resolution during staged upgrades ([ed39a5e](https://github.com/kicksideai/kickside/commit/ed39a5e7f85a9a2f3669853dc63b508af5ebb9a3))
* **security:** preserve native scopes alongside source resolution ([39de48e](https://github.com/kicksideai/kickside/commit/39de48e1964617fad60b36873f78e0cbbe6d1584))

## [0.2.12](https://github.com/kicksideai/kickside/compare/security-v0.2.11...security-v0.2.12) (2026-10-26)


### Performance Improvements

* **security:** avoid hashing unchanged projection bindings ([3264022](https://github.com/kicksideai/kickside/commit/3264022b4becd082376f16dfd78be29103c35cca))
* **security:** skip hashes for equal projected bindings ([528a6e1](https://github.com/kicksideai/kickside/commit/528a6e1c9a9e317be198993e94bbce1f4491d0f5))

## [0.2.11](https://github.com/kicksideai/kickside/compare/security-v0.2.10...security-v0.2.11) (2026-10-25)


### Bug Fixes

* **security:** avoid duplicate registry projection passes ([#144](https://github.com/kicksideai/kickside/issues/144)) ([f5f0a03](https://github.com/kicksideai/kickside/commit/f5f0a030e85edcacb0cdca5e7469ee41e21f655e))

## [0.2.10](https://github.com/kicksideai/kickside/compare/security-v0.2.9...security-v0.2.10) (2026-10-22)


### Bug Fixes

* **security:** return a module install only after the scope projection applies ([595b4db](https://github.com/kicksideai/kickside/commit/595b4db248055aa304f5ecd2919329133dc5681c))
* **security:** return a module install only after the scope projection applies ([ed4c0e2](https://github.com/kicksideai/kickside/commit/ed4c0e28979c921e9a799e7e042f8e6d913ab16a))
* **security:** use shared tabs for administration ([74cd95a](https://github.com/kicksideai/kickside/commit/74cd95aa1590c84bf0d127150684a8f974bff155))

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

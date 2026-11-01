# Changelog

## [0.3.9](https://github.com/kicksideai/kickside/compare/core-v0.3.8...core-v0.3.9) (2026-11-01)


### Bug Fixes

* **core:** retry transient retention owner failures ([#279](https://github.com/kicksideai/kickside/issues/279)) ([f1bb3db](https://github.com/kicksideai/kickside/commit/f1bb3db4f3b0012be9e63d05baadcc32a5a22147))

## [0.3.8](https://github.com/kicksideai/kickside/compare/core-v0.3.7...core-v0.3.8) (2026-11-01)


### Bug Fixes

* **core:** schedule module-owned retention deadlines ([#277](https://github.com/kicksideai/kickside/issues/277)) ([1289a1c](https://github.com/kicksideai/kickside/commit/1289a1cf59ebb0aa67147c89079e9f601342434b))

## [0.3.7](https://github.com/kicksideai/kickside/compare/core-v0.3.6...core-v0.3.7) (2026-10-29)


### Bug Fixes

* **core:** converge thread declarations after concurrent creation ([#232](https://github.com/kicksideai/kickside/issues/232)) ([115401c](https://github.com/kicksideai/kickside/commit/115401c09445cbe8d806e89c45184340b2017f1f))
* scope automation source pickers to binding kinds ([#214](https://github.com/kicksideai/kickside/issues/214)) ([f9e2577](https://github.com/kicksideai/kickside/commit/f9e2577a4dabfb088925098a96e013792e617e21))

## [0.3.6](https://github.com/kicksideai/kickside/compare/core-v0.3.5...core-v0.3.6) (2026-10-28)


### Bug Fixes

* **core:** converge retained thread declarations ([#187](https://github.com/kicksideai/kickside/issues/187)) ([262c781](https://github.com/kicksideai/kickside/commit/262c7810cc7fe702e79d0bdf278ac7c1480693de))

## [0.3.5](https://github.com/kicksideai/kickside/compare/core-v0.3.4...core-v0.3.5) (2026-10-28)


### Bug Fixes

* **security:** resolve live scopes through Security-owned projections ([adad7ee](https://github.com/kicksideai/kickside/commit/adad7ee499f7dfbd1134c57c06368aa440a0ab07))

## [0.3.4](https://github.com/kicksideai/kickside/compare/core-v0.3.3...core-v0.3.4) (2026-10-23)


### Bug Fixes

* **core:** order projection output wakes with job completion ([#82](https://github.com/kicksideai/kickside/issues/82)) ([5550708](https://github.com/kicksideai/kickside/commit/5550708a2c80ee064cd5a6bab6fa48de0f73e313))
* **core:** require Jobs lock ordering for projection completion ([#116](https://github.com/kicksideai/kickside/issues/116)) ([80d8ce9](https://github.com/kicksideai/kickside/commit/80d8ce992efe2dc435c0364ef40ce10a75489a41))

## [0.3.3](https://github.com/kicksideai/kickside/compare/core-v0.3.2...core-v0.3.3) (2026-10-22)


### Bug Fixes

* **core:** accept event type on pull requests ([#70](https://github.com/kicksideai/kickside/issues/70)) ([51b1fe4](https://github.com/kicksideai/kickside/commit/51b1fe4429c6d7d5365794406561498fafe9e911))
* **core:** pin retained input for projections already blocked ([8cda891](https://github.com/kicksideai/kickside/commit/8cda891d18782217af915c38c73516ab3f001e11))
* **core:** retain unread projection input through deterministic blocks ([9a58fd5](https://github.com/kicksideai/kickside/commit/9a58fd56507ada47e6b29adb2f9a6823bb917a38))
* **core:** serialize projection failures with removal ([94d940e](https://github.com/kicksideai/kickside/commit/94d940e1bdab5bc78d3a2e3664a1512ab5562d11))
* **jobs:** park deterministic projection failures without wake demand ([#83](https://github.com/kicksideai/kickside/issues/83)) ([2351ec4](https://github.com/kicksideai/kickside/commit/2351ec43eb07c6667393a5bd6dadc7eb3e6cdfa2))
* **uploads:** preserve completion checkpoints and redact structured diagnostics ([518920e](https://github.com/kicksideai/kickside/commit/518920e63ef6f512949da0d0b79cf9cd7a03a161))

## 0.3.2 (2026-10-17)

- Remove retired retention metadata and refresh packaged documentation.

## 0.3.1 (2026-10-16)

- Preserve database errors when reporting unverifiable thread keys.

- Bind verified legacy thread natural keys during boot migrations and report unverifiable rows without changing them.

## 0.2.2 (2026-10-09)

- Retain projection control failure kinds and native cause metadata.
- Fence target references when authority-blocked work resumes.
- Preserve native projection, workspace and thread-port failure metadata.
- Classify projection uniqueness from the atomic insert result.
- Preserve native errors through Core endpoint backing dispatch (9f70ef807)
- Return native Core provenance validation errors with stable codes (dfae4a59f)
- Retain native Contract cause metadata and query parameter errors (6ecd58f1f)
- Preserve native Execution validation errors and migrate trace consumers (5fda907df)

## 0.2.1 (2026-10-08)

- Preserve thread identity and event history when natural keys contain ambiguous separators.
- Assign separate identities to true collisions through an additive natural-key migration.

## 0.2.0 (2026-10-08)

- fix(core): preserve source integrity and converge resident lifecycle state (6e537e2e2)
- fix: owner delete pages continue when a peer advances the same teardown (R3-P01, R3-P02) (20981d1a9)
- End failed one-shot jobs dead, record projection slot failures on their cursor, and reclaim leftover owned jobs (6b07e66b2)
- Close lost run history, mark caught-up projections valid, and surface unclaimed due work (a64a696c7)
- Resolve thread update audiences from the stored thread (92b5de373)
- Commit declared primary threads with their components (cf3164c57)
- Deliver cursor waiter signals and thread updates under the threads identity (3ce46fb93)
- Notify the job pool and retention sweeper under their service identities (f9e4c900c)
- Default module member requirements to platform Members (a05332552)
- Commit a thread component and its thread row in one transaction (ee4b9bbdc)
- Notify the job worker pool after committed component lifecycle work (52a62010c)
- Declare module access bundles and invalidate changed group sessions (602c31f9d)
- fix(core): preserve declared producer event authorization (ad3a39c96)
- fix(http): retain published error library identities (ae7ddc9be)
- fix(core): accept published projection outputs without continuation flags (24748c795)
- Preserve bounded cleanup outcomes and durable continuation through deletion (78a2aff1f)
- Reduce Core retention discovery and locked thread reads (d0ec644b7)
- fix(projections): preserve due jobs and coalesce dispatch wakes (202379795)
- Page authorized job history through current owners (7f0414e9d)
- Keep current projection catch-up from rescheduling its job slot (cd82ea7eb)
- Converge thread fencing after concurrent owner purge (79f6a2a16)
- Reject subject-changing event identity retries (4480be38f)
- fix(core): select catch-up cursors directly and upgrade their broker (1c17e541d)
- feat(core): continue projection and cursor listings independently (c3cddb8e0)
- fix(core): observe committed component lifecycle through declared projections (269e77f15)
- knowledge: address the source projection through the current threads contract (1d4e362b7)
- Consolidate singleton admission and stop cancelled maintenance standbys (0713f7173)
- Preserve caller process options when spawning projection workers (d49e58ff7)
- fix(cluster): scope durable actor ownership and retain standby contenders (1ec81dcb0)
- fix(core): supervise projection failures and expose owner-scoped job history (2e2f609c5)
- fix(core): preserve process projection error exits (edd064804)
- release: kickside/core 0.1.126 and kickside/component 0.1.66 (thread subject versions, context expectations) (efbbdc2e2)
- Add subject-scoped expectations to thread appends (b3d8315ac)
- fix(core): grant host administrators Lifecycle sharing controls (398697f14)
- Honor shared components and align smoke checks with declared contracts (93b4e34dd)

## 0.1.123

Current published Hub version.

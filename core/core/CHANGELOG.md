# Changelog

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

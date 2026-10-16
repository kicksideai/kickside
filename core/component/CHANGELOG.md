# Changelog

## 0.2.5 (2026-10-13)

- Authorize only implementations selected by the caller’s SQL grant and query filters before pagination.

## 0.2.1 (2026-10-09)

- Retain declaration state and validate persisted execution identities.
- Retain canonical placement registration behavior and native failure metadata.
- Preserve native Component validation failures and service error metadata (cb9e09252)
- feat(component): protect owner metadata and persist monotonic floors (ba184200f)
- fix(component): restore optional notification ownership and fresh harness closure (ea360e716)
- fix(component): dispatch bounded notifications and preserve owner failures (7bc3d6e27)

## 0.2.0 (2026-10-08)

- fix(component): enforce portable stream integrity and guard ownership boundaries (3862b6c7f)
- fix: retain admitted execution identity restrictions (fe4935016)
- feat(component): audited operator adoption of unowned components (94f96e07b)
- fix(jobs,component): refuse components created by unattributed job targets (138993a82)
- fix: resolve declared principal groups through Users authority (4b9fceb7d)
- Reach realtime audiences without caller process or realtime authority (dd5a4cc5b)
- Default module member requirements to platform Members (a05332552)
- Commit a thread component and its thread row in one transaction (ee4b9bbdc)
- Notify the job worker pool after committed component lifecycle work (52a62010c)
- Enforce component module authority and preserve unchanged unrestricted sessions (072f7e01a)
- Declare module access bundles and invalidate changed group sessions (602c31f9d)
- fix(component): add metadata uniqueness through the database (3bde749f1)
- fix(component): retain unique metadata with explicit duplicate refusal (d147ca784)
- fix(http): retain published error library identities (ae7ddc9be)
- fix(component): preserve metadata rows through normal upgrades (b90a1438d)
- Preserve bounded cleanup outcomes and durable continuation through deletion (78a2aff1f)
- Enforce unique Component public metadata with bounded upserts (1b8048d7a)
- fix(component): batch public metadata field writes (5da976e59)
- Align component reader typing and trusted-call inventory with current owners (038f9b129)
- Retain unavailable automations across module removal and cover lifecycle gaps (4312ed163)
- Read context revisions independently and preserve unstructured failure envelopes (610168c7b)
- Authorize runtime metadata writes from declared component identity (5701efa1d)
- Scope runtime metadata grants to stored component implementations (05ba21847)
- fix(component): authorize runtime metadata against stored target attributes (8a869a69f)
- fix(core): observe committed component lifecycle through declared projections (269e77f15)
- Serialize component deletion with structural writers (1967690d7)
- fix(component): authorize trusted runtime meta writes against the target's public meta (b8b0b35c4)
- Name allowed parents in the placement message instead of an error-details array (c043da717)
- feat(component): enforce declarative placement rules (8b6f8e9d4)
- release: kickside/core 0.1.126 and kickside/component 0.1.66 (thread subject versions, context expectations) (efbbdc2e2)
- Check component context subject expectations under the row lock (1ea34411c)
- Reject undeclared component update request fields (c8a9c79ee)
- Store skill bundle bytes in the injected filesystem (07b3715dc)

## 0.1.63

Current published Hub version.

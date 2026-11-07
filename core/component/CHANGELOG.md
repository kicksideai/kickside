# Changelog

## [0.3.8](https://github.com/kicksideai/kickside/compare/component-v0.3.7...component-v0.3.8) (2026-11-07)


### Bug Fixes

* **component:** export deeply nested contexts without overflowing the call stack ([#326](https://github.com/kicksideai/kickside/issues/326)) ([56f765d](https://github.com/kicksideai/kickside/commit/56f765ddc8079d50544de76e426522087478d108))

## [0.3.7](https://github.com/kicksideai/kickside/compare/component-v0.3.6...component-v0.3.7) (2026-11-06)


### Bug Fixes

* **component:** authorize deletion dependencies and continue cleanup across error kinds ([f48c782](https://github.com/kicksideai/kickside/commit/f48c78267a60800793a40c46f8416c6ae8bb27f5))
* **component:** authorize deletion-owned job dependencies ([416f3ab](https://github.com/kicksideai/kickside/commit/416f3abd48e5a140885ccd3d042ee1dd4a2f8c1d))
* **component:** continue structured cleanup across error kinds ([784f8c4](https://github.com/kicksideai/kickside/commit/784f8c4502656381f588b6d040717d5935e31bc2))

## [0.3.6](https://github.com/kicksideai/kickside/compare/component-v0.3.5...component-v0.3.6) (2026-11-05)


### Bug Fixes

* **component:** execute deletion cleanup through Jobs ([c034b5c](https://github.com/kicksideai/kickside/commit/c034b5c8e5cc2c92a5ced4d8ae70107361f2e9d3))
* **component:** expose asynchronous deletion progress ([e4ca4b7](https://github.com/kicksideai/kickside/commit/e4ca4b7ab5185ecc6ecf83b336ca3e6edf5aca6e))
* **component:** preserve published notification access ([efcbc6e](https://github.com/kicksideai/kickside/commit/efcbc6e2e8a161a96e58958662c5816ba808e429))
* **component:** restore bounded final deletion pages ([cc5c7a5](https://github.com/kicksideai/kickside/commit/cc5c7a5ea54818c1d0a538842d1c2881a988b5b4))
* **component:** run deletion cleanup through Jobs ([da3f7ae](https://github.com/kicksideai/kickside/commit/da3f7aee8dce4136a65d1c94bda6604820bc8355))
* **component:** simplify deletion waiting and committed delivery ([584eae6](https://github.com/kicksideai/kickside/commit/584eae6145e5e9b4ea36bdbd6527ffe376e9f7fe))
* **component:** wait for authorized child deletion before teardown ([94ba45d](https://github.com/kicksideai/kickside/commit/94ba45df29f52d5f7b4766dd04bd335f92771752))
* preserve deletion view state and bind notification authority ([2ea5cf1](https://github.com/kicksideai/kickside/commit/2ea5cf1a31352ba4ba1915daeca384d06d2e7b70))

## [0.3.5](https://github.com/kicksideai/kickside/compare/component-v0.3.4...component-v0.3.5) (2026-10-30)


### Bug Fixes

* make direct grants atomic and select installed task providers ([#256](https://github.com/kicksideai/kickside/issues/256)) ([2e51908](https://github.com/kicksideai/kickside/commit/2e519081e032aabb2137ede2e5f3903e55012566))

## [0.3.4](https://github.com/kicksideai/kickside/compare/component-v0.3.3...component-v0.3.4) (2026-10-29)


### Bug Fixes

* **component:** keep trusted existence reads under owner authority ([#240](https://github.com/kicksideai/kickside/issues/240)) ([c998e6c](https://github.com/kicksideai/kickside/commit/c998e6c8da40b5ceacd71bfc9a9d415225977053))

## [0.3.3](https://github.com/kicksideai/kickside/compare/component-v0.3.2...component-v0.3.3) (2026-10-28)


### Bug Fixes

* **security:** resolve live scopes through Security-owned projections ([adad7ee](https://github.com/kicksideai/kickside/commit/adad7ee499f7dfbd1134c57c06368aa440a0ab07))

## [0.3.2](https://github.com/kicksideai/kickside/compare/component-v0.3.1...component-v0.3.2) (2026-10-22)


### Bug Fixes

* **component:** return recorded identity replay generation ([#74](https://github.com/kicksideai/kickside/issues/74)) ([9b21079](https://github.com/kicksideai/kickside/commit/9b210798934249f7eae25bb53e832dd95db13a57))
* **component:** start new components with the creator's captured identity ([1a9b12e](https://github.com/kicksideai/kickside/commit/1a9b12ea4204a37235a5101fe25f25129eb2cfd1))
* **component:** take the declaration fence before access rows ([71646b2](https://github.com/kicksideai/kickside/commit/71646b22d4331de71ac4ef62e8166939b70c9f7f))
* **uploads:** preserve completion checkpoints and redact structured diagnostics ([518920e](https://github.com/kicksideai/kickside/commit/518920e63ef6f512949da0d0b79cf9cd7a03a161))

## 0.3.1 (2026-10-17)

- Remove retired retention metadata from component autoinitialization.

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

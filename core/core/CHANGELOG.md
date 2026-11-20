# Changelog

## [0.3.44](https://github.com/kicksideai/kickside/compare/core-v0.3.43...core-v0.3.44) (2026-11-20)


### Bug Fixes

* **core:** preserve declaration drift for retained cursors ([#791](https://github.com/kicksideai/kickside/issues/791)) ([764ba43](https://github.com/kicksideai/kickside/commit/764ba431afe6f3be3241f02dbd9007ad30ea8d29))

## [0.3.43](https://github.com/kicksideai/kickside/compare/core-v0.3.42...core-v0.3.43) (2026-11-20)


### Bug Fixes

* **core:** type the projection revision check target ([#786](https://github.com/kicksideai/kickside/issues/786)) ([bff9f28](https://github.com/kicksideai/kickside/commit/bff9f287fd0306696efbb3a29b3fd33b2718c1e9))

## [0.3.42](https://github.com/kicksideai/kickside/compare/core-v0.3.41...core-v0.3.42) (2026-11-20)


### Bug Fixes

* **core:** run declared component projections with scoped worker permissions ([#784](https://github.com/kicksideai/kickside/issues/784)) ([63e15e3](https://github.com/kicksideai/kickside/commit/63e15e388de55743ae778e6d82b048bec9fd76d9))

## [0.3.41](https://github.com/kicksideai/kickside/compare/core-v0.3.40...core-v0.3.41) (2026-11-20)


### Bug Fixes

* **core:** preserve active filtered projections across Keeper updates ([#780](https://github.com/kicksideai/kickside/issues/780)) ([dc3775c](https://github.com/kicksideai/kickside/commit/dc3775c677512e733fb154e7ab42917253520509))

## [0.3.40](https://github.com/kicksideai/kickside/compare/core-v0.3.39...core-v0.3.40) (2026-11-20)


### Features

* **core:** checkpoint filtered projection ranges across cursor resets ([#768](https://github.com/kicksideai/kickside/issues/768)) ([d2ae1d8](https://github.com/kicksideai/kickside/commit/d2ae1d89668d4d2de7c493f3313fad512267da2d))

## [0.3.39](https://github.com/kicksideai/kickside/compare/core-v0.3.38...core-v0.3.39) (2026-11-20)


### Performance Improvements

* **core:** preserve projection body when a scan returns no events ([#755](https://github.com/kicksideai/kickside/issues/755)) ([9a2bc65](https://github.com/kicksideai/kickside/commit/9a2bc65fb8281bf958f6093ce0e263032f7f1996))

## [0.3.38](https://github.com/kicksideai/kickside/compare/core-v0.3.37...core-v0.3.38) (2026-11-20)


### Bug Fixes

* **core:** fence private checkpoints against owner identity changes ([#748](https://github.com/kicksideai/kickside/issues/748)) ([c959762](https://github.com/kicksideai/kickside/commit/c959762a7125982201d3acec01fe856f84a3e447))

## [0.3.37](https://github.com/kicksideai/kickside/compare/core-v0.3.36...core-v0.3.37) (2026-11-19)


### Bug Fixes

* **core:** wait for system component provisioning at startup ([ecf12e5](https://github.com/kicksideai/kickside/commit/ecf12e5c61d83e7eb414978faae7a8aa1f6afd27))

## [0.3.36](https://github.com/kicksideai/kickside/compare/core-v0.3.35...core-v0.3.36) (2026-11-19)


### Bug Fixes

* **core:** wait for a committed projection sequence ([e590e5c](https://github.com/kicksideai/kickside/commit/e590e5cac690061421217aaf15519e8ac1df95bc))

## [0.3.35](https://github.com/kicksideai/kickside/compare/core-v0.3.34...core-v0.3.35) (2026-11-19)


### Bug Fixes

* **core:** recover the lifecycle reaper after upgrade ([32774f8](https://github.com/kicksideai/kickside/commit/32774f80483f1986481892d5cefdc83f0af4d05d))

## [0.3.34](https://github.com/kicksideai/kickside/compare/core-v0.3.33...core-v0.3.34) (2026-11-19)


### Bug Fixes

* **core:** let retention stop under sustained wake load ([#675](https://github.com/kicksideai/kickside/issues/675)) ([b741a77](https://github.com/kicksideai/kickside/commit/b741a77e6437edd940c7f1c81dc568a1bb65b9c4))

## [0.3.33](https://github.com/kicksideai/kickside/compare/core-v0.3.32...core-v0.3.33) (2026-11-19)


### Bug Fixes

* **core:** enforce binding-declared event read access ([#305](https://github.com/kicksideai/kickside/issues/305)) ([8a53ce5](https://github.com/kicksideai/kickside/commit/8a53ce5030a515ea98552ce34e30417bd18f7a9a))

## [0.3.32](https://github.com/kicksideai/kickside/compare/core-v0.3.31...core-v0.3.32) (2026-11-19)


### Bug Fixes

* **core:** reprovision threads after completed cleanup ([#625](https://github.com/kicksideai/kickside/issues/625)) ([8d50a1f](https://github.com/kicksideai/kickside/commit/8d50a1f0e173191c078eab4007da2fbbdf857d3e))

## [0.3.31](https://github.com/kicksideai/kickside/compare/core-v0.3.30...core-v0.3.31) (2026-11-19)


### Bug Fixes

* **jobs:** deliver terminal outcomes and preserve upload retry ([#474](https://github.com/kicksideai/kickside/issues/474)) ([d1e19d1](https://github.com/kicksideai/kickside/commit/d1e19d1666c659f61779c87e2e02f5a65782106d))

## [0.3.30](https://github.com/kicksideai/kickside/compare/core-v0.3.29...core-v0.3.30) (2026-11-19)


### Features

* **core:** converge settled projection workers in place ([#615](https://github.com/kicksideai/kickside/issues/615)) ([b6ebc09](https://github.com/kicksideai/kickside/commit/b6ebc09a1a4885e65da978ddeb79e350b974365a))

## [0.3.29](https://github.com/kicksideai/kickside/compare/core-v0.3.28...core-v0.3.29) (2026-11-19)


### Features

* **core:** look up the latest retained external event ([#611](https://github.com/kicksideai/kickside/issues/611)) ([679d4bc](https://github.com/kicksideai/kickside/commit/679d4bcb90bdf4c062e97c7c4c3df25e0eed1e4b))

## [0.3.28](https://github.com/kicksideai/kickside/compare/core-v0.3.27...core-v0.3.28) (2026-11-19)


### Bug Fixes

* **core:** admit private checkpoints from their installed declarations ([#606](https://github.com/kicksideai/kickside/issues/606)) ([e541a15](https://github.com/kicksideai/kickside/commit/e541a1586a0f60f2706d2d4e901d6169c70a62e8))


### Performance Improvements

* **core:** index private checkpoint declarations by owner ([#607](https://github.com/kicksideai/kickside/issues/607)) ([c70b0fd](https://github.com/kicksideai/kickside/commit/c70b0fdfc668f246c70cea32c0c3f848e25bd804))

## [0.3.27](https://github.com/kicksideai/kickside/compare/core-v0.3.26...core-v0.3.27) (2026-11-19)


### Bug Fixes

* **core:** resume marked thread deletion after a missing Jobs page ([d0951cf](https://github.com/kicksideai/kickside/commit/d0951cf04a397e8e3bb6d16bc9a9593931cc56e0))
* **core:** resume marked thread deletion after a missing Jobs page ([c85392b](https://github.com/kicksideai/kickside/commit/c85392bd5c1c08177650f8dce692eccffd30de59))

## [0.3.26](https://github.com/kicksideai/kickside/compare/core-v0.3.25...core-v0.3.26) (2026-11-19)


### Bug Fixes

* **core:** commit thread teardown pages atomically ([#576](https://github.com/kicksideai/kickside/issues/576)) ([5f934f0](https://github.com/kicksideai/kickside/commit/5f934f05dc51d165db195168d75fe350ad701492))
* **core:** converge declared lifecycle projections ([#466](https://github.com/kicksideai/kickside/issues/466)) ([ebc59f8](https://github.com/kicksideai/kickside/commit/ebc59f83121a6c2a412e6d359ee1ca655d3264b7))

## [0.3.25](https://github.com/kicksideai/kickside/compare/core-v0.3.24...core-v0.3.25) (2026-11-19)


### Features

* **core:** checkpoint supervised projections under the Jobs lease ([#585](https://github.com/kicksideai/kickside/issues/585)) ([f6a586b](https://github.com/kicksideai/kickside/commit/f6a586b2bc5841078e076c4ef1fedd2e45d28af3))
* **core:** expose bounded pending source work from projection cursors ([#589](https://github.com/kicksideai/kickside/issues/589)) ([de1698a](https://github.com/kicksideai/kickside/commit/de1698a2d01e6d4b044bfd73930c540c3e42c177))


### Bug Fixes

* **core:** require the Jobs checkpoint lease API ([#592](https://github.com/kicksideai/kickside/issues/592)) ([49c7e08](https://github.com/kicksideai/kickside/commit/49c7e08bf3bca7604f899f9365951585567ba0f2))
* **core:** validate checkpoint position and writer types ([#594](https://github.com/kicksideai/kickside/issues/594)) ([cf0c736](https://github.com/kicksideai/kickside/commit/cf0c736152f7f8403c04bc413f06f35b99bd7ee0))

## [0.3.24](https://github.com/kicksideai/kickside/compare/core-v0.3.23...core-v0.3.24) (2026-11-19)


### Bug Fixes

* preserve text with long internal whitespace ([#563](https://github.com/kicksideai/kickside/issues/563)) ([80ea34c](https://github.com/kicksideai/kickside/commit/80ea34cd57e9bd053d2874c2f7c98625db05c2f7))

## [0.3.23](https://github.com/kicksideai/kickside/compare/core-v0.3.22...core-v0.3.23) (2026-11-19)


### Bug Fixes

* **core:** expose projection attempt state to workers ([#550](https://github.com/kicksideai/kickside/issues/550)) ([87fa84d](https://github.com/kicksideai/kickside/commit/87fa84d40c2fc78d434844033d70d8df996d3e24))

## [0.3.22](https://github.com/kicksideai/kickside/compare/core-v0.3.21...core-v0.3.22) (2026-11-19)


### Features

* **core:** add a shared Unicode case-folding library ([#549](https://github.com/kicksideai/kickside/issues/549)) ([9804e84](https://github.com/kicksideai/kickside/commit/9804e848595bba63e9674fad4479388d55811fef))


### Bug Fixes

* **component:** encrypt declared credentials and mask external reads ([#469](https://github.com/kicksideai/kickside/issues/469)) ([03389bf](https://github.com/kicksideai/kickside/commit/03389bf0bdb5b5092883a061f40fed55ca78db37))
* **core:** derive retention wake-ups from bounded rotations ([#551](https://github.com/kicksideai/kickside/issues/551)) ([8a48065](https://github.com/kicksideai/kickside/commit/8a48065794355f2c303e94f41d1ce91c692871f0))
* **core:** preserve retention deadlines across scoped wakes ([#546](https://github.com/kicksideai/kickside/issues/546)) ([c9e1dc3](https://github.com/kicksideai/kickside/commit/c9e1dc324a88f26a2f2505c2d586dfcf2940e57e))
* **core:** release PostgreSQL prune locks before WAL flush ([#553](https://github.com/kicksideai/kickside/issues/553)) ([6c9cc67](https://github.com/kicksideai/kickside/commit/6c9cc67757bfdfe5f3a9d4a95c4a8323eec08ed6))
* **core:** rotate event retention across threads ([#545](https://github.com/kicksideai/kickside/issues/545)) ([084adc8](https://github.com/kicksideai/kickside/commit/084adc844c4fb911ffb72061146ff3d831305b09))
* **jobs:** close the run of a cancelled execution when cancellation settles ([#526](https://github.com/kicksideai/kickside/issues/526)) ([452a15e](https://github.com/kicksideai/kickside/commit/452a15e51c0268cf1f435b9393e19969bc1ee2d4))
* keep secret operations in owning module frames ([#483](https://github.com/kicksideai/kickside/issues/483)) ([47f4f8a](https://github.com/kicksideai/kickside/commit/47f4f8af2dba69d4b8e818ab78530ec6fad12be9))

## [0.3.21](https://github.com/kicksideai/kickside/compare/core-v0.3.20...core-v0.3.21) (2026-11-17)


### Bug Fixes

* **core:** expose projection failures and restore active slot wakes ([#505](https://github.com/kicksideai/kickside/issues/505)) ([e44a75f](https://github.com/kicksideai/kickside/commit/e44a75f6edcbde07a5f4e9ed21aa1bc56b77baba))
* **core:** isolate owner singleton roots and preserve delegation ([#515](https://github.com/kicksideai/kickside/issues/515)) ([21d1cce](https://github.com/kicksideai/kickside/commit/21d1cce619fcfe273037250fe56a1dad9d80ced2))

## [0.3.20](https://github.com/kicksideai/kickside/compare/core-v0.3.19...core-v0.3.20) (2026-11-16)


### Bug Fixes

* **core:** bound retention age checks to deletion window ([#494](https://github.com/kicksideai/kickside/issues/494)) ([cd50fb7](https://github.com/kicksideai/kickside/commit/cd50fb735bc7dc26f427fc8933a390462d09d633))

## [0.3.19](https://github.com/kicksideai/kickside/compare/core-v0.3.18...core-v0.3.19) (2026-11-15)


### Bug Fixes

* admit service-owned projection resource policies ([#477](https://github.com/kicksideai/kickside/issues/477)) ([78023d9](https://github.com/kicksideai/kickside/commit/78023d9b6d22dd666cd79e91b28bc2a726dc9226))
* **core:** notify cursor waiters when thread teardown removes cursors ([#495](https://github.com/kicksideai/kickside/issues/495)) ([95f63c4](https://github.com/kicksideai/kickside/commit/95f63c4b5b681aac090d713ac0e8601cd6c8c409))

## [0.3.18](https://github.com/kicksideai/kickside/compare/core-v0.3.17...core-v0.3.18) (2026-11-15)


### Bug Fixes

* **core:** retain readable policy data during hot updates ([#491](https://github.com/kicksideai/kickside/issues/491)) ([06f2ef2](https://github.com/kicksideai/kickside/commit/06f2ef20290781f6ebe13bb0a9eb3eecb4130368))

## [0.3.17](https://github.com/kicksideai/kickside/compare/core-v0.3.16...core-v0.3.17) (2026-11-14)


### Features

* **core:** add bounded owner subject retirement ([#488](https://github.com/kicksideai/kickside/issues/488)) ([480e2fd](https://github.com/kicksideai/kickside/commit/480e2fd192be0db6a65cbd79bb85f4cae806c4ed))

## [0.3.16](https://github.com/kicksideai/kickside/compare/core-v0.3.15...core-v0.3.16) (2026-11-14)


### Bug Fixes

* **core:** inherit a 30-day event retention default ([#457](https://github.com/kicksideai/kickside/issues/457)) ([0c03339](https://github.com/kicksideai/kickside/commit/0c033390702d185680672f93c8a148a1886fb09d))

## [0.3.15](https://github.com/kicksideai/kickside/compare/core-v0.3.14...core-v0.3.15) (2026-11-13)


### Bug Fixes

* **execution:** declare maintenance actors exactly and authorize thread completion ([#459](https://github.com/kicksideai/kickside/issues/459)) ([c86999c](https://github.com/kicksideai/kickside/commit/c86999c76f99724bd7eab62924dcb3d931f3bee8))

## [0.3.14](https://github.com/kicksideai/kickside/compare/core-v0.3.13...core-v0.3.14) (2026-11-09)


### Bug Fixes

* preserve lifecycle upgrades and user directory snapshots ([#386](https://github.com/kicksideai/kickside/issues/386)) ([0a842c1](https://github.com/kicksideai/kickside/commit/0a842c16e53b4865771cad9be71680d5e189391d))
* read deletion progress from authorized lists ([#376](https://github.com/kicksideai/kickside/issues/376)) ([302fb90](https://github.com/kicksideai/kickside/commit/302fb90cd777cdf54b3565090b428bfcd8a9f67e))

## [0.3.13](https://github.com/kicksideai/kickside/compare/core-v0.3.12...core-v0.3.13) (2026-11-07)


### Bug Fixes

* **core:** converge the lifecycle boot once the install's migrations are applied ([#352](https://github.com/kicksideai/kickside/issues/352)) ([7652781](https://github.com/kicksideai/kickside/commit/7652781374b81a3be7604acdb08c8cf020a5158f))

## [0.3.12](https://github.com/kicksideai/kickside/compare/core-v0.3.11...core-v0.3.12) (2026-11-07)


### Bug Fixes

* carry the component deletion receipt through thread, skill, webhook, workflow and agent deletes ([#341](https://github.com/kicksideai/kickside/issues/341)) ([98e9d03](https://github.com/kicksideai/kickside/commit/98e9d03b522828d63b284dff4174ef7543bef2cb))

## [0.3.11](https://github.com/kicksideai/kickside/compare/core-v0.3.10...core-v0.3.11) (2026-11-07)


### Performance Improvements

* **automation:** resolve fixed registry entries once per round ([#335](https://github.com/kicksideai/kickside/issues/335)) ([cee0468](https://github.com/kicksideai/kickside/commit/cee0468266db65f6ee629082833e03afef87c387))

## [0.3.10](https://github.com/kicksideai/kickside/compare/core-v0.3.9...core-v0.3.10) (2026-11-05)


### Bug Fixes

* **component:** execute deletion cleanup through Jobs ([c034b5c](https://github.com/kicksideai/kickside/commit/c034b5c8e5cc2c92a5ced4d8ae70107361f2e9d3))
* **component:** run deletion cleanup through Jobs ([da3f7ae](https://github.com/kicksideai/kickside/commit/da3f7aee8dce4136a65d1c94bda6604820bc8355))

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

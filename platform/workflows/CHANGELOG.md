# Changelog

## [0.2.13](https://github.com/kicksideai/kickside/compare/workflows-v0.2.12...workflows-v0.2.13) (2026-11-11)


### Bug Fixes

* enable hourly dataflow retention and declare unavailable step data ([#428](https://github.com/kicksideai/kickside/issues/428)) ([e3bda38](https://github.com/kicksideai/kickside/commit/e3bda38c315352fdec2b5c71abb629a007ac23a4))

## [0.2.12](https://github.com/kicksideai/kickside/compare/workflows-v0.2.11...workflows-v0.2.12) (2026-11-09)


### Bug Fixes

* read deletion progress from authorized lists ([#376](https://github.com/kicksideai/kickside/issues/376)) ([302fb90](https://github.com/kicksideai/kickside/commit/302fb90cd777cdf54b3565090b428bfcd8a9f67e))
* **workflows:** define migration teardown for module uninstall ([#374](https://github.com/kicksideai/kickside/issues/374)) ([05b0cc3](https://github.com/kicksideai/kickside/commit/05b0cc3c267926f5d2e64edd8678c8bb76dc4d28))
* **workflows:** simplify run inspection and knowledge summaries ([#378](https://github.com/kicksideai/kickside/issues/378)) ([d9cd391](https://github.com/kicksideai/kickside/commit/d9cd391d7ebf455f2dbde8e9dd4403253c8afb05))

## [0.2.11](https://github.com/kicksideai/kickside/compare/workflows-v0.2.10...workflows-v0.2.11) (2026-11-07)


### Bug Fixes

* plain-text inbox previews; clear list errors after deletion; ship shared widget styles ([#346](https://github.com/kicksideai/kickside/issues/346)) ([2e72d66](https://github.com/kicksideai/kickside/commit/2e72d66e4b4c838d2aa792d810014ae9931ccb54))

## [0.2.10](https://github.com/kicksideai/kickside/compare/workflows-v0.2.9...workflows-v0.2.10) (2026-11-07)


### Bug Fixes

* carry the component deletion receipt through thread, skill, webhook, workflow and agent deletes ([#341](https://github.com/kicksideai/kickside/issues/341)) ([98e9d03](https://github.com/kicksideai/kickside/commit/98e9d03b522828d63b284dff4174ef7543bef2cb))

## [0.2.9](https://github.com/kicksideai/kickside/compare/workflows-v0.2.8...workflows-v0.2.9) (2026-11-07)


### Bug Fixes

* **widgets:** follow deletion events without racing the delete job ([#337](https://github.com/kicksideai/kickside/issues/337)) ([fdd6984](https://github.com/kicksideai/kickside/commit/fdd6984188d6f35cdaf4e40cd0ac8b9cd08928bc))

## [0.2.8](https://github.com/kicksideai/kickside/compare/workflows-v0.2.7...workflows-v0.2.8) (2026-11-05)


### Bug Fixes

* **component:** expose asynchronous deletion progress ([e4ca4b7](https://github.com/kicksideai/kickside/commit/e4ca4b7ab5185ecc6ecf83b336ca3e6edf5aca6e))
* **component:** run deletion cleanup through Jobs ([da3f7ae](https://github.com/kicksideai/kickside/commit/da3f7aee8dce4136a65d1c94bda6604820bc8355))
* **component:** simplify deletion waiting and committed delivery ([584eae6](https://github.com/kicksideai/kickside/commit/584eae6145e5e9b4ea36bdbd6527ffe376e9f7fe))
* preserve deletion view state and bind notification authority ([2ea5cf1](https://github.com/kicksideai/kickside/commit/2ea5cf1a31352ba4ba1915daeca384d06d2e7b70))
* **widgets:** keep accepted deletion state across pages ([62c8e18](https://github.com/kicksideai/kickside/commit/62c8e181b0e1b60d0c3c6a80f6f9585dac6ef7cb))
* **widgets:** preserve deletion progress across refreshes ([cd607e1](https://github.com/kicksideai/kickside/commit/cd607e14462b8421d092612cb62dce73e57f5ed8))

## [0.2.7](https://github.com/kicksideai/kickside/compare/workflows-v0.2.6...workflows-v0.2.7) (2026-11-03)


### Bug Fixes

* **build:** restore the root make test target, release exclusions and the Workflows test clock ([#294](https://github.com/kicksideai/kickside/issues/294)) ([2b4bb19](https://github.com/kicksideai/kickside/commit/2b4bb195e01cdfdce8494e4e7cc51c5dc55dbb47))

## [0.2.6](https://github.com/kicksideai/kickside/compare/workflows-v0.2.5...workflows-v0.2.6) (2026-11-03)


### Bug Fixes

* **workflows:** create workflows from automation source contracts ([#213](https://github.com/kicksideai/kickside/issues/213)) ([a44c6f7](https://github.com/kicksideai/kickside/commit/a44c6f7b753bceeb9a39cb89784bfffc58b286b5))

## [0.2.5](https://github.com/kicksideai/kickside/compare/workflows-v0.2.4...workflows-v0.2.5) (2026-10-29)


### Features

* **workflows:** configure Block retries and execution timeouts ([#221](https://github.com/kicksideai/kickside/issues/221)) ([57cf0be](https://github.com/kicksideai/kickside/commit/57cf0be55dee41bf1b23a2333827554f015e158f))

## [0.2.4](https://github.com/kicksideai/kickside/compare/workflows-v0.2.3...workflows-v0.2.4) (2026-10-28)


### Bug Fixes

* consolidate default account roles ([aafe19c](https://github.com/kicksideai/kickside/commit/aafe19cd2ac7d58ed04f4d035cef91995eab8dce))
* **workflows:** grant maintenance its committed-change wake ([637f9aa](https://github.com/kicksideai/kickside/commit/637f9aa446222d318601e9ac594147c26efe41f8))

## [0.2.3](https://github.com/kicksideai/kickside/compare/workflows-v0.2.2...workflows-v0.2.3) (2026-10-26)


### Bug Fixes

* **workflows:** give the run notice and run list readable spacing ([e5802ac](https://github.com/kicksideai/kickside/commit/e5802ac565f191edee5b910ee8803fd78393a89e))
* **workflows:** style run controls through owned PT classes ([eb1259d](https://github.com/kicksideai/kickside/commit/eb1259db049c43c6397398883664815befe8994d))

## [0.2.2](https://github.com/kicksideai/kickside/compare/workflows-v0.2.1...workflows-v0.2.2) (2026-10-25)


### Bug Fixes

* **workflows:** recheck workflow access before resuming Await ([#132](https://github.com/kicksideai/kickside/issues/132)) ([43bd575](https://github.com/kicksideai/kickside/commit/43bd5758c8c42200875fe39c6b2f61bf4a0ecd89))

## [0.2.1](https://github.com/kicksideai/kickside/compare/workflows-v0.2.0...workflows-v0.2.1) (2026-10-23)


### Bug Fixes

* **workflows:** preserve empty object schemas through publication ([#110](https://github.com/kicksideai/kickside/issues/110)) ([06213cb](https://github.com/kicksideai/kickside/commit/06213cb3f2de773e5c83a894d810a81838b8cc3c))

## [0.2.0](https://github.com/kicksideai/kickside/compare/workflows-v0.1.120...workflows-v0.2.0) (2026-10-22)


### ⚠ BREAKING CHANGES

* **workflows:** Post-processing S3 placement requires explicitly installing kickside/storage-s3 in the same module plan as this update. The base module no longer installs its S3 policy, controller, jobs, endpoints, or UI.

### Bug Fixes

* declare plain object roots for agent tool input schemas ([75fd0fe](https://github.com/kicksideai/kickside/commit/75fd0fed2a0c71206ae914c6ee497e1b37301a54))
* **uploads:** preserve completion checkpoints and redact structured diagnostics ([518920e](https://github.com/kicksideai/kickside/commit/518920e63ef6f512949da0d0b79cf9cd7a03a161))
* **workflows:** acknowledge published terminal runs without reexecution authority ([ffc2dde](https://github.com/kicksideai/kickside/commit/ffc2dde5988ca5f0984b83e4cfc8a568fc2fedc8))
* **workflows:** fence admission marking by completion token ([421bc69](https://github.com/kicksideai/kickside/commit/421bc690f2f745a2628628152838843341d477e2))
* **workflows:** retain structured failure details ([a9e9f4c](https://github.com/kicksideai/kickside/commit/a9e9f4c071a8e51ce23e4205b4df416c71f0e78d))
* **workflows:** route iteration inputs to body joins ([#46](https://github.com/kicksideai/kickside/issues/46)) ([efed521](https://github.com/kicksideai/kickside/commit/efed521d398ca78422f806d83bb09c3b24b609b3))
* **workflows:** run deliveries under their persisted original identity ([1620989](https://github.com/kicksideai/kickside/commit/1620989285be27fbdf3ea33b1b28d60705542630))

## [0.1.120](https://github.com/kicksideai/kickside/compare/workflows-v0.1.119...workflows-v0.1.120) (2026-10-21)


### Bug Fixes

* **workflows:** preserve empty objects in block catalog schemas ([#40](https://github.com/kicksideai/kickside/issues/40)) ([1d0b93b](https://github.com/kicksideai/kickside/commit/1d0b93bd85c835fdb2926b0a19f18be9d563b4e6))

## [0.1.119](https://github.com/kicksideai/kickside/compare/workflows-v0.1.118...workflows-v0.1.119) (2026-10-20)


### Bug Fixes

* **automation:** add structured task setup forms and published workflow selection ([#33](https://github.com/kicksideai/kickside/issues/33)) ([52fb507](https://github.com/kicksideai/kickside/commit/52fb5074f8cc57ee6b9a5053092559774796315a))

## 0.1.118 (2026-10-19)

- WorkflowsManage runs a published version (action run) the way the Run button does: it returns the run_id at once and the run continues, including while it waits for an Inbox review.
- RunFlow reports a run that is waiting for a person as { status = waiting, run_id } instead of a failure.

## 0.1.117 (2026-10-17)

- Refresh packaged module descriptions and documentation.

## 0.1.116 (2026-10-16)

- Return boundary removal refusals as structured errors with their native cause.

## 0.1.112 (2026-10-08)

- fix(workflows): arm due maintenance deadlines with a positive timer (297dd8612)
- fix: bound agent tool results and derive model checkpoint budgets (83caf17bc)
- Run workflow undo messaging and maintenance wakes under workflows identities (d04a978ba)
- Commit declared primary threads with their components (cf3164c57)
- build: rebuild bundles from source (6c884fef9)
- chore: refresh locks to latest published dependencies (243b4bdff)
- Default module member requirements to platform Members (a05332552)
- Run workflow blocks in the workflow component context (cbbf5cc89)
- Show the recorded failure cause in workflow run lists (8baa80131)
- Declare module access bundles and invalidate changed group sessions (602c31f9d)
- fix(producers): retain optional module event capabilities (65a6e1042)
- build: rebuild bundles from source (295cf85a1)
- Reclaim Undo handoffs and share Workflow status and reader fixtures (0cdd1ccc7)
- Scope runtime metadata grants to stored component implementations (05ba21847)
- Exercise production runtime metadata grants against component targets (6c0f30ee3)
- Declare artifact text fields and the existing workflow layout command (22c2e36a6)
- Read workflow failures from the public engine error (91189ebf5)
- Consolidate singleton admission and stop cancelled maintenance standbys (0713f7173)
- workflows: list every accessible workflow with deterministic tied ordering (8e3ae8fd2)
- Restore retained trigger consolidation behavior through current modules (03eb36263)
- test(build): prove cloud-stage dependency and frontend contracts (aec8fe8d8)
- fix(cluster): scope durable actor ownership and retain standby contenders (1ec81dcb0)
- Test routed workflow step values in the API and output inspector (8c05e614c)
- Keep workflow past-run rows scrollable and retain parked status in run views (007a9bfb6)
- fix(workflows): record persisted runtime failure causes (475bb464c)
- Reject reserved workflow layout targets before no-op deduplication (636d44f7e)
- Persist workflow canvas layout direction across edits and portable source (b49ec5bff)
- Preserve Workflow deletion conflicts and await terminal publication (9431b5548)
- Honor shared webhook access and align smoke flows with declared contracts (89359d612)

## 0.1.109

Current published Hub version.

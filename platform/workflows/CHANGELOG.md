# Changelog

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

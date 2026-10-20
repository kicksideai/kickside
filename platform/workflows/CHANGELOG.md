# Changelog

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

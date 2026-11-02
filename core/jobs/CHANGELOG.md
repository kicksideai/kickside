# Changelog

## [0.1.69](https://github.com/kicksideai/kickside/compare/jobs-v0.1.68...jobs-v0.1.69) (2026-11-02)


### Bug Fixes

* **jobs:** resume claims after registry-driven schema admission ([#290](https://github.com/kicksideai/kickside/issues/290)) ([86d3056](https://github.com/kicksideai/kickside/commit/86d30561c480b50b21e6e7e65947c5dd21bd45a7))

## [0.1.68](https://github.com/kicksideai/kickside/compare/jobs-v0.1.67...jobs-v0.1.68) (2026-11-02)


### Bug Fixes

* **jobs:** wait for schema before admitting upgraded claims ([1c030c0](https://github.com/kicksideai/kickside/commit/1c030c02e83c6fdf34ca6fb6b5aa674cd20f2fdc))

## [0.1.67](https://github.com/kicksideai/kickside/compare/jobs-v0.1.66...jobs-v0.1.67) (2026-10-30)


### Bug Fixes

* preserve knowledge ingestion authority across engines ([#257](https://github.com/kicksideai/kickside/issues/257)) ([023bbe8](https://github.com/kicksideai/kickside/commit/023bbe89f5fc80700007da189a7615a93d693078))

## [0.1.66](https://github.com/kicksideai/kickside/compare/jobs-v0.1.65...jobs-v0.1.66) (2026-10-30)


### Features

* **jobs:** add settings-backed worker capacity ([#210](https://github.com/kicksideai/kickside/issues/210)) ([d52aa4c](https://github.com/kicksideai/kickside/commit/d52aa4c51140f0cb5c1b5a4829e6207841ac2d12))

## [0.1.65](https://github.com/kicksideai/kickside/compare/jobs-v0.1.64...jobs-v0.1.65) (2026-10-29)


### Bug Fixes

* **jobs:** bootstrap PostgreSQL without Core migrations ([8abf7fb](https://github.com/kicksideai/kickside/commit/8abf7fbcb0582126311f0d79e268e059b08e20b1))
* **jobs:** own the updated_at trigger function ([#212](https://github.com/kicksideai/kickside/issues/212)) ([fd83397](https://github.com/kicksideai/kickside/commit/fd83397e6cda5c956f6362a77f4f7c565d226c5c))

## [0.1.64](https://github.com/kicksideai/kickside/compare/jobs-v0.1.63...jobs-v0.1.64) (2026-10-28)


### Features

* **jobs:** public post-commit nudge and slot purge on the facade ([#169](https://github.com/kicksideai/kickside/issues/169)) ([365567e](https://github.com/kicksideai/kickside/commit/365567eccb5bfc5abf03e52c1be1628493c25b24))

## [0.1.63](https://github.com/kicksideai/kickside/compare/jobs-v0.1.62...jobs-v0.1.63) (2026-10-28)


### Bug Fixes

* **jobs:** bound rows after database normalization ([38beea4](https://github.com/kicksideai/kickside/commit/38beea43703f3376779bbdefd28cf098bd421eab))
* **security:** preserve scope APIs through staged upgrades ([03c8fe8](https://github.com/kicksideai/kickside/commit/03c8fe8c14b79a8cb31cc9c37b2b2f3854a86e68))

## [0.1.62](https://github.com/kicksideai/kickside/compare/jobs-v0.1.61...jobs-v0.1.62) (2026-10-25)


### Bug Fixes

* **jobs:** fence thread-owned slot purges before locking jobs ([#139](https://github.com/kicksideai/kickside/issues/139)) ([f71f151](https://github.com/kicksideai/kickside/commit/f71f15129ef4023da645149c7902144e07ce40fe))
* **jobs:** serialize run retirement with thread cleanup ([#141](https://github.com/kicksideai/kickside/issues/141)) ([2eb0b69](https://github.com/kicksideai/kickside/commit/2eb0b6964d41141598964e99dd3e1e9a0b3fa460))

## [0.1.61](https://github.com/kicksideai/kickside/compare/jobs-v0.1.60...jobs-v0.1.61) (2026-10-23)


### Bug Fixes

* **core:** order projection output wakes with job completion ([#82](https://github.com/kicksideai/kickside/issues/82)) ([5550708](https://github.com/kicksideai/kickside/commit/5550708a2c80ee064cd5a6bab6fa48de0f73e313))

## [0.1.60](https://github.com/kicksideai/kickside/compare/jobs-v0.1.59...jobs-v0.1.60) (2026-10-22)


### Bug Fixes

* **automation:** repair drives that reference finished slot jobs ([#103](https://github.com/kicksideai/kickside/issues/103)) ([2e85f34](https://github.com/kicksideai/kickside/commit/2e85f3405600ccde7d7636010dc7e521630719f1))
* **jobs:** apply slot retry policy and structured retry floors ([#81](https://github.com/kicksideai/kickside/issues/81)) ([dfd3baa](https://github.com/kicksideai/kickside/commit/dfd3baa8d9e45c50119344f3786e1cd38b57ec3e))
* **jobs:** park deterministic projection failures without wake demand ([#83](https://github.com/kicksideai/kickside/issues/83)) ([2351ec4](https://github.com/kicksideai/kickside/commit/2351ec43eb07c6667393a5bd6dadc7eb3e6cdfa2))
* **jobs:** read child liveness before reclaim locks ([809fd16](https://github.com/kicksideai/kickside/commit/809fd162784cf380a17841214f186ccdf3b668eb))
* **jobs:** retry infrastructure failures independently of invocation policy ([#80](https://github.com/kicksideai/kickside/issues/80)) ([048967c](https://github.com/kicksideai/kickside/commit/048967c89552a9d95a287dd5a1089ca54cf02e1b))
* **uploads:** preserve completion checkpoints and redact structured diagnostics ([518920e](https://github.com/kicksideai/kickside/commit/518920e63ef6f512949da0d0b79cf9cd7a03a161))

## 0.1.59 (2026-10-17)

- Keep thread teardown consistent during concurrent lifecycle changes.

## 0.1.58 (2026-10-16)

- Cancel retired upload intent maintenance slots during boot migrations while preserving processing jobs and run history.

## 0.1.56 (2026-10-14)

- Measure unclaimed due work against the claim candidate cutoff and retain errors for work that remains unclaimed.

## 0.1.53 (2026-10-09)

- Preserve native Execution validation errors and migrate trace consumers (5fda907df)
- fix(jobs): preserve native failures and defer retries to durable scheduling (35bd3fc5b)
- fix(jobs): prioritize addressed projection catch-up (bb9802804)

## 0.1.52 (2026-10-08)

- test(jobs): guard live cancellation and every terminal retention state (bb6bc07b2)
- smoke: register HOT-UPDATE-INFLIGHT-EXACTLY-ONCE, JOBS-DUE-ALARM-EVIDENCE and JOBS-ASSIGN-EXITED-SLOT with their jobs harness guards; document the jobs upgrade drain bound (feb1ddff8)
- jobs: in-flight executions finish under their code across a hot upgrade; the pool upgrades in place with its slots; due-work alarm judged by evidence read before its claim (73e154776)
- fix(jobs): arm the dispatch deadline from the instant its claim judged (30dfa7b3e)
- fix(jobs): recycle a loop only when the registry moves past its version (7d9d70d77)
- fix(jobs,component): refuse components created by unattributed job targets (138993a82)
- End failed one-shot jobs dead, record projection slot failures on their cursor, and reclaim leftover owned jobs (6b07e66b2)
- Lease each claimed row past its recorded runs and refuse a bad row alone (0c2cd9dc4)
- Close lost run history, mark caught-up projections valid, and surface unclaimed due work (a64a696c7)
- Deliver lease releases and execution controls under Jobs identities (fef2b3f40)
- Notify the job pool and retention sweeper under their service identities (f9e4c900c)
- Default module member requirements to platform Members (a05332552)
- Notify the job worker pool after committed component lifecycle work (52a62010c)
- Declare module access bundles and invalidate changed group sessions (602c31f9d)
- fix(jobs): trap and settle linked child failures in supervision (ab79072e8)
- Reduce durable Jobs dispatch, wake, and completion work (22e13ca82)
- fix(jobs): reuse locked rows for complete byte checks (9c53d747b)
- fix(projections): preserve due jobs and coalesce dispatch wakes (202379795)
- Page authorized job history through current owners (7f0414e9d)
- Consolidate origin smoke setup, release scoping and dispatcher probes (b1a1e59f7)
- Share bounded slot purge commit handling (6215b368d)
- Normalize job deadlines and reclaim vanished singleton owners (c2da23b04)
- fix(jobs): validate exact lookup keys through the shared reader (fa7865b57)
- test: refresh harnesses and validate Jobs persistence fixtures (0fe1f9e44)
- fix(core): select catch-up cursors directly and upgrade their broker (1c17e541d)
- Read exact jobs through the owning query mechanism (a6fe6bb12)
- Consolidate singleton admission and stop cancelled maintenance standbys (0713f7173)
- Use canonical job ownership for scoped retention (c983c6a2b)
- fix(cluster): scope durable actor ownership and retain standby contenders (1ec81dcb0)
- fix(core): supervise projection failures and expose owner-scoped job history (2e2f609c5)
- Normalize job deadlines and settle concurrent slot cleanup (1d9304bd5)

## 0.1.49

Current published Hub version.

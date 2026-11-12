# Changelog

## [0.1.77](https://github.com/kicksideai/kickside/compare/inbox-v0.1.76...inbox-v0.1.77) (2026-11-12)


### Bug Fixes

* **inbox:** enforce addressed access and committed notifications ([#444](https://github.com/kicksideai/kickside/issues/444)) ([c4d3ba9](https://github.com/kicksideai/kickside/commit/c4d3ba96c758fb8b60304898cdfec4018e37fc12))
* **inbox:** restore personal inbox items ([#447](https://github.com/kicksideai/kickside/issues/447)) ([3b3d732](https://github.com/kicksideai/kickside/commit/3b3d7322a3d05f84798526598517a2557489065c))

## [0.1.76](https://github.com/kicksideai/kickside/compare/inbox-v0.1.75...inbox-v0.1.76) (2026-11-12)


### Features

* **inbox:** support private principal-addressed items ([#438](https://github.com/kicksideai/kickside/issues/438)) ([141ec96](https://github.com/kicksideai/kickside/commit/141ec9604b6361502646dda8dec05a0ed0f4e262))

## [0.1.75](https://github.com/kicksideai/kickside/compare/inbox-v0.1.74...inbox-v0.1.75) (2026-11-12)


### Bug Fixes

* resolve assignment defaults and imported dependency APIs ([#437](https://github.com/kicksideai/kickside/issues/437)) ([89d16c3](https://github.com/kicksideai/kickside/commit/89d16c3b391318d79e5e194fc4b1062d0149a60c))

## [0.1.74](https://github.com/kicksideai/kickside/compare/inbox-v0.1.73...inbox-v0.1.74) (2026-11-09)


### Bug Fixes

* rebuild six packages without baked default bindings ([#403](https://github.com/kicksideai/kickside/issues/403)) ([28bdfe1](https://github.com/kicksideai/kickside/commit/28bdfe1020d7c0ef35bc6b383f324a7c86d9042e))

## [0.1.73](https://github.com/kicksideai/kickside/compare/inbox-v0.1.72...inbox-v0.1.73) (2026-11-08)


### Bug Fixes

* UI artifacts in buttons, headings, dialogs and tables ([#371](https://github.com/kicksideai/kickside/issues/371)) ([ea55ea8](https://github.com/kicksideai/kickside/commit/ea55ea8a17ee5802cb73a4dbcf39878d7f56cd2e))

## [0.1.72](https://github.com/kicksideai/kickside/compare/inbox-v0.1.71...inbox-v0.1.72) (2026-11-08)


### Bug Fixes

* **inbox:** remove the New notice test button from the inbox header ([#365](https://github.com/kicksideai/kickside/issues/365)) ([af09fc6](https://github.com/kicksideai/kickside/commit/af09fc6442ab0fbf820e29f4aa7c757500eabd9c))

## [0.1.71](https://github.com/kicksideai/kickside/compare/inbox-v0.1.70...inbox-v0.1.71) (2026-11-07)


### Bug Fixes

* plain-text inbox previews; clear list errors after deletion; ship shared widget styles ([#346](https://github.com/kicksideai/kickside/issues/346)) ([2e72d66](https://github.com/kicksideai/kickside/commit/2e72d66e4b4c838d2aa792d810014ae9931ccb54))

## [0.1.70](https://github.com/kicksideai/kickside/compare/inbox-v0.1.69...inbox-v0.1.70) (2026-11-07)


### Bug Fixes

* **widgets:** follow deletion events without racing the delete job ([#337](https://github.com/kicksideai/kickside/issues/337)) ([fdd6984](https://github.com/kicksideai/kickside/commit/fdd6984188d6f35cdaf4e40cd0ac8b9cd08928bc))

## [0.1.69](https://github.com/kicksideai/kickside/compare/inbox-v0.1.68...inbox-v0.1.69) (2026-11-06)


### Features

* **inbox:** support file references with inline previews ([#173](https://github.com/kicksideai/kickside/issues/173)) ([2a19510](https://github.com/kicksideai/kickside/commit/2a195101fdf84e9246c5a39495d8fdbd3917c490))

## [0.1.68](https://github.com/kicksideai/kickside/compare/inbox-v0.1.67...inbox-v0.1.68) (2026-10-29)


### Features

* **inbox:** support source-owned aggregate item lifecycle ([#204](https://github.com/kicksideai/kickside/issues/204)) ([de81bc1](https://github.com/kicksideai/kickside/commit/de81bc1c7b8fce8c14b3030193534379b4c40fc9))


### Bug Fixes

* preserve composed scopes across chat and Inbox review ([#220](https://github.com/kicksideai/kickside/issues/220)) ([8c16715](https://github.com/kicksideai/kickside/commit/8c167155d4f77d81948b3148284d1f0bd34f30c2))

## [0.1.67](https://github.com/kicksideai/kickside/compare/inbox-v0.1.66...inbox-v0.1.67) (2026-10-28)


### Bug Fixes

* **security:** preserve scope APIs through staged upgrades ([03c8fe8](https://github.com/kicksideai/kickside/commit/03c8fe8c14b79a8cb31cc9c37b2b2f3854a86e68))

## [0.1.66](https://github.com/kicksideai/kickside/compare/inbox-v0.1.65...inbox-v0.1.66) (2026-10-25)


### Bug Fixes

* **inbox:** hide assignee existence before authorization ([#137](https://github.com/kicksideai/kickside/issues/137)) ([7caf6e5](https://github.com/kicksideai/kickside/commit/7caf6e57ebf509b9690dc4eb7530a1065b31cc1f))
* **inbox:** scope review assignee lookup to arm ([#136](https://github.com/kicksideai/kickside/issues/136)) ([9f2dc35](https://github.com/kicksideai/kickside/commit/9f2dc35ebb4c21be98e7f7e238478133be42c34c))

## [0.1.65](https://github.com/kicksideai/kickside/compare/inbox-v0.1.64...inbox-v0.1.65) (2026-10-22)


### Bug Fixes

* **inbox:** derive review titles and prefill editable drafts ([674ac87](https://github.com/kicksideai/kickside/commit/674ac877dd57bb38d97cb67a5a0a9fd7ddc6de73))
* **uploads:** preserve completion checkpoints and redact structured diagnostics ([518920e](https://github.com/kicksideai/kickside/commit/518920e63ef6f512949da0d0b79cf9cd7a03a161))

## [0.1.64](https://github.com/kicksideai/kickside/compare/inbox-v0.1.63...inbox-v0.1.64) (2026-10-20)


### Bug Fixes

* **inbox:** render notice content as Markdown ([#30](https://github.com/kicksideai/kickside/issues/30)) ([f54180e](https://github.com/kicksideai/kickside/commit/f54180e85834b4744d20f95d5dea17679d8706dd))

## 0.1.63 (2026-10-17)

- Remove retired retention metadata and refresh packaged documentation.

## 0.1.59 (2026-10-09)

- Build frontend assets with the current published UI Kit stylesheet.

## 0.1.58 (2026-10-08)

- fix: bound agent tool results and derive model checkpoint budgets (83caf17bc)
- build: rebuild bundles from source (6c884fef9)
- chore: refresh locks to latest published dependencies (243b4bdff)
- Default module member requirements to platform Members (a05332552)
- Declare module access bundles and invalidate changed group sessions (602c31f9d)
- fix(producers): retain optional module event capabilities (65a6e1042)
- fix(security): reserve producer capabilities for module services (59bede7cd)
- fix(producers): restore published output capabilities (1830bf4d3)
- build: rebuild bundles from source (295cf85a1)
- Render mixed review keys in a stable order (d495f0ec3)
- Publish Inbox summaries with scoped runtime authority (9f78f1099)
- Preserve Inbox reviews across durable delivery versions (56a6dccc3)
- fix(inbox): reject empty title content through typed tool errors (47c822ede)
- Restore retained trigger consolidation behavior through current modules (03eb36263)
- fix(inbox): render reviewed data as Markdown blocks (5d877e67b)
- fix(inbox): initialize review controls from declared defaults (cfc5946b2)
- Honor shared components and align smoke checks with declared contracts (93b4e34dd)

## 0.1.55

Current published Hub version.

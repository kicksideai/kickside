# Changelog

## [0.2.5](https://github.com/kicksideai/kickside/compare/automation-v0.2.4...automation-v0.2.5) (2026-10-28)


### Bug Fixes

* **automation:** compose delivery execution scopes ([#183](https://github.com/kicksideai/kickside/issues/183)) ([7ca577b](https://github.com/kicksideai/kickside/commit/7ca577b2a22bdeae4a4cb5fb13f029840d22e77d))
* **automation:** reactivate blocked drives through controls ([#188](https://github.com/kicksideai/kickside/issues/188)) ([8673ccd](https://github.com/kicksideai/kickside/commit/8673ccda3133fc40ce909a5f1e459172c4079e2f))

## [0.2.4](https://github.com/kicksideai/kickside/compare/automation-v0.2.3...automation-v0.2.4) (2026-10-28)


### Bug Fixes

* **security:** preserve scope APIs through staged upgrades ([03c8fe8](https://github.com/kicksideai/kickside/commit/03c8fe8c14b79a8cb31cc9c37b2b2f3854a86e68))

## [0.2.3](https://github.com/kicksideai/kickside/compare/automation-v0.2.2...automation-v0.2.3) (2026-10-25)


### Bug Fixes

* **automation:** preserve legacy recurring agent inputs ([#134](https://github.com/kicksideai/kickside/issues/134)) ([c71eea2](https://github.com/kicksideai/kickside/commit/c71eea238abc29abe01b2b872e600557cbd7965d))
* **automation:** wake retention after round release ([#142](https://github.com/kicksideai/kickside/issues/142)) ([e4ef878](https://github.com/kicksideai/kickside/commit/e4ef8782c41889cd41b7a28a21a032f44e88090f))

## [0.2.2](https://github.com/kicksideai/kickside/compare/automation-v0.2.1...automation-v0.2.2) (2026-10-23)


### Bug Fixes

* **automation:** preserve denied configuration lookup errors ([e24cb7c](https://github.com/kicksideai/kickside/commit/e24cb7c5d42ea64c8426e8d4f64d501382877627))
* **automation:** prune prepared output only with settlement proof ([#79](https://github.com/kicksideai/kickside/issues/79)) ([6578982](https://github.com/kicksideai/kickside/commit/657898216c8f9c40f0c9a7d4ca6f7b360d0307a2))
* **automation:** repair stale job references on unserved wakes ([#127](https://github.com/kicksideai/kickside/issues/127)) ([7fb479a](https://github.com/kicksideai/kickside/commit/7fb479a83cedeefcb6cc7a55bcd0f4b22aa750cb))
* **automation:** restrict authority-bearing edits to the execution subject ([#68](https://github.com/kicksideai/kickside/issues/68)) ([aed8ab5](https://github.com/kicksideai/kickside/commit/aed8ab5ec044ff0cbe8fb1962a8c7caa44bd88b1))
* **automation:** retire direct agent launch controls without breaking saved tasks ([#95](https://github.com/kicksideai/kickside/issues/95)) ([86e687a](https://github.com/kicksideai/kickside/commit/86e687ad79c4d29d91c753d5e7d1ca9e7caf873a))

## [0.2.1](https://github.com/kicksideai/kickside/compare/automation-v0.2.0...automation-v0.2.1) (2026-10-23)


### Bug Fixes

* **automation:** delegate repair checkpoints to migration framework ([#114](https://github.com/kicksideai/kickside/issues/114)) ([de7b929](https://github.com/kicksideai/kickside/commit/de7b929b98da72bacf5d63ce031d6c628ae40c3f))
* **automation:** require the published tool-action contract ([#117](https://github.com/kicksideai/kickside/issues/117)) ([aa4589c](https://github.com/kicksideai/kickside/commit/aa4589cc2873628ba2bf9494bce90b38755c261c))
* **automation:** revalidate resync operator WRITE before applying ([#85](https://github.com/kicksideai/kickside/issues/85)) ([bdca99f](https://github.com/kicksideai/kickside/commit/bdca99ff5a3d5664000927fe54a444f097a43b00))

## [0.2.0](https://github.com/kicksideai/kickside/compare/automation-v0.1.133...automation-v0.2.0) (2026-10-22)


### ⚠ BREAKING CHANGES

* **workflows:** Post-processing S3 placement requires explicitly installing kickside/storage-s3 in the same module plan as this update. The base module no longer installs its S3 policy, controller, jobs, endpoints, or UI.

### Bug Fixes

* **automation:** acknowledge only served slot wakes ([f6f0e87](https://github.com/kicksideai/kickside/commit/f6f0e877c8629c07d67ca11161ec0157f8753d6d))
* **automation:** check every current reference on reconfigure ([04690ea](https://github.com/kicksideai/kickside/commit/04690ea7e5246dc4e53e16ab3d5550c7149ae084))
* **automation:** fence source pulls with the round lease ([#84](https://github.com/kicksideai/kickside/issues/84)) ([4ad30e7](https://github.com/kicksideai/kickside/commit/4ad30e71c5a406cd3884d3e46663977148a541c9))
* **automation:** keep an at-most-once item uncertain when its write call fails ([#87](https://github.com/kicksideai/kickside/issues/87)) ([105039a](https://github.com/kicksideai/kickside/commit/105039ae51cc40f4d1fb636d2e44b6587606ccae))
* **automation:** keep stranded repair outside migration transactions ([#113](https://github.com/kicksideai/kickside/issues/113)) ([90da7cd](https://github.com/kicksideai/kickside/commit/90da7cd633be99bc17f8b63017ece9e4825a8b0c))
* **automation:** preserve dead delivery evidence while its owner exists ([#71](https://github.com/kicksideai/kickside/issues/71)) ([309f1b6](https://github.com/kicksideai/kickside/commit/309f1b6ec6047bfc846dbeece92d93ffa6441693))
* **automation:** repair drives that reference finished slot jobs ([#103](https://github.com/kicksideai/kickside/issues/103)) ([2e85f34](https://github.com/kicksideai/kickside/commit/2e85f3405600ccde7d7636010dc7e521630719f1))
* **automation:** resume restored execution identities ([#75](https://github.com/kicksideai/kickside/issues/75)) ([47c34fa](https://github.com/kicksideai/kickside/commit/47c34fa752c3c673bcbe5bd47b76ba3009b9164e))
* **automation:** retain slots and commands until provisioning completes ([7f7f188](https://github.com/kicksideai/kickside/commit/7f7f18818cd1a9a6138d80f8b42b16e70f4dfe14))
* **automation:** retire settled event receipt mappings by age ([7f24385](https://github.com/kicksideai/kickside/commit/7f243850bc538566a3454e4bb760f4ff73a6d5b1))
* **component:** start new components with the creator's captured identity ([1a9b12e](https://github.com/kicksideai/kickside/commit/1a9b12ea4204a37235a5101fe25f25129eb2cfd1))
* declare plain object roots for agent tool input schemas ([75fd0fe](https://github.com/kicksideai/kickside/commit/75fd0fed2a0c71206ae914c6ee497e1b37301a54))
* preserve execution failure and session acquisition semantics ([#76](https://github.com/kicksideai/kickside/issues/76)) ([2df07e3](https://github.com/kicksideai/kickside/commit/2df07e32a36bb5cf2f20a2eaf030c7d12a4ccb08))
* **uploads:** preserve completion checkpoints and redact structured diagnostics ([518920e](https://github.com/kicksideai/kickside/commit/518920e63ef6f512949da0d0b79cf9cd7a03a161))
* **workflows:** route iteration inputs to body joins ([#46](https://github.com/kicksideai/kickside/issues/46)) ([efed521](https://github.com/kicksideai/kickside/commit/efed521d398ca78422f806d83bb09c3b24b609b3))

## [0.1.133](https://github.com/kicksideai/kickside/compare/automation-v0.1.132...automation-v0.1.133) (2026-10-21)


### Bug Fixes

* **automation:** show scheduled drives while waiting for a run ([#44](https://github.com/kicksideai/kickside/issues/44)) ([82a65d5](https://github.com/kicksideai/kickside/commit/82a65d5ed415a1d649607c0c8cc0cfbad1dfa994))

## [0.1.132](https://github.com/kicksideai/kickside/compare/automation-v0.1.131...automation-v0.1.132) (2026-10-20)


### Bug Fixes

* **automation:** add structured task setup forms and published workflow selection ([#33](https://github.com/kicksideai/kickside/issues/33)) ([52fb507](https://github.com/kicksideai/kickside/commit/52fb5074f8cc57ee6b9a5053092559774796315a))

## 0.1.131 (2026-10-17)

- Refresh packaged module descriptions and documentation.

## 0.1.130 (2026-10-17)

- Expose bounded source samples through the existing acquisition path.

## 0.1.126 (2026-10-09)

- Classify actor-source identity refusals with native errors before resolving a source instance (c885fef67).

## 0.1.125 (2026-10-09)

- Recover authority-blocked commands with higher-generation target fences.
- Preserve original delivery authority across retained work and legacy admission, with additive delivery-provenance storage.
- Refresh live authority before each automation effect and retain durable connection-capacity floors.
- Build frontend assets with the current published UI Kit stylesheet.

## 0.1.124 (2026-10-08)

- fix(automation): retain watcher name during upgrade (c1a770af9)
- fix(automation): evaluate selected native registry capabilities (36f59b106)
- fix: bound agent tool results and derive model checkpoint budgets (83caf17bc)
- fix: owner delete pages continue when a peer advances the same teardown (R3-P01, R3-P02) (20981d1a9)
- fix automation declaration identity authority (2311091a6)
- Close lost run history, mark caught-up projections valid, and surface unclaimed due work (a64a696c7)
- fix: authorize declared principals without actor construction (28d53869a)
- fix: resolve declared principal groups through Users authority (4b9fceb7d)
- build: rebuild bundles from source (6c884fef9)
- chore: refresh locks to latest published dependencies (243b4bdff)
- Default module member requirements to platform Members (a05332552)
- Declare module access bundles and invalidate changed group sessions (602c31f9d)
- Preserve Automation uninstall error authority (85c9d8c19)
- Retain unavailable automations across module removal and cover lifecycle gaps (4312ed163)
- Keep shared catalog picker options within the viewport (a8c8db7b5)
- fix(mcp): declare scoped automation capabilities and prove credential lifecycles (398dc7b32)
- fix(channel): publish admitted chat outputs and honor drive controls (59a95fed0)
- fix(cluster): scope durable actor ownership and retain standby contenders (1ec81dcb0)
- fix(sync): validate mappings against selected source payload schemas (eb00502df)
- fix(automation): show scheduler run times once in manager rows (5d3ea8890)
- Honor shared webhook access and align smoke flows with declared contracts (89359d612)

## 0.1.121

Current published Hub version.

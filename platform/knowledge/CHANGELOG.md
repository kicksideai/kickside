# Changelog

## [0.1.72](https://github.com/kicksideai/kickside/compare/knowledge-v0.1.71...knowledge-v0.1.72) (2026-10-30)


### Bug Fixes

* **knowledge:** discover externally created libraries in mounted catalogs ([#251](https://github.com/kicksideai/kickside/issues/251)) ([1065e22](https://github.com/kicksideai/kickside/commit/1065e22df386037b92147e42c192dfe365f52ba7))

## [0.1.71](https://github.com/kicksideai/kickside/compare/knowledge-v0.1.70...knowledge-v0.1.71) (2026-10-30)


### Bug Fixes

* **knowledge:** return nested views to their previous route ([#209](https://github.com/kicksideai/kickside/issues/209)) ([c62888e](https://github.com/kicksideai/kickside/commit/c62888e42bb0008e6fd512b86145653e2f835635))

## [0.1.70](https://github.com/kicksideai/kickside/compare/knowledge-v0.1.69...knowledge-v0.1.70) (2026-10-29)


### Features

* **knowledge:** admit file references for accepting engines ([#206](https://github.com/kicksideai/kickside/issues/206)) ([fc8c6b2](https://github.com/kicksideai/kickside/commit/fc8c6b218e6a77c45cca9106931d0b5c2f7130ef))


### Bug Fixes

* **knowledge:** reuse store statistics in detail responses ([f924751](https://github.com/kicksideai/kickside/commit/f92475169765155b5d3d631e9aebcbbfb191f7b3))

## [0.1.69](https://github.com/kicksideai/kickside/compare/knowledge-v0.1.68...knowledge-v0.1.69) (2026-10-28)


### Features

* **knowledge:** show engine statistics in the shared header ([#185](https://github.com/kicksideai/kickside/issues/185)) ([029161b](https://github.com/kicksideai/kickside/commit/029161bc66d8bf0f2e30f233733664a080b9c394))

## [0.1.68](https://github.com/kicksideai/kickside/compare/knowledge-v0.1.67...knowledge-v0.1.68) (2026-10-28)


### Bug Fixes

* **security:** preserve scope APIs through staged upgrades ([03c8fe8](https://github.com/kicksideai/kickside/commit/03c8fe8c14b79a8cb31cc9c37b2b2f3854a86e68))

## [0.1.67](https://github.com/kicksideai/kickside/compare/knowledge-v0.1.66...knowledge-v0.1.67) (2026-10-25)


### Bug Fixes

* **knowledge:** honor singular sink picker keys ([#140](https://github.com/kicksideai/kickside/issues/140)) ([ea87659](https://github.com/kicksideai/kickside/commit/ea8765922efac3a35345ee15080c772f4ab925f2))

## [0.1.66](https://github.com/kicksideai/kickside/compare/knowledge-v0.1.65...knowledge-v0.1.66) (2026-10-23)


### Bug Fixes

* **knowledge:** reference large content artifacts instead of inlining them ([#88](https://github.com/kicksideai/kickside/issues/88)) ([08d13f6](https://github.com/kicksideai/kickside/commit/08d13f6e1caeddd470549da5e7adba7862df44ea))

## [0.1.65](https://github.com/kicksideai/kickside/compare/knowledge-v0.1.64...knowledge-v0.1.65) (2026-10-22)


### Bug Fixes

* **knowledge:** describe store lifecycle row output ([#90](https://github.com/kicksideai/kickside/issues/90)) ([81d54a9](https://github.com/kicksideai/kickside/commit/81d54a9c16c78d42b895d7ac0b4d8f1c626d4132))
* **knowledge:** open engine stores through their named binding ([#108](https://github.com/kicksideai/kickside/issues/108)) ([b3dfa4c](https://github.com/kicksideai/kickside/commit/b3dfa4cd2d1c4682be51297fdc1dd30a193de9b7))
* preserve typed LLM errors in agents and knowledge ([f56ef7f](https://github.com/kicksideai/kickside/commit/f56ef7fefcf00e51278751304fa88597382634b4))
* **uploads:** preserve completion checkpoints and redact structured diagnostics ([518920e](https://github.com/kicksideai/kickside/commit/518920e63ef6f512949da0d0b79cf9cd7a03a161))

## 0.1.64 (2026-10-17)

- Refresh packaged module descriptions and documentation.

## 0.1.60 (2026-10-09)

- Preserve native Execution validation errors and migrate trace consumers (5fda907df)
- Build frontend assets with the current published UI Kit stylesheet.

## 0.1.59 (2026-10-08)

- fix: bound agent tool results and derive model checkpoint budgets (83caf17bc)
- fix(knowledge): agent search and ask tools keep the classified kind and cause of a failure (452896eff)
- fix(contract,knowledge): ask answer failures keep their classified kind through one shared model_failure library (6dad93d7a)
- fix(knowledge): search endpoint answers retrieval failures with the returned error's classified status (13c659f42)
- Deliver scope reconcile, OAuth, upload and profile signals under service identities (90ce38da7)
- build: rebuild bundles from source (6c884fef9)
- chore: refresh locks to latest published dependencies (243b4bdff)
- Default module member requirements to platform Members (a05332552)
- fix(knowledge): retain cleanup card on refresh error (33f38a6e8)
- fix: track accepted knowledge cleanup to list completion (466810721)
- Declare module access bundles and invalidate changed group sessions (602c31f9d)
- fix(knowledge): retain the published HTTP error library (21899ba50)
- fix(producers): retain optional module event capabilities (65a6e1042)
- Preserve bounded cleanup outcomes and durable continuation through deletion (78a2aff1f)
- Classify missing Knowledge configuration and own fixture teardown (30064021c)
- Declare engine config maintenance and preserve compensated KB updates (bb24bd90f)
- knowledge: address the source projection through the current threads contract (1d4e362b7)
- knowledge: read the complete accessible catalog with continuation (6a9eb05b3)
- Restore retained trigger consolidation behavior through current modules (03eb36263)
- fix(knowledge): request digest refresh after summary configuration edits (04d5fa5ba)

## 0.1.56

Current published Hub version.

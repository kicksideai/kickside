# Changelog

## [0.1.92](https://github.com/kicksideai/kickside/compare/models-v0.1.91...models-v0.1.92) (2026-11-21)


### Bug Fixes

* **app:** require the LLM fallback transport ([#839](https://github.com/kicksideai/kickside/issues/839)) ([106a415](https://github.com/kicksideai/kickside/commit/106a4154b21bb8a733e3454e3994330a1e7a291a))

## [0.1.91](https://github.com/kicksideai/kickside/compare/models-v0.1.90...models-v0.1.91) (2026-11-21)


### Features

* **models:** agent tools and a trait for model catalog cards ([#828](https://github.com/kicksideai/kickside/issues/828)) ([fdd15a2](https://github.com/kicksideai/kickside/commit/fdd15a2ba1ee9c4a1cea42db566740147f0ec407))

## [0.1.90](https://github.com/kicksideai/kickside/compare/models-v0.1.89...models-v0.1.90) (2026-11-21)


### Features

* **models:** configure and expose provider icons ([#826](https://github.com/kicksideai/kickside/issues/826)) ([0a23151](https://github.com/kicksideai/kickside/commit/0a231515396758de2173ef207f8a7e28af4c0e3a))

## [0.1.89](https://github.com/kicksideai/kickside/compare/models-v0.1.88...models-v0.1.89) (2026-11-20)


### Features

* **models:** add the model cards contract on the shared card write path ([39ee5ed](https://github.com/kicksideai/kickside/commit/39ee5edf263fb7d9c7d46881bb3936b77f651cd3))

## [0.1.88](https://github.com/kicksideai/kickside/compare/models-v0.1.87...models-v0.1.88) (2026-11-20)


### Bug Fixes

* **models:** keep credentials out of card pricing ([c1b1e1f](https://github.com/kicksideai/kickside/commit/c1b1e1fb4e5158fdebb577615e159771e07d8ee8))

## [0.1.87](https://github.com/kicksideai/kickside/compare/models-v0.1.86...models-v0.1.87) (2026-11-19)


### Bug Fixes

* **models:** preserve empty JSON objects when redacting provider replies ([#701](https://github.com/kicksideai/kickside/issues/701)) ([bdf561d](https://github.com/kicksideai/kickside/commit/bdf561d796629d466b7924f027190d8c41622233))

## [0.1.86](https://github.com/kicksideai/kickside/compare/models-v0.1.85...models-v0.1.86) (2026-11-19)


### Features

* **models:** export and import provider profiles and model cards ([#482](https://github.com/kicksideai/kickside/issues/482)) ([1d05230](https://github.com/kicksideai/kickside/commit/1d0523074a5a6b3e8e19ab331a4a613e2e960f82))

## [0.1.85](https://github.com/kicksideai/kickside/compare/models-v0.1.84...models-v0.1.85) (2026-11-19)


### Bug Fixes

* **models:** preserve native sampling capabilities on saved profiles ([#587](https://github.com/kicksideai/kickside/issues/587)) ([9d00e73](https://github.com/kicksideai/kickside/commit/9d00e73c36c310e69242c0f3c60c7cc93f0b10a8))

## [0.1.84](https://github.com/kicksideai/kickside/compare/models-v0.1.83...models-v0.1.84) (2026-11-19)


### Bug Fixes

* **models:** require a positive provider timeout ([20f1981](https://github.com/kicksideai/kickside/commit/20f19816ebc40063cebb2f652157c3f13a72136c))
* **models:** retain valid provider timeouts and immediate retries ([#571](https://github.com/kicksideai/kickside/issues/571)) ([20f1981](https://github.com/kicksideai/kickside/commit/20f19816ebc40063cebb2f652157c3f13a72136c))
* **models:** retain working provider timeouts and immediate retries ([551884c](https://github.com/kicksideai/kickside/commit/551884ca859faceb034a985d2642f5049731a79b))
* preserve text with long internal whitespace ([#563](https://github.com/kicksideai/kickside/issues/563)) ([80ea34c](https://github.com/kicksideai/kickside/commit/80ea34cd57e9bd053d2874c2f7c98625db05c2f7))

## [0.1.83](https://github.com/kicksideai/kickside/compare/models-v0.1.82...models-v0.1.83) (2026-11-19)


### Bug Fixes

* **models:** distinguish unreadable class assignments ([20b2960](https://github.com/kicksideai/kickside/commit/20b2960e592ee7682ac217ce6b52eba6e1591535))
* **models:** distinguish unreadable class assignments ([bdcbc62](https://github.com/kicksideai/kickside/commit/bdcbc62d374c2623b303c0039caf9d44aa9b30ea))
* **models:** type unassigned class resolution errors ([6b525ce](https://github.com/kicksideai/kickside/commit/6b525ceac41885d6e8ab9558510bfe971a26b71f))

## [0.1.82](https://github.com/kicksideai/kickside/compare/models-v0.1.81...models-v0.1.82) (2026-11-19)


### Bug Fixes

* **models:** probe first-party OpenAI generation through Responses ([#559](https://github.com/kicksideai/kickside/issues/559)) ([2e3eea9](https://github.com/kicksideai/kickside/commit/2e3eea93c4eddae321e27f8b34f87ae9d28e2ca8))

## [0.1.81](https://github.com/kicksideai/kickside/compare/models-v0.1.80...models-v0.1.81) (2026-11-19)


### Bug Fixes

* keep secret operations in owning module frames ([#483](https://github.com/kicksideai/kickside/issues/483)) ([47f4f8a](https://github.com/kicksideai/kickside/commit/47f4f8af2dba69d4b8e818ab78530ec6fad12be9))
* **models:** honor the provider timeout for plain chat ([#556](https://github.com/kicksideai/kickside/issues/556)) ([5a7518f](https://github.com/kicksideai/kickside/commit/5a7518f5ff44adc17498c4ea66961f8c2bed80ec))
* **models:** keep discovered models usable without token limits ([#541](https://github.com/kicksideai/kickside/issues/541)) ([39e40c2](https://github.com/kicksideai/kickside/commit/39e40c234eeeb9f94607ae7cfba85e8360d5b472))
* **models:** resolve configured models for members ([#395](https://github.com/kicksideai/kickside/issues/395)) ([b79e54f](https://github.com/kicksideai/kickside/commit/b79e54fa105fcf18794e8c4d989f55ddf4a7b376))

## [0.1.80](https://github.com/kicksideai/kickside/compare/models-v0.1.79...models-v0.1.80) (2026-11-16)


### Bug Fixes

* preserve web component host contracts and eager bundles ([8bfd86d](https://github.com/kicksideai/kickside/commit/8bfd86dded87eea2c40294be136af1a66ab25765))

## [0.1.79](https://github.com/kicksideai/kickside/compare/models-v0.1.78...models-v0.1.79) (2026-11-16)


### Bug Fixes

* **models:** encrypt legacy provider headers and preserve safe diagnostics ([#462](https://github.com/kicksideai/kickside/issues/462)) ([03301f6](https://github.com/kicksideai/kickside/commit/03301f6f1de1134d7ed1af5470be1a9b2f70754f))

## [0.1.78](https://github.com/kicksideai/kickside/compare/models-v0.1.77...models-v0.1.78) (2026-11-15)


### Bug Fixes

* **models:** preserve capability overrides while refreshing discovery ([#472](https://github.com/kicksideai/kickside/issues/472)) ([d0a989b](https://github.com/kicksideai/kickside/commit/d0a989b454430e15064e1603765fe69f7a9640c6))
* **models:** preserve credentials while keeping token quantities ([#473](https://github.com/kicksideai/kickside/issues/473)) ([0f9c7ec](https://github.com/kicksideai/kickside/commit/0f9c7ecb9cf3a35917073e858cc07a216046c447))

## [0.1.77](https://github.com/kicksideai/kickside/compare/models-v0.1.76...models-v0.1.77) (2026-11-13)


### Bug Fixes

* align System settings navigation and administration panes ([#449](https://github.com/kicksideai/kickside/issues/449)) ([f113972](https://github.com/kicksideai/kickside/commit/f113972709e065c17ecc112b61cc4bd141b75a87))

## [0.1.76](https://github.com/kicksideai/kickside/compare/models-v0.1.75...models-v0.1.76) (2026-11-12)


### Bug Fixes

* **models:** serialize cache reloads through publication ([#440](https://github.com/kicksideai/kickside/issues/440)) ([0ef3045](https://github.com/kicksideai/kickside/commit/0ef304577a2167c3ecaa9aea2f8f723095c0ca93))

## [0.1.75](https://github.com/kicksideai/kickside/compare/models-v0.1.74...models-v0.1.75) (2026-11-09)


### Bug Fixes

* **models:** retain eligible ranked class candidates during resolution ([#399](https://github.com/kicksideai/kickside/issues/399)) ([cab10e7](https://github.com/kicksideai/kickside/commit/cab10e7533c0ff556255fcd7623b5845e2aee683))

## [0.1.74](https://github.com/kicksideai/kickside/compare/models-v0.1.73...models-v0.1.74) (2026-11-09)


### Bug Fixes

* **models:** preserve enable state when assigning classes ([#393](https://github.com/kicksideai/kickside/issues/393)) ([491847b](https://github.com/kicksideai/kickside/commit/491847ba4e3a184afef858f0d4684d44606d0506))

## [0.1.73](https://github.com/kicksideai/kickside/compare/models-v0.1.72...models-v0.1.73) (2026-11-09)


### Bug Fixes

* **ui:** simplify model results and move setup replay ([#380](https://github.com/kicksideai/kickside/issues/380)) ([807df19](https://github.com/kicksideai/kickside/commit/807df195bbef3d6698a47ecaeeed4290b976e471))

## [0.1.72](https://github.com/kicksideai/kickside/compare/models-v0.1.71...models-v0.1.72) (2026-11-08)


### Bug Fixes

* UI artifacts in buttons, headings, dialogs and tables ([#371](https://github.com/kicksideai/kickside/issues/371)) ([ea55ea8](https://github.com/kicksideai/kickside/commit/ea55ea8a17ee5802cb73a4dbcf39878d7f56cd2e))

## [0.1.71](https://github.com/kicksideai/kickside/compare/models-v0.1.70...models-v0.1.71) (2026-10-29)


### Bug Fixes

* **models:** preserve catalog types through error fixtures ([#234](https://github.com/kicksideai/kickside/issues/234)) ([6c8ca59](https://github.com/kicksideai/kickside/commit/6c8ca59fa6c9dbf1324a635df7a4f2bd3d5f14bf))

## [0.1.70](https://github.com/kicksideai/kickside/compare/models-v0.1.69...models-v0.1.70) (2026-10-28)


### Bug Fixes

* **security:** resolve live scopes through Security-owned projections ([adad7ee](https://github.com/kicksideai/kickside/commit/adad7ee499f7dfbd1134c57c06368aa440a0ab07))

## [0.1.69](https://github.com/kicksideai/kickside/compare/models-v0.1.68...models-v0.1.69) (2026-10-22)


### Bug Fixes

* **models:** correct model discovery capabilities and picker classes ([3f96cc2](https://github.com/kicksideai/kickside/commit/3f96cc24c6c4977bf36d215b7f90b1731bb9548e))

## 0.1.68 (2026-10-20)

- Model discovery reads OpenRouter's embeddings catalog as well, so provider embedding models (OpenAI text-embedding-3) get their context window and can be enabled for knowledge bases.

## 0.1.67 (2026-10-17)

- Refresh packaged module descriptions and documentation.

## 0.1.63 (2026-10-09)

- Build frontend assets with the current published UI Kit stylesheet.

## 0.1.62 (2026-10-08)

- Deliver scope reconcile, OAuth, upload and profile signals under service identities (90ce38da7)
- build: rebuild bundles from source (6c884fef9)
- chore: refresh locks to latest published dependencies (243b4bdff)
- Complete Users management: scoped System tabs, scope catalog and declared memberships (829cb91b7)
- Default module member requirements to platform Members (a05332552)
- Declare module access bundles and invalidate changed group sessions (602c31f9d)
- Preserve sanitized model request options across catalog and editor (9cfb870ae)
- Run native PostgreSQL gates through isolated module targets (3ddb9c541)
- test(models): prove editor bundle revalidation and drawer scroll ownership (b8e0460d7)
- Restore retained trigger consolidation behavior through current modules (03eb36263)
- fix(cluster): scope durable actor ownership and retain standby contenders (1ec81dcb0)

## 0.1.60

Current published Hub version.

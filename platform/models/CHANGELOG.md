# Changelog

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

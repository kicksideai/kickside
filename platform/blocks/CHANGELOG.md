# Changelog

## [0.1.46](https://github.com/kicksideai/kickside/compare/blocks-v0.1.45...blocks-v0.1.46) (2026-11-22)


### Bug Fixes

* preserve the workflow arm in resume handoffs ([#914](https://github.com/kicksideai/kickside/issues/914)) ([4b09779](https://github.com/kicksideai/kickside/commit/4b097790959c2a43a50a80b2bd1cbc04ce898295))

## [0.1.45](https://github.com/kicksideai/kickside/compare/blocks-v0.1.44...blocks-v0.1.45) (2026-11-19)


### Bug Fixes

* preserve text with long internal whitespace ([#563](https://github.com/kicksideai/kickside/issues/563)) ([80ea34c](https://github.com/kicksideai/kickside/commit/80ea34cd57e9bd053d2874c2f7c98625db05c2f7))

## [0.1.44](https://github.com/kicksideai/kickside/compare/blocks-v0.1.43...blocks-v0.1.44) (2026-11-16)


### Bug Fixes

* **blocks:** preserve connected tool input with fixed arguments ([#503](https://github.com/kicksideai/kickside/issues/503)) ([7bf864c](https://github.com/kicksideai/kickside/commit/7bf864c0b0698b383efe4c0d6e07022a48f1e8aa))

## [0.1.43](https://github.com/kicksideai/kickside/compare/blocks-v0.1.42...blocks-v0.1.43) (2026-10-29)


### Features

* **blocks:** support bounded native retries and execution timeouts ([#231](https://github.com/kicksideai/kickside/issues/231)) ([f71bd38](https://github.com/kicksideai/kickside/commit/f71bd38b1a94eb8549aa78d626976ce1a8523e9c))

## [0.1.42](https://github.com/kicksideai/kickside/compare/blocks-v0.1.41...blocks-v0.1.42) (2026-10-28)


### Bug Fixes

* **blocks:** preserve resume errors and validate arm ownership ([#168](https://github.com/kicksideai/kickside/issues/168)) ([81919a8](https://github.com/kicksideai/kickside/commit/81919a8c3c0220fb523f21e2c9965ea2402c0d17))

## [0.1.41](https://github.com/kicksideai/kickside/compare/blocks-v0.1.40...blocks-v0.1.41) (2026-10-28)


### Bug Fixes

* **security:** preserve scope APIs through staged upgrades ([03c8fe8](https://github.com/kicksideai/kickside/commit/03c8fe8c14b79a8cb31cc9c37b2b2f3854a86e68))

## [0.1.40](https://github.com/kicksideai/kickside/compare/blocks-v0.1.39...blocks-v0.1.40) (2026-10-25)


### Bug Fixes

* **blocks:** include Await execution in module access ([#135](https://github.com/kicksideai/kickside/issues/135)) ([6b8b2e4](https://github.com/kicksideai/kickside/commit/6b8b2e401676b9cf259431d99ebd7911e45f2692))

## [0.1.39](https://github.com/kicksideai/kickside/compare/blocks-v0.1.38...blocks-v0.1.39) (2026-10-23)


### Bug Fixes

* **workflows:** preserve empty object schemas through publication ([#110](https://github.com/kicksideai/kickside/issues/110)) ([06213cb](https://github.com/kicksideai/kickside/commit/06213cb3f2de773e5c83a894d810a81838b8cc3c))

## 0.1.37 (2026-10-14)

- Preserve declared empty object fields in new portable Flow artifacts and retain existing artifact checksums.

## 0.1.35 (2026-10-08)

- fix: bound agent tool results and derive model checkpoint budgets (83caf17bc)
- Declare module access bundles and invalidate changed group sessions (602c31f9d)
- Run native PostgreSQL gates through isolated module targets (3ddb9c541)

## 0.1.33

Current published Hub version.

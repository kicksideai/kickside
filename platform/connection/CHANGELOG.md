# Changelog

## [0.5.1](https://github.com/kicksideai/kickside/compare/connection-v0.5.0...connection-v0.5.1) (2026-10-23)


### Bug Fixes

* **connection:** type provider client fixtures ([#131](https://github.com/kicksideai/kickside/issues/131)) ([34a503c](https://github.com/kicksideai/kickside/commit/34a503ce98550881b86120b96e860bb3ee027807))

## [0.5.0](https://github.com/kicksideai/kickside/compare/connection-v0.4.0...connection-v0.5.0) (2026-10-22)


### ⚠ BREAKING CHANGES

* **workflows:** Post-processing S3 placement requires explicitly installing kickside/storage-s3 in the same module plan as this update. The base module no longer installs its S3 policy, controller, jobs, endpoints, or UI.

### Bug Fixes

* **channel:** pass the delivery key to reply providers on keyed writes ([#77](https://github.com/kicksideai/kickside/issues/77)) ([ca9c879](https://github.com/kicksideai/kickside/commit/ca9c879efcad63267a7796481b4d24af9cf52092))
* **uploads:** preserve completion checkpoints and redact structured diagnostics ([518920e](https://github.com/kicksideai/kickside/commit/518920e63ef6f512949da0d0b79cf9cd7a03a161))
* **workflows:** route iteration inputs to body joins ([#46](https://github.com/kicksideai/kickside/issues/46)) ([efed521](https://github.com/kicksideai/kickside/commit/efed521d398ca78422f806d83bb09c3b24b609b3))

## [0.4.0](https://github.com/kicksideai/kickside/compare/connection-v0.3.1...connection-v0.4.0) (2026-10-21)


### ⚠ BREAKING CHANGES

* **connection:** Update Box, Dropbox, and Notion alongside Connection. Provider-specific multipart, argument-header, and checksum formats are owned by their provider packages and passed through the native Prepare hook.

### Bug Fixes

* **connection:** move provider wire formats behind native preparers ([#57](https://github.com/kicksideai/kickside/issues/57)) ([463cd3c](https://github.com/kicksideai/kickside/commit/463cd3c8056c0fc64f320fe1e8e30d5a9e6666f3))

## [0.3.1](https://github.com/kicksideai/kickside/compare/connection-v0.3.0...connection-v0.3.1) (2026-10-21)


### Features

* **connection:** support native productivity provider adapters ([#43](https://github.com/kicksideai/kickside/issues/43)) ([1efcf58](https://github.com/kicksideai/kickside/commit/1efcf58af4a637bde446dcf2902ece5eb866c90c))

## 0.2.4 (2026-10-14)

- Resolve connection icons from the provider connection declaration regardless of source and sink binding order.

## 0.2.1 (2026-10-09)

- Enforce the shared durable connection capacity floor (7331b32c7)

## 0.2.0 (2026-10-08)

- build: rebuild bundles from source (6c884fef9)
- chore: refresh locks to latest published dependencies (243b4bdff)
- Default module member requirements to platform Members (a05332552)
- Declare module access bundles and invalidate changed group sessions (602c31f9d)
- fix(http): retain published error library identities (ae7ddc9be)
- Run native PostgreSQL gates through isolated module targets (3ddb9c541)
- Authorize connection status reads through the component query (f6a8be5fa)
- feat(channel): surface connection validation warnings as responder health (61ad98e0f)
- fix(frontend): consolidate retained rollout styles and sticky layer (884ee6454)
- fix(oauth): honor offline grants and preserve automatic renewal (EE2-2445) (16fbe4248)

## 0.1.49

Current published Hub version.

# Changelog

## [0.5.6](https://github.com/kicksideai/kickside/compare/connection-v0.5.5...connection-v0.5.6) (2026-11-09)


### Bug Fixes

* read deletion progress from authorized lists ([#376](https://github.com/kicksideai/kickside/issues/376)) ([302fb90](https://github.com/kicksideai/kickside/commit/302fb90cd777cdf54b3565090b428bfcd8a9f67e))

## [0.5.5](https://github.com/kicksideai/kickside/compare/connection-v0.5.4...connection-v0.5.5) (2026-11-07)


### Bug Fixes

* plain-text inbox previews; clear list errors after deletion; ship shared widget styles ([#346](https://github.com/kicksideai/kickside/issues/346)) ([2e72d66](https://github.com/kicksideai/kickside/commit/2e72d66e4b4c838d2aa792d810014ae9931ccb54))

## [0.5.4](https://github.com/kicksideai/kickside/compare/connection-v0.5.3...connection-v0.5.4) (2026-11-07)


### Bug Fixes

* **widgets:** follow deletion events without racing the delete job ([#337](https://github.com/kicksideai/kickside/issues/337)) ([fdd6984](https://github.com/kicksideai/kickside/commit/fdd6984188d6f35cdaf4e40cd0ac8b9cd08928bc))

## [0.5.3](https://github.com/kicksideai/kickside/compare/connection-v0.5.2...connection-v0.5.3) (2026-11-05)


### Bug Fixes

* **component:** expose asynchronous deletion progress ([e4ca4b7](https://github.com/kicksideai/kickside/commit/e4ca4b7ab5185ecc6ecf83b336ca3e6edf5aca6e))
* **component:** run deletion cleanup through Jobs ([da3f7ae](https://github.com/kicksideai/kickside/commit/da3f7aee8dce4136a65d1c94bda6604820bc8355))
* **component:** simplify deletion waiting and committed delivery ([584eae6](https://github.com/kicksideai/kickside/commit/584eae6145e5e9b4ea36bdbd6527ffe376e9f7fe))
* preserve deletion view state and bind notification authority ([2ea5cf1](https://github.com/kicksideai/kickside/commit/2ea5cf1a31352ba4ba1915daeca384d06d2e7b70))
* **widgets:** keep accepted deletion state across pages ([62c8e18](https://github.com/kicksideai/kickside/commit/62c8e181b0e1b60d0c3c6a80f6f9585dac6ef7cb))
* **widgets:** preserve deletion progress across refreshes ([cd607e1](https://github.com/kicksideai/kickside/commit/cd607e14462b8421d092612cb62dce73e57f5ed8))

## [0.5.2](https://github.com/kicksideai/kickside/compare/connection-v0.5.1...connection-v0.5.2) (2026-10-28)


### Bug Fixes

* **security:** preserve scope APIs through staged upgrades ([03c8fe8](https://github.com/kicksideai/kickside/commit/03c8fe8c14b79a8cb31cc9c37b2b2f3854a86e68))

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

# Changelog

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

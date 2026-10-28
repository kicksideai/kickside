# Changelog

## [0.3.1](https://github.com/kicksideai/kickside/compare/settings-v0.3.0...settings-v0.3.1) (2026-10-28)


### Bug Fixes

* **security:** resolve live scopes through Security-owned projections ([adad7ee](https://github.com/kicksideai/kickside/commit/adad7ee499f7dfbd1134c57c06368aa440a0ab07))

## [0.3.0](https://github.com/kicksideai/kickside/compare/settings-v0.2.0...settings-v0.3.0) (2026-10-22)


### ⚠ BREAKING CHANGES

* **workflows:** Post-processing S3 placement requires explicitly installing kickside/storage-s3 in the same module plan as this update. The base module no longer installs its S3 policy, controller, jobs, endpoints, or UI.

### Bug Fixes

* **settings:** use the published content radius token ([1560a1a](https://github.com/kicksideai/kickside/commit/1560a1a2e259d821d72c85fac8ed877050783637))
* **settings:** validate structured drafts and show row errors ([9204407](https://github.com/kicksideai/kickside/commit/9204407c204fb2c72cb443e3f08482905ddf03a6))
* **uploads:** preserve completion checkpoints and redact structured diagnostics ([518920e](https://github.com/kicksideai/kickside/commit/518920e63ef6f512949da0d0b79cf9cd7a03a161))
* **workflows:** route iteration inputs to body joins ([#46](https://github.com/kicksideai/kickside/issues/46)) ([efed521](https://github.com/kicksideai/kickside/commit/efed521d398ca78422f806d83bb09c3b24b609b3))

## [0.2.0](https://github.com/kicksideai/kickside/compare/settings-v0.1.48...settings-v0.2.0) (2026-10-21)


### ⚠ BREAKING CHANGES

* **uploads:** Post-processing S3 placement requires explicitly installing kickside/storage-s3 in the same module plan as this update. The base module no longer installs its S3 policy, controller, jobs, endpoints, or UI.

### Bug Fixes

* **uploads:** extract S3 placement into an optional extension ([#55](https://github.com/kicksideai/kickside/issues/55)) ([c3d9c0c](https://github.com/kicksideai/kickside/commit/c3d9c0c64e2c0b566e17689d53e3ddec07208a90))

## [0.1.48](https://github.com/kicksideai/kickside/compare/settings-v0.1.47...settings-v0.1.48) (2026-10-21)


### Features

* **uploads:** offload processed content through owned S3 storage ([#47](https://github.com/kicksideai/kickside/issues/47)) ([33c7e72](https://github.com/kicksideai/kickside/commit/33c7e72a784cbc9e0b0733767373fbe3c0932596))

## 0.1.45 (2026-10-09)

- Build frontend assets with the current published UI Kit stylesheet.

## 0.1.44 (2026-10-08)

- build: rebuild bundles from source (6c884fef9)
- chore: refresh locks to latest published dependencies (243b4bdff)
- Complete Users management: scoped System tabs, scope catalog and declared memberships (829cb91b7)
- Declare module access bundles and invalidate changed group sessions (602c31f9d)
- fix(settings): retain both callable cache bootloader identities (987e23995)
- Run native PostgreSQL gates through isolated module targets (3ddb9c541)
- Restore retained trigger consolidation behavior through current modules (03eb36263)
- fix(settings): register the cache bootloader once (3b9c1b29d)

## 0.1.43

Current published Hub version.

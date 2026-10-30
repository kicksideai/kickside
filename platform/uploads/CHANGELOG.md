# Changelog

## [0.3.7](https://github.com/kicksideai/kickside/compare/uploads-v0.3.6...uploads-v0.3.7) (2026-10-30)


### Bug Fixes

* **uploads:** preserve legacy presigned S3 addresses ([#260](https://github.com/kicksideai/kickside/issues/260)) ([12842ee](https://github.com/kicksideai/kickside/commit/12842ee9f460960707db8b69ed378ad1f599fff7))
* **uploads:** preserve objects referenced across legacy S3 aliases ([#263](https://github.com/kicksideai/kickside/issues/263)) ([48b2c43](https://github.com/kicksideai/kickside/commit/48b2c438f152b8ef899fe99fd263d9b4f1259237))
* **uploads:** remove unused S3 alias compatibility ([#265](https://github.com/kicksideai/kickside/issues/265)) ([9758d2c](https://github.com/kicksideai/kickside/commit/9758d2c33146550fb79619d0f03183331376dce6))

## [0.3.6](https://github.com/kicksideai/kickside/compare/uploads-v0.3.5...uploads-v0.3.6) (2026-10-29)


### Bug Fixes

* **uploads:** read original upload content and canonical artifact metadata ([#207](https://github.com/kicksideai/kickside/issues/207)) ([55ab0cc](https://github.com/kicksideai/kickside/commit/55ab0cc08dc67de4ddea699880d55e23b0370257))

## [0.3.5](https://github.com/kicksideai/kickside/compare/uploads-v0.3.4...uploads-v0.3.5) (2026-10-28)


### Features

* **uploads:** add preview deep links ([#170](https://github.com/kicksideai/kickside/issues/170)) ([4bebf64](https://github.com/kicksideai/kickside/commit/4bebf64776be18aea2b203a8de044741a73ffb0d))


### Bug Fixes

* **uploads:** return native errors from provider bindings ([#202](https://github.com/kicksideai/kickside/issues/202)) ([1ce679f](https://github.com/kicksideai/kickside/commit/1ce679f4c11adebfc53cbe491c5cb97056a2c33c))

## [0.3.4](https://github.com/kicksideai/kickside/compare/uploads-v0.3.3...uploads-v0.3.4) (2026-10-28)


### Bug Fixes

* **uploads:** enforce component read access in content providers ([#171](https://github.com/kicksideai/kickside/issues/171)) ([a6bc32c](https://github.com/kicksideai/kickside/commit/a6bc32c25f3217100d78de0bf03d502f91ea5c95))

## [0.3.3](https://github.com/kicksideai/kickside/compare/uploads-v0.3.2...uploads-v0.3.3) (2026-10-28)


### Features

* **uploads:** mark PDF pages and PPTX slides in document markdown ([95a4330](https://github.com/kicksideai/kickside/commit/95a433048cae3e5bfc8904d9d8df91efb4dba001))
* **uploads:** mark PDF pages and PPTX slides in document markdown ([466fb75](https://github.com/kicksideai/kickside/commit/466fb75c838e675b0c662b8c20d595509ee44ea2))

## [0.3.2](https://github.com/kicksideai/kickside/compare/uploads-v0.3.1...uploads-v0.3.2) (2026-10-27)


### Features

* **uploads:** support native storage paths and safe stage relocation ([b6be26e](https://github.com/kicksideai/kickside/commit/b6be26e9ded82d1dab0de96d5d3cb09f62fb2318))


### Bug Fixes

* **security:** preserve scope APIs through staged upgrades ([03c8fe8](https://github.com/kicksideai/kickside/commit/03c8fe8c14b79a8cb31cc9c37b2b2f3854a86e68))

## [0.3.1](https://github.com/kicksideai/kickside/compare/uploads-v0.3.0...uploads-v0.3.1) (2026-10-25)


### Bug Fixes

* **uploads:** page files using their selected sort order ([#138](https://github.com/kicksideai/kickside/issues/138)) ([3174d1d](https://github.com/kicksideai/kickside/commit/3174d1da2cf78aef89ae4da2ecf31654922e1a73))

## [0.3.0](https://github.com/kicksideai/kickside/compare/uploads-v0.2.0...uploads-v0.3.0) (2026-10-22)


### ⚠ BREAKING CHANGES

* **workflows:** Post-processing S3 placement requires explicitly installing kickside/storage-s3 in the same module plan as this update. The base module no longer installs its S3 policy, controller, jobs, endpoints, or UI.

### Bug Fixes

* **uploads:** classify transcription codes, retry failed uploads, keep provider text private ([b633f94](https://github.com/kicksideai/kickside/commit/b633f94820c5e0b75e0cbce1bc46995e75476b61))
* **uploads:** compose retries with guarded idempotent teardown ([72d2b12](https://github.com/kicksideai/kickside/commit/72d2b12b3f2fe70862ce90c91ee5ff04bdc23f80))
* **uploads:** honor optional callbacks and idempotent teardown ([318ab49](https://github.com/kicksideai/kickside/commit/318ab49a1f6c5267cb1a902e75d6e21d705f1779))
* **uploads:** narrow validated transcription code for typed pipeline ([4b06e86](https://github.com/kicksideai/kickside/commit/4b06e86984ccb6d0f780c4cf6540e04f2c9ff5a2))
* **uploads:** preserve completion checkpoints and redact structured diagnostics ([518920e](https://github.com/kicksideai/kickside/commit/518920e63ef6f512949da0d0b79cf9cd7a03a161))
* **uploads:** verify row absence before accepting teardown not found ([966fca4](https://github.com/kicksideai/kickside/commit/966fca422303cc14ca01a1a87584253f4767a6ce))
* **workflows:** route iteration inputs to body joins ([#46](https://github.com/kicksideai/kickside/issues/46)) ([efed521](https://github.com/kicksideai/kickside/commit/efed521d398ca78422f806d83bb09c3b24b609b3))

## [0.2.0](https://github.com/kicksideai/kickside/compare/uploads-v0.1.74...uploads-v0.2.0) (2026-10-21)


### ⚠ BREAKING CHANGES

* **uploads:** Post-processing S3 placement requires explicitly installing kickside/storage-s3 in the same module plan as this update. The base module no longer installs its S3 policy, controller, jobs, endpoints, or UI.

### Bug Fixes

* **uploads:** extract S3 placement into an optional extension ([#55](https://github.com/kicksideai/kickside/issues/55)) ([c3d9c0c](https://github.com/kicksideai/kickside/commit/c3d9c0c64e2c0b566e17689d53e3ddec07208a90))

## [0.1.74](https://github.com/kicksideai/kickside/compare/uploads-v0.1.73...uploads-v0.1.74) (2026-10-21)


### Features

* **uploads:** offload processed content through owned S3 storage ([#47](https://github.com/kicksideai/kickside/issues/47)) ([33c7e72](https://github.com/kicksideai/kickside/commit/33c7e72a784cbc9e0b0733767373fbe3c0932596))


### Bug Fixes

* **uploads:** keep reads available during S3 placement ([#48](https://github.com/kicksideai/kickside/issues/48)) ([0b17848](https://github.com/kicksideai/kickside/commit/0b178480b0bda7873d1e73f519b0aa612214c8fa))

## 0.1.73 (2026-10-17)

- Remove retired retention metadata and refresh packaged documentation.

## 0.1.70 (2026-10-12)

- Compose the existing document converter policy into Uploads member access.
- Require a Doc2MD release that provides its member policy.

## 0.1.69 (2026-10-09)

- Build frontend assets with the current published UI Kit stylesheet.

## 0.1.68 (2026-10-08)

- fix(mcp): persist scoped results without ingestion and grant continuation explicitly (R4-I8) (fe4b91807)
- fix(mcp): scope result continuations to tool grants and sessions (R4-I10) (38b1e822e)
- fix(uploads): run the projection worker without a security frame and deliver owner notifications through notify_owner (445c449c2)
- fix: preserve native result bounds and refresh selected model limits (528dd0e0b)
- fix: bound agent tool results and derive model checkpoint budgets (83caf17bc)
- fix(uploads): publish owner status through the Web Host contract (6d209ebdf)
- build: rebuild bundles from source (6c884fef9)
- chore: refresh locks to latest published dependencies (243b4bdff)
- Default module member requirements to platform Members (a05332552)
- Declare module access bundles and invalidate changed group sessions (602c31f9d)
- fix(security): reserve producer capabilities for module services (59bede7cd)
- fix(producers): restore published output capabilities (1830bf4d3)
- Preserve typed Uploads listing failures (57a45b178)
- Publish Uploads summaries through implementation-scoped runtime authority (777fc0b85)
- Run native PostgreSQL gates through isolated module targets (3ddb9c541)
- fix(uploads): restrict actor listings to declared upload types (d51eb9055)
- Honor shared components and align smoke checks with declared contracts (93b4e34dd)

## 0.1.65

Current published Hub version.

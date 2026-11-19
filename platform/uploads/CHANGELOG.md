# Changelog

## [0.3.31](https://github.com/kicksideai/kickside/compare/uploads-v0.3.30...uploads-v0.3.31) (2026-11-19)


### Features

* **uploads:** admit versioned provider attachments ([#695](https://github.com/kicksideai/kickside/issues/695)) ([4b3bbdc](https://github.com/kicksideai/kickside/commit/4b3bbdc98afa9a787e69a0ad194d9869a4455f62))

## [0.3.30](https://github.com/kicksideai/kickside/compare/uploads-v0.3.29...uploads-v0.3.30) (2026-11-19)


### Bug Fixes

* **uploads:** log upload creation persistence failures ([#687](https://github.com/kicksideai/kickside/issues/687)) ([17538f6](https://github.com/kicksideai/kickside/commit/17538f6fd6848a9d18f26c878788038f12c68f45))

## [0.3.29](https://github.com/kicksideai/kickside/compare/uploads-v0.3.28...uploads-v0.3.29) (2026-11-19)


### Bug Fixes

* **uploads:** reject invalid multipart completion tokens ([#659](https://github.com/kicksideai/kickside/issues/659)) ([61a1e2d](https://github.com/kicksideai/kickside/commit/61a1e2d8328e0a60cb99bf11c200241414dab742))

## [0.3.28](https://github.com/kicksideai/kickside/compare/uploads-v0.3.27...uploads-v0.3.28) (2026-11-19)


### Features

* **uploads:** enable progress deadlines for reporting pipelines ([#475](https://github.com/kicksideai/kickside/issues/475)) ([4ef4dbb](https://github.com/kicksideai/kickside/commit/4ef4dbb1f0aa21baa34d85a7005b5deeb6e427b6))


### Bug Fixes

* **uploads:** bound PostgreSQL checkpoint page reads ([#636](https://github.com/kicksideai/kickside/issues/636)) ([78a4ecc](https://github.com/kicksideai/kickside/commit/78a4ecc2ef8378b9676f60498122df0eba6ff481))

## [0.3.27](https://github.com/kicksideai/kickside/compare/uploads-v0.3.26...uploads-v0.3.27) (2026-11-19)


### Bug Fixes

* **jobs:** deliver terminal outcomes and preserve upload retry ([#474](https://github.com/kicksideai/kickside/issues/474)) ([d1e19d1](https://github.com/kicksideai/kickside/commit/d1e19d1666c659f61779c87e2e02f5a65782106d))
* **uploads:** require terminal outcome recovery dependencies ([#626](https://github.com/kicksideai/kickside/issues/626)) ([a53e39a](https://github.com/kicksideai/kickside/commit/a53e39ad5c8613dc45db69ba0e8d822c6846571c))

## [0.3.26](https://github.com/kicksideai/kickside/compare/uploads-v0.3.25...uploads-v0.3.26) (2026-11-19)


### Bug Fixes

* **uploads:** show filenames and reasons for request failures ([#555](https://github.com/kicksideai/kickside/issues/555)) ([ff314c8](https://github.com/kicksideai/kickside/commit/ff314c85467fcb86242dfa4ab9f49e53abeabbe5))
* **uploads:** surface every request failure with its file and reason ([#565](https://github.com/kicksideai/kickside/issues/565)) ([6a2ea3c](https://github.com/kicksideai/kickside/commit/6a2ea3c10428dfe3b201bfc1a2be0e50f2eed7d4))

## [0.3.25](https://github.com/kicksideai/kickside/compare/uploads-v0.3.24...uploads-v0.3.25) (2026-11-19)


### Bug Fixes

* **uploads:** keep TSV and text source uploads readable ([#554](https://github.com/kicksideai/kickside/issues/554)) ([3f265fa](https://github.com/kicksideai/kickside/commit/3f265fa80cd738eac07a037cbaebd7860549d9c1))

## [0.3.24](https://github.com/kicksideai/kickside/compare/uploads-v0.3.23...uploads-v0.3.24) (2026-11-19)


### Bug Fixes

* **uploads:** erase owner data without provisioning a user thread ([#573](https://github.com/kicksideai/kickside/issues/573)) ([33ae247](https://github.com/kicksideai/kickside/commit/33ae2472229d007c25e4620aca17b537766dbd67))

## [0.3.23](https://github.com/kicksideai/kickside/compare/uploads-v0.3.22...uploads-v0.3.23) (2026-11-19)


### Bug Fixes

* preserve text with long internal whitespace ([#563](https://github.com/kicksideai/kickside/issues/563)) ([80ea34c](https://github.com/kicksideai/kickside/commit/80ea34cd57e9bd053d2874c2f7c98625db05c2f7))

## [0.3.22](https://github.com/kicksideai/kickside/compare/uploads-v0.3.21...uploads-v0.3.22) (2026-11-19)


### Bug Fixes

* **models:** probe first-party OpenAI generation through Responses ([#559](https://github.com/kicksideai/kickside/issues/559)) ([2e3eea9](https://github.com/kicksideai/kickside/commit/2e3eea93c4eddae321e27f8b34f87ae9d28e2ca8))

## [0.3.21](https://github.com/kicksideai/kickside/compare/uploads-v0.3.20...uploads-v0.3.21) (2026-11-19)


### Bug Fixes

* keep secret operations in owning module frames ([#483](https://github.com/kicksideai/kickside/issues/483)) ([47f4f8a](https://github.com/kicksideai/kickside/commit/47f4f8af2dba69d4b8e818ab78530ec6fad12be9))
* **uploads:** bound and sanitize renderer diagnostics ([#502](https://github.com/kicksideai/kickside/issues/502)) ([e398270](https://github.com/kicksideai/kickside/commit/e398270a01f3d93c22a06dd57934231e275a144a))
* **uploads:** preserve artifact read causes ([#560](https://github.com/kicksideai/kickside/issues/560)) ([098314c](https://github.com/kicksideai/kickside/commit/098314c777b2a18964f4a40cde0722e0f80f6188))
* **uploads:** project a retried upload's new processing attempt ([#507](https://github.com/kicksideai/kickside/issues/507)) ([c0a5d29](https://github.com/kicksideai/kickside/commit/c0a5d2986e0bd3c5049494ee5690cca587646b72))

## [0.3.20](https://github.com/kicksideai/kickside/compare/uploads-v0.3.19...uploads-v0.3.20) (2026-11-16)


### Bug Fixes

* preserve web component host contracts and eager bundles ([8bfd86d](https://github.com/kicksideai/kickside/commit/8bfd86dded87eea2c40294be136af1a66ab25765))
* preserve web component host contracts and eager bundles ([b68bfa0](https://github.com/kicksideai/kickside/commit/b68bfa020b6f8ba97a0c37c9b5a955030617d37a))

## [0.3.19](https://github.com/kicksideai/kickside/compare/uploads-v0.3.18...uploads-v0.3.19) (2026-11-13)


### Bug Fixes

* **uploads:** keep the converter's retry classification on conversion failures ([#468](https://github.com/kicksideai/kickside/issues/468)) ([aef74a1](https://github.com/kicksideai/kickside/commit/aef74a1039e6d3808bb5ee6384f6d51b46b6b85a))

## [0.3.18](https://github.com/kicksideai/kickside/compare/uploads-v0.3.17...uploads-v0.3.18) (2026-11-13)


### Bug Fixes

* **execution:** declare maintenance actors exactly and authorize thread completion ([#459](https://github.com/kicksideai/kickside/issues/459)) ([c86999c](https://github.com/kicksideai/kickside/commit/c86999c76f99724bd7eab62924dcb3d931f3bee8))

## [0.3.17](https://github.com/kicksideai/kickside/compare/uploads-v0.3.16...uploads-v0.3.17) (2026-11-13)


### Features

* **uploads:** add an opt-in setting to OCR every document page ([#452](https://github.com/kicksideai/kickside/issues/452)) ([b778945](https://github.com/kicksideai/kickside/commit/b77894576ddeb3bd8b6cf23496a42d978f50f9e6))

## [0.3.16](https://github.com/kicksideai/kickside/compare/uploads-v0.3.15...uploads-v0.3.16) (2026-11-11)


### Features

* **uploads:** publish authorized revision-bound page images ([#429](https://github.com/kicksideai/kickside/issues/429)) ([ebec6f7](https://github.com/kicksideai/kickside/commit/ebec6f77eb79325dca349f2a1c9d44b2786c02cc))

## [0.3.15](https://github.com/kicksideai/kickside/compare/uploads-v0.3.14...uploads-v0.3.15) (2026-11-11)


### Bug Fixes

* **uploads:** expose and test HTTP deduplication responses ([#423](https://github.com/kicksideai/kickside/issues/423)) ([1812bc8](https://github.com/kicksideai/kickside/commit/1812bc86714bd3596e7fa8415eee8da5089b775f))

## [0.3.14](https://github.com/kicksideai/kickside/compare/uploads-v0.3.13...uploads-v0.3.14) (2026-11-10)


### Bug Fixes

* **uploads:** authorize component reference assignments ([#418](https://github.com/kicksideai/kickside/issues/418)) ([08e59ef](https://github.com/kicksideai/kickside/commit/08e59ef254be2cbf91114dba3d2072ac1920aeea))
* **uploads:** render sparse marked pages below the source-size threshold ([#409](https://github.com/kicksideai/kickside/issues/409)) ([ab9c255](https://github.com/kicksideai/kickside/commit/ab9c255dd42c54fadcdff41823d6670e6d51794e))
* **uploads:** report pages the rasterizer could not render ([#411](https://github.com/kicksideai/kickside/issues/411)) ([aca0978](https://github.com/kicksideai/kickside/commit/aca0978c97bd88ea56e449e59f331899e0d64118))
* **uploads:** resume completed stages across processing attempts ([#417](https://github.com/kicksideai/kickside/issues/417)) ([bff7b59](https://github.com/kicksideai/kickside/commit/bff7b59d42a00923081733f239d41df2c9680c27))

## [0.3.13](https://github.com/kicksideai/kickside/compare/uploads-v0.3.12...uploads-v0.3.13) (2026-11-10)


### Bug Fixes

* **uploads:** preserve sparse PDF pages through OCR ([#402](https://github.com/kicksideai/kickside/issues/402)) ([8c98fbe](https://github.com/kicksideai/kickside/commit/8c98fbe1482be90ad7303cf7edc78336975a2e7a))

## [0.3.12](https://github.com/kicksideai/kickside/compare/uploads-v0.3.11...uploads-v0.3.12) (2026-11-09)


### Bug Fixes

* **retention:** preserve owner cleanup progress and committed writes ([#389](https://github.com/kicksideai/kickside/issues/389)) ([63f0e85](https://github.com/kicksideai/kickside/commit/63f0e859a1fef74704365e4a8f511f8b159198d4))
* **uploads,transform:** use plain file labels and code guidance ([#379](https://github.com/kicksideai/kickside/issues/379)) ([d00fad0](https://github.com/kicksideai/kickside/commit/d00fad038decbad7cb0c4f6705e12d48d4fd4591))

## [0.3.11](https://github.com/kicksideai/kickside/compare/uploads-v0.3.10...uploads-v0.3.11) (2026-11-07)


### Bug Fixes

* **widgets:** follow deletion events without racing the delete job ([#337](https://github.com/kicksideai/kickside/issues/337)) ([fdd6984](https://github.com/kicksideai/kickside/commit/fdd6984188d6f35cdaf4e40cd0ac8b9cd08928bc))

## [0.3.10](https://github.com/kicksideai/kickside/compare/uploads-v0.3.9...uploads-v0.3.10) (2026-11-06)


### Features

* **inbox:** support file references with inline previews ([#173](https://github.com/kicksideai/kickside/issues/173)) ([2a19510](https://github.com/kicksideai/kickside/commit/2a195101fdf84e9246c5a39495d8fdbd3917c490))

## [0.3.9](https://github.com/kicksideai/kickside/compare/uploads-v0.3.8...uploads-v0.3.9) (2026-11-05)


### Features

* **uploads:** add trusted_reader library ([8c001b7](https://github.com/kicksideai/kickside/commit/8c001b705f54a5181452a67a3d85be673bbab8f8))
* **uploads:** keep caller metadata and fetched file facts on attachment ingest ([3993702](https://github.com/kicksideai/kickside/commit/39937029dfcc671f9b85fad1515372dcfb197685))
* **uploads:** trusted reader and caller metadata on attachment ingest (ATN-98) ([3f7a958](https://github.com/kicksideai/kickside/commit/3f7a958ccfdd28170e1f39fa356445254478b83c))


### Bug Fixes

* **uploads:** find the original image of an image upload in trusted_reader ([d685224](https://github.com/kicksideai/kickside/commit/d685224889e493f882fe90d0d9a298fa0473effc))
* **uploads:** harden attachment metadata, text limits and token replay ([d387676](https://github.com/kicksideai/kickside/commit/d38767697056d3144181c80f0bff797022aa222f))
* **uploads:** isolate concurrent blob writes and keep typed ingest errors ([f5e7b12](https://github.com/kicksideai/kickside/commit/f5e7b12b3d65bb27fc8254b1c43dfaecd4b4acb7))
* **uploads:** isolate concurrent blob writes and preserve ingest errors ([ded65bc](https://github.com/kicksideai/kickside/commit/ded65bc25fb852d4d0bea8c1c9c7491e4f658499))
* **uploads:** return the uploader's metadata from trusted_reader provenance ([94e7b08](https://github.com/kicksideai/kickside/commit/94e7b082208c571e47e1de944e78e1f59f1e12aa))
* **uploads:** trim whitespace without the anchored pattern on large text ([e8abea7](https://github.com/kicksideai/kickside/commit/e8abea7527af8e4210936e29d0a4c584d5f7cba0))

## [0.3.8](https://github.com/kicksideai/kickside/compare/uploads-v0.3.7...uploads-v0.3.8) (2026-10-30)


### Bug Fixes

* bound upload invalidation reads in file surfaces ([#269](https://github.com/kicksideai/kickside/issues/269)) ([6a90ddf](https://github.com/kicksideai/kickside/commit/6a90ddf86b813f273b1b0bf1609084c453764ecf))

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

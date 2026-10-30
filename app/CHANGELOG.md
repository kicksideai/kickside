# Changelog

## [0.2.28](https://github.com/kicksideai/kickside/compare/kickside-v0.2.27...kickside-v0.2.28) (2026-10-30)


### Bug Fixes

* **knowledge:** return nested views to their previous route ([#209](https://github.com/kicksideai/kickside/issues/209)) ([c62888e](https://github.com/kicksideai/kickside/commit/c62888e42bb0008e6fd512b86145653e2f835635))

## [0.2.27](https://github.com/kicksideai/kickside/compare/kickside-v0.2.26...kickside-v0.2.27) (2026-10-30)


### Bug Fixes

* **app:** remove the retired run-as validator and require Security 0.2.20 ([#243](https://github.com/kicksideai/kickside/issues/243)) ([8afbc98](https://github.com/kicksideai/kickside/commit/8afbc9850d3af3064baed5bdaf5ba738b32cff31))

## [0.2.26](https://github.com/kicksideai/kickside/compare/kickside-v0.2.25...kickside-v0.2.26) (2026-10-29)


### Bug Fixes

* **app:** require repaired security and update dependencies ([#238](https://github.com/kicksideai/kickside/issues/238)) ([c7966a4](https://github.com/kicksideai/kickside/commit/c7966a4b271157e544fb5c6251ae289c35f0717e))
* **release:** publish companion artifacts before the application ([#235](https://github.com/kicksideai/kickside/issues/235)) ([f489bbd](https://github.com/kicksideai/kickside/commit/f489bbde8e55aae216c30d82a15631659197dcbd))

## [0.2.25](https://github.com/kicksideai/kickside/compare/kickside-v0.2.24...kickside-v0.2.25) (2026-10-29)


### Bug Fixes

* **app:** allow canonical usage tracking for signed-in sessions ([#223](https://github.com/kicksideai/kickside/issues/223)) ([aef425c](https://github.com/kicksideai/kickside/commit/aef425c8d732615dcbfeb19e29c1b98074f16459))
* **app:** keep overflowing navigation and account menus usable ([#217](https://github.com/kicksideai/kickside/issues/217)) ([1d9c3c4](https://github.com/kicksideai/kickside/commit/1d9c3c4c2873c36c57be4ddba559557cba60351e))
* **app:** limit chat flap clicks to the visible tab ([#203](https://github.com/kicksideai/kickside/issues/203)) ([59cdc12](https://github.com/kicksideai/kickside/commit/59cdc12044d771ead56f529aeac011264314d900))
* preserve composed scopes across chat and Inbox review ([#220](https://github.com/kicksideai/kickside/issues/220)) ([8c16715](https://github.com/kicksideai/kickside/commit/8c167155d4f77d81948b3148284d1f0bd34f30c2))
* **release:** require companion artifacts before application publication ([#224](https://github.com/kicksideai/kickside/issues/224)) ([f76687b](https://github.com/kicksideai/kickside/commit/f76687bf122da7a913e1bfb5bc2402b8b6ca8d54))

## [0.2.24](https://github.com/kicksideai/kickside/compare/kickside-v0.2.23...kickside-v0.2.24) (2026-10-28)


### Bug Fixes

* **app:** require deferred sharing continuity in Users ([d09914e](https://github.com/kicksideai/kickside/commit/d09914efe05fc7057679cec19666a5a33d3c718d))
* consolidate default account roles ([aafe19c](https://github.com/kicksideai/kickside/commit/aafe19cd2ac7d58ed04f4d035cef91995eab8dce))
* consolidate default account roles ([02b9f4b](https://github.com/kicksideai/kickside/commit/02b9f4bc47efb852b9f20c2f08edebb9c6d28972))
* **ui:** derive primary action contrast ([#190](https://github.com/kicksideai/kickside/issues/190)) ([30058be](https://github.com/kicksideai/kickside/commit/30058be3701af2b5c6e9a47af1b111db22538f90))
* **users:** preserve deferred sharing after role consolidation ([102c926](https://github.com/kicksideai/kickside/commit/102c926b2bea879ab25cbf540c364bb7579e7394))

## [0.2.23](https://github.com/kicksideai/kickside/compare/kickside-v0.2.22...kickside-v0.2.23) (2026-10-28)


### Features

* **settings:** support shared picker value controls ([#177](https://github.com/kicksideai/kickside/issues/177)) ([8a883eb](https://github.com/kicksideai/kickside/commit/8a883eb7122f80e24c09c9f0ebce0f3b68cf4ced))


### Bug Fixes

* **app:** keep hosted surface controls clear of the chat handle ([#172](https://github.com/kicksideai/kickside/issues/172)) ([2c074da](https://github.com/kicksideai/kickside/commit/2c074da2adc3a97072043647aa800e535a9eec45))

## [0.2.22](https://github.com/kicksideai/kickside/compare/kickside-v0.2.21...kickside-v0.2.22) (2026-10-28)


### Bug Fixes

* **app:** check page stylesheet fonts before release ([#166](https://github.com/kicksideai/kickside/issues/166)) ([4812e02](https://github.com/kicksideai/kickside/commit/4812e020e47d4a9b590060e83b3319b2a63a6e27))
* **security:** resolve live scopes through Security-owned projections ([adad7ee](https://github.com/kicksideai/kickside/commit/adad7ee499f7dfbd1134c57c06368aa440a0ab07))

## [0.2.21](https://github.com/kicksideai/kickside/compare/kickside-v0.2.20...kickside-v0.2.21) (2026-10-23)


### Bug Fixes

* **app:** build and verify complete release packages ([#119](https://github.com/kicksideai/kickside/issues/119)) ([277f2b0](https://github.com/kicksideai/kickside/commit/277f2b0455bf68bc81187228e90dd1b54e42af70))

## [0.2.20](https://github.com/kicksideai/kickside/compare/kickside-v0.2.19...kickside-v0.2.20) (2026-10-23)


### Bug Fixes

* **automation:** delegate repair checkpoints to migration framework ([#114](https://github.com/kicksideai/kickside/issues/114)) ([de7b929](https://github.com/kicksideai/kickside/commit/de7b929b98da72bacf5d63ce031d6c628ae40c3f))
* **automation:** require the published tool-action contract ([#117](https://github.com/kicksideai/kickside/issues/117)) ([aa4589c](https://github.com/kicksideai/kickside/commit/aa4589cc2873628ba2bf9494bce90b38755c261c))
* **core:** require Jobs lock ordering for projection completion ([#116](https://github.com/kicksideai/kickside/issues/116)) ([80d8ce9](https://github.com/kicksideai/kickside/commit/80d8ce992efe2dc435c0364ef40ce10a75489a41))

## [0.2.19](https://github.com/kicksideai/kickside/compare/kickside-v0.2.18...kickside-v0.2.19) (2026-10-22)


### Bug Fixes

* **app:** restore dark tab highlights and separators ([48794e1](https://github.com/kicksideai/kickside/commit/48794e1dfc238126f3fb7ebf019587df51bbac6f))
* **app:** route host chat intents to the application chat ([11a4921](https://github.com/kicksideai/kickside/commit/11a4921f6ca31095e37d37e2222aeca9728737a6))
* **inbox:** derive review titles and prefill editable drafts ([674ac87](https://github.com/kicksideai/kickside/commit/674ac877dd57bb38d97cb67a5a0a9fd7ddc6de73))
* **settings:** use the published content radius token ([1560a1a](https://github.com/kicksideai/kickside/commit/1560a1a2e259d821d72c85fac8ed877050783637))
* **uploads:** preserve completion checkpoints and redact structured diagnostics ([518920e](https://github.com/kicksideai/kickside/commit/518920e63ef6f512949da0d0b79cf9cd7a03a161))

## [0.2.18](https://github.com/kicksideai/kickside/compare/kickside-v0.2.17...kickside-v0.2.18) (2026-10-21)


### Features

* **connection:** support native productivity provider adapters ([#43](https://github.com/kicksideai/kickside/issues/43)) ([1efcf58](https://github.com/kicksideai/kickside/commit/1efcf58af4a637bde446dcf2902ece5eb866c90c))


### Bug Fixes

* **workflows:** preserve empty objects in block catalog schemas ([#40](https://github.com/kicksideai/kickside/issues/40)) ([1d0b93b](https://github.com/kicksideai/kickside/commit/1d0b93bd85c835fdb2926b0a19f18be9d563b4e6))

## [0.2.17](https://github.com/kicksideai/kickside/compare/kickside-v0.2.16...kickside-v0.2.17) (2026-10-20)


### Features

* **oauth:** support resource-specific provider options and issuer validation ([#37](https://github.com/kicksideai/kickside/issues/37)) ([fb172f1](https://github.com/kicksideai/kickside/commit/fb172f15dcc32688a520f2b90476a7374efc0121))

## 0.2.16 (2026-10-19)

- The external-agent setup step issues an MCP client config with `"type": "http"`, so clients such as Claude Code load the pasted config.
- Refresh the application lock and the page app build inputs (`kickside/ui-kit` 1.5.7) to published releases.

## 0.2.15 (2026-10-17)

- Refresh published module dependencies, packaged documentation and application assets.

## 0.2.14 (2026-10-16)

- Include the developer handbook sources and refresh the application lock to published module releases.

## 0.2.11 (2026-10-13)

- Compose equivalent baseline runtime permissions into fewer policies and retain every legacy policy identity and rule.

## 0.2.4 (2026-10-09)

- Resolve the final wave dependencies, including Transform 0.1.46 and Automation 0.1.126.
- Install the verified module releases for authority preservation, durable capacity, native errors and command recovery.

## 0.2.3 (2026-10-08)

- Declares the Cloud deployment descriptors as string literals so Hub planning accepts their defaults (48ea59c5f).
- Resolves the security harness mcp-client dependency from its locked release.

## 0.2.2 (2026-10-08)

- Packages the built workspace application and rejects missing declared frontend entry points.

## 0.2.1 (2026-10-08)

- Restores every published runtime profile, including quickstart, SQLite and the larger PostgreSQL profiles.

## 0.2.0 (2026-10-08)

- docs(core): align handbook promises with current ownership and lifecycle (5fca9cd46)
- test(app): classify product endpoint authority from router declarations (1b8ab8506)
- fix: bound agent tool results and derive model checkpoint budgets (83caf17bc)
- chore: refresh locks to latest published dependencies (1b18de0ef)
- Deliver scope reconcile, OAuth, upload and profile signals under service identities (90ce38da7)
- Deliver cursor waiter signals and thread updates under the threads identity (3ce46fb93)
- build: rebuild bundles from source (6c884fef9)
- chore: refresh locks to latest published dependencies (243b4bdff)
- Remove session token-data rewrite; access expansions keep sessions, new access arrives at next login (d4c5e888d)
- Render System only for accounts whose navigation lists it (fa4360c95)
- Say System is not available to accounts without the System capability (060f7c126)
- Complete Users management: scoped System tabs, scope catalog and declared memberships (829cb91b7)
- Gate System navigation and settings tabs by their declared capabilities (c39276bbe)
- Preserve member tokens and refresh native grants on access expansions (9980e8ede)
- Declare selectable Users management and gate shell contributions by capability (ffc32f170)
- Declare chat agent selection and asynchronous jobs as signed-in core capabilities (aadf4557f)
- Exercise module groups with native policy projection and fresh harness bindings (836de5e03)
- Default module member requirements to platform Members (a05332552)
- fix: preserve the app branding filesystem across upgrades (774791dbb)
- build: refresh the app shell ui-kit resolution (fd93514d5)
- Keep thread output publication outside human administration (8844d4041)
- Disambiguate core and module security requirement bindings (4844627ac)
- Verify full catalogue default access and document optional capabilities (0085a27c7)
- Verify named group sets across module boundaries and published bindings (ae6c7fc74)
- Resolve composed login groups and retain core shell admission (ae828d962)
- Compose application module groups and exercise scoped access (016053b35)
- fix(app): preserve published history, catalog and deployment inputs (7f36dbe8b)
- fix(ui): retain the published branding filesystem by default (fd718dc93)
- Integrate Studio onboarding and focused browser acceptance (c9809a37c)
- Bind Self Reflection discovery to host scopes and execute native cases (383d6465d)
- fix(mcp): declare scoped automation capabilities and prove credential lifecycles (398dc7b32)
- Keep cluster name and directory read authority in owning modules (97da56fd2)
- fix(app): resolve published Keeper requirement ownership in the application graph (58da70002)
- fix(app): preserve locked validation and publish PostgreSQL profile (088d9b547)
- fix(app): complete registry documentation retirement across declarations (2b18e6bc0)
- docs(app): remove retired registry catalog RFC source (cfdc2a4c1)
- fix(app): validate built application assets before release packaging (d0922f255)
- fix(frontend): consolidate retained rollout styles and sticky layer (884ee6454)
- fix(cluster): scope durable actor ownership and retain standby contenders (1ec81dcb0)
- Name allowed parents in the placement message instead of an error-details array (c043da717)
- feat(component): enforce declarative placement rules (8b6f8e9d4)
- Require explicit content type for text artifacts (246114bf8)
- Check component context subject expectations under the row lock (1ea34411c)
- Add subject-scoped expectations to thread appends (b3d8315ac)
- Point conflict detection at component-owned stores, not thread appends (beaf39232)
- Describe component.update without the removed compare-and-set (5aff67688)
- Bind Keeper MCP authentication to live Users groups (7a2c5c9e6)
- Merge main and keep the splash presentation test precondition explicit (b61f4e9c6)
- Keep active splash mounted until its completion intent finishes (b71c692e0)
- Add dialog presentation for optional splash onboarding (7ef530a46)
- fix(core): grant host administrators Lifecycle sharing controls (398697f14)
- Honor shared components and align smoke checks with declared contracts (93b4e34dd)

## 0.1.143

Current published Hub version.

# Changelog

## [0.1.48](https://github.com/kicksideai/kickside/compare/skills-v0.1.47...skills-v0.1.48) (2026-11-09)


### Bug Fixes

* read deletion progress from authorized lists ([#376](https://github.com/kicksideai/kickside/issues/376)) ([302fb90](https://github.com/kicksideai/kickside/commit/302fb90cd777cdf54b3565090b428bfcd8a9f67e))

## [0.1.47](https://github.com/kicksideai/kickside/compare/skills-v0.1.46...skills-v0.1.47) (2026-11-07)


### Bug Fixes

* plain-text inbox previews; clear list errors after deletion; ship shared widget styles ([#346](https://github.com/kicksideai/kickside/issues/346)) ([2e72d66](https://github.com/kicksideai/kickside/commit/2e72d66e4b4c838d2aa792d810014ae9931ccb54))

## [0.1.46](https://github.com/kicksideai/kickside/compare/skills-v0.1.45...skills-v0.1.46) (2026-11-07)


### Bug Fixes

* carry the component deletion receipt through thread, skill, webhook, workflow and agent deletes ([#341](https://github.com/kicksideai/kickside/issues/341)) ([98e9d03](https://github.com/kicksideai/kickside/commit/98e9d03b522828d63b284dff4174ef7543bef2cb))

## [0.1.45](https://github.com/kicksideai/kickside/compare/skills-v0.1.44...skills-v0.1.45) (2026-11-07)


### Bug Fixes

* **widgets:** follow deletion events without racing the delete job ([#337](https://github.com/kicksideai/kickside/issues/337)) ([fdd6984](https://github.com/kicksideai/kickside/commit/fdd6984188d6f35cdaf4e40cd0ac8b9cd08928bc))

## [0.1.44](https://github.com/kicksideai/kickside/compare/skills-v0.1.43...skills-v0.1.44) (2026-11-05)


### Bug Fixes

* align consumer gates with asynchronous component deletion ([380f092](https://github.com/kicksideai/kickside/commit/380f092413fdaf4a5bdefaa8ce59fdd959f40202))
* **component:** expose asynchronous deletion progress ([e4ca4b7](https://github.com/kicksideai/kickside/commit/e4ca4b7ab5185ecc6ecf83b336ca3e6edf5aca6e))
* **component:** run deletion cleanup through Jobs ([da3f7ae](https://github.com/kicksideai/kickside/commit/da3f7aee8dce4136a65d1c94bda6604820bc8355))
* **component:** simplify deletion waiting and committed delivery ([584eae6](https://github.com/kicksideai/kickside/commit/584eae6145e5e9b4ea36bdbd6527ffe376e9f7fe))
* preserve deletion view state and bind notification authority ([2ea5cf1](https://github.com/kicksideai/kickside/commit/2ea5cf1a31352ba4ba1915daeca384d06d2e7b70))
* **widgets:** keep accepted deletion state across pages ([62c8e18](https://github.com/kicksideai/kickside/commit/62c8e181b0e1b60d0c3c6a80f6f9585dac6ef7cb))
* **widgets:** preserve deletion progress across refreshes ([cd607e1](https://github.com/kicksideai/kickside/commit/cd607e14462b8421d092612cb62dce73e57f5ed8))

## 0.1.43 (2026-10-17)

- Remove retired retention metadata and refresh packaged documentation.

## 0.1.40 (2026-10-09)

- Preserve native Component validation failures and service error metadata (cb9e09252)
- Build frontend assets with the current published UI Kit stylesheet.

## 0.1.39 (2026-10-08)

- fix: bound agent tool results and derive model checkpoint budgets (83caf17bc)
- build: rebuild bundles from source (6c884fef9)
- chore: refresh locks to latest published dependencies (243b4bdff)
- test: guard skill file routing and binary downloads (75ec0bbba)
- fix: view and download versioned skill bundle files (67bec369b)
- Return the version file manifest with a skill (6a5318b11)
- Resolve the build-time ui-kit input at its latest release (47a764f8c)
- Gate published updates and preserve UI logos and skill bundles (f5c289281)
- Declare module access bundles and invalidate changed group sessions (602c31f9d)
- fix(producers): retain optional module event capabilities (65a6e1042)
- Run native PostgreSQL gates through isolated module targets (3ddb9c541)
- Store skill bundle bytes in the injected filesystem (07b3715dc)
- fix(skills): preserve error kinds across HTTP and tool calls (745efe743)

## 0.1.37

Current published Hub version.

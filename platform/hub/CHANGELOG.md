# Changelog

## [0.1.69](https://github.com/kicksideai/kickside/compare/hub-v0.1.68...hub-v0.1.69) (2026-10-28)


### Bug Fixes

* **hub:** retain scans for current plan artifacts ([#189](https://github.com/kicksideai/kickside/issues/189)) ([2800797](https://github.com/kicksideai/kickside/commit/2800797a860a01057ae91413e395b61963450c14))
* **hub:** show loading throughout initial module discovery ([#199](https://github.com/kicksideai/kickside/issues/199)) ([e30a0b0](https://github.com/kicksideai/kickside/commit/e30a0b00036f7a31e5c2866e9ad6c8c626faeddb))

## [0.1.68](https://github.com/kicksideai/kickside/compare/hub-v0.1.67...hub-v0.1.68) (2026-10-28)


### Bug Fixes

* **hub:** preflight all module updates as one batch ([#167](https://github.com/kicksideai/kickside/issues/167)) ([dff3e0a](https://github.com/kicksideai/kickside/commit/dff3e0a6c7963d2f1a2441171de44097d6d13da5))

## [0.1.67](https://github.com/kicksideai/kickside/compare/hub-v0.1.66...hub-v0.1.67) (2026-10-26)


### Bug Fixes

* **hub:** require released sequential-update planner ([0e7d001](https://github.com/kicksideai/kickside/commit/0e7d00102e5ae272ae8d5cfdf918af4304ea584b))
* **hub:** update modules one by one in dependency order ([98e5a49](https://github.com/kicksideai/kickside/commit/98e5a496080ea62e893d321d1a7b6214e6c3330f))

## [0.1.66](https://github.com/kicksideai/kickside/compare/hub-v0.1.65...hub-v0.1.66) (2026-10-25)


### Bug Fixes

* **hub:** require typed recommender completion ([#145](https://github.com/kicksideai/kickside/issues/145)) ([b93bc77](https://github.com/kicksideai/kickside/commit/b93bc77a6f2835548592816a8e46591e7d72bbb1))
* **hub:** resolve shared widget dependencies in clean builds ([#150](https://github.com/kicksideai/kickside/issues/150)) ([38ee765](https://github.com/kicksideai/kickside/commit/38ee7655adbce4ae32486381ccbf2e5ba7171e2c))

## [0.1.65](https://github.com/kicksideai/kickside/compare/hub-v0.1.64...hub-v0.1.65) (2026-10-23)


### Bug Fixes

* **hub:** display readable custom license references ([#118](https://github.com/kicksideai/kickside/issues/118)) ([252820d](https://github.com/kicksideai/kickside/commit/252820d476db7b6d9344e6c50bd1778d9ecf5b1b))

## [0.1.64](https://github.com/kicksideai/kickside/compare/hub-v0.1.63...hub-v0.1.64) (2026-10-22)


### Bug Fixes

* **hub:** resolve destinations for transitive module updates ([65ad359](https://github.com/kicksideai/kickside/commit/65ad359b52a1f1b0c0d79cdeb696e22394e99274))

## 0.1.63 (2026-10-17)

- Refresh packaged module descriptions and documentation.

## 0.1.59 (2026-10-09)

- Build frontend assets with the current published UI Kit stylesheet.

## 0.1.58 (2026-10-08)

- fix(hub): retain private catalog membership across search results (c757c7e7a)
- fix: preserve native result bounds and refresh selected model limits (528dd0e0b)
- fix: bound agent tool results and derive model checkpoint budgets (83caf17bc)
- build: rebuild bundles from source (6c884fef9)
- chore: refresh locks to latest published dependencies (243b4bdff)
- Complete Users management: scoped System tabs, scope catalog and declared memberships (829cb91b7)
- Complete module policies for SSO and dynamic scope resources (a694563bf)
- Declare module access bundles and invalidate changed group sessions (602c31f9d)
- Refresh Hub harness dependencies through configurable local replacements (b873cd15e)
- Verify module-declared required setup before installation completes (6f3354b94)
- Run native PostgreSQL gates through isolated module targets (3ddb9c541)
- fix(hub): retry refused root updates as a complete batch (7810055d9)
- Honor shared components and align smoke checks with declared contracts (93b4e34dd)

## 0.1.57

Current published Hub version.

# Changelog

## [0.1.40](https://github.com/kicksideai/kickside/compare/webhooks-v0.1.39...webhooks-v0.1.40) (2026-11-05)


### Bug Fixes

* **component:** expose asynchronous deletion progress ([e4ca4b7](https://github.com/kicksideai/kickside/commit/e4ca4b7ab5185ecc6ecf83b336ca3e6edf5aca6e))
* **component:** run deletion cleanup through Jobs ([da3f7ae](https://github.com/kicksideai/kickside/commit/da3f7aee8dce4136a65d1c94bda6604820bc8355))
* **component:** simplify deletion waiting and committed delivery ([584eae6](https://github.com/kicksideai/kickside/commit/584eae6145e5e9b4ea36bdbd6527ffe376e9f7fe))
* preserve deletion view state and bind notification authority ([2ea5cf1](https://github.com/kicksideai/kickside/commit/2ea5cf1a31352ba4ba1915daeca384d06d2e7b70))
* **widgets:** keep accepted deletion state across pages ([62c8e18](https://github.com/kicksideai/kickside/commit/62c8e181b0e1b60d0c3c6a80f6f9585dac6ef7cb))
* **widgets:** preserve deletion progress across refreshes ([cd607e1](https://github.com/kicksideai/kickside/commit/cd607e14462b8421d092612cb62dce73e57f5ed8))

## 0.1.36 (2026-10-09)

- Build frontend assets with the current published UI Kit stylesheet.

## 0.1.35 (2026-10-08)

- build: rebuild bundles from source (6c884fef9)
- chore: refresh locks to latest published dependencies (243b4bdff)
- Complete Users management: scoped System tabs, scope catalog and declared memberships (829cb91b7)
- Declare module access bundles and invalidate changed group sessions (602c31f9d)
- fix(producers): retain optional module event capabilities (65a6e1042)
- Run native PostgreSQL gates through isolated module targets (3ddb9c541)
- fix(sync): validate mappings against selected source payload schemas (eb00502df)
- Centralize webhook access gates and preserve typed management errors (b3e776675)
- Honor shared webhook access and align smoke flows with declared contracts (89359d612)

## 0.1.33

Current published Hub version.

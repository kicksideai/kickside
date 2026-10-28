# Changelog

## [0.1.88](https://github.com/kicksideai/kickside/compare/sync-v0.1.87...sync-v0.1.88) (2026-10-28)


### Bug Fixes

* **sync:** preserve preparation errors across function calls ([#181](https://github.com/kicksideai/kickside/issues/181)) ([7daae2f](https://github.com/kicksideai/kickside/commit/7daae2ff86cf35f0d20141dbe9f3641af3bba2a6))
* **sync:** stop automatic retries of missing prepared results ([#182](https://github.com/kicksideai/kickside/issues/182)) ([fcea5be](https://github.com/kicksideai/kickside/commit/fcea5bee10b4be7134962d9301beb7db0ccca5df))

## [0.1.87](https://github.com/kicksideai/kickside/compare/sync-v0.1.86...sync-v0.1.87) (2026-10-28)


### Bug Fixes

* **security:** preserve scope APIs through staged upgrades ([03c8fe8](https://github.com/kicksideai/kickside/commit/03c8fe8c14b79a8cb31cc9c37b2b2f3854a86e68))
* **sync:** allow editing legacy syncs without reconcile flag ([#174](https://github.com/kicksideai/kickside/issues/174)) ([bf72f38](https://github.com/kicksideai/kickside/commit/bf72f38dedaa7b2300615de190008f0fc6b38638))

## [0.1.86](https://github.com/kicksideai/kickside/compare/sync-v0.1.85...sync-v0.1.86) (2026-10-23)


### Bug Fixes

* **automation:** restrict authority-bearing edits to the execution subject ([#68](https://github.com/kicksideai/kickside/issues/68)) ([aed8ab5](https://github.com/kicksideai/kickside/commit/aed8ab5ec044ff0cbe8fb1962a8c7caa44bd88b1))

## [0.1.85](https://github.com/kicksideai/kickside/compare/sync-v0.1.84...sync-v0.1.85) (2026-10-22)


### Bug Fixes

* **uploads:** preserve completion checkpoints and redact structured diagnostics ([518920e](https://github.com/kicksideai/kickside/commit/518920e63ef6f512949da0d0b79cf9cd7a03a161))

## [0.1.84](https://github.com/kicksideai/kickside/compare/sync-v0.1.83...sync-v0.1.84) (2026-10-20)


### Bug Fixes

* honor agent picker configuration in data syncs ([#29](https://github.com/kicksideai/kickside/issues/29)) ([8764097](https://github.com/kicksideai/kickside/commit/87640977328f797c127bb54c40c6c6194a7fd188))

## 0.1.83 (2026-10-17)

- Supply source samples as Transform items for generation and validation.

## 0.1.82 (2026-10-17)

- Provide real source samples and the selected source schema to Transform generation and validation.

## 0.1.81 (2026-10-17)

- Settle explicit transform skips without sink writes or delivery failures.

## 0.1.77 (2026-10-09)

- Preserve native normalization failures through strategy and installation boundaries.

## 0.1.76 (2026-10-09)

- Enforce the shared durable connection capacity floor (7331b32c7)
- Refresh transform resource grants before each call (ec076c6ca)
- Refresh live authority before each automation effect (b4c0b95df)
- Build frontend assets with the current published UI Kit stylesheet.

## 0.1.75 (2026-10-08)

- build: rebuild bundles from source (6c884fef9)
- chore: refresh locks to latest published dependencies (243b4bdff)
- Declare module access bundles and invalidate changed group sessions (602c31f9d)
- Run native PostgreSQL gates through isolated module targets (3ddb9c541)
- Resolve source identity before Sync schema validation (65cab07af)
- Keep shared catalog picker options within the viewport (a8c8db7b5)
- fix(sync): validate mappings against selected source payload schemas (eb00502df)

## 0.1.73

Current published Hub version.

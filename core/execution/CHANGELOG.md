# Changelog

## [0.2.6](https://github.com/kicksideai/kickside/compare/execution-v0.2.5...execution-v0.2.6) (2026-10-22)


### Bug Fixes

* return typed execution construction failures ([#73](https://github.com/kicksideai/kickside/issues/73)) ([1219db2](https://github.com/kicksideai/kickside/commit/1219db2e21623b8e578c2fb4bafe2bc199ea1968))
* **uploads:** preserve completion checkpoints and redact structured diagnostics ([518920e](https://github.com/kicksideai/kickside/commit/518920e63ef6f512949da0d0b79cf9cd7a03a161))

## 0.2.5 (2026-10-17)

- Refresh packaged module descriptions and documentation.

## 0.2.1 (2026-10-09)

- fix(mcp): retain issuing authority and revoke reduced delegations (fd9953e90)
- Preserve native Execution validation errors and migrate trace consumers (5fda907df)

## 0.2.0 (2026-10-08)

- fix(execution): preserve all correlation token parts across codec boundaries (c28217f2e)
- docs(execution): keep principal validation comment with its function (871fd8523)
- fix: evaluate deferred delegation in live authorizer scope (9671d4ed6)
- fix: retain admitted execution identity restrictions (fe4935016)
- fix: authorize declared principals without actor construction (28d53869a)
- Declare module access bundles and invalidate changed group sessions (602c31f9d)
- feat: compose execution scopes from live group memberships (60bc8cf06)
- Run native PostgreSQL gates through isolated module targets (3ddb9c541)
- fix(execution): retain live owner groups for MCP credentials (7d6d892d4)

## 0.1.34

Current published Hub version.

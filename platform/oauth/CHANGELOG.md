# Changelog

## [0.1.41](https://github.com/kicksideai/kickside/compare/oauth-v0.1.40...oauth-v0.1.41) (2026-10-26)


### Bug Fixes

* **oauth:** complete cleanup when the connection row is already gone ([c4dc409](https://github.com/kicksideai/kickside/commit/c4dc409367add2ecd932a37e775648c4fe53b557))
* **oauth:** complete orphaned connection teardown ([160e05b](https://github.com/kicksideai/kickside/commit/160e05b5c069c253d5a4ea7920798f1979fe2eb9))

## [0.1.40](https://github.com/kicksideai/kickside/compare/oauth-v0.1.39...oauth-v0.1.40) (2026-10-22)


### Bug Fixes

* **oauth:** authorize runtime config and await callback readiness ([#89](https://github.com/kicksideai/kickside/issues/89)) ([54f96c6](https://github.com/kicksideai/kickside/commit/54f96c60e9ed316e9a87a80baad1c6222afbab26))
* **uploads:** preserve completion checkpoints and redact structured diagnostics ([518920e](https://github.com/kicksideai/kickside/commit/518920e63ef6f512949da0d0b79cf9cd7a03a161))

## [0.1.39](https://github.com/kicksideai/kickside/compare/oauth-v0.1.38...oauth-v0.1.39) (2026-10-21)


### Features

* **connection:** support native productivity provider adapters ([#43](https://github.com/kicksideai/kickside/issues/43)) ([1efcf58](https://github.com/kicksideai/kickside/commit/1efcf58af4a637bde446dcf2902ece5eb866c90c))

## [0.1.38](https://github.com/kicksideai/kickside/compare/oauth-v0.1.37...oauth-v0.1.38) (2026-10-20)


### Features

* **oauth:** support resource-specific provider options and issuer validation ([#37](https://github.com/kicksideai/kickside/issues/37)) ([fb172f1](https://github.com/kicksideai/kickside/commit/fb172f15dcc32688a520f2b90476a7374efc0121))

## 0.1.33 (2026-10-08)

- Deliver scope reconcile, OAuth, upload and profile signals under service identities (90ce38da7)
- Default module member requirements to platform Members (a05332552)
- Declare module access bundles and invalidate changed group sessions (602c31f9d)
- fix(http): retain published error library identities (ae7ddc9be)
- Run native PostgreSQL gates through isolated module targets (3ddb9c541)
- Reply to OAuth callbacks while preserving release and delivery errors (6be0da039)
- Preserve OAuth token input extensions and exact deadline assertions (1c9201c52)
- fix(cluster): scope durable actor ownership and retain standby contenders (1ec81dcb0)
- fix(oauth): honor offline grants and preserve automatic renewal (EE2-2445) (16fbe4248)

## 0.1.31

Current published Hub version.

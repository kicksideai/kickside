# Changelog

## [0.2.10](https://github.com/kicksideai/kickside/compare/channel-v0.2.9...channel-v0.2.10) (2026-11-13)


### Bug Fixes

* **execution:** declare maintenance actors exactly and authorize thread completion ([#459](https://github.com/kicksideai/kickside/issues/459)) ([c86999c](https://github.com/kicksideai/kickside/commit/c86999c76f99724bd7eab62924dcb3d931f3bee8))

## [0.2.9](https://github.com/kicksideai/kickside/compare/channel-v0.2.8...channel-v0.2.9) (2026-11-09)


### Bug Fixes

* **retention:** preserve owner cleanup progress and committed writes ([#389](https://github.com/kicksideai/kickside/issues/389)) ([63f0e85](https://github.com/kicksideai/kickside/commit/63f0e859a1fef74704365e4a8f511f8b159198d4))

## [0.2.8](https://github.com/kicksideai/kickside/compare/channel-v0.2.7...channel-v0.2.8) (2026-11-07)


### Bug Fixes

* plain-text inbox previews; clear list errors after deletion; ship shared widget styles ([#346](https://github.com/kicksideai/kickside/issues/346)) ([2e72d66](https://github.com/kicksideai/kickside/commit/2e72d66e4b4c838d2aa792d810014ae9931ccb54))

## [0.2.7](https://github.com/kicksideai/kickside/compare/channel-v0.2.6...channel-v0.2.7) (2026-11-05)


### Bug Fixes

* **channel:** finish responder-owned cleanup before unregister ([f34d810](https://github.com/kicksideai/kickside/commit/f34d810df66481ce1a0ca2aecc9ff00f2e37f87f))
* **component:** run deletion cleanup through Jobs ([da3f7ae](https://github.com/kicksideai/kickside/commit/da3f7aee8dce4136a65d1c94bda6604820bc8355))

## [0.2.6](https://github.com/kicksideai/kickside/compare/channel-v0.2.5...channel-v0.2.6) (2026-10-28)


### Bug Fixes

* **security:** resolve live scopes through Security-owned projections ([adad7ee](https://github.com/kicksideai/kickside/commit/adad7ee499f7dfbd1134c57c06368aa440a0ab07))

## [0.2.5](https://github.com/kicksideai/kickside/compare/channel-v0.2.4...channel-v0.2.5) (2026-10-22)


### Bug Fixes

* **channel:** pass the delivery key to reply providers on keyed writes ([#77](https://github.com/kicksideai/kickside/issues/77)) ([ca9c879](https://github.com/kicksideai/kickside/commit/ca9c879efcad63267a7796481b4d24af9cf52092))
* preserve execution failure and session acquisition semantics ([#76](https://github.com/kicksideai/kickside/issues/76)) ([2df07e3](https://github.com/kicksideai/kickside/commit/2df07e32a36bb5cf2f20a2eaf030c7d12a4ccb08))
* **uploads:** preserve completion checkpoints and redact structured diagnostics ([518920e](https://github.com/kicksideai/kickside/commit/518920e63ef6f512949da0d0b79cf9cd7a03a161))

## 0.2.4 (2026-10-17)

- Remove retired retention metadata and refresh packaged documentation.

## 0.2.1 (2026-10-09)

- Preserve native Execution validation errors and migrate trace consumers (5fda907df)
- fix(channel): preserve active conversation state across native upgrades (1ab8e7d5f)
- Build frontend assets with the current published UI Kit stylesheet.

## 0.2.0 (2026-10-08)

- fix: bound agent tool results and derive model checkpoint budgets (83caf17bc)
- Route conversation hub messages through the channel hub signal (9b25f6bee)
- build: rebuild bundles from source (6c884fef9)
- chore: refresh locks to latest published dependencies (243b4bdff)
- fix(channel): fence turn mutations during conversation unlink (fe719e120)
- Declare module access bundles and invalidate changed group sessions (602c31f9d)
- fix(security): reserve producer capabilities for module services (59bede7cd)
- fix(producers): restore published output capabilities (1830bf4d3)
- Validate responder connections and preserve turns through assessor outages (d97a689c0)
- Scope runtime metadata grants to stored component implementations (05ba21847)
- Exercise production runtime metadata grants against component targets (6c0f30ee3)
- fix(channel): retain failed recovery notification causes (2368553e5)
- fix(channel): admit and recover declined-message audit writes (e7d9f7847)
- fix(channel): publish admitted chat outputs and honor drive controls (59a95fed0)
- fix(channel): resolve protected chat identities as a deferred owner (3427cdac6)
- Keep cluster name and directory read authority in owning modules (97da56fd2)
- Recover failed route health without terminating the conversation hub (a591e2c44)
- Consolidate singleton admission and stop cancelled maintenance standbys (0713f7173)
- feat(channel): surface connection validation warnings as responder health (61ad98e0f)
- fix(channel): unrouted and lookup-failed inbound writes no component health (b80fe9f21)
- fix(cluster): scope durable actor ownership and retain standby contenders (1ec81dcb0)
- Expose channel responder routing and agent health under the hub identity (58d68931c)

## 0.1.51

Current published Hub version.

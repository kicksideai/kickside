# Changelog

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

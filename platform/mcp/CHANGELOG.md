# Changelog

## [0.2.7](https://github.com/kicksideai/kickside/compare/mcp-v0.2.6...mcp-v0.2.7) (2026-10-28)


### Bug Fixes

* **mcp:** keep credential badges inside cards ([#194](https://github.com/kicksideai/kickside/issues/194)) ([1cc3071](https://github.com/kicksideai/kickside/commit/1cc307141f19e97cb8bba98a75a7169038a43574))

## 0.2.6 (2026-10-17)

- Refresh packaged frontend assets and documentation.

## 0.2.5 (2026-10-16)

- Revoke active credentials that capture retired policy restrictions while preserving their authority and audit data.

## 0.2.1 (2026-10-09)

- fix(mcp): retain issuing authority and revoke reduced delegations (fd9953e90)
- fix(mcp): recheck native authority for result continuations (f27172da4)
- Bound anonymous OAuth registrations through serializable admission (1d2dfefbf)
- Validate MCP tool arguments against complete native schemas (902a7e7e4)
- Constrain new credential presets through shared grant expansion (67438ccd7)
- Propagate MCP preset discovery failures (e8135f238)
- Validate original MCP JSON before restriction decoding (3b742ac35)
- Validate MCP credential restrictions before mint and policy mutation (dc81929f3)
- Refuse corrupt credential restrictions at their shared trust boundary (19c7ced37)
- Reject unsupported stateless MCP transport methods (59c19908c)
- Preserve native MCP discovery and continuation failures (d24cf6803)
- Preserve native errors in MCP tool results (a8842f0b3)
- Validate stored OAuth callbacks at authorization (bceb15da9)
- Validate PKCE proof syntax and compare S256 in constant time (79fa6964d)
- Display the registered callback hostname during OAuth consent (178b5220a)
- Prevent caching of MCP credentials and OAuth responses (84a7d5931)
- Prevent framing of OAuth consent responses (d475b7d00)
- Validate OAuth requests before consent controls render (9b83bf82d)
- Keep MCP execution policies private in group composition (f702c344b)
- Seal OAuth grants without a deployment encryption key (1458ccf3f)
- Honor configured public MCP authority under endpoint security (a3b0de5ce)
- Add root OAuth discovery routes (0cf1ee20d)
- fix(mcp): bind OAuth credentials to their resource audience (ffb743328)
- fix(mcp): validate OAuth callback schemes and authorities (f8a088d97)
- fix(mcp): validate browser origins before transport dispatch (d63ac78b5)
- Build frontend assets with the current published UI Kit stylesheet.

## 0.2.0 (2026-10-08)

- fix(mcp): persist scoped results without ingestion and grant continuation explicitly (R4-I8) (fe4b91807)
- fix(mcp): scope result continuations to tool grants and sessions (R4-I10) (38b1e822e)
- test(smoke): recover complete paginated tool history and document continuation offsets (d8de5deee)
- fix: bound agent tool results and derive model checkpoint budgets (83caf17bc)
- feat(component): audited operator adoption of unowned components (94f96e07b)
- build: rebuild bundles from source (6c884fef9)
- chore: refresh locks to latest published dependencies (243b4bdff)
- Enforce MCP tool and discovery access through the credential owner scope (17cba77f9)
- Keep MCP transport session metadata separate from domain connection context (8000dd9cd)
- Run native PostgreSQL gates through isolated module targets (3ddb9c541)
- fix(mcp): point unavailable tool calls at session_info and find_traits (e8ff3a981)
- fix(mcp): declare scoped automation capabilities and prove credential lifecycles (398dc7b32)
- Restore retained trigger consolidation behavior through current modules (03eb36263)
- fix(frontend): consolidate retained rollout styles and sticky layer (884ee6454)

## 0.1.55

Current published Hub version.

# Changelog

## [0.2.6](https://github.com/kicksideai/kickside/compare/agents-v0.2.5...agents-v0.2.6) (2026-10-25)


### Bug Fixes

* **hub:** require typed recommender completion ([#145](https://github.com/kicksideai/kickside/issues/145)) ([b93bc77](https://github.com/kicksideai/kickside/commit/b93bc77a6f2835548592816a8e46591e7d72bbb1))

## [0.2.5](https://github.com/kicksideai/kickside/compare/agents-v0.2.4...agents-v0.2.5) (2026-10-23)


### Bug Fixes

* **agents:** clarify generated artifact tag instructions ([#130](https://github.com/kicksideai/kickside/issues/130)) ([17e539a](https://github.com/kicksideai/kickside/commit/17e539af8533a0b587378b2cccccf96a5048a5fd))
* **automation:** retire direct agent launch controls without breaking saved tasks ([#95](https://github.com/kicksideai/kickside/issues/95)) ([86e687a](https://github.com/kicksideai/kickside/commit/86e687ad79c4d29d91c753d5e7d1ca9e7caf873a))

## [0.2.4](https://github.com/kicksideai/kickside/compare/agents-v0.2.3...agents-v0.2.4) (2026-10-22)


### Bug Fixes

* **agents:** return invalid trait context as a typed resolver error ([b9851b1](https://github.com/kicksideai/kickside/commit/b9851b11b7c1fd46f6ba0e18262fdb427999700b))
* declare plain object roots for agent tool input schemas ([75fd0fe](https://github.com/kicksideai/kickside/commit/75fd0fed2a0c71206ae914c6ee497e1b37301a54))
* preserve typed LLM errors in agents and knowledge ([f56ef7f](https://github.com/kicksideai/kickside/commit/f56ef7fefcf00e51278751304fa88597382634b4))
* **uploads:** preserve completion checkpoints and redact structured diagnostics ([518920e](https://github.com/kicksideai/kickside/commit/518920e63ef6f512949da0d0b79cf9cd7a03a161))

## [0.2.3](https://github.com/kicksideai/kickside/compare/agents-v0.2.2...agents-v0.2.3) (2026-10-20)


### Bug Fixes

* honor agent picker configuration in data syncs ([#29](https://github.com/kicksideai/kickside/issues/29)) ([8764097](https://github.com/kicksideai/kickside/commit/87640977328f797c127bb54c40c6c6194a7fd188))

## 0.2.2 (2026-10-19)

- The Agent step documents its model field: a model class or exact model id, required with inline instructions unless the step input carries model.

## 0.2.1 (2026-10-17)

- Refresh packaged module descriptions and documentation.

## 0.1.61 (2026-10-09)

- Build frontend assets with the current published UI Kit stylesheet.

## 0.1.60 (2026-10-08)

- test(smoke): recover complete paginated tool history and document continuation offsets (d8de5deee)
- fix(agents): retain existing checkpoint caps when deriving model limits (68fd62f79)
- fix: preserve native result bounds and refresh selected model limits (528dd0e0b)
- fix: bound agent tool results and derive model checkpoint budgets (83caf17bc)
- build: rebuild bundles from source (6c884fef9)
- chore: refresh locks to latest published dependencies (243b4bdff)
- Default module member requirements to platform Members (a05332552)
- Declare module access bundles and invalidate changed group sessions (602c31f9d)
- fix(http): retain published error library identities (ae7ddc9be)
- fix(agents): retain the published Markdown artifact default (30aacef61)
- Preserve concurrent Agent context decisions with revision checks (8bb9024f6)
- Document every tool combination with its selection state (0e4c6c24c)
- Execute registered API, transform, policy and picker test cases (e319c69c8)
- Declare artifact text fields and the existing workflow layout command (22c2e36a6)
- Restore retained trigger consolidation behavior through current modules (03eb36263)
- Require explicit content type for text artifacts (246114bf8)
- Detach only the named agent memory KB and document its binding (cd562b452)

## 0.1.56

Current published Hub version.

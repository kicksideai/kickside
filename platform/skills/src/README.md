# kickside/skills

Reusable agent procedures ("skills") for KickSide.

A skill is a component (identity / access / sharing / discovery) whose thread is
its append-only version history. A registered projection folds that history into
the current read-model body. Bundle bytes live in the injected filesystem, referenced by SHA-256 in the
version event, so the module does not own a parallel skill database schema.

This module owns:

- The skill store (`kickside.skills:skill_create` / `skill_get` / `skill_list` /
  `skill_list_files` / `skill_read_file` / `skill_refine` / `skill_delete` /
  `skill_share`) — per-method dispatchers over the thread-backed state reader and
  writer, each running under the caller's actor so the component service enforces
  access.
- The bundle helpers (`bundle/frontmatter.lua` — a bounded SKILL.md frontmatter
  parser, and `bundle/normalize.lua` — the SkillBundle normalizer).
- The HTTP API: `GET /skills`, `GET /skills/{id}`,
  `GET /skills/{id}/versions`, `POST /skills`, `PATCH /skills/{id}`,
  and `DELETE /skills/{id}`. Sharing is exposed through the Skill tool and the
  `skill_share` store function, not as an HTTP route.
- The `skill_runtime` contract (activate / list_files / read_file).
- The **Skills** agent trait (`kickside.skills.traits:skills`): a dual-mode trait
  whose static prompt + `Skill` tool give on-demand discovery, load, author, and
  refine of any readable skill (`use` returns the body + a compact file manifest);
  a `SkillFile` tool reads bundled files on demand; and a build func
  (`init_skills`) pins specific skills' bodies + manifests into an agent's prompt
  when the agent supplies `context.skill_ids`.

## Bundled scripts

Scripts are stored as bundle files and are not executed. A version’s manifest
retains file kinds, executable metadata, allowed tools, and compatibility
metadata. The implemented runtime contract exposes `activate`, `list_files`,
and `read_file`; activation retains the agent’s existing authority.

## Boundary

skills is permission-agnostic. The host router enforces auth + endpoint firewall;
per-skill access is the component service's job (`component.validate_access`).

skills depends on `kickside/component`, `kickside/contract`, `kickside/core`. It registers the `agent.trait` + `tool`
registry entries the agents module discovers through the registry — there is no
code coupling to the agents module.

## Dependency interface

The consuming host wires these via `ns.dependency`:

- `api_router` — required router the HTTP routes attach to; must
  enforce auth + endpoint firewall.
- `ui_server` — required HTTP server for the bundled Skills UI.
- `upload_storage` — required filesystem for bundle bytes.

## Test

```
make test
```

Run `make lockrefresh` first. The standalone harness runs thread-backed CRUD,
sharing, version/file reads, tool behavior, and agent pinning suites. Use its
PostgreSQL profile with a dedicated database for the second engine.

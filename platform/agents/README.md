# kickside/agents

Agent definitions, chat surfaces, capabilities, and execution.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/agents
wippy install
```

Apply host bindings and migrations through the application install plan.
Review the manifest and registry requirements before enabling the module.
Host resources and security groups bind through the install plan.


## Requirements

For repository validation, use the Wippy release pinned in
[CI](../../.github/workflows/ci.yml). Use current Hub dependencies
for the contracts declared by the module.
The standalone harness uses SQLite and declares a PostgreSQL test profile.
Frontend development also uses Node.js 22, npm, and Make.

## Development

From this module directory:

```sh
make lockrefresh
make lint
make test
(cd test && wippy test --profile postgres --set vars.pg_database=kickside_readme_test)
```

Create a dedicated PostgreSQL database before the profile run and drop it
afterward. Set the `pg_host`, `pg_port`, `pg_username`, and `pg_password`
variables in the harness configuration for your test server.
Edit frontend source under `ui/` and run `make -C ../../ build MOD=agents` from this directory;
commit regenerated tracked assets with the source.

## Use

Create a personal agent with a prompt, model, capabilities, and optional routing. Configure models in **System → Models**. Omitted traits use the Agents creation defaults; an explicit empty `traits` array opts out. Capability configuration selects resources and does not grant access to them.

## Reference

- [Module reference](src/README.md)

### Contracts

| Definition | Methods |
| --- | --- |
| [`kickside.agents:agents`](src/_index.yaml) | `create`, `find`, `upsert`, `update`, `delete`, `list`, `attach_kb`, `detach_kb`, `attach_tool`, `detach_tool` |
| [`kickside.agents:tools`](src/_index.yaml) | `find`, `list` |

### Agent tools

Tool names link to their input/output schemas. Capabilities and the caller’s
resource access determine which tools are available.

| Tool | Selection and paging inputs |
| --- | --- |
| [`CreateArtifact`](src/traits/_index.yaml) | See the operation schema |
| [`Agents`](src/traits/registry/agent_actions/_index.yaml) | `fields`, `limit`, `cursor` |
| [`Capabilities`](src/traits/registry/curation/_index.yaml) | `fields`, `limit`, `cursor` |
| [`Platform`](src/traits/registry/platform_manager/_index.yaml) | `fields`, `limit`, `offset`, `cursor` |
| [`Redirect`](src/traits/registry/trait_helpers/_index.yaml) | `fields`, `limit`, `cursor` |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.agents:api_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.agents:ui_server`](src/_index.yaml) | Host supplies the value |
| [`kickside.agents.security:user_security_scope`](src/security/module_access/_index.yaml) | `kickside.security.groups:members` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/agents)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

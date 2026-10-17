# kickside/knowledge

Knowledge-base management, ingestion, retrieval, and provider bindings.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/knowledge
wippy install
```

Apply host bindings and migrations through the application install plan.
Review the manifest and registry requirements before enabling the module.
Host resources and security groups bind through the install plan.


## Requirements

Wippy 0.3.x; repository validation uses 0.3.47a. Use current Hub dependencies
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
Edit frontend source under `ui/` and run `make -C ../../ build MOD=knowledge` from this directory;
commit regenerated tracked assets with the source.

## Use

Create a knowledge base with an installed engine, ingest content, and inspect processing state before querying it. Select the base on an agent capability and share it with the execution principal. The engine owns document, graph, and embedding storage; Knowledge owns the base lifecycle and engine-neutral interfaces.

## Reference

- [Module reference](src/README.md)

### Contracts

| Definition | Methods |
| --- | --- |
| [`kickside.knowledge:kb_store_lifecycle`](src/_index.yaml) | `create_store`, `get_store`, `update_config`, `delete_store` |
| [`kickside.knowledge:maintainable`](src/_index.yaml) | `schedule_resummarize`, `schedule_reembed`, `maintenance_status` |
| [`kickside.knowledge:knowledge_bases`](src/_index.yaml) | `create`, `find`, `upsert`, `update`, `delete`, `list` |

### Agent tools

Tool names link to their input/output schemas. Capabilities and the caller’s
resource access determine which tools are available.

| Tool | Selection and paging inputs |
| --- | --- |
| [`QueryKB`](src/traits/_index.yaml) | `limit`, `cursor`, `fields` |
| [`RetrieveKB`](src/traits/_index.yaml) | `limit`, `cursor`, `fields` |
| [`EmbedToKB`](src/traits/_index.yaml) | See the operation schema |
| [`FindKnowledgeBases`](src/traits/_index.yaml) | `limit`, `cursor`, `fields` |
| [`AskKB`](src/traits/_index.yaml) | `limit` |
| [`SearchKB`](src/traits/_index.yaml) | `limit`, `cursor`, `fields` |
| [`Knowledge`](src/traits/_index.yaml) | `limit`, `cursor`, `fields` |
| [`FetchUrl`](src/traits/kb_ingest/_index.yaml) | See the operation schema |
| [`EmbedContent`](src/traits/kb_ingest/_index.yaml) | See the operation schema |
| [`DeleteContent`](src/traits/kb_ingest/_index.yaml) | See the operation schema |
| [`SelectKB`](src/traits/kb_ingest/_index.yaml) | See the operation schema |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.knowledge:api_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.knowledge:ui_server`](src/_index.yaml) | Host supplies the value |
| [`kickside.knowledge.security:user_security_scope`](src/security/_index.yaml) | `kickside.security.groups:members` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/knowledge)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

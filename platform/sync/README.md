# kickside/sync

Data synchronization implemented as an automation kind.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/sync
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
The harness checks the Jira source payload schema against the inbox input
schema. To validate an Atlassian source change alongside Sync, load its local
module through the workspace replacement:

```sh
cd test
wippy test --set "workspace.replacements.kickside/atlassian=$ATLASSIAN_SOURCE"
wippy test --profile postgres --set vars.pg_database=kickside_readme_test \
  --set "workspace.replacements.kickside/atlassian=$ATLASSIAN_SOURCE"
```

`ATLASSIAN_SOURCE` names the providers repository's `atlassian/` directory.
Edit frontend source under `ui/` and run `make -C ../../ build MOD=sync` from this directory;
commit regenerated tracked assets with the source.

## Acquisition and LLM settings

Published `trigger.poll.page_size`, `max_pages_per_run`, and `max_items_per_run`
map to `round.page_size`, `round.max_pages`, and `round.max_items`. Their bounds
and acquisition behavior remain unchanged. `transform.temperature`,
`transform.max_tokens`, and the runtime values of `transform.generation_policy`
reach the transform LLM strategy; [Transform configuration](../transform/README.md#llm-runtime-configuration)
defines their validation and omitted-option defaults.

## Use

Create a **Data Sync** Automation, select an event or collection source port, configure a transform, and select a writable destination. Validate against captured source envelopes before enabling it. The shared Automation engine owns scheduling and delivery; deleting the sync retains destination records.

### Contracts

| Definition | Methods |
| --- | --- |
| [`kickside.sync:sync_contract`](src/_index.yaml) | `reconfigure` |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.sync:ui_server`](src/_index.yaml) | Host supplies the value |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/sync)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

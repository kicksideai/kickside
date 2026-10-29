# kickside/transform

Shared expression, LLM, code, and function item transforms.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/transform
wippy install
```

Apply host bindings and migrations through the application install plan.
Review the manifest and registry requirements before enabling the module.
Host resources and security groups bind through the install plan.

## Key concepts

The public `kickside.transform:apply` library accepts
`{strategy, config, item = {item_key, envelope, input}}`. Data Sync converts the
source envelope into this strategy item: `input` contains the source payload,
and `envelope` contains source identity and event metadata.

For `kind: expr`, `payload` and `input` both refer to that input value;
`item` is the strategy item and `envelope` is its envelope metadata.
For a source payload with `name` and `message`:

```text
{title: payload.name, content: payload.message}
```

A function transform receives `{item = strategy_item, config = ...}` and reads
payload fields through `request.item.input`. `inputs` is not a binding.

Validate before installation using `POST /api/v1/transform/validate` with
`transform`, `sink_schema`, and real `samples` (an array of source envelopes).
Generation and validation require captured source items with a `payload`. Missing
samples fail clearly; schemas do not fabricate data. Generation defaults to
`expr`; `auto` explicitly requests the strategy judge. Each request stays with
its selected strategy until it validates or exhausts its attempts.

See [src/](src/) for registry declarations and implementation.

## LLM runtime configuration

The LLM strategy sends `temperature` and `max_tokens` through `wippy.llm:llm`.
Omitted options retain `class:fast`, the concise-summary prompt, temperature zero,
and the selected provider's token budget. The LLM owner resolves the model and
its supported sampling behavior.

An optional `generation_policy` carries runtime values in
`model.selector`, `sampling.temperature`, `budgets.runtime`, and `prompts.runtime`.
Its optional `type` is `kickside.transform.generation_policy` and `version` is `1`.
Direct model, temperature and token-budget fields agree with the corresponding
policy values when both are present. An explicit prompt overrides the policy prompt. Temperatures are finite numbers; token budgets are positive integers.
Install and runtime use the same validation. The policy's generation-time
metadata remains stored; it does not change item-runtime orchestration.

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
Edit frontend source under `ui/` and run `make -C ../../ build MOD=transform` from this directory;
commit regenerated tracked assets with the source.

A strategy binding may declare `meta.validate_at_install: true` when applying a synthetic schema sample is safe during installation. `generator.validate_install` executes only these strategies through the existing transform validation gate. An absent flag preserves installation behavior and avoids invoking effectful strategies. Runtime output validation applies to every strategy.

## Use

Data Sync maps a source envelope into the strategy item described above. Successful application returns `present` and `value`. An explicit `{present = false, skip = "reason"}` skips the item without writing to the sink; an absent output without a skip fails. The Automation round records skips separately from failed deliveries.

### Contracts

| Definition | Methods |
| --- | --- |
| [`kickside.transform:strategy`](src/_index.yaml) | `apply`, `describe` |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.transform:api_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.transform:ui_server`](src/_index.yaml) | Host supplies the value |
| [`kickside.transform.security:user_security_scope`](src/security/_index.yaml) | `kickside.security.groups:members` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/transform)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

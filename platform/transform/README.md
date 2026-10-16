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

For `kind: expr`, the expression receives `item` (the source envelope) and
`payload` (`item.payload`). These are the bindings used by
`kickside.transform:transform`; `input` and `inputs` are not aliases.

For an event whose payload contains `name` and `message`, for example:

```text
{title: payload.name, content: payload.message}

A function transform instead receives `{ item = envelope, config = ... }`.
These are different interfaces; use the interface for the selected transform kind.

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

Wippy 0.3.x; repository validation uses 0.3.47a. Use current Hub dependencies
for the contracts declared by the module.
The standalone harness uses SQLite and declares a PostgreSQL test profile.
Frontend development also uses Node.js 22, npm, and Make.

## Development

From this module directory:

```sh
cd test
wippy install
cd ..
make lint
make test
cd test
wippy test --profile postgres --set vars.pg_database=kickside_readme_test
```

Create a dedicated PostgreSQL database before the profile run and drop it
afterward. Set the `pg_host`, `pg_port`, `pg_username`, and `pg_password`
variables in the harness configuration for your test server.
Edit frontend source under `ui/` and run `make -C ../../ build MOD=transform` from this directory;
commit regenerated tracked assets with the source.

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://kicksideai.github.io/docs/building-modules/)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/transform)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

A strategy binding may declare `meta.validate_at_install: true` when applying a synthetic schema sample is safe during installation. `generator.validate_install` executes only these strategies through the existing transform validation gate. An absent flag preserves installation behavior and avoids invoking effectful strategies. Runtime output validation applies to every strategy.

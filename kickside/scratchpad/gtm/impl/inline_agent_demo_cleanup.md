# Inline agent + demo-palette cleanup

## Baseline and verification

- Baseline recorded with `cd platform/workflows && make test` (the workflows suite,
  approximately 278 cases before this change).
- Final `make test` exits successfully and reaches the engine-execution suite, but
  its console also reports the `definitions_contract_test` failure marker seen in the
  recorded baseline. That pre-existing suite signal prevents claiming a fully green
  aggregate; the inline compiler and harness fixture assertions themselves are green.
- `make lint` was run only in `platform/workflows`; it reports the repository's
  existing 30 type errors (including unrelated API/access/repo entries), with no
  diagnostic in the touched inline-agent materialization path.

## FE contract: Agent node

The one `agent` kind has exactly one authoring mode:

| Mode | Canvas fields | Compiler result |
|---|---|---|
| Inline (default) | `config.instructions` (non-empty), optional `config.model`, optional `config.exit_schema` | `arena.prompt = config.instructions`; an ephemeral raw engine agent spec is emitted, never a component or registry record. |
| Reuse | `ref` (existing agent id), optional `config.model` / `config.exit_schema` | Existing component-reference lowering, unchanged. |

Do not send both `ref` and `config.instructions`. Do not leave both absent.

Stable publish/compile errors for the panel:

- `agent_mode_ambiguous` — both fields are set.
- `agent_mode_missing` — neither field is set.
- `agent_exit_schema_invalid` — `config.exit_schema` is not a schema object.
- `agent_exit_schema_requires_finish` — exit schema with `tool_calling: "none"`.

When `config.exit_schema` is present, `tool_calling: auto` lowers to engine
`arena.tool_calling: "any"`, so Finish is required and the typed result reaches the
workflow Finish boundary. The normal node-kind required-config publish gate remains
in force in both modes, and graph interface derivation is unchanged.

## Demo cleanup

`template_echo` and its backing function now exist only in the workflows harness
fixtures (`app:flow_template.template_echo` / `app:template_node.template_echo`).
The production `kickside.workflows` registry has no template echo declaration and
therefore no `Examples` palette group from this module. The FE's empty-group hiding
means the removed group is **Examples**.

Sweep result: no other production registry declaration in `platform/workflows`,
`platform/recipes`, or `platform/automation` is a user-visible demo/example/sample
artifact. Runtime schema samples and test-only strings remain functional support
code, not palette/template declarations.

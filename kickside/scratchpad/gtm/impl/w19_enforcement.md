# W19 definition read contract and exit-schema enforcement

## Definitions contract

The published, read-only cross-module contract is
`kickside.workflows:definitions`.

- `get_interface(workflow_ref)` returns the immutable Start/Finish/Error
  interface derived from the published graph document by the same store
  projection used by existing consumer faces.
- `export(workflow_ref)` returns the portable A10-6/W9.6 definition artifact:
  `{ schema_version, portable_key, kind, version, refs, slots, spec,
  checksum }`. `spec` is a `kickside.workflows.flow_template` declaration whose
  `definition` contains the portable `slots` and raw graph `document`.

Both methods first use `workflow_repo.require_access(..., ACCESS.READ)`, the
same component-read gate used by consumers, then load an immutable published
version. Drafts are therefore invisible. The source loader selects only the
published document and its graph-derived interface; compiled commands are never
selected, exported, or embedded in the portable spec.

The harness calls the declared binding from an app module, verifies the read
denial and draft cases for both methods, then imports the returned `spec` through
the normal `flow_template.instantiate` path. Re-exporting that published imported
workflow produces an equivalent portable document and the same portable key.

## Agent exit-schema contract

An agent node that declares a table `exit_schema` promises typed terminal output.
`tool_calling = "auto"` is therefore lowered to the engine's enforcing
`"any"` mode; explicit `"any"` remains `"any"`. This is the least-surprising
compatible interpretation of the existing default: a schema opts into its
already-declared typed-output promise rather than allowing an untyped prose
completion.

`tool_calling = "none"` with an exit schema is refused at compile/publish with
`agent_exit_schema_requires_finish`: it directs authors to `auto` or `any` and
explains that `none` disables the required finish tool. A non-object
`exit_schema` is likewise rejected as `agent_exit_schema_invalid`. This follows
the engine behavior behind the run 59a02258 failure: `auto` can accept a response
without a tool call, while `any` requires the schema-backed finish tool, so no
schema-bearing node can silently pass a bare string downstream.

No persisted agent nodes with `exit_schema` were found in the stored workflow
examples. No migration or document heal is needed. Existing persisted
`exit_schema + auto` nodes are source-compatible and become enforcing when next
compiled/published; `exit_schema + none` is intentionally rejected until changed.

## Tests and rollout

The test suite covers default, `auto`, `any`, and `none`: default/`auto`/`any`
emit an enforcing `arena.tool_calling = "any"`; `none` is rejected with the
directed error. The definitions harness covers binding resolution, published-only
visibility, access control, compiled-command exclusion, and portable
round-trip.

`cd platform/workflows/test && wippy run test` changed from the supplied baseline
of 254 to 256 passing tests. A workflows module/application reload or redeploy is
required for the new contract declaration and compiler lowering to be used; the
live service on 8085 was not restarted or otherwise modified.

# Workflow / Inbox HITL convention audit

Date: 2026-07-11

Status: read-only product-source audit. No runtime restart, product edit, or commit was
performed by this lane.

## Scope and method

Source was traced across:

- the Inbox-owned `kickside.workflows.node` declaration and Inbox decision renderer;
- workflow registry discovery/lowering, config assist API/domain/UI, Await execution,
  decision/resume, and publish validation;
- shared `wc-schema-form` / structured-value field;
- users-owned principal directory and `wc-principal-picker`;
- tests at each seam.

Promptmap refine passes covered all four areas. Its output was used only as a search aid;
every finding below was verified in source. Several generated suggestions were rejected
(for example, Vue text interpolation is not an XSS bug, an internal signal target is not
automatically an authorization bypass, and structured-output prompting is not made safe by
"sanitizing" natural-language intent).

## Ranked findings

### B1 — The declared review form and the Inbox renderer speak different types

The node declares `config.form` as an **object** named “Form schema”
(`platform/inbox/src/workflow/_index.yaml:41-44`). Config assist tests likewise draft a
JSON-Schema-shaped object. But Inbox renders decision controls only when
`metadata.form` is an **array** of `{ key, label, type, required, options }` rows
(`platform/inbox/ui/src/app/decision.ts:64-83`). An object is silently treated as no form.

This means the UI can accept and persist a plausible LLM-authored “Form schema” which the
actual human reviewer never sees. It directly blocks the requested proof that all Inbox
HITL controls are configurable by LLM and work end to end.

Minimal seam: choose one declarative grammar and own it once. Prefer a bounded JSON Schema
object (`properties`, top-level `required`, string/number/boolean/enum) because the shared
form and AI assist already use that vocabulary. Have Inbox render that schema through one
pure adapter. If the row-array grammar is retained, declare `form.type=array` with a strict
`items` schema and label it “Review fields”, not “Form schema”. Reject malformed forms at
publish/assist time; never silently erase them.

### B2 — `config_schema` is presentation metadata, not an enforced node contract

The Inbox declaration says `timeout` is an integer with `minimum: 1` and constrains
`priority` by enum (`_index.yaml:60-68`). AI-generated values are validated inside
`assist.lua`, but the workflow publish/run gate only checks that fields named by
`config_required`/`schema.required` are non-empty
(`platform/workflows/src/compiler/graph.lua:159-200`). It does not validate instance types,
enum, range, array/object shape, or additional properties. The shared form also does not
project `minimum`, `maximum`, length constraints, or required semantics onto the controls;
its number input has no `min`/`max` and every edit is emitted immediately
(`platform/widgets/ui/src/multiselect/app/SchemaForm.vue:45-91`).

So a manual/API edit can publish `timeout=0`, a non-integer, a bad priority, or a malformed
form even though the declaration claims otherwise. LLM assist happens to be stricter than
the canonical workflow contract, which is backwards.

Minimal seam: extract the bounded config validator from `assist.lua` into the workflows
schema-contract module and run it in both publish and launch validation for every declared
node kind, with slot values deferred until binding. Make SchemaForm project the same
supported constraints (`min`, `max`, required/invalid state). Assist then consumes the
validator; it must not own it.

### H1 — A bad context expression fails open and can expose the full upstream payload

`shape_context` evaluates the author’s redaction/shaping expression, but on any evaluation
error returns the raw input (`platform/workflows/src/node/await/process.lua:115-126`). The
raw result is then copied into Inbox metadata and rendered into item content
(`process.lua:135-165`). The test explicitly canonizes this behavior as “falls back to raw
input”.

For a human-review boundary this is unsafe and surprising: a typo in an expression meant
to select `{ amount, recommendation }` can expose credentials, internal notes, or the entire
record to the assignee.

Minimal seam: fail the node/arm with `{code,message}` on expression error, or create a
directed configuration error containing no raw data. Empty expression may intentionally use
the raw input; a non-empty invalid expression must fail closed. Replace the existing
fallback test with a no-leak failure assertion.

### H2 — Arbitrary assignee IDs become actor impersonation without an assignment policy

The declaration accepts a scalar user id. The picker improves UX but is not an authority
boundary. Runtime code accepts the stored string and, when it differs from the current
actor, constructs a new actor for that id and calls Inbox persistence as that actor
(`platform/workflows/src/node/await/process.lua:37-46,176-182`). Neither the compiler nor
the arm checks that the principal exists at execution time or that the workflow owner may
assign work to that person.

A caller with workflow write access can bypass the picker and create review items in an
arbitrary user’s Inbox. This also couples workflow execution to the mechanics of actor
impersonation.

Minimal seam: Inbox should expose a public `assign_decision` contract accepting the target
principal and frozen caller identity. Inbox/users policy validates existence and assignment
authority, then stores owner/assignee without workflows minting another actor. The workflow
module supplies intent and correlation, not identity impersonation.

### H3 — The declarative intrinsic still hardcodes Inbox inside workflow engine code

The registry declaration says the Inbox node is decoupled and declarative, but the generic
Await process imports the private `kickside.inbox.persist:inbox_writer`, knows the
`inbox.decision` type, constructs Inbox item metadata/content, and contains two Inbox-only
arm functions. `runs/decisions.lua` and the HITL reconciler also reach the Inbox writer.
Meanwhile the same Await module already has the proper extension seam: a declaration-owned
`resume_trigger.arm_ref` invoked opaquely (`process.lua:198-220`).

This is an abstraction inversion: workflows owns an Inbox adapter while Inbox’s registry
entry is mostly presentation/lowering metadata.

Minimal seam: move Inbox item construction/assignment into an Inbox-owned public arm
function and declare that `arm_ref` on the intrinsic. Keep correlation and opaque
`await_handle` in workflows. Expose decision callback/resolution through public workflow and
Inbox contracts; remove direct persistence imports from workflows. Do not create another
executor.

### H4 — No test proves the actual declared intrinsic across a process restart

The strongest engine test creates the built-in `human` node, pauses, and resumes in the
same process (`platform/workflows/src/engine_execution_test.lua:733+`). The Inbox declaration
test checks registry metadata only. Await’s test calls a preview helper only. Reconciliation
tests build projection fixtures. None drives the actual `inbox_decision` registry entry
through catalog -> lowering -> publish -> run -> Inbox -> process restart -> resolve ->
correct output arm.

Minimal seam: retain the live restart proof, and add one restart-capable integration harness
using the real registry declaration and public Inbox resolution contract. Assert stable item
id, one pending item after re-arm, persisted run/node correlation, both approve/reject arms,
form payload, and no duplicate completion.

### M1 — Required configuration has two sources of truth

The Inbox declaration repeats `prompt` in both JSON Schema `required` and
`config_required` (`_index.yaml:30,69`). Compiler and registry code prefer
`config_required` when present and otherwise fall back to `schema.required`; validation
only checks that the chosen fields exist, not that both declarations agree. Assist and
SchemaForm read `schema.required`, while publish reads the override first.

Minimal seam: make `config_schema.required` canonical. For migration compatibility, accept
`config_required` only when identical and fail registry validation on divergence, then
remove it from new declarations.

### M2 — Config assist is secure in the important places, but duplicated and oversized

The current implementation correctly derives node/schema/current config server-side under
WRITE access, removes picker/sensitive fields before prompting, merges omissions over the
current config, validates the result, and guards stale client responses. Those are real
strengths.

However `platform/workflows/src/assist.lua` is 1,062 lines and owns edge, binding, schema,
and config prompts plus schema validation and workflow/catalog resolution. The client
reimplements picker traversal and recursive merge in `ConfigAssist.vue` (277 lines), and
that client merge has no recursion bound (`ConfigAssist.vue:120-166`). Error envelopes in
`assist_api.lua` also differ: older endpoints return `{success,error}` for invalid bodies,
while config uses `{success,error,code,message}`.

Minimal seam: split `assist/config.lua` (projection + prompt orchestration) from one shared
bounded `config_schema.lua`; keep the HTTP handler thin. Move client defense-in-depth merge
to a tested pure utility with the same depth cap. Normalize all assist errors to
`{code,message}` plus `success=false` only where legacy clients still require it.

### M3 — Shared SchemaForm duplicates its entire control renderer

Primary and advanced fields repeat the same picker/select/textarea/structured/boolean/
number/text chain verbatim (`SchemaForm.vue:74-119`). This already contributed to partial
vocabulary: `SchemaField` omits live annotations such as `kinds`, `empty_label`, minimum,
maximum, min/max length/items, while runtime objects happen to carry them.

Minimal seam: extract one `SchemaFieldControl` and one typed schema-field dialect. Primary
and advanced sections only choose grouping. Add contract tests for every supported keyword
and explicit directed fallback for unsupported schemas.

### M4 — Principal picker’s reusable value contract is heuristic

The users-owned directory seam and stale-request guards are solid. But the picker chooses
the first schema property as its storage key and accepts four identity aliases
(`PrincipalPicker.vue:31-43`), while SchemaForm extracts a selection using another ordered
alias list. This is safe for today’s one-field Inbox schema, but ambiguous for a reused
multi-property declaration and difficult to reason about.

Minimal seam: the web component contract should have one explicit `field`/`value` scalar
and emit `{value, principal}` (or a canonical config patch). WcMount adapts that once. Reject
multi-field picker schemas rather than relying on object key order.

## Styling and transient-state check

- Config-assist preview/applied controls now use the canonical 14px card / 8px control /
  10px directed-state radii, wrap actions, and switch to a two-column action grid at 520px.
- Principal picker uses canonical 8px controls and 14px anchored panel; no 999px button or
  raw off-canon radius was found in this slice.
- ConfigAssist has request-sequence, identity/config fingerprint, unmount, Accept/Cancel,
  and Undo coverage. Principal search/hydration has independent sequence guards and tests.
- Remaining visual risk is not a raw-radius violation but composition: SchemaForm emits on
  every keystroke, and the duplicated primary/advanced renderer makes state parity easy to
  regress. Live transient-state QA remains necessary after the product fixes above.

## Suggested fix order

1. Align form grammar end to end (B1) and add the actual intrinsic contract test.
2. Enforce `config_schema` at publish/launch and project constraints into SchemaForm (B2).
3. Make context shaping fail closed (H1).
4. Move assignment/arming behind Inbox-owned public contracts with authorization (H2/H3).
5. Add the restart-capable real-intrinsic test (H4).
6. Collapse required vocabulary and decompose assist/SchemaForm/picker adapters (M1-M4).


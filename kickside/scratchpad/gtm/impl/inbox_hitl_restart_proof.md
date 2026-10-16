# Inbox HITL restart proof — blocked at AI-assisted authoring gate

Date: 2026-07-11

Status: **Source gap fixed and regression-tested; live restart proof awaiting coordinated reload.**

The owner requires the Inbox review node to be configurable from plain language in the
workflow UI: AI drafts the node configuration, the draft is previewed, accepted, remains
inspectable/editable, and then survives publish/run/restart/resume. The current UI has no
AI-assist surface for an Inbox review node. Using edge-mapping assist would prove a different
surface and is explicitly not accepted as a substitute.

No workflow, run, or Inbox item was created, so there is nothing to clean up and no restart
was requested.

## Declarative node contract (source of truth)

Registry entry: `kickside.inbox.workflow:workflow_node.inbox_decision`.

Source: `platform/inbox/src/workflow/_index.yaml:16-95`.

Supported configuration:

| Control | Type / constraints | Runtime meaning |
|---|---|---|
| Prompt | textarea string, required | Inbox decision question |
| Context expression | textarea string, optional | expr-lang expression evaluated against upstream output |
| Form schema | object, optional | reviewer fields collected and returned with the decision |
| Assignee | string, optional | actor id; empty uses the workflow runner |
| Approve label | string, default `Approve` | positive action copy |
| Reject label | string, default `Reject` | negative action copy |
| Priority | `low | normal | high | urgent`, default `normal` | Inbox priority |
| Timeout seconds | integer, minimum 1, optional | durable await timeout |

Declared outputs and routes:

- Output: `{ outcome: "approve" | "reject", form?: object }`.
- `Approve` port when `output.outcome == 'approve'`.
- `Reject` port when `output.outcome == 'reject'`.
- Lowering targets the durable Await engine node with `resume_trigger.type = inbox.decision`,
  stable `signal_id = $def_node_id`, all item controls under `emit`, and timeout on the Await.

## Exact UI gap

`inbox_decision` is an extension node kind. `NodeConfigPanel.vue` routes extension config to
the generic `wc-schema-form`:

- `platform/workflows/ui/src/app/panels/NodeConfigPanel.vue:70-81` identifies external kinds
  and derives their generic form schema.
- `NodeConfigPanel.vue:290-300` mounts only `wc-schema-form` for that schema.
- The config merge at `NodeConfigPanel.vue:146-149` persists manual form changes.
- The only node-config plain-language assist in this dispatcher is the boundary
  `SchemaEditor` at `NodeConfigPanel.vue:246-265`; it applies only to Start/Finish/Error.
- Mapping assist exists on edges, not on the Inbox review node configuration.

Therefore a user currently must manually fill prompt, context, form, assignee, labels,
priority, and timeout. They cannot say, for example, “Send an urgent finance review to Alex,
show the invoice total, collect a reason, label the actions Pay/Hold, and time out tomorrow”
and review an AI-drafted node configuration.

## Acceptance gate needed before restart proof

A conforming fix must add a generic, declaration-driven config-assist surface for external
workflow node kinds (not an Inbox-only imperative branch), with these observable behaviors:

1. Plain-language intent can draft the Inbox node's complete config using its declared
   `config_schema`.
2. The result appears as a preview/diff; it is never silently applied.
3. Accept merges only declared fields into the node config; Undo restores the prior config.
4. Drafted values remain editable through the existing schema form.
5. Unknown fields and invalid enum/type/minimum values are rejected before save/publish.
6. The surface remains usable in light/dark and compact inspector widths.
7. A component test covers the full describe -> preview -> accept -> edit -> undo lifecycle.

After that fix is serving, the live proof can proceed: UI-only authoring, reload persistence,
publish, run to Awaiting, coordinated app restart, Inbox resolution, workflow continuation,
alternate outcome, history/debug evidence, and cleanup.

## Source implementation stage (2026-07-11)

The gate above is now implemented without an Inbox-specific branch:

- Backend: `POST /api/v1/workflows/{id}/assist/config`, WRITE-gated to the workflow.
  It accepts intent, node kind/title, the declared config schema, and current config; uses
  the existing bounded `class:fast` structured-output seam; validates required fields,
  declared fields, types, enums, integer/range constraints; returns stable `code` +
  `message`; and performs no persistence.
- Frontend: decomposed `ConfigAssist.vue` + `assist-config.ts`. Any external node with a
  real form config schema gets “Describe this step” -> “Draft with AI”, an inspectable
  before/after field preview, Accept, Cancel, and post-apply Undo. The canonical
  `wc-schema-form` stays directly below it for manual edits.
- Picker/component-id fields are excluded from the assist schema and current-config payload;
  applying or undoing a draft preserves non-form picker config.

Verification before reload:

- Backend focused assist suite: 21/21 green.
- Full backend workflows suite: 16/16 entries green.
- Frontend: 65 files / 519 tests green.
- Production Vite build: green (248 modules).
- `git diff --check`: green.

Second-review hardening:

- The browser now sends only `{ node_id, intent }`. Under the workflow WRITE gate, the
  server loads the current definition, resolves that node, resolves its canonical registry
  declaration, derives the assistable schema/current config, and rejects missing or
  non-configurable nodes. Client-supplied kind/schema/config are not trusted.
- Picker/class identity fields are removed from the model projection; the server enforces a
  closed top-level schema for the remaining declared fields.
- Validation covers required, type, enum, const, integer, numeric ranges, string lengths,
  array sizes, and `additionalProperties` behavior. Intent and schema size are bounded.
- Omitted optional settings are merged from server-owned current config. The UI repeats
  that preservation defensively and previews the union of old and drafted fields.
- Async requests carry a monotonic sequence plus selected-node snapshot; changing nodes or
  unmounting invalidates late responses. A/B out-of-order resolution is regression-tested.
- Final focused assist tests: backend 27/27, frontend 6/6.
- Final full regression: backend 16/16 entries, frontend 65 files / 521 tests. Production
  build and `git diff --check` remain green.

Honesty note for the live proof: the canonical Inbox declaration currently exposes
`assignee` as a raw optional actor-id string, not a picker-backed identity field. The UI
must be tested as shipped. If it cannot resolve/select a person canonically, that is a
usability blocker for “all controls we need”; an opaque id typed or guessed by AI will not
be presented as a pass.

Third-review hardening:

- Fields declared or named as secrets, passwords, tokens, credentials, private keys,
  `writeOnly`, `sensitive`, or password/secret formats are excluded before prompt
  construction. A containing object is also excluded when its nested schema or current
  value carries a sensitive key.
- Server-owned current config is depth-bounded (12) and JSON-size-bounded (64 KiB) before
  it can reach the model. The declared assist schema is independently bounded to 64 KiB.
- Configuration assist now explicitly rejects schema dialect features its validator does
  not enforce (`oneOf`/`anyOf`/`allOf`, conditional/not, pattern schemas, refs/defs,
  contains/prefix-items, and unevaluated rules). It does not silently present partial
  validation as complete validation.
- The frontend reads a structured 404 body first, preserving directed errors such as
  “This step no longer exists.” Only an endpoint-missing/non-JSON 404 becomes “AI assist
  isn’t available here yet.”
- Focused verification after this hardening: backend 29/29; frontend 7/7; production build
  green. Full regression remains required after final read-only review.

Assignee-control recon: no shared actor/user picker web component exists today. The users
module owns the canonical `kickside.contract:directory` seam and authenticated
`GET /api/v1/principals/search` / `POST /api/v1/principals/resolve` endpoints; its Share UI
contains a bespoke typeahead over that seam. Widgets ships component/model/channel/
connection pickers, but no principal picker. Concrete recommendation: extract that existing
directory-backed typeahead into a shared `wc-principal-picker` (with a users-only filter),
then annotate Inbox `assignee` with that picker. Until then the control is an opaque actor-id
text field and is a blocker to claiming that Inbox assignment is easy or safely configurable.

Minimal principal-picker extraction plan (not implemented):

1. Add `wc-principal-picker` as a shared widget entry/bundle, built from the existing
   `PickerSelect`/`AnchoredPanel` placement and picker-value conventions—no copied Share
   dialog shell.
2. Use the existing principal envelope `{ id, type, label, sublabel }`; lazy search calls
   `GET /api/v1/principals/search?q=&limit=`, hydration calls
   `POST /api/v1/principals/resolve`, and a schema option restricts results to `user` for
   Inbox assignment.
3. Declare Inbox `assignee` with `picker: wc-principal-picker`, `role: primary`, and the
   users-only filter. The generic schema form then mounts it and config assist excludes it
   automatically through the existing picker-field projection.
4. Test keyboard/typeahead selection, id hydration, empty runner-default state, compact
   placement, missing-picker failure, and Inbox schema-form integration; reuse the existing
   directory security policy and add no new identity lookup endpoint.

Latest full regression after third-review hardening: backend 16/16 entries; frontend
66 files / 535 tests; production build green.

Fourth-review schema-dialect hardening:

- Replaced the recursive unsupported-keyword denylist with a schema-position-aware
  allowlist. Assist accepts only the JSON Schema subset that the server validator actually
  enforces: a single declared type, object properties/required, one item schema,
  boolean-or-schema `additionalProperties`, enums/scalar constants, the enforced size and
  range bounds, plus presentation annotations. Unknown assertions, union type arrays, and
  tuple item schemas are rejected before any model call.
- The structural walk visits schema positions only. Data inside `enum`, `const`, `default`,
  and `examples` is not mistaken for schema vocabulary, closing the false-positive class
  introduced by recursive keyword scans.
- Sensitive-field exclusion also traverses schema-valued `additionalProperties` and
  server-owned current nested values, so dynamic object maps cannot smuggle passwords,
  credentials, private keys, or tokens into the prompt.
- Focused backend configuration-assist verification is 30/30 green. Final full regression:
  backend 16/16 workflow test entries, frontend 66 files / 535 tests, production build
  green, and scoped `git diff --check` clean.

Fifth-review projection and preservation hardening:

- A read-only decomposition/convention review found that top-level picker exclusion was
  insufficient: a picker nested inside an object could still send its stored identity to
  the model. The projection now excludes the entire containing field when any nested
  schema position declares a picker or picker class. The same rule covers schema-valued
  array items and `additionalProperties`.
- Model validation now runs against the projected surface. Rich schema vocabulary owned
  exclusively by an excluded picker cannot disable assist for unrelated safe fields, while
  unsupported vocabulary on any model-facing field still fails closed.
- Draft application now performs a schema-aware recursive merge for objects. Omitted
  optional nested children retain their current values; arrays and scalars still replace
  atomically. This extends the existing “absence means keep, never delete” rule below the
  top level.
- Supported-depth/schema-dialect checks now precede general recursive validation and JSON
  encoding on the generation path. Focused assist verification after these changes is
  32/32 green (33 including setup); full regression will run once the concurrently-built
  principal picker stops moving, so the integration state is tested once as a unit.

The live fixture/restart/resume proof has not yet been claimed. It resumes only after the
parent coordinates a reload containing both the new endpoint and rebuilt UI bundle.

Sixth-review validator hardening:

- The supported configuration dialect now accepts only the concrete value types the Lua
  validator can represent and check. Union arrays, `null`, tuple items, unknown assertions,
  invalid bound shapes, and contradictory min/max bounds fail before model invocation.
- Object-valued enum data is compared structurally. Keyword-looking keys inside `enum`,
  `default`, and `examples` remain data rather than being traversed as schema vocabulary,
  while the enum assertion itself is now genuinely enforced.
- Closed and schema-valued `additionalProperties` are enforced even when an object declares
  no named `properties`; array size bounds are enforced even when `items` is omitted. These
  were two validator holes exposed while checking that every allowlisted assertion was real.
- Final focused assist verification: 33/33. Final full workflows backend: 16/16 entries.
  Workflows UI: 66 files / 537 tests. Production build: 248 modules. Scoped diff check: clean.

Seventh-review freshness and boundary hardening:

- Type-less schemas with object, array, string, or numeric assertions now infer one
  enforceable value family. Mixed families and assertions contradicting an explicit type
  fail before generation. Regressions cover `required`, schema-valued
  `additionalProperties`, and `items` without an explicit `type`.
- Root-level identity or sensitivity markers (`picker`, `class`, `sensitive`, `writeOnly`,
  password/secret format) disable config assist before child projection.
- Authoritative node kind/title are trimmed and byte-bounded both during server resolution
  and immediately before prompt construction.
- The UI snapshots workflow id, node id, schema, and current configuration for each request.
  Manual edits or same-node workflow/schema changes invalidate a long response and show a
  re-draft instruction; stale full configurations are never overlaid.
- Test stability note: deferred component tests explicitly await the same test-owned Promise
  after resolving it. Without that ownership handoff Vitest reported the assertion as passed
  but retained its worker during teardown.
- Final focused verification: backend 36/36; frontend 12/12. Full backend: 16/16 entries.
  Full frontend: 67 files / 545 tests. Production build: 248 modules. Scoped diff check and
  orphan-process check: clean.

Eighth-review semantic freshness hardening:

- Request/config fingerprints now recursively sort object keys, preserve array order, and
  terminate safely on cycles or excessive depth. A parent echo with different serialization
  order is treated as the same accepted configuration rather than an unrelated manual edit.
- Regression: Accept a nested draft, receive a semantically identical top-level and nested
  config with reordered keys, retain “Draft applied,” then Undo to the exact prior config.
- Focused single-fork ConfigAssist: 10/10. Full frontend: 67 files / 546 tests. Production
  build: 248 modules. Scoped diff check: clean.

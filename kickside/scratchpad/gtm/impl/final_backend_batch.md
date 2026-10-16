# Workflows backend batch — final

Live app handling: port 8085 was read-only throughout; no restart, reload, UI build,
dataflow edit, lockfile edit, checkout, stash, or push was performed.

## Task 1 — required config / definition-slot publish gate

What changed:

- `platform/workflows/src/compiler/graph.lua:123` reuses the template declaration
  surface at `document.params.portable_slots`; `:169` validates every non-boundary
  node-kind requirement before graph analysis. Requirements come from the existing
  kind grammar: `config_required`, falling back to `config_schema.required`
  (`:158`). Missing/undeclared values are directed `node_config_missing` errors
  naming `node <id> config.<field>` and saying `bind it or declare it as a slot`
  (`:189`).
- `platform/workflows/src/versions.lua:149` provides the launch-time repeat check;
  successful new publications mark only the frozen document at `:331`. Unmarked
  historic versions deliberately bypass it (`:146-155`).
- `platform/workflows/src/runs.lua:775` enforces that defense-in-depth check before
  engine creation, returning `config_requirements_unbound` at `:779`.
- `platform/workflows/src/store.lua:200` exports declared slots alongside the
  graph-derived interface (`:234-243`); `platform/workflows/src/definitions.lua:119`
  includes them in the portable definition artifact.

Slot grammar decision: no new kind-declaration grammar was introduced. A required
config field is valid when bound to a concrete non-empty value, or points to a key
declared in `params.portable_slots` using either `{ "kind": "slot", "key": "…" }`
or the existing exact token string `${slot:key}` (`graph.lua:139-155`).
`config.inputs.required` remains unrelated engine routing readiness.

Tests: `compiler/compile_test.lua:1071` covers missing, declared-slot, and
undeclared-slot cases; `versions_test.lua` covers publish refusal/marker; and
`runs_test.lua:435` covers marked-corrupt rejection plus legacy-version continuity.

## Task 2 — portable definitions REST export/import

What changed:

- `platform/workflows/src/api/definitions_api.lua:62` validates the source-only
  portable artifact; `:120` creates a new component plus ordinary definition-CQRS
  draft; `:171` applies the explicit READ gate before export; and `:178`/`:199`
  implement the HTTP handlers.
- `platform/workflows/src/api/_index.yaml:140` registers `GET
  /workflows/{id}/export`; `:159` registers `POST /workflows/import`. Root router
  targets are at `platform/workflows/src/_index.yaml:112`.
- Import resolves a case-insensitive title collision as `Title (imported)`, then
  `Title (imported 2)`, etc. It never calls publish and returns a version-0 draft.

Portable source JSON (GET response is `{ "success": true, "portable": <below> }`):

```json
{
  "schema_version": 1,
  "portable_key": "namespace/name",
  "kind": "workflow_definition",
  "version": 1,
  "refs": [],
  "slots": [{ "key": "knowledge_base", "required": true }],
  "spec": {
    "type": "kickside.workflows.flow_template",
    "portable_key": "namespace/name",
    "title": "Workflow title",
    "definition": {
      "slots": [{ "key": "knowledge_base", "required": true }],
      "document": { "nodes": [], "edges": [], "notes": [], "layout": {}, "params": {} }
    }
  },
  "checksum": "…"
}
```

POST accepts that portable object directly (not a compiled-command envelope) and
returns `{ "success": true, "workflow": { "workflow_id": "…", "title": "…",
"status": "draft", "published": false, "portable_key": "…" } }`. Malformed
source returns HTTP 400 with `code: "portable_invalid"`; unauthenticated requests
return 401; an authenticated non-reader receives 403 on export. Top-level and spec
`compiled_commands` are rejected.

Tests: `platform/workflows/src/definitions_api_test.lua:45` covers equivalent
round-trip draft, collision policy, published READ denial, malformed directed 4xx,
and HTTP authentication gates.

## Task 3 — list location breadcrumb

What changed:

- `core/component/src/persist/read_port.lua:119` now forwards the already-declared
  `include.placement` option to the reader, exposing parent id/path through the
  existing actor-scoped query.
- `platform/workflows/src/repo.lua:85` batches distinct parent ids through one
  second actor-scoped `component.query`, mapping returned parent `meta.title` to
  `parent_name` and `breadcrumb`. `repo.list` requests placement at `:200`, adds
  `parent_id` only for placed rows at `:224`, and performs the batch enrichment at
  `:265`. A parent omitted by the access-filtered batch is omitted from the row,
  preventing a title leak; root/unplaced rows have no location fields.

Tests: `platform/workflows/src/access_test.lua:71` creates a parent, a placed child,
and a root workflow; it asserts `parent_id`, `parent_name`, and `breadcrumb` for the
child and their absence for the root row.

## Verification and reload

Observed suite deltas (`cd platform/workflows/test && wippy run test`):

- Baseline: 259.
- Task 1: 263 green (the gate contributes compile/publish/run coverage; the shared
  workspace also gained one concurrent test).
- Task 2: 266 green (+3 portable API cases).
- Task 3: 267 green (+1 location case).

Reload is required for the running application to load these Lua/module-router
changes. It was intentionally **not** performed: the live app on 8085 was left
untouched.

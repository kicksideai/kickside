# W16.1 — kickside-workflow-embed (Face-4 embed web component)

FRONTEND lane. Working dir `platform/workflows/ui`. No production build; `static/` and
Lua untouched (one append-only YAML registry block in `src/_index.yaml`). Built on HEAD.

## Loading mechanism (followed, not invented)

The platform's by-tag shared-widget convention: a Vite lib **entry** builds one
self-registering ESM bundle; the module serves `static/` over its `http.static` mount; a
**`view.component` registry.entry** maps `tag_name -> base_path + entry_point`; the host
resolves the tag via `GET /components/by-tag/{tag}`, dynamically imports the bundle with
`?declare-tag=<tag>`, and the bundle's `define(import.meta.url, Class)` self-registers the
custom element. `auto_register: true` makes the host preregister the tag at boot so a
consumer can drop `<kickside-workflow-embed>` straight into a template (no `loadByTagName`);
it also mounts fine via `@widgets/app/WcMount.vue` / `loadByTagName`. Identical mechanism to
`wc-component-picker` (auto_register) and the sibling `kickside-workflow-setup`.

Concretely added:
- `src/workflow_embed.ts` — `WippyVueElement` subclass + `define(import.meta.url, ...)`,
  mirroring `workflow_setup.ts`. Props schema declares kebab attributes; root reads them
  camelCased (the useProps gotcha — `parseProps` exposes `workflow-id` as `workflowId`).
- `vite.config.ts` — new entry `workflow_embed` -> `static/workflow_embed.js` (deferred build).
- `src/_index.yaml` — append-only `workflow_embed_view` registry.entry (`tag_name:
  kickside-workflow-embed`, `base_path: kickside-workflows`, `entry_point: workflow_embed.js`,
  `auto_register: true`, `props`). `git diff --cached` verified: 32 insertions, 0 deletions,
  no other lines touched (the file also carries the codex lane's unrelated hunks, which were
  left unstaged).

## Tag + props contract (for module authors)

Mount by tag: `<kickside-workflow-embed workflow-id="019f...">` (or via WcMount).

| attribute     | meaning |
|---------------|---------|
| `workflow-id` | optional. Pins a published workflow. Omit to show a published-workflow picker (ALL published, no schema-compat filter). |
| `input`       | optional. Pre-mapped Start input as a JSON-object string. Omit to render the Start-schema-driven form. Invalid JSON / non-object surfaces a directed error, not a raw dump. |
| `mode`        | `run` (default): run + live status + Finish output rendered read-only. `dispatch`: fire-and-forget, confirms with the run id, no polling. |
| `label`       | optional action-button text. Default `Run workflow`. |

Behavior: resolves the workflow's published Start schema via `listWorkflows({partial:'published'})`
+ `analyzeWorkflowCandidate` (reused data layer); gates the payload against the Start schema
client-side (required-field presence) before launch; launches via `POST /workflows/{id}/run`
(the one runner door the builder uses); in run mode polls `GET /workflows/{id}/runs/{run_id}`
with backoff until terminal or unmount, rendering `run.output` (via `RunPayload.vue`) on
completion or the honest `run.error` reason / no-detail fallback on failure (W13). Published
only — never lists or runs drafts. 403 renders "You don't have access to this workflow." An
"Open in editor" anchor links `href=/workflows/{id}` (target=_blank, not a coupling).

## Files (key line refs)

- `src/workflow_embed.ts` — WC entry (`define` at :53).
- `src/app/EmbedWorkflow.vue` — orchestrator (resolve/picker/form/gate/launch/poll/render).
  `useProps` camel read via `embed-props`; SchemaEditor lazy-loaded (`defineAsyncComponent`)
  so the picker/dispatch/result paths don't pull the schema-form machinery.
- `src/app/EmbedWorkflowPicker.vue` — picker over ALL published workflows (reuses
  `listWorkflows` + `analyzeWorkflowCandidate`; filters only on `published_version`).
- `src/app/embed-props.ts` — pure prop parsing: `readEmbedProps` / `parseInputProp` /
  `normalizeMode` (camel-first, kebab fallback).
- `src/app/embed-run.ts` — pure: `inputGate`/`missingRequiredFields` (input gate),
  `nextPollDelay` (backoff), `isTerminalStatus`, `runView` (RunRow -> render view).
- `src/app/api.ts` — `RunRow.output` (`:162-174`) + `asRunRow` maps it (`:219-231`); the
  run-output read seam (85f379a4).
- `src/styles.css` — `.wf-embed-*` (tokens-only `--wf-*`/`--p-*`, appended at end).

## Workaround removal (trust server has_draft_changes)

The FE was computing draft state client-side (`headSeq > latest.def_seq + 1`) because the
server's `has_draft_changes` over-counted the publish marker; that is fixed server-side
(95229486, markers excluded). Switched the FE to trust the server:
- `src/app/workflow-call.ts:88-94` — `hasDraftChanges = summary.has_draft_changes === true`
  (dropped the `|| headSeq > publishedDefSeq` re-derivation and the now-unused head/def locals).
- `src/app/version-history.ts:17-20` — `hasUnpublishedEdits` now compares the server's
  **marker-excluded** definition edit head to the version's def_seq (`> def_seq`, no `+1`).
- Threaded that value: `types.ts` (`WfDoc.definitionEditSeq`), `sync.ts` (folded from
  `/state.definition_edit_seq`, fallback head_seq; advanced in lockstep by recognized edit
  events, never by the unknown `version.published` marker), `WorkflowCanvas.vue` +
  `VersionHistoryPanel.vue` (prop `headSeq` -> `definitionEditSeq`).
- Mapping tests against the fixed shape: `workflow-call.test.ts` (clean published workflow
  reads `has_draft_changes:false` verbatim), `version-history.test.ts` (edit-head vs def_seq),
  `sync.test.ts` (marker excluded from the edit head).

## Test delta

Baseline 223 -> **255 green** (+32). vue-tsc: touched files clean; only the 3 pre-existing
project errors remain (`WorkflowSetup.vue`, `workflow_setup.ts`, `widgets/ports.ts`).
- `embed-props.test.ts` (10), `embed-run.test.ts` (12), `embed-workflow.test.ts` (2 mount),
  `run-payload.test.ts` (1), `api.test.ts` (+2 getRun output), `sync.test.ts` (+4 edit head),
  `workflow-call.test.ts` (+1 server field). `version-history.test.ts` rewritten (same count).

Real live fixtures (own test artifacts, captured via admin token against :8085):
- `run-e754dc50-completed-detail.json` — completed run of "adv-runner-contract", real Finish
  output `{"x":"ok"}` assembled into the fixed run-detail shape. "UX Audit Sandwich" could not
  produce a completed run — it fails at its "Refund Triage" agent node.
- `run-589d3cb5-failed-detail.json` — real failed run of "UX Audit Sandwich" (agent node, bare
  "Failed"): the W13 swallowed-reason case, drives the honest no-detail fallback.

## Build-deferred / live state

- No production build run; `static/` untouched. `static/workflow_embed.js` and the updated
  `wippy-meta.json` land at the next `ui` build + static sync; the tag will not resolve on the
  live :8085 app until then (registry entry_point points at that file).
- The live :8085 backend is ALSO stale on 95229486 and 85f379a4: it still reports
  `has_draft_changes:true` for a clean published workflow and omits `run.output` on completed
  run detail. The FE is written against the corrected primitives (source); both land on the
  next backend reload. Fixtures use the fixed shapes, not the stale-live shapes.

## Commits (scoped, not pushed; on `main` — did not branch to avoid moving the shared HEAD the
codex src lane is committing against)

- `2fd1b06e` workflows/ui: trust server has_draft_changes, drop client draft workaround
- `d8ecc57e` workflows/ui: kickside-workflow-embed Face-4 web component (W16.1)
- `26da03b2` workflows: register kickside-workflow-embed tag (view.component)

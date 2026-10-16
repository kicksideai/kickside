# Workflow assist reliability hardening

Date: 2026-07-09

Scope: `platform/workflows/src` and its Lua suite only. The live process on
port 8085 was not restarted and no UI static assets were rebuilt.

## Investigation

### Assist paths, model routing, and timeout baseline

Both authoring assists use the same LLM call path:

| Path | Entry | LLM call | Model/provider selection | Baseline timeout |
| --- | --- | --- | --- | --- |
| Edge mapping | `platform/workflows/src/assist.lua:439-471` | `default_generate` -> `structured_generate` (`:299-302`, `:258-297`) | `class:fast`, not a concrete provider/model id | None explicitly set by workflows |
| JSON Schema | `platform/workflows/src/assist.lua:473-512` | `default_schema_generate` -> `structured_generate` (`:304-307`, `:258-297`) | The same `class:fast` class selector | None explicitly set by workflows |

At the inspected pre-change baseline, the selector was `class:fast` at
`platform/workflows/src/assist.lua:15`; its call at `:214-219` passed only
`model` and `temperature`. Therefore the timeout was the routed provider's
default, not an explicit workflows bound.

`class:fast` already uses the platform model-selection convention:

- `kickside.models` binds its resolver as the default
  `wippy.llm:model_resolver` at `platform/models/src/_index.yaml:150-158`.
- The resolver delegates to the merged model catalog at
  `platform/models/src/resolver.lua:5-9`.
- That catalog resolves `class:<name>` and selects the highest-priority enabled
  configured member at `platform/models/src/model_catalog.lua:109-140`.
- The shared LLM implementation invokes the bound resolver before fallback
  registry discovery, then opens the selected card's first provider; see
  `wippy/framework/src/llm/src/llm.lua:157-180` and `:610-652` in the local
  Wippy runtime source.

Conclusion: neither assist path hardcoded an OpenAI provider nor a concrete
model ID. It used the platform's `fast` class, so no new model config surface
or module-level model default was added.

### Failure shape before the change

The pre-change helper converted the provider error to text
(`platform/workflows/src/assist.lua:184-188` still shows the formatter), then
the old edge/schema paths interpolated it directly into `error` (baseline
`HEAD:platform/workflows/src/assist.lua:391` and `:422`). Thus an upstream
`OpenAI API error: 504` reached the client verbatim. The HTTP endpoints also
always returned 200 after calling assist (baseline
`HEAD:platform/workflows/src/api/assist_api.lua:67-75` and `:93-99`).

## Changes

- Added a 20-second explicit timeout to every attempt of the shared structured
  assist call: `platform/workflows/src/assist.lua:258-274`.
- Added one retry only (two total attempts), with a 250 ms backoff for a typed
  retryable error, 5xx status, or timeout text: `assist.lua:190-216` and
  `:267-285`. Both edge and schema paths enter this same helper.
- Wrapped thrown provider/runtime failures with `pcall` in the same helper, so
  they also become an assist result rather than an HTTP 500 (`assist.lua:267-279`).
- Replaced exhausted/provider failures with the stable, non-provider error
  body:

  ```json
  {
    "success": false,
    "error": "assist_unavailable",
    "message": "AI assist is temporarily unavailable. Please try again in a moment, or continue editing manually."
  }
  ```

  Its construction and propagation are at `assist.lua:218-224`, `:462-465`,
  and `:498-501`; raw provider text is intentionally omitted.
- The HTTP handlers now preserve the module convention of a top-level stable
  `error` plus human `message`, and return this particular service failure as
  JSON HTTP 503 rather than 500: `platform/workflows/src/api/assist_api.lua:51-58`,
  `:76-83`, and `:101-106`.
- Added `time` to the assist library declaration because it performs the bounded
  retry delay: `platform/workflows/src/_index.yaml:552-561`.

## Tests

Standard module command: `cd platform/workflows/test && wippy run test`.

- Before changes: **202 tests passed**.
- After changes: **205 tests passed** (**+3**), in 5.3 seconds.
- New coverage in `platform/workflows/src/assist_test.lua`:
  - retry then success, including exactly two calls and one 250 ms backoff
    (`:164-184`);
  - retry then structured `assist_unavailable`, with no provider/504 text in
    the human message (`:186-206`);
  - schema-assist timeout option bounded to 20 seconds (`:320-343`).

`wippy lint` was also run after the change. The assist changes are lint-clean;
the command still reports one unrelated, pre-existing type-check error in
`platform/workflows/src/kind_test.lua:158` (`component` field inference). No
unrelated test was relaxed or edited.

## Live-service note

**Restart required: yes.** The application already running on 8085 continues
to execute its old loaded Lua code until the GTM session restarts it. No restart
was performed during this work.

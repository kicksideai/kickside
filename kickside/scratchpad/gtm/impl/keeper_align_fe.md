# Keeper-aligned workflows frontend

Date: 2026-07-10

## Delivered

- Run inspector: added an API-backed Timeline tab with paged workflow lifecycle and
  engine events, collapsed raw payloads, and directed loading/empty/error states.
  The overview now shows the known parent/current/child run branch, a redacted-run JSON
  download (`workflow-run-<id>.redacted.json`), and a Keeper dataflow link only when a
  `dataflow_id` exists. Selected node inspection shows engine-node and parent-engine-node
  identities plus known process identity in a compact mono row.
- Version history: added immutable graph/interface diff viewing (added/removed/changed
  nodes and edges, with record titles when present) and the existing warning treatment
  for interface compatibility changes. Restore requires an explicit confirmation that it
  creates a separate unpublished draft and never mutates history; success navigates to
  that returned draft.
- Builder: replaced the manager-navigation Automate shortcut with **Add trigger**. It
  opens the auto-registered shared `<kickside-recipe-config>` in a builder modal with
  `workflow-id` pre-bound. Copy explicitly says it creates an Automation and leaves the
  workflow definition pure. The success state names the returned binding and links to
  the Automations manager (there is no truthful individual binding manage route).

## Verification

- Baseline: 45 Vitest files / 449 tests green.
- Final: 48 Vitest files / 460 tests green (+11).
- Added focused pure/mount coverage for timeline/hierarchy/export mapping, graph-diff
  mapping, restore-as-new-draft messaging/routing and API call, and shared assembler
  mount wiring plus its created state.
- `npx vue-tsc --noEmit` clean.
- `npm run build` green; workflows static assets rebuilt.
- Visual/browser verification was not driven here and is deferred to the orchestrator's
  next live wave.

## Scope

Only `platform/workflows/ui`, its generated `platform/workflows/static` bundle, and this
report are part of this frontend slice. No Lua source, `app/wippy.lock`, or unrelated
packages are included.

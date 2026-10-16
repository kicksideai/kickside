# Platform audit — frontend fix batch

Scope: platform/connection/ui, platform/knowledge/ui, platform/models/ui,
providers/kb10/ui, chestor/workspace/ui, and the shared radius-canon dedup across the
9 UI packages. No src Lua touched. app/wippy.lock untouched. Commits scoped per repo; not
pushed.

## Per-finding results

**#5 connection — load failure masqueraded as empty catalog (W13).**
Onboard.vue and connections.vue wrapped each catalog/list request in a per-request
`.catch(() => empty)` that swallowed failures, so an outage rendered the honest empty
state. Removed the fallbacks; a failed fetch now reaches the outer catch and drives a
directed error state with a Retry that re-runs the load, distinct from the empty state on
a successful-but-empty load. connections.vue splits `loadError` (initial load — replaces
content) from the existing inline `error` (row actions — stays non-destructive). Onboard
keeps the wizard footer reachable on error. Files: `platform/connection/ui/src/app/{Onboard,connections}.vue`,
`styles.css`, new `app/errorstate.spec.ts` (4 mount tests: error+retry and empty for both
components).

**#6 knowledge — engine/model catalog outage hidden as empty options.**
KbCreate collapsed a failed engines/models fetch into `[]`, opening the dialog with a false
"no engine installed" empty notice. KbDialog now takes a `loadError` prop + emits `retry`;
when set it renders a directed error with retry in the type catalog instead of the empty
notice. Both callers wired: KbCreate (workspace "+" host element) and the knowledge page's
`openCreate` load the catalog with outage-vs-empty distinction (fixing the same parallel
masking path in knowledge.vue). Files: `platform/knowledge/ui/src/app/{KbCreate,KbDialog,knowledge}.vue`,
`styles.css`, new `app/kbcreate.spec.ts` (2 mount tests).

**#8 models + chestor/workspace — copied 18-file shared shell.**
No full consolidation (that stays the platform ticket — see below). The 18 shared files
are byte-identical; the styles.css copies had drifted: workspace's copy of the shared shell
had non-canon border-radii (7px/5px/3px) where canonical models uses 8/6/999px, undetected
because workspace has no radius-canon guard. Realigned the 5 drifted shared-shell radii and
added a one-line provenance comment to each vendored copy (17 components + index.ts + the
shared styles.css portion) pointing at the canonical models source; added a reciprocal note
on the models barrel. Files: `chestor/workspace/ui/src/styles.css` + `app/shared/*`,
`platform/models/ui/src/app/shared/index.ts`.
- Out of scope, noted: `.ws-menu-item` (5px) in workspace's OWN `.ws-*` shell is non-canon;
  belongs to the radius-alias consolidation, not the copied-shell drift.

**#9 kb10 — private radius token system.**
All kb10 radius tokens/literals already resolve to canon (`--kb-r:8`, `--kb-r-card:14`,
`--kb-r-sm:6`, `--doc-radius:14`; literals 8/6/14/10/11/999/50%/4/2 — the census lane's
`--kb-r-card` fix was the last drift). Guardrail present and green; folded into the shared
factory (#10). No value changes needed.

**#10 radius-canon test copied 9x → one shared factory.**
Extracted the 104-line scanner into `platform/widgets/ui/src/app/radiusCanon.ts` exporting
`registerRadiusCanon({ srcDir, allow })`. All 9 package tests become ~8-line wrappers passing
their own source root; scanning logic + canon table live once. Main-repo 8 packages import
via the existing `@widgets` alias; kb10 (providers repo) imports via a `@widgets` alias added
to its vitest.config pointing at the sibling platform tree — the same source-loaded layout
app/wippy.lock already assumes. All 9 radius tests green.

## Verification

- Suites (touched packages): widgets 98/98, knowledge 19/19, models 14/14, automation 94/94,
  hub 98/98, recipes 31/31, uploads 10/10, workspace 3/3 — all green.
  connection 16/17, kb10 81/82 — the single failure in each is PRE-EXISTING and orthogonal
  (connection realtime-meta patch test; kb10 AddPanel upload-pipeline test), present at
  baseline before this batch, unrelated to any finding here.
- Test deltas: connection +4 (errorstate.spec), knowledge +2 (kbcreate.spec), kb10 test file
  -102 lines (shared factory). All 9 radius-canon tests pass via the factory.
- Builds: `npm run build` (vite) green for widgets, connection, knowledge, models, kb10,
  workspace. (radius-wrapper-only packages unchanged in-bundle — test files excluded.)
- vue-tsc: no vue-tsc binary is installed in this checkout (app-level `type-check` script
  exists but the binary is absent), so type verification was via vite build (compiles all
  SFCs/TS, resolves imports/templates) + the @vue/test-utils mount tests that exercise the
  new code paths. No type regressions surfaced.
- Live error-state spot-check: done as mount tests (both branches, with a simulated
  rejected fetch) — the accepted proof per the brief; the states need a simulated outage.

## Not committed / follow-ups

- Regenerated static bundles (connection/knowledge/workspace `../static/*.js`) were produced
  by the build-verification and left uncommitted: chestor's static is contaminated by
  concurrent-lane changes so a clean static commit is impossible there; applied a uniform
  source-only policy across repos. Static is deterministically rebuilt by `npm run build` /
  CI. (git checkout/restore are disallowed here, so the regenerated static remains in the
  working tree.)
- Consolidation ticket (unchanged, deferred): the models/workspace shared shell (18 files +
  ~1,484-line styles.css) is still two sources of truth. Proper fix = one owned shared UI
  package consumed by both (or workspace consuming the shell by tag), not the byte copy.
  The provenance comments make the drift visible in the interim.
- The kb10 radius wrapper's `@widgets` alias couples kb10's test resolution to the
  co-checked-out platform tree; the fully-decoupled fix is a published shared test-util
  package (out of scope).

## Commits

- main: `test(ui): extract shared radius-canon guardrail into widgets factory` (#10);
  `fix(connection/ui): surface load failures instead of empty catalogs` (#5);
  `fix(knowledge/ui): distinguish engine/model outage from empty catalog` (#6);
  `docs(models/ui): note the shared shell is vendored by chestor/workspace` (#8).
- providers: `test(kb10/ui): use the shared radius-canon guardrail` (#9/#10).
- chestor: `fix(workspace/ui): realign vendored models shell to canon + add provenance` (#8).

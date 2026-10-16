# W14 version visibility (builder UI) — implementation

Frontend-only, visibility scope (W14.2 run display + W14.5 history UX surface). No
pin-policy, no diff, no restore, no graph time-travel — those need backend + owner sign-off.
Working dir: `platform/workflows/ui`. No production build; source + vitest + vue-tsc only.
`static/` and `platform/workflows/src` untouched.

## Scope 1 — run version chip

The runs API already returns `version` (and `origin`) per run; the UI never rendered it.

- `src/app/api.ts:167-168` — `RunRow` gains `version: number` (+ `origin?: string`);
  `src/app/api.ts:223-224` `asRunRow` maps them (absent version -> 0).
- `src/app/run-history.ts:60-84` — new pure `runVersionBadge(version)` -> `{ label, kind,
  title }`: `v{n}`/`published` for a positive version, `Draft run`/`draft` for version 0.
- Rendered in three places: runs list rows (`RunsPanel.vue:14,37`), the run inspector
  header (`RunNodeOutput.vue:64,77`), and the "viewing run" banner
  (`WorkflowCanvas.vue:928`). Chip styles `.wf-run-ver` at `styles.css:205-213`.

### version-0 naming decision — "Draft run"

`runs.lua:805-846` `M.simulate` compiles the *current unpublished draft canvas* and launches
it as a transient run with `version = 0`, `origin = "simulation"`, `trigger_kind =
"simulation"`. Version 0 therefore never pinned a published version — it ran the draft. Live
confirms: run `88444c66` = `version:1, origin:published`; run `e3bc833e` = `version:0,
origin:simulation`. The builder's own "Run" button IS this simulate path ("no publish, no
version"). So version 0 is labelled **"Draft run"** (title: "Ran the unpublished draft canvas
— not a published version"), never a fake `v0`. Honesty rule satisfied — no run is implied to
have executed a published version when it did not.

## Scope 2 — version history panel

Attached to the existing publish affordance (a `tabler:versions` icon button beside Publish),
not a new page — `WorkflowCanvas.vue:897-913`, popover `historyOpen` state at 725-735,
mutually exclusive with the Runs/Simulate popovers.

- New `src/app/VersionHistoryPanel.vue` — lists published versions newest-first (v{n}, when,
  who), marks the head as "Current", and on selecting a version fetches its frozen interface
  and shows a read-only In/Out/Error key summary. Styles `.wf-vers-*` at `styles.css:215-260`.
- New pure core `src/app/version-history.ts`: `summarizeInterface`/`fieldSummary`
  (interface -> presentation) and `hasUnpublishedEdits` (draft indicator).
- `types.ts:161-171` — `WorkflowInterface` extended with `error_schema/error_count/error_keys`
  (versions.get returns the Error side too); `api.ts:51-59` `asInterface` maps them.

### draft indicator — deviation from the recon, and why (backend finding)

The recon says to reflect the list API's `has_draft_changes`. Live testing shows that flag is
**structurally always-true after any publish**: `versions.publish` appends a non-projected
`version.published` marker at `def_seq + 1` (`versions.lua:154-159`), and `has_draft_changes =
head_seq > published_def_seq` (`repo.lua:100`) counts that marker. Every published workflow in
the live instance reports `head_seq = published_def_seq + 1` and `has_draft_changes: true`,
even freshly published with zero edits (state endpoint confirmed head_seq=42 vs version
def_seq=41 for "UX Audit Sandwich", no edits). Reflecting it verbatim would show "draft
changes" on every published workflow — dishonest noise.

So the panel derives the indicator truthfully from the def-event stream:
`hasUnpublishedEdits(headSeq, latestVersion.def_seq) = headSeq > def_seq + 1` — the canvas
head strictly beyond the single publish marker. This reads clean right after publish and flips
to "unpublished edits since v{n}" on the first authored edit. It reads the canvas's own
`engine.doc.headSeq` (live-reactive) — no extra fetch, no dependency on the broken flag.

**Backend follow-up (not my lane — src is the codex lane):** `has_draft_changes` over-reports
by the publish marker; the correct fix is to exclude the marker from the head/def comparison
in `repo.lua:100`. Flagging for backend + owner.

## Scope 3 — dead code wired up

`listWorkflowVersions()` (`api.ts`), previously never called anywhere in the builder, is now
the version list source for the history panel. Added a sibling `getWorkflowVersion(id, n)`
(`api.ts:260-282`) for the per-version interface — a new read (no prior parallel fetch
existed), reusing `asInterface`; no duplicate version store or refetch path introduced.

## Scope 4 — honesty

Read-only throughout: header note "Read-only", version rows are selection-only (no edit/
restore/rollback buttons), the empty state says "Publish to freeze the current canvas as v1 —
it stays editable as a draft." Nowhere implies an old version can be edited or restored.

## Verify

- vitest: 189 -> 206 passing (17 new + 1 snapshot updated for the drawer version chip).
  New tests: `run-history.test.ts` runVersionBadge (3), `version-history.test.ts` (11, real
  live-API interface + def_seq/head_seq fixtures), `api.test.ts` listRuns/listWorkflowVersions/
  getWorkflowVersion mapping (3). Pure-ts only; fixtures are real live responses.
- vue-tsc: touched files clean. 3 remaining project errors (`WorkflowSetup.vue`,
  `workflow_setup.ts`, `widgets/ports.ts`) are pre-existing, untouched by this change.

## Build-deferred

No production build run; `static/` (live :8085 bundle) untouched — these source + CSS changes
do not reach the running app until a build+static sync is done separately. Commit scoped to
`platform/workflows/ui`, not pushed.

## Files

- `src/app/api.ts` — RunRow.version/origin, asRunRow, asInterface error fields,
  WorkflowVersionDetail + getWorkflowVersion
- `src/app/types.ts` — WorkflowInterface error fields
- `src/app/run-history.ts` — runVersionBadge
- `src/app/version-history.ts` (new) — hasUnpublishedEdits, summarizeInterface, fieldSummary
- `src/app/VersionHistoryPanel.vue` (new)
- `src/app/RunsPanel.vue`, `src/app/RunNodeOutput.vue`, `src/app/WorkflowCanvas.vue` — chip +
  history popover
- `src/styles.css` — .wf-run-ver, .wf-vers-*
- tests: `run-history.test.ts`, `version-history.test.ts` (new), `api.test.ts`,
  `run-node-output.test.ts` (fixture + snapshot)

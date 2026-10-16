# Workflow draft-change marker fix

## Mechanism

`has_draft_changes` now compares the latest command-derived definition edit sequence
to the latest published version's `def_seq`, rather than comparing the raw event-stream
head. `version.published` is a non-projected marker at `def_seq + 1`, so it no longer
makes a freshly published workflow appear dirty.

The edit-event set is derived from `types.COMMAND_TO_EVENT`. This is future-proof:
new definition commands automatically count as edits, while any new non-command marker
event is excluded without relying on a fixed marker offset or a special-case type list.

## Implementation

- `platform/workflows/src/store.lua:18-27` derives the command-event set; `:340-353`
  reads its latest sequence; `:355-378` returns it with the current raw head.
- `platform/workflows/src/repo.lua:91-101` retains raw `head_seq` for clients but derives
  `has_draft_changes` from `definition_edit_seq > published_def_seq`.
- `platform/workflows/src/access_test.lua:113-170` covers publish clean, real edit dirty,
  second publish clean, and an additional future non-edit marker remaining clean.

## Verification

`cd platform/workflows/test && wippy run test` passed: **218/218** (baseline 217/217;
one regression test added).

## Restart required

Yes. Deploy/reload the workflows backend for a running service to load the changed Lua
modules. No live-app restart was performed.

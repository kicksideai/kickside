# W20 matrix close-out — 2026-07-11

Live on http://localhost:8085 (admin@wippy.local), isolated headless Chrome via playwright-core
(`s9_drv/lib.mjs`). Screenshots in `kickside/scratchpad/w20/`. One reload performed (boot29) for the
item-3 registry declaration; no other restarts/builds/git.

## Per-item result

### 1. SHARE (scenario 16 sub-gap) — PASS

`kickside-share` driven live from **both** entry points on the published "W20 — Parent (calls child)"
(`019f4efd`):

- **List row menu**: row "…" → Share → dialog "Share · W20 — Parent (calls child)" → typeahead found
  `S9 Outsider` → default cap Read → Share. Toast "Shared · S9 Outsider"; access list added the
  outsider. `w20c_share_list_2_dialog.png`, `w20c_share_list_5_granted.png`.
- **Builder header**: open builder → header Share → same dialog (shows the same access model, outsider
  already present) → toggled Write on the outsider row live. `w20c_share_builder_2_dialog.png`,
  `w20c_share_builder_3_write_added.png`.

Grant round-trip (the load-bearing proof), principal `s9-outsider@wippy.local` (`a6fb95e1`):

| endpoint | pre-grant | post-grant |
|---|---|---|
| `GET /workflows/{id}/state` | 403 access denied | **200** |
| `GET /workflows/{id}/export` | 403 access denied | **200** |
| `GET /component-access/grants/{id}` | 403 | 403 (correct — READ ≠ admin) |

Owner access list went `[admin(15)]` → `[admin(15), outsider(1)]`, then `outsider(3)` after the
builder-header Write toggle. Grant **persists across the reload** (post-boot29: outsider still 200).
Drivers: `s9_drv/w20c_share_baseline.mjs`, `w20c_share_list.mjs`, `w20c_share_builder.mjs`.

### 2. SCENARIO 8 (contract pre-seed via flow points) — PASS

Customizing the CRM's declared "S9 — CRM Enrichment Slot" opens a draft that carries the slot
default's contract into the editor:

- The customize draft (`019f4fba`) shares the default runnable's **exact boundary node UUIDs**
  (start `19b076e3`, finish `466bb81e`, error `3848d86c`) and interface, and reproduces its full
  graph (`start+agent+finish+error`) — an exact clone of the slot default, not a fresh scaffold.
- In the builder, the Start boundary panel shows **"WORKFLOW INPUTS AND RESULTS — LOCKED"**, INPUT
  SCHEMA `{"type":"object","properties":{}}`, and **"Pinned — a boundary node can't be deleted."** —
  i.e. the editor opened with a passed reference to the expected input/output/error contract.
- Contrast: a bare "New workflow" seeds no boundary schemas.

Precise nuance (in the W20 status): the shipped default (Inline Agent Smoke v2) declares a generic
typed-object interface, so the pre-seeded contract is generic-object-typed — the pre-seed
**mechanism** (exact clone of the slot default) is what satisfies scenario 8's intent, not a rich
named-field schema. Screenshot `w20c_s8_3_start_schema.png`. Drivers `s9_drv/w20c_s8*.mjs`.

### 3. SCENARIO 16 full vision (multi-stage) — PASS

Declared a SECOND flow point `s9.crm.qualify.v1` on the same CRM component (title "S9 — CRM
Qualification Slot", distinct default = the existing clone `019f4f7f` v3, envelope-valid — proven by
its successful binding to enrich). Registry edit in `platform/workflows/src/_index.yaml`; one reload
(boot29, HTTP 200, 0 ERROR-level lines). Post-reload the WC renders **two independently-configured
stages**:

- "S9 — CRM Enrichment Slot" — **Customized · Workflow …ee2d0 v3** (bound to the existing clone) —
  actions Edit / Bind existing / Restore default.
- "S9 — CRM Qualification Slot" — **Using default** — actions Customize / Bind existing.

The owner's "different workflows on different stages" story, driven. Screenshot
`w20c_s16_two_stages.png`. Driver `s9_drv/w20c_s16.mjs`.

## Reload

boot29 per procedure: SIGTERM pid 1014041 → SIGKILL after 6s → `wippy run -c` (source-replacement
mode, honors the `kickside/workflows → ../platform/workflows` lock replacement). `live_8085_boot29.log`:
HTTP 200, 0 true ERROR-level lines, 0 fatal/panic, flow_point contract bindings registered, both
points list (`enrich`=customized, `qualify`=default, neither incompatible).

## Bonus — scenario 13 (in-builder trigger) re-confirmed live

The last non-target prior gap: builder → Add trigger now renders the full `kickside-recipe-config`
(Name, Runs, When On-a-schedule, and the trigger→Start field mapper) — no longer empty.
`w20c_s13_add_trigger.png`.

## Notes / defects

- **Residual cosmetic (L5):** customize/import clones auto-title from the humanized portable_key
  ("Workflow 019f4dc6…"); a `param.set title` apply is shadowed by the portable-key derivation.
  Non-blocking.
- **Latent defect found (pre-existing):** restore (`flow_points.delete_binding`) deletes the
  `flow_bindings` row but not the `flow_binding_revisions` audit rows, so the first re-bind after a
  restore collides on `(binding_id, revision)` and returns 400 — yet the `flow_bindings` INSERT
  (ON CONFLICT UPDATE) still commits, so the point resolves. Rebinding at the current revision writes
  a clean revision-log row (used here: enrich is cleanly Customized at revision 2). Fix-forward
  (out of scope for this close-out): `delete_binding` should also purge/tombstone the point's
  revision log, or the log should key on an invocation UUID rather than the reused revision integer.

## Final tally: 16 / 16 PASS

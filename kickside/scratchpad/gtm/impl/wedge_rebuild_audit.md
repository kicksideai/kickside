# Constructor proof — rebuilding the inbound-lead pre-call wedge by hand

**Artifact:** workflow "Wedge rebuilt by hand" — id `019f494d-c2d3-72c5-a217-fbe7cc80ec26`, **published clean as v1** (def_seq 103).
**Reference:** installed "Inbound lead pre-call wedge" (`019f48db-2c9e-7517-9076-6796aea97d4a`) — 15 nodes / 27 edges.
**Method:** UI-only authoring through the visual builder (palette drag, port-drag edges, config panels, transform editor, schema/edge AI assist). API used only to inspect/diff. Workflow was NOT run (per instructions).

Screenshots: `e2e-shots/rebuild-01..06-*.png`.

## What got built vs the reference

| | Reference | Hand-built | Note |
|---|---|---|---|
| Nodes | 15 | 13 | missing the 2 `func`/passthrough relay nodes |
| Edges | 27 | 18 | missing 7 `[failed]→Error` + 2 passthrough-hop edges |
| Node kinds | 12 distinct | 11 distinct | only `func` (passthrough) unexpressible |
| Edge transforms | present | 18/18 authored, incl. `passed_items[1]` | all verbatim to reference |
| Start input schema | declared | authored via AI-assist from prose | near-identical |
| Boundary schemas | set | set (hand-typed JSON) | publish-gating |
| Publish | v2 | **v1, clean** | after boundary schemas set |

## Step-by-step grade

Friction 1 (trivial) … 5 (painful/blocked).

| Step / construct | Achievable via UI? | Friction | Gap |
|---|---|---|---|
| Create workflow ("Blank") | Yes | 1 | Blank canvas has **no** Start/Finish/Error; user must add all three |
| Start (boundary) | Yes | 2 | schema is raw-JSON textarea; mitigated by prose AI-assist |
| Start input schema via AI | Yes | 1 | prose → schema produced near-perfect result |
| resolve_contact (GTM) | Yes (palette) | 1 | named ports `resolved`/`review_required` exposed |
| resolve_review_required (`func` passthrough) | **No** | 5 | no function/relay/passthrough node in palette |
| owned_data_read (GTM) | Node yes, **config no** | 3 | config panel has **zero fields**; declared refs (crm/voice/reader) unsettable — supplied via edge data instead |
| score_fit (GTM) | Yes | 1 | — |
| score_join / brief_join / review_join (`join`) | Yes | 2 | `output_mode` select (object/array) renders; 2-input wiring works |
| lane_guard (GTM) | Yes | 1 | named ports `pass`/`block` exposed |
| lane_blocked (`func` passthrough) | **No** | 5 | same passthrough gap; wired `block→Error` directly instead |
| compose_brief / draft_reply (GTM) | Yes | 1 | no config fields (none needed) |
| brief_review (Human) | Yes, fully | 1 | Priority enum select + Draft/Brief/Thread id + Timeout fields render & persist |
| Finish (boundary) | Yes | 2 | output_schema raw-JSON; **empty default blocks publish** |
| Error (boundary) | Yes | 2 | error_schema raw-JSON; empty default blocks publish |
| Edge: Start→resolve (hardcoded crm_id + input.*) | Yes | 2 | literal + field refs typed into mapping textarea |
| Edge: named outcome ports (resolved/pass/block/approve/edit/reject) | Yes | 2 | port-drag from named handle works, lands on exact port |
| Edge: `passed_items[1]` 1-based mapping | Yes | 2 | authored 1-based, stored verbatim |
| Edge: joins (2 inputs → in1/in2) | Yes | 2 | — |
| Edge: **node[failed]→Error** (7×) | **No** | 5 | no `failed` source handle on any node; can't route failures to Error |
| Edge transforms generally | Yes | 2 | commit-on-blur worked reliably (no quirk bite observed) |
| Edge "Map fields with AI" | Partial | 3 | returns a valid mapping (`/assist/edge` 200) but did not visibly populate the field; uses `output?.` not `input.` |
| Publish | Yes | 2 | precise blocking message, then clean |

## Cannot-express list (headline)

1. **`func`/passthrough (relay) nodes** — the palette (Structure / Agents / Automations / Workflows / Logic / Human / Tools 126 / Destinations 10 / CRM / GTM) has no generic Function/Relay/Passthrough step. Searching "passthrough"/"function"/"relay" returns only Sticky Note & Frame. The template's 2 relay nodes have no UI equivalent. (Workaround: their reshape can live on a direct edge transform, so functionally recoverable — but the node itself is not.)
2. **`[failed]` error-routing edges (7)** — no fallible node exposes a `failed` source port. The engine gates the failed face on a per-node `failed_port` config flag, and **the builder has no control for it anywhere** (absent from the config panel and the built bundle). So no step can be wired to the Error boundary on failure, and the per-node error-code transforms (`{ code:'…_failed', error: error }`) cannot be authored. This removes the wedge's entire error-handling layer.

Everything else in the wedge — all 11 real node kinds, every named outcome port, all edge data-mappings including the 1-based `passed_items[1]` subscript, joins, boundary schemas, the brief_review enum+fields, and the Start input schema — IS expressible in the UI.

## Raw-JSON moments

1. **Start input_schema** — raw JSON textarea (mitigated: prose "Describe the schema" + AI-assist).
2. **Finish output_schema** — raw JSON textarea (assist present, but empty default silently blocks publish).
3. **Error error_schema** — raw JSON textarea (same).
4. **Edge mapping (transform)** — raw expression DSL text (mitigated: "Map fields with AI").
5. **Edge condition (WHEN)** — raw expression text, **no assist**.

## AI-assist coverage

- **Start/boundary schema assist — strong.** Prose ("An inbound lead: required email, name, source … optional company that is a name string or an object") produced `{required:[email,name,source], company: oneOf[string,object], message optional}` — a near-exact match to the reference input schema, including the `oneOf` company shape. Present on all boundary panels.
- **Edge "Map fields with AI" — works but rough.** `/assist/edge` returns a real field-by-field mapping. Two issues: (a) the returned transform did not visibly land in the editor in my run; (b) it emits `output?.field`, whereas templates and the working grammar use `input.field` — a vocabulary split that will confuse users (the field placeholder also says `output.id`).
- **No assist for the edge CONDITION** field — that stays a raw expression.
- Both assists require a genuine click (a synthesized click event does not trigger them — harness note, not a product defect).

## Validation / compile

- Continuous canvas validation is thin: no dangling-node or unmapped-input warnings appear while building.
- Publish validation is precise and actionable: first attempt returned *"Not publishable: Finish boundary requires config.output_schema; Error boundary requires config.error_schema."* After setting both schemas, publish succeeded and minted v1.

## Publish result

**Clean publish, v1.** The only blocker was the two empty boundary schemas; once set to `{type:object, additionalProperties:true}` the hand-built graph compiled and published with no further complaints — despite 18 edges, 3 joins, named-port fan-out, and 18 authored transforms.

## Top 10 authoring-UX fixes (ranked)

1. **Expose a node error/`failed` output port** (a `failed_port` toggle, or an always-present error handle) so fallible steps can route to Error with a transform. Single highest-value fix — unlocks the entire error layer (7 edges).
2. **Unify the transform vocabulary.** Field placeholder + Map-fields-AI use `output.*`; templates and the compiling grammar use `input.*`. Pick one and make the AI-assist emit it.
3. **Surface config fields on GTM/tool nodes.** owned_data_read (and peers) show an empty panel; their declared config (crm/voice/reader refs) is unsettable except via edge data.
4. **Default boundary schemas to a publishable value** (`{type:object, additionalProperties:true}`) instead of an empty stub that silently blocks publish; keep the prose assist.
5. **Prevent the duplicate-pinned-boundary trap.** A second Start/Finish/Error can be dropped but is pinned and **undeletable** via UI — an unrecoverable dead end. Block the drop or allow removal of the extra.
6. **Auto-scaffold Start/Finish/Error on "Blank"** (or hint hard), so the interface contract isn't silently missing.
7. **Make "Map fields with AI" land its result visibly** in the editor with a confirmation; today the call succeeds but the field can stay blank.
8. **Add an edge-condition assist** (or a picker of upstream ports/fields) so the WHEN expression isn't the one remaining raw-DSL-only field.
9. **Better auto-layout.** It produces a single horizontal row that overlaps named-port labels; a top-to-bottom dagre with port spacing makes branchy graphs legible.
10. **Continuous pre-publish validation on canvas** (dangling nodes, unmapped required inputs, empty boundary schema) rather than surfacing only as a publish-time toast.

## Buildable-percentage verdict

**~85% of the wedge is assemblable by a motivated non-engineer.** Nodes 13/15 (87%), edges 18/27 (67%) — but the 9 missing edges collapse to a *single* missing capability (error routing) plus its 2 relay nodes. The complete happy path, the human review branch with its 3 outcomes, and the review-required/lane-blocked/reject → Error branches are all fully authorable, including every data mapping. What a non-engineer cannot build is the systematic "on failure → Error" layer, because no failed port is ever shown.

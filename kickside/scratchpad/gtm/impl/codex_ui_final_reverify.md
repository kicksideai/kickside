# Workflow UI state re-verification — 2026-07-11

## Verdict

The two failures from the independent state sweep are closed in the live app, and the
follow-up connected-edge pass found and closed one shared-mapper contract leak.

## Live proofs

- **980px editor:** the canvas remains mounted and usable. Start AI assist renders at
  980x800 with a 10px result surface, 8px Undo/Accept actions below the message, and no
  result or prompt overflow. Evidence: `live_ui_reverify/01_start_assist_980.png` and
  `live_ui_reverify/result.json`.
- **Add trigger:** a published workflow opens the shared automation builder in-place with
  schedule selection, workflow identity, required-input mapping, and the directed summary.
  The component endpoint returns 200 after the coordinated reload. Evidence:
  `live_ui_reverify/02_add_trigger.png`.
- **Connected edges:** all five connections in UX Audit Sandwich were selected without
  mutation. Their inspector controls have 8px action/input radii and no measured overflow.
  Evidence: `live_edge_mapper_local/edge-1.png` through `edge-5.png` and `result.json`.
- **Pass-through mapping:** the failed-output -> Error connection exposed a contradiction:
  canvas/runtime correctly passed `{code,message}` through, while FieldMapper claimed two
  fields were unmapped. Shared mapping completeness now recognizes compatible same-name
  pass-through fields without writing a transform; live re-drive says “Required fields pass
  through unchanged” and displays `output.code` / `output.message`.
- **Declarative/generated surface:** the live palette rendered 40 entries through the
  generic catalog, including component intrinsics from CRM, GTM, contacts, precall, inbox,
  and acquisition. A completed historical run was opened read-only and its node output,
  timeline affordance, technical-details disclosure, child statuses, and Keeper link were
  rendered without console errors. Evidence: `live_run_surface_local/`.

## Regression gates

- Workflows UI: 55 files / 487 tests green; production build green.
- Widgets UI: 16 files / 111 tests green; production build green.
- Automation UI: 13 files / 128 tests green; production build green.
- `git diff --check`: green.
- Live root, Workflows, Automations, and embedded automation component: HTTP 200.
- New boot log: no `ERROR`, `FATAL`, or `panic` lines.

## Scope honesty

The remaining new-connection states were subsequently driven in a disposable workflow and
the workflow was deleted cleanly:

- unique name+type match -> visible auto-map pair reveal -> persistent “view” trace;
- missing required target -> animated pending edge and intent prompt;
- dismiss -> red dashed edge with required-count badge;
- hard reload -> warning and badge persist;
- explicit mapping -> calm edge;
- downstream schema adds a required field -> warning and count return.

Evidence: `new_edge_live_replay/01_auto_map_reveal.png` through
`06_schema_invalidated.png`, plus `result.json`.

Both light and dark workflow surfaces were also measured under reduced-motion mode. A 3.3:1
white-on-green Run action was corrected at the shared primary-action token. The final
workflow-surface contrast census reports zero failures in both themes, keyboard focus remains
visible, reduced motion is active, and there are no browser console errors. Evidence:
`dark_a11y_probe/` and `light_a11y_probe/`.

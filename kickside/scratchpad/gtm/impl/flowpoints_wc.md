# Flow Points config-surface web component

## Contract

`<kickside-flow-points component-instance-id="…">` is the workflows-owned,
component-hosted settings face. It only reads and writes
`/api/v1/components/{component_id}/flow-points`; it does not add internal point
defaults to the workflow catalog.

The component maps `default`, `customized`, and `incompatible` response states,
uses a binding revision for use-existing and restore actions, and routes a
customized draft or bound workflow through its `navigate` event. A published
picker applies the available declared interface checks before selection; the API
remains authoritative and an incompatibility response is shown as
`This workflow doesn’t fit here yet: <failing check>`.

## Shipped files

- `platform/workflows/ui/src/flow_points.ts` self-registers the tag.
- `platform/workflows/src/_index.yaml` adds an auto-registered `view.component`
  entry, append-only.
- The config surface, API mapper, styles, tests, and built `flow_points.js` stay
  in the workflows bundle.

## Verification

- Baseline: 470 Vitest tests passed.
- Final: 52 files / 475 Vitest tests passed; Vite build emitted
  `platform/workflows/static/flow_points.js`. `vue-tsc --noEmit` reports three
  pre-existing diagnostics in `widgets/ui/src/app/ports.ts`,
  `WorkflowSetup.vue`, and `workflow_setup.ts`; none are in this surface.
- Fixture/mount coverage covers all state mappings, interface copy, API
  incompatibility copy, no-points rendering, and the exact bind request.
- Live REST: a real published workflow component
  (`019f4dc6-b44c-7426-b023-b710800cbbce`) returned
  `{ success: true, points: [] }` from its component flow-points route.
  Chromium could not launch in this sandbox (SIGTRAP from the browser socket
  setup), so the tag could not be browser-mounted here. The no-points mount is
  covered in happy-dom; scenario 9 should perform the next live browser check
  against a component that declares a real point.

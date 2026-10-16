import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Right-click creation contract: empty canvas, frames, and notes all open the
// in-place creation menu, so adding a step or note never requires a trip back
// to the palette. Ordinary step nodes keep their own selection behavior.

const canvas = readFileSync(new URL('./WorkflowCanvasView.vue', import.meta.url), 'utf8')
const interactions = readFileSync(new URL('./useCanvasCreateMenu.ts', import.meta.url), 'utf8')

describe('canvas context menu contract', () => {
  it('offers in-place creation from a pane right-click', () => {
    expect(canvas).toContain('@pane-context-menu="model.onPaneContextMenu"')
    expect(canvas).toContain('model.menuAddStep')
    expect(canvas).toContain('model.menuAddNote')
    expect(canvas).toContain('model.menuAddFrame')
  })

  it('treats frame and note bodies as creatable space, not step nodes', () => {
    expect(canvas).toContain('@node-context-menu="model.onNodeContextMenu"')
    expect(interactions).toMatch(/wfFrame.*\|\|.*wfNote/)
  })

  it('places from the cursor position, not the canvas center', () => {
    expect(interactions).toContain('screenToFlowCoordinate({ x: menu.x, y: menu.y })')
    expect(interactions).toContain('placeNote(point)')
    expect(interactions).toContain('placeFrame(point)')
  })

  it('refuses creation while viewing a past run', () => {
    expect(interactions).toMatch(/openPaneMenu[\s\S]{0,80}viewingRun\.value\) return/)
  })
})

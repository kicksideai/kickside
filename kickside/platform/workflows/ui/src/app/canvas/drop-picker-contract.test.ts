import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// The wire-drop contract: a connection drag released on the empty pane opens the
// step picker at the drop point, and a picked step is created there already
// wired to the drag source through the ordinary connect path — so validation,
// auto-mapping, and the intent popover apply to it unchanged.

const canvas = readFileSync(new URL('./WorkflowCanvasView.vue', import.meta.url), 'utf8')
const interactions = readFileSync(new URL('./useCanvasCreateMenu.ts', import.meta.url), 'utf8')
const keymap = readFileSync(new URL('./keymap.ts', import.meta.url), 'utf8')

describe('wire-drop picker contract', () => {
  it('opens only for a source-handle drag released on the pane', () => {
    expect(canvas).toContain('@connect-start="model.onConnectStart"')
    expect(interactions).toMatch(/handleType === 'source'/)
    expect(interactions).toMatch(/classList\.contains\('vue-flow__pane'\)/)
  })

  it('never opens after a completed connection or in run view', () => {
    expect(interactions).toMatch(/if \(dragConnected \|\| !source \|\| viewingRun\.value\) return/)
  })

  it('routes the picked step through the ordinary connect path', () => {
    expect(interactions).toMatch(/const id = placeItem\(item/)
    expect(interactions).toMatch(/onConnect\(\{ source: picker\.source/)
  })

  it('keeps the forgiving connection radius', () => {
    expect(canvas).toContain(':connection-radius="40"')
  })
})

describe('canvas fit shortcuts', () => {
  it('maps Shift+1/Shift+2 to fit and zoom-selection', () => {
    expect(keymap).toMatch(/'1' \|\| e\.key === '!'/)
    expect(keymap).toMatch(/'2' \|\| e\.key === '@'/)
  })
})

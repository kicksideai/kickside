import { describe, expect, it } from 'vitest'
import { applyEvent, docFromState, emptyDoc, foldCommands } from './sync'

describe('layout direction', () => {
  it('folds direction commands and events into the document', () => {
    const doc = emptyDoc()
    expect(doc.direction).toBe('TB')
    foldCommands(doc, [{ type: 'layout.set-direction', body: { direction: 'LR' } }])
    expect(doc.direction).toBe('LR')
    expect(applyEvent(doc, { seq: 2, type: 'kickside.workflows.events:layout.direction-set', body: { direction: 'TB' } })).toEqual({ changed: true, unknown: false })
    expect(doc.direction).toBe('TB')
  })

  it('reads the direction from persisted definition state', () => {
    expect((docFromState({ layout: { positions: {}, direction: 'LR' }, head_seq: 3 })).direction).toBe('LR')
    expect((docFromState({ layout: { positions: {} } })).direction).toBe('TB')
  })
})

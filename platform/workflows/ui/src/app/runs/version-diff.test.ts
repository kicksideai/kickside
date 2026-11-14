import { describe, expect, it } from 'vitest'
import { diffHasChanges, graphDeltaItems, interfaceChangeLabel } from './version-diff'

describe('version diff mapping', () => {
  it('uses graph names where present and a stable id for unnamed changes', () => {
    expect(graphDeltaItems([{ id: 'node-1', after: { title: 'Qualify lead' } }, { id: 'edge-1', after: { source_id: 'a', target_id: 'b' } }]))
      .toEqual([{ id: 'node-1', name: 'Qualify lead' }, { id: 'edge-1', name: 'a → b' }])
  })

  it('maps interface changes into the warning presentation and detects any delta', () => {
    expect(interfaceChangeLabel({ field: 'input.topic', type: 'required_added' })).toBe('input.topic: required_added')
    expect(diffHasChanges({ from_version: 1, to_version: 2, interface: { before: {}, after: {}, changes: [] }, graph: { nodes: { added: [], removed: [], changed: [] }, edges: { added: [], removed: [], changed: [{ id: 'e' }] } } })).toBe(true)
  })
})

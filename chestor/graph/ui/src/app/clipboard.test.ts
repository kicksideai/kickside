import { describe, expect, it } from 'vitest'
import { pastePlan } from './clipboard'

describe('clipboard paste plan', () => {
  const clip = {
    nodes: [
      { id: 'n1', type: 'note', name: 'One', x: 10, y: 10 },
      { id: 'n2', type: 'task', name: 'Two', x: 200, y: 10 },
    ],
    edges: [
      { type: 'relates-to', source_id: 'n1', target_id: 'n2' },
      { type: 'relates-to', source_id: 'n1', target_id: 'outside' },
    ],
  }

  it('re-mints every id, rewires internal edges, drops external ones', () => {
    let seq = 0
    const plan = pastePlan(clip, () => `fresh-${++seq}`)
    expect(plan.nodes.map(n => n.id)).toEqual(['fresh-1', 'fresh-2'])
    expect(plan.edges).toHaveLength(1)
    expect(plan.edges[0].source_id).toBe('fresh-1')
    expect(plan.edges[0].target_id).toBe('fresh-2')
  })

  it('offsets the pasted block', () => {
    const plan = pastePlan(clip, () => 'x', { x: 40, y: 8 })
    expect(plan.nodes[0].x).toBe(50)
    expect(plan.nodes[0].y).toBe(18)
  })
})

import { describe, expect, it } from 'vitest'
import { looseConnectTarget } from './loose-connect'

const nodes = [
  { id: 'a', x: 0, y: 0, width: 160, height: 56 },
  { id: 'b', x: 300, y: 0, width: 160, height: 56 },
  { id: 'overlap', x: 320, y: 10, width: 160, height: 56 },
]

describe('loose connect', () => {
  it('targets the node whose body contains the drop point', () => {
    expect(looseConnectTarget('a', { x: 310, y: 5 }, nodes)).toBe('b')
  })

  it('never targets the node the drag started from', () => {
    expect(looseConnectTarget('a', { x: 10, y: 10 }, nodes)).toBeNull()
  })

  it('prefers the topmost node when bodies overlap', () => {
    expect(looseConnectTarget('a', { x: 330, y: 20 }, nodes)).toBe('overlap')
  })

  it('returns null for a drop on empty canvas', () => {
    expect(looseConnectTarget('a', { x: 900, y: 900 }, nodes)).toBeNull()
  })

  it('ignores unmeasured nodes', () => {
    expect(looseConnectTarget('a', { x: 5, y: 5 }, [{ id: 'ghost', x: 0, y: 0, width: 0, height: 0 }])).toBeNull()
  })
})

import { describe, expect, it } from 'vitest'
import { snapToGuides } from './helper-lines'

const others = [
  { id: 'a', x: 100, y: 100, width: 200, height: 60 },
  { id: 'b', x: 500, y: 300, width: 200, height: 60 },
]

describe('helper lines', () => {
  it('snaps a near-aligned left edge and reports the vertical guide', () => {
    const r = snapToGuides({ id: 'd', x: 104, y: 400, width: 200, height: 60 }, others)
    expect(r.x).toBe(100)
    const guide = r.guides.find(g => g.axis === 'x')
    expect(guide?.at).toBe(100)
    expect(guide?.from).toBe(100)
    expect(guide?.to).toBe(460)
  })

  it('snaps centers to centers and never to edges', () => {
    // dragged middle 127+30=157 vs a's middle 130: out of tolerance; a's bottom
    // 160 is 3 away but edge-to-center pairs are ignored.
    const rY = snapToGuides({ id: 'd', x: 800, y: 127, width: 200, height: 60 }, others, 6)
    expect(rY.y).toBe(127)
    // dragged middle at 133 (y=103) vs a's middle 130 → snaps to y=100
    const rC = snapToGuides({ id: 'd', x: 800, y: 103, width: 200, height: 60 }, others, 6)
    expect(rC.y).toBe(100)
  })

  it('keeps the position untouched outside tolerance', () => {
    const r = snapToGuides({ id: 'd', x: 150, y: 400, width: 200, height: 60 }, others, 6)
    expect(r.x).toBe(150)
    expect(r.guides.filter(g => g.axis === 'x')).toHaveLength(0)
  })

  it('picks the closest snap when several are in range', () => {
    const r = snapToGuides({ id: 'd', x: 103, y: 400, width: 200, height: 60 }, [
      { id: 'a', x: 100, y: 100, width: 200, height: 60 },
      { id: 'c', x: 105, y: 200, width: 200, height: 60 },
    ], 6)
    expect(r.x).toBe(105)
  })

  it('never snaps to itself or unmeasured rects', () => {
    const r = snapToGuides({ id: 'a', x: 104, y: 104, width: 200, height: 60 }, [
      { id: 'a', x: 100, y: 100, width: 200, height: 60 },
      { id: 'ghost', x: 104, y: 104, width: 0, height: 0 },
    ], 6)
    expect(r.x).toBe(104)
    expect(r.guides).toHaveLength(0)
  })
})

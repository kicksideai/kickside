import { describe, expect, it } from 'vitest'
import { alignRects, distributeRects } from './align'

const rects = [
  { id: 'a', x: 0, y: 0, width: 100, height: 40 },
  { id: 'b', x: 200, y: 100, width: 100, height: 60 },
  { id: 'c', x: 400, y: 300, width: 100, height: 40 },
]

describe('align', () => {
  it('aligns left edges to the selection extreme', () => {
    const out = alignRects(rects, 'left')
    expect(out.every(o => o.x === 0)).toBe(true)
    expect(out.map(o => o.y)).toEqual([0, 100, 300])
  })

  it('aligns bottoms to the lowest edge', () => {
    const out = alignRects(rects, 'bottom')
    expect(out.map(o => o.y)).toEqual([300, 280, 300])
  })

  it('needs at least two rects', () => {
    expect(alignRects([rects[0]], 'left')).toEqual([])
  })
})

describe('distribute', () => {
  it('spaces equal gaps keeping the extremes fixed', () => {
    const out = distributeRects(rects, 'h')
    const byId = Object.fromEntries(out.map(o => [o.id, o]))
    expect(byId.a.x).toBe(0)
    expect(byId.c.x).toBe(400)
    // span 500, sizes 300, gaps = 100 each: b starts at 0+100+100 = 200
    expect(byId.b.x).toBe(200)
  })

  it('needs at least three rects', () => {
    expect(distributeRects(rects.slice(0, 2), 'h')).toEqual([])
  })
})

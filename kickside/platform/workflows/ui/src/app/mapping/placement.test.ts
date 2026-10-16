import { describe, expect, it } from 'vitest'
import { cascadeOffset, CASCADE_STEP, CASCADE_WRAP, OVERLAP_GAP, freePosition, freeRectPosition, overlaps, rectsOverlap } from './placement'

describe('cascadeOffset', () => {
  it('places the first item exactly at centre', () => {
    expect(cascadeOffset(0)).toEqual({ dx: 0, dy: 0 })
  })

  it('steps down-right by CASCADE_STEP per consecutive placement', () => {
    expect(cascadeOffset(1)).toEqual({ dx: CASCADE_STEP, dy: CASCADE_STEP })
    expect(cascadeOffset(3)).toEqual({ dx: 3 * CASCADE_STEP, dy: 3 * CASCADE_STEP })
    expect(cascadeOffset(CASCADE_WRAP - 1)).toEqual({ dx: (CASCADE_WRAP - 1) * CASCADE_STEP, dy: (CASCADE_WRAP - 1) * CASCADE_STEP })
  })

  it('wraps back to centre after CASCADE_WRAP placements', () => {
    expect(cascadeOffset(CASCADE_WRAP)).toEqual({ dx: 0, dy: 0 })
    expect(cascadeOffset(CASCADE_WRAP + 1)).toEqual({ dx: CASCADE_STEP, dy: CASCADE_STEP })
  })

  it('never stacks two consecutive placements on the same point', () => {
    for (let i = 0; i < CASCADE_WRAP - 1; i++) {
      expect(cascadeOffset(i)).not.toEqual(cascadeOffset(i + 1))
    }
  })
})

describe('overlaps', () => {
  it('is true when both axes fall inside one footprint', () => {
    expect(overlaps({ x: 100, y: 100 }, { x: 110, y: 120 })).toBe(true)
  })

  it('is false once either axis clears the gap', () => {
    expect(overlaps({ x: 100, y: 100 }, { x: 100 + OVERLAP_GAP, y: 100 })).toBe(false)
    expect(overlaps({ x: 100, y: 100 }, { x: 100, y: 100 + OVERLAP_GAP })).toBe(false)
  })
})

describe('freePosition', () => {
  it('keeps the desired point when nothing is nearby', () => {
    expect(freePosition({ x: 200, y: 160 }, [])).toEqual({ x: 200, y: 160 })
    expect(freePosition({ x: 200, y: 160 }, [{ x: 900, y: 900 }])).toEqual({ x: 200, y: 160 })
  })

  it('nudges off an existing node it would land on top of', () => {
    const pos = freePosition({ x: 200, y: 160 }, [{ x: 200, y: 160 }])
    expect(pos).not.toEqual({ x: 200, y: 160 })
    expect(overlaps(pos, { x: 200, y: 160 })).toBe(false)
  })

  it('steps clear of a diagonal run of stacked nodes', () => {
    const occupied = [
      { x: 200, y: 160 },
      { x: 200 + CASCADE_STEP, y: 160 + CASCADE_STEP },
      { x: 200 + 2 * CASCADE_STEP, y: 160 + 2 * CASCADE_STEP },
    ]
    const pos = freePosition({ x: 200, y: 160 }, occupied)
    expect(occupied.every((o) => !overlaps(pos, o))).toBe(true)
  })

  it('is bounded — returns a finite last-tried point rather than looping on a dense field', () => {
    const occupied = Array.from({ length: 200 }, (_, i) => ({ x: 200 + i * CASCADE_STEP, y: 160 + i * CASCADE_STEP }))
    const pos = freePosition({ x: 200, y: 160 }, occupied, CASCADE_STEP, OVERLAP_GAP, 5)
    expect(pos).toEqual({ x: 200 + 5 * CASCADE_STEP, y: 160 + 5 * CASCADE_STEP })
  })
})

describe('full-card placement', () => {
  it('detects overlap from card extents even when anchors look far apart', () => {
    expect(rectsOverlap(
      { x: 100, y: 100, width: 216, height: 76 },
      { x: 250, y: 140, width: 216, height: 76 },
    )).toBe(true)
  })

  it('keeps a dropped card near the pointer but clears every occupied card', () => {
    const occupied = [
      { x: 200, y: 160, width: 216, height: 76 },
      { x: 460, y: 160, width: 216, height: 76 },
    ]
    const size = { width: 216, height: 76 }
    const point = freeRectPosition({ x: 330, y: 180 }, size, occupied)
    expect(occupied.every(rect => !rectsOverlap({ ...point, ...size }, rect))).toBe(true)
    expect(Math.hypot(point.x - 330, point.y - 180)).toBeLessThan(500)
  })
})

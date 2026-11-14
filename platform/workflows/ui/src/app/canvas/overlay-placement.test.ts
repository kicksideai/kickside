import { describe, expect, it } from 'vitest'
import { clampLiftedOverlay, placeLiftedOverlay, clampPointerHint } from './overlay-placement'

describe('canvas overlay placement', () => {
  const bounds = { left: 100, top: 50, right: 900, bottom: 650 }

  it('keeps a lifted card inside every canvas boundary', () => {
    expect(clampLiftedOverlay({ left: 80, top: 40 }, bounds, 300, 220)).toEqual({ left: 262, top: 296 })
    expect(clampLiftedOverlay({ left: 950, top: 900 }, bounds, 300, 220)).toEqual({ left: 738, top: 638 })
  })

  it('centers a surface wider than its compact canvas', () => {
    expect(clampLiftedOverlay({ left: 0, top: 0 }, { left: 10, top: 10, right: 210, bottom: 300 }, 300, 180).left).toBe(110)
  })

  it('uses each measured height and keeps the lifted rendered rectangle inside the canvas', () => {
    const short = clampLiftedOverlay({ left: 400, top: 60 }, bounds, 300, 90)
    const tall = clampLiftedOverlay({ left: 400, top: 60 }, bounds, 300, 360)
    expect(tall.top).toBeGreaterThan(short.top)
    expect(short.top - 14 - 90).toBeGreaterThanOrEqual(bounds.top + 12)
    expect(tall.top - 14 - 360).toBeGreaterThanOrEqual(bounds.top + 12)
  })

  it('moves a compact edge prompt away from node cards when space is available', () => {
    const obstacle = { left: 300, top: 250, right: 620, bottom: 390 }
    const placed = placeLiftedOverlay({ left: 460, top: 420 }, bounds, 280, 180, [obstacle])
    const rendered = { left: placed.left - 140, right: placed.left + 140, top: placed.top - 194, bottom: placed.top - 14 }
    const overlaps = rendered.left < obstacle.right && rendered.right > obstacle.left && rendered.top < obstacle.bottom && rendered.bottom > obstacle.top
    expect(overlaps).toBe(false)
  })

  it('keeps the connection hint away from viewport edges', () => {
    expect(clampPointerHint({ left: 995, top: 795 }, 1000, 800)).toEqual({ left: 810, top: 756 })
  })
})

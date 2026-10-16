import { describe, expect, it } from 'vitest'
import { completenessBadgePosition } from './mapping-edge-position'

describe('completenessBadgePosition', () => {
  it('moves a short vertical-edge badge sideways instead of onto either card', () => {
    expect(completenessBadgePosition(100, 100, 100, 120, 100, 110)).toEqual({ x: 52, y: 107 })
  })

  it('moves a horizontal-edge badge above the wire', () => {
    expect(completenessBadgePosition(20, 80, 120, 80, 70, 80)).toEqual({ x: 55, y: 32 })
  })

  it('does not trust a curved-path midpoint that has entered the target card', () => {
    expect(completenessBadgePosition(100, 100, 140, 100, 138, 100)).toEqual({ x: 114, y: 52 })
  })

  it('clears the measured short-edge card boundary by more than one badge half-width', () => {
    const position = completenessBadgePosition(1003.32, 429.45, 974.2, 458.84, 988, 444)
    const badgeHalfWidth = 15.03
    // For this left-running edge the chosen normal moves the badge below-left; its right
    // edge must remain left of the target card's measured x=1003.32.
    expect(position.x + badgeHalfWidth).toBeLessThan(1003.32)
  })

  it('stays finite for a zero-length provisional edge', () => {
    const pos = completenessBadgePosition(4, 4, 4, 4, 4, 4)
    expect(Number.isFinite(pos.x)).toBe(true)
    expect(Number.isFinite(pos.y)).toBe(true)
  })

  it('defaults to a zoom of 1 when the caller omits it', () => {
    const withDefault = completenessBadgePosition(100, 100, 100, 120, 100, 110)
    const explicit = completenessBadgePosition(100, 100, 100, 120, 100, 110, 1)
    expect(withDefault).toEqual(explicit)
  })

  it('keeps the same on-screen clearance at a higher zoom instead of ballooning outward', () => {
    // The badge's translate lands inside VueFlow's zoom-scaled pane, so its flow-space
    // perpendicular offset from the 35%-anchor point is itself multiplied by zoom again
    // once rendered. The on-screen gutter (flow-space offset * zoom) must stay constant
    // across zoom levels — this is exactly the bug that put the badge ~130px off a dashed
    // edge on a small, tightly auto-fit graph.
    const anchor = { x: 100 + (100 - 100) * 0.35, y: 100 + (120 - 100) * 0.35 }
    const perpendicular = (zoom: number) => {
      const p = completenessBadgePosition(100, 100, 100, 120, 100, 110, zoom)
      return Math.hypot(p.x - anchor.x, p.y - anchor.y)
    }
    expect(perpendicular(3) * 3).toBeCloseTo(perpendicular(1) * 1, 5)
    expect(perpendicular(3)).toBeCloseTo(perpendicular(1) / 3, 5)
  })
})

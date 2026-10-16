import { describe, expect, it } from 'vitest'
import {
  MAX_ZOOM, MIN_ZOOM, boundsOf, clampZoom, detailFor, edgeDetail, fitTransform, intersects,
  labelBudget, layoutWorld, toScreen, toWorld, visibleWorld, zoomAbout,
} from './view'

const extent = (x: number, y: number, halfWidth = 10, halfHeight = 10) => ({ x, y, halfWidth, halfHeight })

describe('graph reading transform', () => {
  it('fits a wide graph to a wide pane on both axes', () => {
    const bounds = { minX: 0, minY: 0, maxX: 2000, maxY: 400 }
    const wide = fitTransform(bounds, { width: 1200, height: 600 }, 0)
    // The wide axis is the binding one, so the scale comes from it.
    expect(wide.zoom).toBeCloseTo(1200 / 2000, 6)
    // Centred: the graph centre lands on the pane centre.
    expect(wide.x + 1000 * wide.zoom).toBeCloseTo(600, 6)
    expect(wide.y + 200 * wide.zoom).toBeCloseTo(300, 6)
  })

  it('lets the short axis bind when the pane is the wider one', () => {
    const bounds = { minX: 0, minY: 0, maxX: 400, maxY: 2000 }
    const tall = fitTransform(bounds, { width: 1200, height: 600 }, 0)
    expect(tall.zoom).toBeCloseTo(600 / 2000, 6)
  })

  it('never blows a small graph past the reading scale', () => {
    const one = fitTransform({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, { width: 1200, height: 600 })
    expect(one.zoom).toBe(1.5)
  })

  it('solves in a world shaped like the pane, so the fit fills it', () => {
    const viewport = { width: 1400, height: 700 }
    const world = layoutWorld(900, viewport)
    expect(world.width / world.height).toBeCloseTo(2, 2)
    const fitted = fitTransform({ minX: 0, minY: 0, maxX: world.width, maxY: world.height }, viewport, 0)
    // A world with the pane's aspect ratio leaves no letterbox on either axis.
    expect(Math.abs(world.width * fitted.zoom - viewport.width)).toBeLessThan(1.5)
    expect(Math.abs(world.height * fitted.zoom - viewport.height)).toBeLessThan(1.5)
  })

  it('reserves label-block room for a reading-scale window', () => {
    // 160 records at full detail draw their label boxes; a world sized for
    // bare marks squeezes them until the surplus walls against the edges.
    const viewport = { width: 1450, height: 790 }
    const world = layoutWorld(160, viewport)
    // Rounding the axes trims a fraction of a percent off the exact area.
    expect(world.width * world.height).toBeGreaterThanOrEqual(160 * 11000 * 0.99)
  })

  it('gives a larger graph more room without changing its shape', () => {
    const viewport = { width: 1200, height: 800 }
    const small = layoutWorld(50, viewport)
    const large = layoutWorld(5000, viewport)
    expect(large.width).toBeGreaterThan(small.width)
    expect(large.width / large.height).toBeCloseTo(small.width / small.height, 2)
    // Never smaller than the pane it is read in.
    expect(small.width).toBeGreaterThanOrEqual(viewport.width)
  })

  it('centres an empty graph rather than dividing by zero', () => {
    const empty = fitTransform(null, { width: 800, height: 400 })
    expect(empty).toEqual({ zoom: 1, x: 400, y: 200 })
  })

  it('measures bounds across mark and label extents', () => {
    expect(boundsOf([extent(0, 0, 5, 12), extent(100, 40, 20, 4)]))
      .toEqual({ minX: -5, minY: -12, maxX: 120, maxY: 44 })
    expect(boundsOf([])).toBeNull()
  })

  it('holds the point under the cursor while zooming', () => {
    const start = { zoom: 1, x: 0, y: 0 }
    const before = toWorld(start, 300, 200)
    const after = zoomAbout(start, 1.4, 300, 200)
    const held = toWorld(after, 300, 200)
    expect(held.x).toBeCloseTo(before.x, 6)
    expect(held.y).toBeCloseTo(before.y, 6)
  })

  it('bounds the scale at both ends', () => {
    expect(clampZoom(1e6)).toBe(MAX_ZOOM)
    expect(clampZoom(0)).toBe(MIN_ZOOM)
    expect(zoomAbout({ zoom: MAX_ZOOM, x: 0, y: 0 }, 4, 0, 0).zoom).toBe(MAX_ZOOM)
  })

  it('round-trips world and screen space', () => {
    const transform = { zoom: 0.37, x: -120, y: 64 }
    const screen = toScreen(transform, 512, -88)
    const world = toWorld(transform, screen.x, screen.y)
    expect(world.x).toBeCloseTo(512, 6)
    expect(world.y).toBeCloseTo(-88, 6)
  })
})

describe('culling', () => {
  it('keeps what the pane can see and drops what it cannot', () => {
    const transform = { zoom: 1, x: 0, y: 0 }
    const world = visibleWorld(transform, { width: 800, height: 600 }, 0)
    expect(intersects(world, extent(400, 300))).toBe(true)
    expect(intersects(world, extent(-40, 300))).toBe(false)
    // A mark whose radius reaches into the pane is still drawn.
    expect(intersects(world, extent(-6, 300))).toBe(true)
  })

  it('grows the kept region by the margin in world units', () => {
    const world = visibleWorld({ zoom: 0.5, x: 0, y: 0 }, { width: 800, height: 600 }, 100)
    expect(world.minX).toBe(-200)
    expect(world.maxX).toBe(1800)
  })
})

describe('level of detail', () => {
  it('reads out to envelopes only when the type could not be resolved anyway', () => {
    expect(detailFor(0.15, 100)).toBe('envelope')
    expect(detailFor(0.3, 5000)).toBe('envelope')
    expect(detailFor(0.3, 100)).toBe('dot')
    expect(detailFor(0.6, 100)).toBe('mark')
    expect(detailFor(1, 100)).toBe('full')
  })

  it('drops to marks on a dense frame even at reading scale', () => {
    expect(detailFor(1.4, 3000)).toBe('dot')
    expect(detailFor(1.4, 900)).toBe('mark')
  })

  it('spends its label budget on landmarks below reading scale', () => {
    expect(labelBudget(0.3, 500)).toBe(0)
    expect(labelBudget(0.6, 500)).toBeGreaterThan(0)
    expect(labelBudget(0.6, 500)).toBeLessThanOrEqual(48)
    expect(labelBudget(1, 120)).toBe(120)
  })

  it('names only landmarks in a frame denser than reading scale', () => {
    // A reading-zoom frame over hundreds of marks would otherwise draw
    // hundreds of overlapping names — ink, not names.
    expect(labelBudget(1, 500)).toBe(48)
    expect(labelBudget(1, 5000)).toBe(48)
    expect(labelBudget(1, 420)).toBe(420)
  })

  it('drops edge ornament before it drops edges', () => {
    expect(edgeDetail('full')).toEqual({ arrows: true, labels: true, curves: true })
    expect(edgeDetail('mark')).toEqual({ arrows: false, labels: false, curves: true })
    expect(edgeDetail('dot')).toEqual({ arrows: false, labels: false, curves: false })
  })
})

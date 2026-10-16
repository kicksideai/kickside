import { beforeAll, describe, expect, it, vi } from 'vitest'
import { MIX_STEPS, TERRITORY_BUDGET, buildScene, drawScene, hitPort, hitTest, mixCacheSize, portPoint, visibleNodes } from './graph-draw'
import type { DrawState, Palette } from './graph-draw'

// `intersects` takes an extent object, so every call through it allocates one.
// Wrapping it lets a frame state whether it reached for that entry per record.
vi.mock('./view', async importOriginal => {
  const actual = await importOriginal<typeof import('./view')>()
  return { ...actual, intersects: vi.fn(actual.intersects) }
})
import { LayoutEngine } from './layout-engine'
import type { Placement } from './layout-engine'
import { GEOMETRY_STRIDE } from './layout-protocol'
import type { GraphEdge, GraphNode } from './types'

const node = (id: string, kind = 'observation', parent_id?: string): GraphNode =>
  ({ id, kind, label: id, parent_id, child_count: 0, revision: 1, created_at: 1, updated_at: 1 })
const edge = (id: string, from: string, to: string, kind = 'supports'): GraphEdge =>
  ({ id, from, to, kind, revision: 1, created_at: 1, updated_at: 1 })

/** A placement written by hand, so the scene under test has known coordinates. */
function placementOf(points: Array<[string, number, number]>, radius = 8): Placement {
  const positions = new Float32Array(points.length * 2)
  const geometry = new Float32Array(points.length * GEOMETRY_STRIDE)
  points.forEach(([, x, y], at) => {
    positions[at * 2] = x
    positions[at * 2 + 1] = y
    geometry[at * GEOMETRY_STRIDE] = radius
    geometry[at * GEOMETRY_STRIDE + 1] = radius + 6
    geometry[at * GEOMETRY_STRIDE + 2] = radius + 3
    geometry[at * GEOMETRY_STRIDE + 3] = radius + 16
    geometry[at * GEOMETRY_STRIDE + 4] = 2
  })
  const ids = points.map(([id]) => id)
  return {
    ids,
    index: new Map(ids.map((id, at) => [id, at])),
    positions,
    geometry,
    labels: ids.map(id => [id]),
    width: 1000,
    height: 600,
    ms: 1,
  }
}

const palette: Palette = {
  bg: 'rgb(255, 255, 255)',
  fg: 'rgb(20, 20, 20)',
  muted: 'rgb(120, 120, 120)',
  faint: 'rgb(180, 180, 180)',
  border: 'rgb(220, 220, 220)',
  accent: 'rgb(200, 80, 30)',
  panel: 'rgb(248, 248, 248)',
  family: {
    anchor: 'rgb(200, 80, 30)', rule: 'rgb(60, 120, 220)', decision: 'rgb(130, 90, 200)',
    evidence: 'rgb(40, 170, 90)', risk: 'rgb(220, 60, 60)', open: 'rgb(230, 160, 40)',
    agent: 'rgb(160, 70, 20)', note: 'rgb(120, 120, 120)',
  },
  edge: {
    structure: 'rgb(180, 180, 180)', support: 'rgb(40, 170, 90)', conflict: 'rgb(220, 60, 60)',
    succession: 'rgb(130, 90, 200)', presence: 'rgb(200, 80, 30)',
  },
}

const NOW = 1_787_000_000

const state = (over: Partial<DrawState> = {}): DrawState => ({
  detail: 'full',
  now: NOW,
  selectedId: '',
  hoveredId: '',
  mutedFamily: '',
  touched: new Set<string>(),
  showRegions: true,
  pins: [],
  ...over,
})

/** Records every call so a frame can be read back and asserted on. */
function recorder() {
  const calls: Array<{ name: string; args: unknown[] }> = []
  const text: string[] = []
  const handler: ProxyHandler<Record<string, unknown>> = {
    get(target, property: string) {
      if (property in target) return target[property]
      return (...args: unknown[]) => {
        calls.push({ name: property, args })
        if (property === 'fillText') text.push(String(args[0]))
      }
    },
    set(target, property: string, value) { target[property] = value; return true },
  }
  const context = new Proxy({} as Record<string, unknown>, handler) as unknown as CanvasRenderingContext2D
  return { context, calls, text, count: (name: string) => calls.filter(call => call.name === name).length }
}

beforeAll(() => {
  if (typeof globalThis.Path2D === 'undefined') {
    // happy-dom carries no canvas, and the scene only needs the marks to exist.
    ;(globalThis as unknown as { Path2D: unknown }).Path2D = class { constructor(_d?: string) {} }
  }
})

describe('scene', () => {
  it('carries every placed record and drops relations with no placed endpoint', () => {
    const nodes = [node('a'), node('b'), node('c')]
    const scene = buildScene(
      placementOf([['a', 100, 100], ['b', 300, 140]]),
      nodes,
      [edge('ab', 'a', 'b'), edge('ac', 'a', 'c'), edge('self', 'a', 'a')],
    )
    expect(scene.nodes.map(item => item.id)).toEqual(['a', 'b'])
    expect(scene.edges).toHaveLength(1)
    expect(scene.edges[0]).toMatchObject({ from: 0, to: 1, family: 'support' })
  })

  it('reads the drawn bounds from the composite, not from the mark alone', () => {
    const scene = buildScene(placementOf([['a', 100, 100]]), [node('a')], [])
    expect(scene.bounds!.minX).toBeLessThan(100)
    // The label hangs under the mark, so the box reaches further down than up.
    expect(scene.bounds!.maxY - 100).toBeGreaterThan(100 - scene.bounds!.minY)
  })

  it('names a territory with the count of records it actually holds', async () => {
    const nodes = [
      node('root', 'project'),
      { ...node('branch', 'workstream'), parent_id: 'root' },
      ...Array.from({ length: 6 }, (_, index) => ({ ...node(`m${index}`, 'evidence'), parent_id: 'branch' })),
    ]
    const edges = nodes.filter(item => item.parent_id).map((item, index) => edge(`e${index}`, item.parent_id!, item.id, 'contains'))
    const placement = (await new LayoutEngine().solve({
      nodes, edges, width: 900, height: 600, emphasis: new Set(), held: new Map(),
    }))!
    const scene = buildScene(placement, nodes, edges)
    expect(scene.regions.length).toBeGreaterThan(0)
    // The territory encloses the branch record and everything under it.
    expect(scene.regions[0].size).toBe(7)
  })
})

describe('ghost ports', () => {
  it('turns a relation that leaves the canvas into a port that names where it goes', () => {
    const scene = buildScene(
      placementOf([['a', 100, 100]]),
      [node('a')],
      [edge('out', 'a', 'elsewhere', 'supports'), edge('in', 'origin', 'a', 'contains')],
      new Map([['elsewhere', 'Program transformer'], ['origin', 'History']]),
    )
    expect(scene.edges).toHaveLength(0)
    expect(scene.ports.map(port => [port.targetId, port.targetLabel, port.outbound]))
      .toEqual([['elsewhere', 'Program transformer', true], ['origin', 'History', false]])
  })

  it('falls back to the address when nothing has named the target yet', () => {
    const scene = buildScene(placementOf([['a', 100, 100]]), [node('a')], [edge('out', 'a', 'n-404')])
    expect(scene.ports[0].targetLabel).toBe('n-404')
  })

  it('fans repeated ports off one record instead of stacking them', () => {
    const scene = buildScene(
      placementOf([['a', 100, 100]]),
      [node('a')],
      ['x', 'y', 'z'].map((id, index) => edge(`e${index}`, 'a', id)),
    )
    const points = scene.ports.map(port => portPoint(scene, port))
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        expect(Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y)).toBeGreaterThan(4)
      }
    }
  })

  it('answers a press on a port with the record it leads to', () => {
    const scene = buildScene(placementOf([['a', 100, 100]]), [node('a')], [edge('out', 'a', 'elsewhere')])
    const point = portPoint(scene, scene.ports[0])
    expect(hitPort(scene, point.x, point.y)?.targetId).toBe('elsewhere')
    expect(hitPort(scene, point.x + 200, point.y)).toBeNull()
  })
})

describe('hit testing', () => {
  const scene = buildScene(placementOf([['a', 100, 100], ['b', 400, 300], ['c', 900, 40]]), [node('a'), node('b'), node('c')], [])

  it('finds the record under a point and nothing under empty ground', () => {
    expect(hitTest(scene, 100, 100)).toBe('a')
    expect(hitTest(scene, 402, 303)).toBe('b')
    expect(hitTest(scene, 250, 250)).toBe('')
  })

  it('answers from the grid whatever the scene size', () => {
    const many = Array.from({ length: 4000 }, (_, index): [string, number, number] =>
      [`n${index}`, (index % 80) * 40, Math.floor(index / 80) * 40])
    const large = buildScene(placementOf(many), many.map(([id]) => node(id)), [])
    expect(hitTest(large, 40 * 5, 40 * 7)).toBe(`n${7 * 80 + 5}`)
    expect(hitTest(large, 40 * 5 + 20, 40 * 7 + 20)).toBe('')
  })
})

describe('culling', () => {
  it('keeps only what the pane can see', () => {
    const scene = buildScene(placementOf([['a', 100, 100], ['b', 5000, 100]]), [node('a'), node('b')], [])
    const visible = visibleNodes(scene, { zoom: 1, x: 0, y: 0 }, { width: 800, height: 600 })
    expect(visible).toEqual([0])
  })

  it('walks the whole scene without building an object per record', async () => {
    // The cull runs over every record in the graph on every frame, so a pan
    // over a large journal would otherwise mint one throwaway extent per
    // record per repaint.
    const { intersects } = await import('./view')
    vi.mocked(intersects).mockClear()
    const points = Array.from({ length: 3000 }, (_, index): [string, number, number] =>
      [`n${index}`, (index % 60) * 200, Math.floor(index / 60) * 200])
    const large = buildScene(placementOf(points), points.map(([id]) => node(id)), [])
    const visible = visibleNodes(large, { zoom: 1, x: 0, y: 0 }, { width: 800, height: 600 })
    expect(visible.length).toBeGreaterThan(0)
    expect(visible.length).toBeLessThan(points.length)
    expect(intersects).not.toHaveBeenCalled()
  })
})

describe('frames', () => {
  const nodes = [node('alpha'), node('beta', 'risk'), node('gamma', 'decision')]
  const edges = [edge('e1', 'alpha', 'beta'), edge('e2', 'beta', 'gamma', 'contradicts')]
  const scene = buildScene(placementOf([['alpha', 100, 100], ['beta', 300, 200], ['gamma', 500, 120]]), nodes, edges)
  const viewport = { width: 900, height: 600 }
  const transform = { zoom: 1, x: 0, y: 0 }

  it('inks marks, relations and names at reading scale', () => {
    const { context, text, count } = recorder()
    const stats = drawScene(context, scene, transform, viewport, palette, state())
    expect(stats.nodes).toBe(3)
    expect(stats.edges).toBe(2)
    expect(stats.labels).toBe(3)
    expect(count('stroke')).toBeGreaterThan(0)
    expect(text).toEqual(expect.arrayContaining(['alpha', 'beta', 'gamma']))
  })

  it('stops naming records below reading scale but never stops counting them', () => {
    const { context } = recorder()
    const stats = drawScene(context, scene, { zoom: 0.3, x: 0, y: 0 }, viewport, palette, state({ detail: 'dot' }))
    expect(stats.labels).toBe(0)
    expect(stats.nodes).toBe(3)
  })

  it('replaces marks with territories that state their real counts, never a blank', async () => {
    const branchNodes = [
      node('root', 'project'),
      { ...node('branch', 'workstream'), parent_id: 'root' },
      ...Array.from({ length: 7 }, (_, index) => ({ ...node(`m${index}`, 'evidence'), parent_id: 'branch' })),
    ]
    const branchEdges = branchNodes.filter(item => item.parent_id)
      .map((item, index) => edge(`e${index}`, item.parent_id!, item.id, 'contains'))
    const placement = (await new LayoutEngine().solve({
      nodes: branchNodes, edges: branchEdges, width: 900, height: 600, emphasis: new Set(), held: new Map(),
    }))!
    const branchScene = buildScene(placement, branchNodes, branchEdges)
    const { context, text } = recorder()
    // Placed clear of the canvas head, which owns the top-left corner.
    const stats = drawScene(context, branchScene, { zoom: 0.14, x: 420, y: 300 }, viewport, palette, state({ detail: 'envelope' }))
    expect(stats.territories).toBeGreaterThan(0)
    expect(text).toEqual(expect.arrayContaining(['8 records']))
    expect(stats.nodes).toBe(branchNodes.length)
  })

  it('names the largest territories and states how many it is holding back', async () => {
    const branchCount = TERRITORY_BUDGET + 6
    const nodes = [node('root', 'project')]
    const edges: GraphEdge[] = []
    for (let branch = 0; branch < branchCount; branch++) {
      nodes.push({ ...node(`b${branch}`, 'workstream'), parent_id: 'root' })
      edges.push(edge(`eb${branch}`, 'root', `b${branch}`, 'contains'))
      for (let member = 0; member < 4 + branch; member++) {
        nodes.push({ ...node(`b${branch}-m${member}`, 'evidence'), parent_id: `b${branch}` })
        edges.push(edge(`e${branch}-${member}`, `b${branch}`, `b${branch}-m${member}`, 'contains'))
      }
    }
    const placement = (await new LayoutEngine().solve({
      nodes, edges, width: 2400, height: 1600, emphasis: new Set(), held: new Map(),
    }))!
    const dense = buildScene(placement, nodes, edges)
    expect(dense.regions.length).toBeGreaterThan(TERRITORY_BUDGET)
    const { context } = recorder()
    const stats = drawScene(context, dense, { zoom: 0.18, x: 0, y: 0 }, { width: 1200, height: 800 }, palette, state({ detail: 'envelope' }))
    expect(stats.territories).toBe(TERRITORY_BUDGET)
    expect(stats.territories + stats.territoriesHeld).toBe(dense.regions.length)
  })

  it('says how many sessions a record has been worked in', () => {
    const worked = buildScene(
      placementOf([['alpha', 100, 100]]),
      [node('alpha')],
      [],
      new Map(),
      new Map([['alpha', { sessions: 3, lastActivityAt: NOW - 1200 }]]),
    )
    expect(worked.nodes[0].sessions).toBe(3)
    const { context, text } = recorder()
    drawScene(context, worked, transform, viewport, palette, state())
    expect(text).toEqual(expect.arrayContaining(['3 sessions · 20m ago']))
  })

  it('leaves an unworked record unbadged rather than badging it with a zero', () => {
    const { context, text } = recorder()
    drawScene(context, scene, transform, viewport, palette, state())
    expect(text.some(value => /session/.test(value))).toBe(false)
  })

  it('clears the frame before it draws it', () => {
    const { context, calls } = recorder()
    drawScene(context, scene, transform, viewport, palette, state())
    expect(calls[0].name).toBe('clearRect')
  })

  it('keeps the colour table bounded while recency heat cools with the clock', () => {
    const heated = buildScene(
      placementOf([['alpha', 100, 100]]),
      [node('alpha')],
      [],
      new Map(),
      new Map([['alpha', { sessions: 1, lastActivityAt: NOW }]]),
    )
    const { context } = recorder()
    drawScene(context, heated, transform, viewport, palette, state({ now: NOW }))
    const settled = mixCacheSize()
    for (let tick = 1; tick <= 2000; tick++) {
      drawScene(context, heated, transform, viewport, palette, state({ now: NOW + tick }))
    }
    // The heat ring is mixed at a strength that moves with every second of the
    // reading clock. The table it is drawn through may only grow with the
    // palette, never with how long the journal has been open.
    expect(mixCacheSize() - settled).toBeLessThanOrEqual(MIX_STEPS)
  })
})

import { describe, expect, it } from 'vitest'
import {
  branchRegions, edgeFamily, forceLayout, labelLines, nodeBox, nodeFamily,
} from './force-layout'
import type { GraphEdge, GraphNode } from './types'

const node = (id: string, kind = 'claim'): GraphNode => ({ id, kind, label: id, child_count: 0, revision: 1, created_at: 1, updated_at: 1 })
const edge = (id: string, from: string, to: string, kind = 'supports'): GraphEdge => ({ id, from, to, kind, revision: 1, created_at: 1, updated_at: 1 })
const box = (nodes: GraphNode[], edges: GraphEdge[], id: string, emphasis = new Set<string>()) => {
  const degree = edges.filter(item => item.from === id || item.to === id).length
  return nodeBox(nodes.find(item => item.id === id)!, degree, emphasis.has(id))
}

describe('record families', () => {
  it('reads every kind as one of the epistemic families', () => {
    expect(nodeFamily('invariant')).toBe('rule')
    expect(nodeFamily('proof_obligation')).toBe('open')
    expect(nodeFamily('false_green')).toBe('risk')
    expect(nodeFamily('Observation')).toBe('evidence')
    expect(nodeFamily('workstream')).toBe('anchor')
    expect(nodeFamily('cursor')).toBe('agent')
    expect(nodeFamily('something-new')).toBe('note')
  })

  it('separates relations that carry knowledge from relations that carry presence', () => {
    expect(edgeFamily('contains')).toBe('structure')
    expect(edgeFamily('contradicts')).toBe('conflict')
    expect(edgeFamily('superseded_by')).toBe('succession')
    expect(edgeFamily('positioned_at')).toBe('presence')
  })
})

describe('labels', () => {
  it('wraps on word boundaries and ellipsises only what cannot fit', () => {
    expect(labelLines('Ownership fence audit', 128, 2)).toEqual(['Ownership fence audit'])
    const wrapped = labelLines('Every semantic fact has one canonical owner in the program', 90, 2)
    expect(wrapped).toHaveLength(2)
    expect(wrapped[1].endsWith('…')).toBe(true)
    expect(labelLines('', 90)).toEqual(['untitled'])
  })

  it('gives every record a measurable box, so no label is clipped by the layout', () => {
    const record = node('n', 'decision')
    record.label = 'Select immutable ledger plus relational projections'
    const compact = nodeBox(record, 2)
    const emphasised = nodeBox(record, 2, true)
    expect(compact.lines).toHaveLength(1)
    expect(emphasised.lines).toHaveLength(2)
    expect(emphasised.bottom).toBeGreaterThan(compact.bottom)
    expect(compact.halfWidth).toBeGreaterThan(compact.radius)
  })
})

describe('force layout', () => {
  it('is deterministic and keeps every box inside its bounded viewport', () => {
    const nodes = [node('a'), node('b', 'evidence'), node('c', 'decision')]
    const edges = [edge('ab', 'a', 'b'), edge('bc', 'b', 'c')]
    const first = forceLayout(nodes, edges, 640, 400)
    const second = forceLayout(nodes, edges, 640, 400)
    expect(first.map(n => [n.px, n.py])).toEqual(second.map(n => [n.px, n.py]))
    expect(first.every(item => item.px - item.box.halfWidth >= -0.01 && item.px + item.box.halfWidth <= 640.01
      && item.py - item.box.top >= -0.01 && item.py + item.box.bottom <= 400.01)).toBe(true)
  })

  it('retains spatial memory when a refreshed projection contains the same graph', () => {
    const nodes = Array.from({ length: 24 }, (_, index) => node(`n${index}`, index % 2 ? 'decision' : 'evidence'))
    const edges = nodes.slice(1).map((item, index) => edge(`e${index}`, nodes[index].id, item.id))
    const first = forceLayout(nodes, edges, 720, 460)
    const cache = new Map(first.map(item => [item.id, { px: item.px, py: item.py }]))
    const refreshed = forceLayout(nodes.map(item => ({ ...item })), edges.map(item => ({ ...item })), 720, 460, new Set(), cache)
    const maximumDrift = Math.max(...refreshed.map(item => {
      const before = cache.get(item.id)!
      return Math.hypot(item.px - before.px, item.py - before.py)
    }))
    expect(maximumDrift).toBeLessThan(45)
  })

  it('does not move a remembered graph at all when the projection is unchanged', () => {
    const nodes = Array.from({ length: 18 }, (_, index) => node(`n${index}`, index % 3 ? 'evidence' : 'decision'))
    const edges = nodes.slice(1).map((item, index) => edge(`e${index}`, nodes[index].id, item.id))
    const first = forceLayout(nodes, edges, 760, 480)
    const cache = new Map(first.map(item => [item.id, { px: item.px, py: item.py }]))
    const refreshed = forceLayout(nodes.map(item => ({ ...item })), edges.map(item => ({ ...item })), 760, 480, new Set(), cache)
    expect(refreshed.map(item => [item.id, item.px, item.py]))
      .toEqual(first.map(item => [item.id, item.px, item.py]))
  })

  it('seats a record that entered the window without relocating the rest', () => {
    const nodes = Array.from({ length: 12 }, (_, index) => node(`n${index}`, 'evidence'))
    const edges = nodes.slice(1).map((item, index) => edge(`e${index}`, nodes[index].id, item.id))
    const first = forceLayout(nodes, edges, 760, 480)
    const cache = new Map(first.map(item => [item.id, { px: item.px, py: item.py }]))
    const grown = [...nodes, node('fresh', 'risk')]
    const grownEdges = [...edges, edge('e-fresh', 'n3', 'fresh', 'contradicts')]
    const after = forceLayout(grown, grownEdges, 760, 480, new Set(), cache)
    expect(after.some(item => item.id === 'fresh')).toBe(true)
    const drift = Math.max(...after.filter(item => cache.has(item.id)).map(item => {
      const before = cache.get(item.id)!
      return Math.hypot(item.px - before.px, item.py - before.py)
    }))
    expect(drift).toBeLessThan(40)
  })

  it('fits an automatic graph across the available canvas without changing its topology', () => {
    const nodes = [node('root', 'project'), ...Array.from({ length: 39 }, (_, index) => ({
      ...node(`n${index}`, index % 4 ? 'workstream' : 'decision'),
      parent_id: index < 6 ? 'root' : `n${index % 6}`,
    }))]
    const edges = nodes.slice(1).map((item, index) => edge(`e${index}`, item.parent_id || 'root', item.id))
    const placed = forceLayout(nodes, edges, 1400, 760, new Set(['root', 'n0', 'n1', 'n2', 'n3', 'n4', 'n5']))
    const xSpan = Math.max(...placed.map(item => item.px)) - Math.min(...placed.map(item => item.px))
    const ySpan = Math.max(...placed.map(item => item.py)) - Math.min(...placed.map(item => item.py))
    expect(xSpan).toBeGreaterThan(1400 * .58)
    expect(ySpan).toBeGreaterThan(760 * .58)
  })

  it('does not mistake semantic protection for an explicit layout position', () => {
    const nodes = [node('root', 'project'), ...Array.from({ length: 12 }, (_, index) => node(`n${index}`))]
    const edges = nodes.slice(1).map((item, index) => edge(`e${index}`, 'root', item.id))
    const ordinary = forceLayout(nodes, edges, 640, 440)
    const protectedNodes = forceLayout(nodes.map(item => item.id === 'root' ? { ...item, pinned: true } : item), edges, 640, 440)
    expect(protectedNodes.map(item => [item.px, item.py])).toEqual(ordinary.map(item => [item.px, item.py]))
  })

  it('keeps every label block clear of its neighbours at a compact viewport boundary', () => {
    const nodes = Array.from({ length: 46 }, (_, index) => ({
      ...node(`n${index}`, index % 3 ? 'workstream' : 'evidence'),
      pinned: index === 0,
    }))
    const edges = nodes.slice(1).map((item, index) => edge(`e${index}`, nodes[index].id, item.id))
    const emphasis = new Set(nodes.slice(0, 7).map(item => item.id))
    const placed = forceLayout(nodes, edges, 778, 300, emphasis)
    for (let i = 0; i < placed.length; i++) {
      const a = placed[i]
      const boxA = box(nodes, edges, a.id, emphasis)
      for (let j = i + 1; j < placed.length; j++) {
        const b = placed[j]
        const boxB = box(nodes, edges, b.id, emphasis)
        const gapY = a.py <= b.py ? boxA.bottom + boxB.top : boxB.bottom + boxA.top
        const overlaps = Math.abs(a.px - b.px) < boxA.halfWidth + boxB.halfWidth - 1
          && Math.abs(a.py - b.py) < gapY - 1
        expect(overlaps, `${a.id} overlaps ${b.id}`).toBe(false)
      }
    }
  })

  it('holds a record where a reader placed it and relaxes the rest around it', () => {
    const nodes = Array.from({ length: 14 }, (_, index) => node(`n${index}`, index ? 'evidence' : 'project'))
    const edges = nodes.slice(1).map((item, index) => edge(`e${index}`, 'n0', item.id))
    const first = forceLayout(nodes, edges, 800, 500)
    const cache = new Map(first.map(item => [item.id, { px: item.px, py: item.py }]))
    const held = new Map([['n0', { px: 120, py: 90 }]])
    const dragged = forceLayout(nodes, edges, 800, 500, new Set(), cache, held)
    const anchor = dragged.find(item => item.id === 'n0')!
    expect(anchor.held).toBe(true)
    expect(Math.hypot(anchor.px - 120, anchor.py - 90)).toBeLessThan(1)
    expect(dragged.filter(item => item.id !== 'n0').every(item => !item.held)).toBe(true)
  })

  it('excludes presence relations from the knowledge topology', () => {
    const nodes = [node('a'), node('b'), node('agent-1', 'agent')]
    const edges = [edge('ab', 'a', 'b'), edge('at', 'agent-1', 'a', 'positioned_at')]
    const placed = forceLayout(nodes, edges, 600, 400)
    expect(placed.find(item => item.id === 'a')!.degree).toBe(1)
    expect(placed.find(item => item.id === 'agent-1')!.degree).toBe(0)
  })

  it('re-seats a grown graph instead of walling arrivals against the world edges', () => {
    // A whole-graph load: a small window solved first, then a much larger
    // record set arrives with the window's positions remembered. Freezing the
    // remembered core would leave the arrivals nowhere to stand but the
    // boundary, piled into walls of clamped records.
    const window = Array.from({ length: 60 }, (_, index) => node(`w${index}`, 'evidence'))
    const first = forceLayout(window, [], 1400, 700)
    const cache = new Map(first.map(item => [item.id, { px: item.px, py: item.py }]))
    const whole = [...window, ...Array.from({ length: 420 }, (_, index) => node(`g${index}`, 'evidence'))]
    const grown = forceLayout(whole, [], 2600, 1300, new Set(), cache)
    const walled = grown.filter(item =>
      item.px <= item.box.halfWidth + .5 || item.px >= 2600 - item.box.halfWidth - .5
      || item.py <= item.box.top + .5 || item.py >= 1300 - item.box.bottom - .5)
    expect(walled.length / grown.length).toBeLessThan(0.02)
    // The remembered core moved with the growth rather than staying pinned.
    const moved = grown.filter(item => {
      const before = cache.get(item.id)
      return before && Math.hypot(item.px - before.px, item.py - before.py) > 1
    })
    expect(moved.length).toBeGreaterThan(0)
  })

  it('keeps a same-size refresh exactly where the reader knows it', () => {
    const nodes = Array.from({ length: 30 }, (_, index) => node(`n${index}`, 'evidence'))
    const first = forceLayout(nodes, [], 1200, 700)
    const cache = new Map(first.map(item => [item.id, { px: item.px, py: item.py }]))
    const refreshed = forceLayout([...nodes, node('extra', 'evidence')], [], 1200, 700, new Set(), cache)
    for (const item of refreshed) {
      const before = cache.get(item.id)
      if (before) expect(Math.hypot(item.px - before.px, item.py - before.py)).toBeLessThan(1)
    }
  })

  it('re-arranges persisted coordinates only when the reader asks to unpin them', () => {
    // Stored positions that do not collide hold exactly; label resolution has
    // nothing to separate.
    const stored = Array.from({ length: 12 }, (_, index) =>
      ({ ...node(`n${index}`, 'evidence'), x: 150 + (index % 4) * 200, y: 120 + Math.floor(index / 4) * 160 }))
    const kept = forceLayout(stored, [], 1200, 700)
    const anchor = kept.find(item => item.id === 'n3')!
    expect(Math.hypot(anchor.px - 750, anchor.py - 120)).toBeLessThan(1)
    const rearranged = forceLayout(stored, [], 1200, 700, new Set(), undefined, undefined, { unpin: true })
    // Unpinning refuses the stored coordinates as seeds too: an unpinned solve
    // that merely unfixed them would relax back into the same arrangement.
    const displaced = rearranged.filter(item => {
      const source = stored.find(record => record.id === item.id)!
      return Math.hypot(item.px - (source.x as number), item.py - (source.y as number)) > 120
    })
    expect(displaced.length).toBeGreaterThanOrEqual(stored.length / 2)
  })
})

describe('branch territories', () => {
  it('draws one closed region per branch that holds enough members to read as a place', () => {
    const nodes = [
      node('root', 'project'),
      ...Array.from({ length: 6 }, (_, index) => ({ ...node(`a${index}`, 'evidence'), parent_id: 'branch-a' })),
      ...Array.from({ length: 5 }, (_, index) => ({ ...node(`b${index}`, 'risk'), parent_id: 'branch-b' })),
      { ...node('branch-a', 'workstream'), parent_id: 'root' },
      { ...node('branch-b', 'workstream'), parent_id: 'root' },
    ]
    const edges = nodes.filter(item => item.parent_id).map((item, index) => edge(`e${index}`, item.parent_id!, item.id, 'contains'))
    const regions = branchRegions(forceLayout(nodes, edges, 900, 600), 900, 600)
    expect(regions.length).toBeGreaterThan(0)
    expect(regions.every(region => region.path.startsWith('M ') && region.path.endsWith('Z'))).toBe(true)
    expect(regions.every(region => region.size >= 3)).toBe(true)
  })
})

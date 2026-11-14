import { describe, expect, it } from 'vitest'
import type { Node as FlowNode } from '@vue-flow/core'
import { autoLayout, deriveContainers, containerAt, clampRegionFor, clampToRegion, nodeDimensionsFor } from './graph-sync'
import { buildFlowData, renderedHandles } from '../canvas/graph-projection'
import { FAILED_PORT_GUTTER, PORT_GAP, PORT_LABEL_MIN_WIDTH, PORT_NODE_MAX_WIDTH, PORT_ROW_GUTTER, PORT_ROW_HEIGHT, nodeDimensionsForPorts } from './node-geometry'
import { outPortsFor, kindDef, registerBlocks } from '../domain/node-policy'
import { emptyDoc } from './sync'
import type { WfDoc, LayoutPosition } from '../types'
import type { WfNodeData, WfNoteData } from '../domain/graph-data'
import type { RunState } from '../runs/run-overlay'

function docWith(node: Record<string, unknown>) {
  const doc = emptyDoc()
  const n = { id: 'n1', title: 'Step', ...node } as never
  doc.nodes = { n1: n }
  return doc
}

describe('node outcome capacity', () => {
  it('keeps common two-outcome cards compact and wraps larger declarations predictably', () => {
    expect(nodeDimensionsForPorts([{ id: '', label: '' }]).width).toBe(216)
    expect(nodeDimensionsForPorts([{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }]).width).toBe(216)
    expect(nodeDimensionsForPorts(Array.from({ length: 4 }, (_, i) => ({ id: `p${i}`, label: `Outcome ${i}` }))).width).toBe(294)
    expect(nodeDimensionsForPorts(Array.from({ length: 8 }, (_, i) => ({ id: `p${i}`, label: `Outcome ${i}` }))).width).toBe(294)
    expect(nodeDimensionsForPorts(Array.from({ length: 12 }, (_, i) => ({ id: `p${i}`, label: `Outcome ${i}` }))).width).toBe(294)
  })

  it.each([1, 2, 4, 8, 12])('reserves non-overlapping grid cells for every one of %i outcomes', (count) => {
    const geometry = nodeDimensionsForPorts(Array.from({ length: count }, (_, i) => ({ id: `p${i}`, label: `Outcome ${i}` })))
    expect(geometry.width).toBeLessThanOrEqual(PORT_NODE_MAX_WIDTH)
    expect(geometry.cellWidth).toBeGreaterThanOrEqual(PORT_LABEL_MIN_WIDTH)
    expect(geometry.rows * geometry.columns).toBeGreaterThanOrEqual(count)
    expect(geometry.height).toBe(76 + (geometry.rows - 1) * PORT_ROW_HEIGHT)
    const occupiedWidth = PORT_ROW_GUTTER + geometry.columns * geometry.cellWidth + (geometry.columns - 1) * PORT_GAP
    expect(occupiedWidth).toBeLessThanOrEqual(geometry.width)
    const cells = Array.from({ length: count }, (_, i) => ({
      left: (i % geometry.columns) * (geometry.cellWidth + PORT_GAP),
      top: Math.floor(i / geometry.columns) * PORT_ROW_HEIGHT,
      right: (i % geometry.columns) * (geometry.cellWidth + PORT_GAP) + geometry.cellWidth,
      bottom: Math.floor(i / geometry.columns) * PORT_ROW_HEIGHT + 20,
    }))
    for (let i = 0; i < cells.length; i++) for (let j = i + 1; j < cells.length; j++) {
      const x = Math.max(0, Math.min(cells[i].right, cells[j].right) - Math.max(cells[i].left, cells[j].left))
      const y = Math.max(0, Math.min(cells[i].bottom, cells[j].bottom) - Math.max(cells[i].top, cells[j].top))
      expect(x * y).toBe(0)
    }
  })

  it('reduces the grid to three columns when the Failed gutter is present', () => {
    const ports = Array.from({ length: 12 }, (_, i) => ({ id: `p${i}`, label: `Outcome ${i}` }))
    const geometry = nodeDimensionsForPorts(ports, true)
    expect(geometry).toMatchObject({ width: 258, columns: 3, rows: 4, cellWidth: 64, height: 154 })
    expect(PORT_ROW_GUTTER + FAILED_PORT_GUTTER + geometry.columns * geometry.cellWidth + (geometry.columns - 1) * PORT_GAP).toBe(geometry.width)
  })

  it.each(['TB', 'LR'] as const)('keeps mixed-height multi-port cards disjoint in %s auto layout', (direction) => {
    const doc = emptyDoc()
    const counts = [1, 2, 4, 8, 12]
    doc.nodes = {
      root: { id: 'root', title: 'Root', kind: 'start' } as never,
    }
    doc.edges = {}
    for (const count of counts) {
      const ref = `test.blocks:layout_geometry_${direction}_${count}`
      registerBlocks([{ id: ref, label: `${count} routes`, ports: Array.from({ length: count }, (_, i) => ({ id: `p${i}`, label: `Port ${i}` })) }])
      const id = `n${count}`
      doc.nodes[id] = { id, title: `${count} outcomes`, kind: 'block', ref } as never
      doc.edges[`e${count}`] = { id: `e${count}`, source_id: 'root', target_id: id } as never
    }
    const positions = autoLayout(doc, direction)
    const ids = Object.keys(doc.nodes)
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
      const a = positions[ids[i]], b = positions[ids[j]]
      const ad = nodeDimensionsFor(doc.nodes[ids[i]]), bd = nodeDimensionsFor(doc.nodes[ids[j]])
      const overlapX = Math.max(0, Math.min(a.x + ad.width, b.x + bd.width) - Math.max(a.x, b.x))
      const overlapY = Math.max(0, Math.min(a.y + ad.height, b.y + bd.height) - Math.max(a.y, b.y))
      expect(overlapX * overlapY, `${ids[i]} overlaps ${ids[j]}`).toBe(0)
    }
  })

  it.each([
    ['TB', 1318, 900], ['LR', 1318, 900],
    ['TB', 798, 740], ['LR', 798, 740],
    ['TB', 338, 680], ['LR', 338, 680],
    ['TB', 178, 640], ['LR', 178, 640],
  ] as const)('packs disconnected mixed cards within the readable %s canvas at %ipx', (direction, width, height) => {
    const doc = emptyDoc()
    for (const count of [1, 2, 4, 8, 12]) {
      const ref = `test.blocks:bounded_${direction}_${width}_${count}`
      registerBlocks([{ id: ref, label: `${count} routes`, ports: Array.from({ length: count }, (_, i) => ({ id: `p${i}`, label: `Port ${i}` })) }])
      doc.nodes[`n${count}`] = { id: `n${count}`, title: `${count} outcomes`, kind: 'block', ref } as never
    }
    const minZoom = 0.55
    const positions = autoLayout(doc, direction, { width, height, minZoom })
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const [id, p] of Object.entries(positions)) {
      const d = nodeDimensionsFor(doc.nodes[id])
      minX = Math.min(minX, p.x); minY = Math.min(minY, p.y)
      maxX = Math.max(maxX, p.x + d.width); maxY = Math.max(maxY, p.y + d.height)
    }
    expect((maxX - minX) * minZoom).toBeLessThanOrEqual(width)
    expect((maxY - minY) * minZoom).toBeLessThanOrEqual(height)
  })
})




// Every edge must bind to a handle its endpoint card actually renders. A single dangling
// handle makes VueFlow drop the entire edges layer, so this is the load-bearing invariant.




// A container with a body chain and explicit positions, so derivation and geometry are
// exercised without dagre in the loop.
function containerDoc(): { doc: WfDoc; pos: Record<string, LayoutPosition> } {
  const doc = emptyDoc()
  doc.nodes = {
    loop: { id: 'loop', title: 'Loop', kind: 'cycle' } as never,
    a: { id: 'a', title: 'A', kind: 'block' } as never,
    b: { id: 'b', title: 'B', kind: 'block' } as never,
    done: { id: 'done', title: 'After', kind: 'block' } as never,
  }
  doc.edges = {
    e1: { id: 'e1', source_id: 'loop', target_id: 'a', source_port: 'body' } as never,
    e2: { id: 'e2', source_id: 'a', target_id: 'b' } as never,
    e3: { id: 'e3', source_id: 'loop', target_id: 'done', source_port: 'done' } as never,
  }
  const pos: Record<string, LayoutPosition> = {
    loop: { x: 0, y: 0 },
    a: { x: 0, y: 120 },
    b: { x: 0, y: 240 },
    done: { x: 400, y: 120 },
  }
  doc.positions = pos
  return { doc, pos }
}

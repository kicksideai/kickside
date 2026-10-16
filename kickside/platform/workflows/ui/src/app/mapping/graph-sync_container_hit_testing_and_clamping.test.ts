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


describe('container hit-testing and clamping', () => {
  it('reports the container whose box contains a point, and null outside every box', () => {
    const { doc, pos } = containerDoc()
    const [c] = deriveContainers(doc, pos).containers
    const inside = { x: c.box.x + c.box.width / 2, y: c.box.y + c.box.height / 2 }
    expect(containerAt(doc, inside, pos)).toBe('loop')
    expect(containerAt(doc, { x: c.box.x + c.box.width + 500, y: 0 }, pos)).toBeNull()
  })

  it('clamps a member dropped far outside back within its container extent', () => {
    const { doc, pos } = containerDoc()
    const region = clampRegionFor(doc, 'loop', ['a', 'b'], pos, 'b')
    const clamped = clampToRegion(5000, 5000, region)
    expect(clamped.x).toBeLessThanOrEqual(region.x + region.width)
    expect(clamped.y).toBeLessThanOrEqual(region.y + region.height)
    expect(clamped.x).toBeGreaterThanOrEqual(region.x)
    expect(clamped.y).toBeGreaterThanOrEqual(region.y)
  })

  it('leaves an in-bounds position untouched', () => {
    const { doc, pos } = containerDoc()
    const region = clampRegionFor(doc, 'loop', ['a', 'b'], pos)
    const p = { x: region.x + 10, y: region.y + 10 }
    expect(clampToRegion(p.x, p.y, region)).toEqual(p)
  })

  it('sizes and clamps a high-cardinality member with the same dimensions as its card', () => {
    const ports = Array.from({ length: 8 }, (_, i) => ({ id: `p${i}`, label: `Outcome ${i}` }))
    const ref = 'test.blocks:wide'
    registerBlocks([{ id: ref, label: 'Wide', ports }])
    const doc = emptyDoc()
    doc.nodes = {
      loop: { id: 'loop', title: 'Loop', kind: 'cycle' } as never,
      wide: { id: 'wide', title: 'Wide result', kind: 'block', ref } as never,
    }
    doc.edges = { body: { id: 'body', source_id: 'loop', target_id: 'wide', source_port: 'body' } as never }
    const pos = { loop: { x: 0, y: 0 }, wide: { x: 0, y: 120 } }
    const dimensions = nodeDimensionsFor(doc.nodes.wide)
    const [container] = deriveContainers(doc, pos).containers
    expect(container.box.width).toBeGreaterThanOrEqual(dimensions.width)

    const region = clampRegionFor(doc, 'loop', ['wide'], pos, 'wide')
    const clamped = clampToRegion(5000, 5000, region, dimensions)
    expect(clamped.x + dimensions.width).toBeLessThanOrEqual(region.x + region.width)
    expect(clamped.y + dimensions.height).toBeLessThanOrEqual(region.y + region.height)
  })

  it.each([1, 2, 4, 8, 12])('uses the canonical %i-port width and height in container and clamp math', (count) => {
    const ports = Array.from({ length: count }, (_, i) => ({ id: `route_${i}`, label: `Route ${i}` }))
    const ref = `test.blocks:container_geometry_${count}`
    registerBlocks([{ id: ref, label: `${count} routes`, ports }])
    const doc = emptyDoc()
    doc.nodes = {
      loop: { id: 'loop', title: 'Loop', kind: 'cycle' } as never,
      member: { id: 'member', title: 'Member', kind: 'block', ref } as never,
    }
    doc.edges = { body: { id: 'body', source_id: 'loop', target_id: 'member', source_port: 'body' } as never }
    const pos = { loop: { x: 0, y: 0 }, member: { x: 20, y: 120 } }
    const dimensions = nodeDimensionsFor(doc.nodes.member)
    const [container] = deriveContainers(doc, pos).containers
    expect(container.box.width).toBeGreaterThanOrEqual(dimensions.width)
    expect(container.box.height).toBeGreaterThanOrEqual(dimensions.height)

    const region = clampRegionFor(doc, 'loop', ['member'], pos, 'member')
    const clamped = clampToRegion(9999, 9999, region, dimensions)
    expect(clamped.x + dimensions.width).toBeLessThanOrEqual(region.x + region.width)
    expect(clamped.y + dimensions.height).toBeLessThanOrEqual(region.y + region.height)
  })
})


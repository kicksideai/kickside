import { describe, expect, it } from 'vitest'
import { branchConfigPatch, readBranchPredicate } from './branch-node'
import { buildFlowData, renderedHandles } from '../canvas/graph-projection'
import { outPortsFor } from '../domain/node-policy'
import { emptyDoc } from '../mapping/sync'
import type { WfNodeData } from '../domain/graph-data'

// The compiler routes a branch from config.predicate on the node onto edges leaving the
// true/false ports (probe 3: true/false + config.predicate compiles clean). These prove
// the shape the UI now produces matches that contract.

describe('branch predicate config round-trip', () => {
  it('reads a stored predicate and defaults empty', () => {
    expect(readBranchPredicate({ predicate: "output.status == 'ok'" })).toBe("output.status == 'ok'")
    expect(readBranchPredicate({})).toBe('')
    expect(readBranchPredicate(null)).toBe('')
  })

  it('commits config.predicate onto the node, trimmed, preserving other config', () => {
    const patch = branchConfigPatch({ keep: 1 }, "  output.status == 'ok'  ")
    expect(patch).toEqual({ keep: 1, predicate: "output.status == 'ok'" })
  })


  it('a branch built by the UI is the compiler-valid shape: predicate + true/false arms', () => {
    // The node the panel produces and the ports the card lets a user wire from.
    const node = { id: 'br', title: 'Branch', kind: 'branch', config: branchConfigPatch({}, "output.ok == true") }
    expect((node.config as Record<string, unknown>).predicate).toBe('output.ok == true')
    expect(outPortsFor('branch').map((p) => p.id)).toEqual(['true', 'false'])

    const doc = emptyDoc()
    doc.nodes = {
      br: node as never,
      a: { id: 'a', title: 'A', kind: 'finish' } as never,
      b: { id: 'b', title: 'B', kind: 'finish' } as never,
    }
    doc.edges = {
      e1: { id: 'e1', source_id: 'br', target_id: 'a', source_port: 'true' } as never,
      e2: { id: 'e2', source_id: 'br', target_id: 'b', source_port: 'false' } as never,
    }
    const { flowNodes, flowEdges } = buildFlowData(doc)
    expect(flowEdges).toHaveLength(2)
    const brData = flowNodes.find((n) => n.id === 'br')!.data as WfNodeData
    const handles = renderedHandles(brData.outPorts, undefined)
    for (const e of flowEdges) expect(handles.sources).toContain(e.sourceHandle)
  })
})

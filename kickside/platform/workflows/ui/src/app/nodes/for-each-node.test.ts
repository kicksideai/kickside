import { describe, expect, it } from 'vitest'
import { FOR_EACH_DEFAULT_BATCH, forEachNodePatch, isForEachKind, readForEach } from './for-each-node'
import { deriveContainers } from '../mapping/graph-sync'
import { buildFlowData } from '../canvas/graph-projection'
import { kindDef } from '../domain/node-policy'
import { emptyDoc } from '../mapping/sync'
import type { WfNodeData } from '../domain/graph-data'
import type { LayoutPosition } from '../types'

describe('for-each config reading', () => {
  it('reads a canonical for_each with the honest parallel defaults (batch 8, stop on error)', () => {
    expect(readForEach('for_each', {})).toEqual({ sourceKey: '', batchSize: 8, continueOnError: false })
    expect(FOR_EACH_DEFAULT_BATCH).toBe(8)
  })

  it('reads explicit for_each config verbatim', () => {
    expect(readForEach('for_each', { source_array_key: 'leads', batch_size: 4, continue_on_error: true }))
      .toEqual({ sourceKey: 'leads', batchSize: 4, continueOnError: true })
  })

  it('recognizes only the for_each kind', () => {
    expect(isForEachKind('for_each')).toBe(true)
    expect(isForEachKind('parallel')).toBe(false)
    expect(isForEachKind('cycle')).toBe(false)
    expect(isForEachKind(undefined)).toBe(false)
  })
})

describe('for-each config round-trip (backend-canonical shape)', () => {
  it('commits the canonical kind + explicit source key, batch and continue_on_error', () => {
    const patch = forEachNodePatch({ keep: 1 }, { sourceKey: 'items', batchSize: 8, continueOnError: false })
    expect(patch.kind).toBe('for_each')
    expect(patch.config).toEqual({ keep: 1, source_array_key: 'items', batch_size: 8, continue_on_error: false })
  })

  it('round-trips canonical stored configuration', () => {
    const stored = { kind: 'for_each', config: { source_array_key: 'rows', batch_size: 4, continue_on_error: true } }
    const read = readForEach(stored.kind, stored.config)
    const patch = forEachNodePatch(stored.config, read)
    expect(patch.kind).toBe('for_each')
    expect(patch.config).toEqual({ source_array_key: 'rows', batch_size: 4, continue_on_error: true })
  })

  it('clamps batch size to at least 1', () => {
    const patch = forEachNodePatch({}, { sourceKey: '', batchSize: 0, continueOnError: false })
    expect((patch.config as Record<string, unknown>).batch_size).toBe(1)
  })
})

describe('for_each documents render as For each', () => {
  it('carries the canonical identity through buildFlowData', () => {
    const doc = emptyDoc()
    doc.nodes = { p: { id: 'p', title: 'Fan out', kind: 'for_each' } as never }
    const data = buildFlowData(doc).flowNodes.find((n) => n.id === 'p')!.data as WfNodeData
    expect(data.kindLabel).toBe('For each')
    expect(data.hueVar).toBe(kindDef('for_each').hueVar)
    expect(data.outPorts.map((p) => p.id)).toEqual(['body', 'done'])
  })

  it('derives a container box for its body', () => {
    const doc = emptyDoc()
    doc.nodes = {
      p: { id: 'p', title: 'Fan out', kind: 'for_each' } as never,
      item: { id: 'item', title: 'Item', kind: 'block' } as never,
    }
    doc.edges = { e1: { id: 'e1', source_id: 'p', target_id: 'item', source_port: 'body' } as never }
    const pos: Record<string, LayoutPosition> = { p: { x: 0, y: 0 }, item: { x: 0, y: 120 } }
    doc.positions = pos
    const { containers, parentOf } = deriveContainers(doc, pos)
    expect(containers).toHaveLength(1)
    expect(containers[0].id).toBe('p')
    expect(parentOf.item).toBe('p')
  })
})

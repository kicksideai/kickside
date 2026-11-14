import { describe, expect, it } from 'vitest'
import {
  combineExclusiveBranchConflict,
  combineExclusiveWarning,
  combineModeFromConfig,
  combineNodePatch,
  isCombineKind,
  readCombineMode,
  readCombineOutputMode,
} from './combine-node'
import { emptyDoc } from '../mapping/sync'
import type { WfDoc } from '../types'

describe('combine mode reading', () => {
  it('reads an explicit combine mode, defaulting to wait_all', () => {
    expect(readCombineMode('combine', { mode: 'wait_all' })).toBe('wait_all')
    expect(readCombineMode('combine', { mode: 'first_wins' })).toBe('first_wins')
    expect(readCombineMode('combine', {})).toBe('wait_all')
    expect(readCombineMode('combine', null)).toBe('wait_all')
  })

  it('reads only the two canonical modes', () => {
    expect(combineModeFromConfig({ mode: 'first_wins' })).toBe('first_wins')
    expect(combineModeFromConfig({ mode: 'first_arrival' })).toBe('wait_all')
    expect(combineModeFromConfig({ first_arrival: true })).toBe('wait_all')
    expect(combineModeFromConfig({ mode: 'wait_all' })).toBe('wait_all')
    expect(combineModeFromConfig({})).toBe('wait_all')
  })

  it('reads output_mode, defaulting to object', () => {
    expect(readCombineOutputMode({ output_mode: 'array' })).toBe('array')
    expect(readCombineOutputMode({ output_mode: 'object' })).toBe('object')
    expect(readCombineOutputMode({})).toBe('object')
  })

  it('recognizes only the combine kind', () => {
    expect(isCombineKind('combine')).toBe(true)
    expect(isCombineKind('join')).toBe(false)
    expect(isCombineKind('merge')).toBe(false)
    expect(isCombineKind('branch')).toBe(false)
    expect(isCombineKind(undefined)).toBe(false)
  })
})

describe('combine config round-trip (backend-canonical shape)', () => {
  it('commits the canonical kind + explicit mode and output_mode', () => {
    const patch = combineNodePatch({ keep: 1 }, 'wait_all', 'array')
    expect(patch.kind).toBe('combine')
    expect(patch.config).toEqual({ keep: 1, mode: 'wait_all', output_mode: 'array' })
  })

  it('preserves unrelated canonical configuration', () => {
    const stored = { kind: 'combine', config: { output_mode: 'array', keep: 1 } }
    const mode = readCombineMode(stored.kind, stored.config)
    const outputMode = readCombineOutputMode(stored.config)
    const patch = combineNodePatch(stored.config, mode, outputMode)
    expect(patch.kind).toBe('combine')
    expect(patch.config).toEqual({ keep: 1, mode: 'wait_all', output_mode: 'array' })
  })
})

describe('combineExclusiveBranchConflict (wait-all guard rail)', () => {
  function branchArmsDoc(p1: string, p2: string, src1 = 'br', src2 = 'br'): WfDoc {
    const doc = emptyDoc()
    doc.nodes = {
      br: { id: 'br', title: 'Approved?', kind: 'branch' } as never,
      br2: { id: 'br2', title: 'Other', kind: 'branch' } as never,
      c: { id: 'c', title: 'Combine', kind: 'combine' } as never,
    }
    doc.edges = {
      e1: { id: 'e1', source_id: src1, target_id: 'c', source_port: p1 } as never,
      e2: { id: 'e2', source_id: src2, target_id: 'c', source_port: p2 } as never,
    }
    return doc
  }

  it('flags a combine fed only by both arms of the same Branch', () => {
    expect(combineExclusiveBranchConflict(branchArmsDoc('true', 'false'), 'c')).toBe('br')
  })

  it('does not flag when both edges are the same arm (not mutually exclusive)', () => {
    expect(combineExclusiveBranchConflict(branchArmsDoc('true', 'true'), 'c')).toBeNull()
  })

  it('does not flag arms from two different Branches', () => {
    expect(combineExclusiveBranchConflict(branchArmsDoc('true', 'false', 'br', 'br2'), 'c')).toBeNull()
  })

  it('does not flag when any input is not a Branch arm', () => {
    const doc = branchArmsDoc('true', 'false')
    doc.nodes.step = { id: 'step', title: 'Step', kind: 'block' } as never
    doc.edges.e3 = { id: 'e3', source_id: 'step', target_id: 'c' } as never
    expect(combineExclusiveBranchConflict(doc, 'c')).toBeNull()
  })

  it('needs at least two incoming arms', () => {
    const doc = branchArmsDoc('true', 'false')
    delete doc.edges.e2
    expect(combineExclusiveBranchConflict(doc, 'c')).toBeNull()
  })

  it('ignores non-combine nodes', () => {
    const doc = branchArmsDoc('true', 'false')
    doc.nodes.c = { id: 'c', title: 'Nope', kind: 'block' } as never
    expect(combineExclusiveBranchConflict(doc, 'c')).toBeNull()
  })

  it('warns naming the Branch and steering to first-wins', () => {
    const msg = combineExclusiveWarning('Approved?')
    expect(msg).toContain('Approved?')
    expect(msg).toContain('first-wins')
  })
})

import { describe, expect, it } from 'vitest'
import { edgeCompat, isStructurallyValid, semanticPort, validateConnection } from './connection-policy'

describe('validateConnection', () => {
  it('allows when either schema is absent (neutral)', () => {
    expect(validateConnection(null, { type: 'object' }).status).toBe('neutral')
    expect(validateConnection({ type: 'string' }, undefined).status).toBe('neutral')
    expect(validateConnection(null, null).status).toBe('neutral')
  })

  it('treats an empty or unparseable schema as neutral', () => {
    expect(validateConnection('', { type: 'string' }).status).toBe('neutral')
    expect(validateConnection('not json', { type: 'string' }).status).toBe('neutral')
    expect(validateConnection({}, { type: 'string' }).status).toBe('neutral')
  })

  it('accepts matching scalar types', () => {
    expect(validateConnection({ type: 'string' }, { type: 'string' }).status).toBe('ok')
  })

  it('treats number and integer as compatible', () => {
    expect(validateConnection({ type: 'integer' }, { type: 'number' }).status).toBe('ok')
    expect(validateConnection({ type: 'number' }, { type: 'integer' }).status).toBe('ok')
  })

  it('rejects mismatched scalar types with a naming message', () => {
    const v = validateConnection({ type: 'string' }, { type: 'number' })
    expect(v.status).toBe('error')
    expect(v.message).toContain('string')
    expect(v.message).toContain('number')
  })

  it('accepts objects whose required fields are all present upstream', () => {
    const src = { type: 'object', properties: { id: {}, name: {} } }
    const tgt = { type: 'object', properties: { id: {} }, required: ['id'] }
    expect(validateConnection(src, tgt).status).toBe('ok')
  })

  it('rejects objects missing a required downstream field, naming it', () => {
    const src = { type: 'object', properties: { id: {} } }
    const tgt = { type: 'object', properties: { email: {} }, required: ['email'] }
    const v = validateConnection(src, tgt)
    expect(v.status).toBe('error')
    expect(v.message).toContain('email')
  })

  it('parses stringified JSON schemas', () => {
    const src = JSON.stringify({ type: 'object', properties: { id: {} } })
    const tgt = JSON.stringify({ type: 'object', required: ['id'], properties: { id: {} } })
    expect(validateConnection(src, tgt).status).toBe('ok')
  })

  it('allows an any-typed producer or consumer', () => {
    expect(validateConnection({ type: 'any' }, { type: 'object', required: ['x'], properties: {} }).status).toBe('ok')
  })
})

describe('edgeCompat', () => {
  it('flags a schema mismatch as needs-mapping, never as an error', () => {
    expect(edgeCompat({ type: 'string' }, { type: 'number' })).toBe('needs-mapping')
    const src = { type: 'object', properties: { id: {} } }
    const tgt = { type: 'object', properties: { email: {} }, required: ['email'] }
    expect(edgeCompat(src, tgt)).toBe('needs-mapping')
  })

  it('reads a compatible or uninformative pair as ok', () => {
    expect(edgeCompat({ type: 'string' }, { type: 'string' })).toBe('ok')
    expect(edgeCompat(null, { type: 'object' })).toBe('ok')
    expect(edgeCompat(undefined, undefined)).toBe('ok')
  })
})

describe('isStructurallyValid', () => {
  it('keeps visual handles out of the semantic port vocabulary', () => {
    expect(semanticPort('out-bottom')).toBeUndefined()
    expect(semanticPort('out-right')).toBeUndefined()
    expect(semanticPort('in-top')).toBeUndefined()
    expect(semanticPort('in-left')).toBeUndefined()
    expect(semanticPort('failed')).toBe('failed')
    expect(semanticPort('result')).toBe('result')
  })

  it('rejects a missing side or a self-loop', () => {
    expect(isStructurallyValid({ source: null, target: 'b' }, [])).toBe(false)
    expect(isStructurallyValid({ source: 'a', target: null }, [])).toBe(false)
    expect(isStructurallyValid({ source: 'a', target: 'a' }, [])).toBe(false)
  })

  it('rejects a duplicate of an existing edge with the same ports', () => {
    const edges = [{ source_id: 'a', target_id: 'b' }]
    expect(isStructurallyValid({ source: 'a', target: 'b' }, edges)).toBe(false)
    expect(isStructurallyValid({ source: 'a', target: 'c' }, edges)).toBe(true)
  })

  it('allows the same endpoints on different ports', () => {
    const edges = [{ source_id: 'a', target_id: 'b', source_port: 'then' }]
    expect(isStructurallyValid({ source: 'a', target: 'b', sourceHandle: 'else' }, edges)).toBe(true)
    expect(isStructurallyValid({ source: 'a', target: 'b', sourceHandle: 'then' }, edges)).toBe(false)
  })

  it('allows a structurally sound connection regardless of schema', () => {
    expect(isStructurallyValid({ source: 'a', target: 'b' }, [])).toBe(true)
  })

  it('does not treat a stored edge as a duplicate of itself when re-validated on load', () => {
    // VueFlow re-runs this validator over every stored edge during setEdges. An edge whose
    // stored ports equal its rendered handle ids matches itself in the edge set; without
    // excluding the edge by id it reads as a duplicate and VueFlow drops it, collapsing the
    // whole edges layer. Excluding self keeps the stored edge valid.
    const edges = [{ id: 'e1', source_id: 'a', target_id: 'b', source_port: 'out-bottom', target_port: 'in-top' }]
    expect(isStructurallyValid({ id: 'e1', source: 'a', target: 'b', sourceHandle: 'out-bottom', targetHandle: 'in-top' }, edges)).toBe(true)
    // A freshly drawn connection carries no id, so a real duplicate is still refused.
    expect(isStructurallyValid({ source: 'a', target: 'b', sourceHandle: 'out-bottom', targetHandle: 'in-top' }, edges)).toBe(false)
    // A distinct stored edge with the same endpoints/ports is still a duplicate.
    expect(isStructurallyValid({ id: 'e2', source: 'a', target: 'b', sourceHandle: 'out-bottom', targetHandle: 'in-top' }, edges)).toBe(false)
  })

  it('treats a presentation-handle edge and a canonical plain edge as duplicates', () => {
    const edges = [{ source_id: 'a', target_id: 'b' }]
    expect(isStructurallyValid({ source: 'a', target: 'b', sourceHandle: 'out-bottom', targetHandle: 'in-top' }, edges)).toBe(false)
    expect(isStructurallyValid({ source: 'a', target: 'b', sourceHandle: 'out-right', targetHandle: 'in-left' }, edges)).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'
import { parseJsonObject } from './json-field'

describe('parseJsonObject', () => {
  it('reads empty text as unset, not an error', () => {
    expect(parseJsonObject('')).toEqual({ value: null, error: '' })
    expect(parseJsonObject('   ')).toEqual({ value: null, error: '' })
  })

  it('parses a valid JSON object', () => {
    expect(parseJsonObject('{ "tenant": "acme", "n": 3 }')).toEqual({ value: { tenant: 'acme', n: 3 }, error: '' })
  })

  it('rejects a JSON array', () => {
    const r = parseJsonObject('[1, 2, 3]')
    expect(r.value).toBeNull()
    expect(r.error).toBe('Must be a JSON object.')
  })

  it('rejects a JSON primitive', () => {
    const r = parseJsonObject('"just a string"')
    expect(r.value).toBeNull()
    expect(r.error).toBe('Must be a JSON object.')
  })

  it('reports a parse error for malformed JSON', () => {
    const r = parseJsonObject('{ not json')
    expect(r.value).toBeNull()
    expect(r.error).toMatch(/Invalid JSON/)
  })
})

import { describe, expect, it } from 'vitest'
import { flowFilename } from './portable'

describe('flowFilename', () => {
  it('slugs the Flow title into a lower-kebab .flow.json filename', () => {
    expect(flowFilename('Qualify Lead')).toBe('qualify-lead.flow.json')
  })

  it('strips punctuation and collapses whitespace/underscores', () => {
    expect(flowFilename('  Inbound Lead: Pre-call Wedge!! ')).toBe('inbound-lead-pre-call-wedge.flow.json')
    expect(flowFilename('a__b   c')).toBe('a-b-c.flow.json')
  })

  it('falls back to "flow" for an empty or punctuation-only title', () => {
    expect(flowFilename('')).toBe('flow.flow.json')
    expect(flowFilename('   ')).toBe('flow.flow.json')
    expect(flowFilename('***')).toBe('flow.flow.json')
  })
})

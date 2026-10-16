import { describe, it, expect } from 'vitest'
import { credentialStatusLabel, entryLabel } from './labels.ts'

describe('credentialStatusLabel', () => {
  it('maps the server credential status enum to human labels', () => {
    expect(credentialStatusLabel('active')).toBe('Active')
    expect(credentialStatusLabel('revoked')).toBe('Revoked')
  })
  it('falls back to the raw token for unknown values and empty for none', () => {
    expect(credentialStatusLabel('expired')).toBe('expired')
    expect(credentialStatusLabel(undefined)).toBe('')
    expect(credentialStatusLabel('')).toBe('')
  })
})

// A component entry with no declared name must never surface its raw registry
// id as the primary label — the id belongs in a secondary/mono detail only.
describe('entryLabel', () => {
  it('uses the declared name', () => {
    expect(entryLabel({ name: 'Research agent' })).toBe('Research agent')
  })
  it('never falls back to the raw id — a neutral name instead', () => {
    expect(entryLabel({ name: '' })).toBe('Unknown component')
    expect(entryLabel({})).toBe('Unknown component')
  })
})

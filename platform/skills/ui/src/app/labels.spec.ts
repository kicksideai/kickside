import { describe, it, expect } from 'vitest'
import { skillStatusLabel, fileKindLabel } from './labels.ts'

describe('skillStatusLabel', () => {
  it('maps the server status enum to human labels', () => {
    expect(skillStatusLabel('active')).toBe('Active')
    expect(skillStatusLabel('archived')).toBe('Archived')
  })
  it('falls back to the raw token for unknown values and empty for none', () => {
    expect(skillStatusLabel('draft')).toBe('draft')
    expect(skillStatusLabel(undefined)).toBe('')
    expect(skillStatusLabel('')).toBe('')
  })
})

describe('fileKindLabel', () => {
  it('maps the server file-kind enum to human labels', () => {
    expect(fileKindLabel('reference')).toBe('Reference')
    expect(fileKindLabel('asset')).toBe('Asset')
    expect(fileKindLabel('script')).toBe('Script')
  })
  it('falls back to the raw token for unknown values and empty for none', () => {
    expect(fileKindLabel('binary')).toBe('binary')
    expect(fileKindLabel(undefined)).toBe('')
  })
})

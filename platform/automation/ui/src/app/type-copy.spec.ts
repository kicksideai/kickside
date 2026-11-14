import { describe, expect, it } from 'vitest'
import { automationTypeDescription } from './type-copy'

describe('automation type copy', () => {
  it('keeps the provider-authored description without interpreting its vocabulary', () => {
    expect(automationTypeDescription({ description: 'Poll a source every hour.' })).toBe('Poll a source every hour.')
  })
})

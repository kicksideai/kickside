import { describe, expect, it } from 'vitest'
import { webhookStatusLabel } from './labels'

describe('webhookStatusLabel', () => {
  it('maps the known status enum to a human label', () => {
    expect(webhookStatusLabel('active')).toBe('Active')
    expect(webhookStatusLabel('revoked')).toBe('Revoked')
  })

  it('falls back to the raw token for an unknown status, never blank', () => {
    expect(webhookStatusLabel('paused')).toBe('paused')
  })

  it('renders nothing for an absent status', () => {
    expect(webhookStatusLabel(undefined)).toBe('')
  })
})

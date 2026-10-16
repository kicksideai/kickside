import { describe, expect, it } from 'vitest'
import { collectMetrics } from './row-status'

describe('future timestamp metrics', () => {
  it('formats future state timestamps as time until the event', () => {
    const timestamp = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString()
    const state = { enabled: true, expires_at: timestamp }
    const metrics = collectMetrics([{ key: 'expires_at', type: 'text' }], state, false)
    expect(metrics).toEqual([{ label: 'Expires At', value: 'in 4d', title: undefined, icon: undefined }])
  })
})

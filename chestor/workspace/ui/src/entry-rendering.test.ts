import { describe, expect, it } from 'vitest'
import { rendererAttrs } from './entry-rendering'
import type { Entry } from './types'

describe('entry renderer access', () => {
  it('opens a shared reader in full mode with editing disabled', () => {
    const attrs = rendererAttrs({ id: 'northwind', name: 'Delivery', type: 'graph', access_level: 1 } as Entry, 'full')
    expect(attrs.mode).toBe('full')
    expect(attrs['read-only']).toBe('true')
    expect(attrs['entry-id']).toBe('northwind')
  })
  it('enables editing only for the write access bit', () => {
    const attrs = rendererAttrs({ id: 'northwind', name: 'Delivery', type: 'roadmap', access_level: 3 } as Entry, 'full')
    expect(attrs['read-only']).toBe('false')
  })
})

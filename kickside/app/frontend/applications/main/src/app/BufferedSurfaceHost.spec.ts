import { describe, expect, it } from 'vitest'
import type { SwapSlot } from '@wippy-fe/layout'
import { surfaceIdentity } from './surfaceIdentity'
import { isSurfaceBufferActive } from './surfaceBufferActivity'
import { isSurfaceBufferVisible } from './surfaceBufferVisibility'

interface Entry {
  key: string
}

function slot(index: number, key: string, ready: boolean, lastActiveAt: number): SwapSlot<Entry> {
  return { index, key, entry: { key }, ready, error: null, lastActiveAt }
}

describe('surfaceIdentity', () => {
  it('keys nested routes by their owning navigation item', () => {
    const item = { id: 'knowledge', render: 'component', component_tag: 'kickside-knowledge' } as never
    expect(surfaceIdentity('/knowledge/a', 'surface', item)).toBe('nav:knowledge')
    expect(surfaceIdentity('/knowledge/b', 'surface', item)).toBe('nav:knowledge')
  })

  it('keeps same-tag surfaces separate when their navigation owners differ', () => {
    const first = { id: 'knowledge', render: 'component', component_tag: 'kickside-shared' } as never
    const second = { id: 'archive', render: 'component', component_tag: 'kickside-shared' } as never
    expect(surfaceIdentity('/knowledge', 'surface', first)).toBe('nav:knowledge')
    expect(surfaceIdentity('/archive', 'surface', second)).toBe('nav:archive')
  })

  it('falls back to the first path segment for unknown catch-all routes', () => {
    expect(surfaceIdentity('/alpha/a', 'surface')).toBe('path-root:alpha')
    expect(surfaceIdentity('/beta', 'surface')).toBe('path-root:beta')
  })
})

describe('surface buffer visibility', () => {
  it('keeps the outgoing buffer visible only while the incoming buffer is pending', () => {
    const outgoing = slot(1, 'dashboard', true, 1)
    const incoming = slot(0, 'system', false, 2)

    expect(isSurfaceBufferVisible(outgoing, [incoming, outgoing], 0)).toBe(true)
    expect(isSurfaceBufferVisible(incoming, [incoming, outgoing], 0)).toBe(false)

    const readyIncoming = { ...incoming, ready: true }
    expect(isSurfaceBufferVisible(outgoing, [readyIncoming, outgoing], 0)).toBe(false)
    expect(isSurfaceBufferVisible(readyIncoming, [readyIncoming, outgoing], 0)).toBe(true)
  })

  it('makes the incoming buffer active before it is paint-ready', () => {
    const outgoing = slot(1, 'dashboard', true, 1)
    const incoming = slot(0, 'system', false, 2)

    expect(isSurfaceBufferActive(incoming, 0)).toBe(true)
    expect(isSurfaceBufferActive(outgoing, 0)).toBe(false)
    expect(isSurfaceBufferVisible(outgoing, [incoming, outgoing], 0)).toBe(true)
  })

  it('makes every retained ordinary surface inactive when its layout panel is not presented', () => {
    const retained = slot(0, 'dashboard', true, 2)

    expect(isSurfaceBufferActive(retained, 0, false)).toBe(false)
  })

  it('shows the retained buffer again on A to B to A reuse', () => {
    const retainedA = slot(1, 'dashboard', true, 3)
    const retainedB = slot(0, 'system', true, 2)

    expect(isSurfaceBufferVisible(retainedA, [retainedB, retainedA], 1)).toBe(true)
    expect(isSurfaceBufferVisible(retainedB, [retainedB, retainedA], 1)).toBe(false)
  })
})

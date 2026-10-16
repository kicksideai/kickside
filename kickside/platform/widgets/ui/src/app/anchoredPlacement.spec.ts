import { describe, expect, it } from 'vitest'
import { anchoredPlacement } from './anchoredPlacement'

const anchor = (left: number, top: number, width = 40, height = 32) => ({
  left, right: left + width, top, bottom: top + height, width,
})

describe('anchoredPlacement', () => {
  it('caps a requested picker width inside compact viewports', () => {
    const p = anchoredPlacement({
      anchor: anchor(4, 60), viewportWidth: 280, viewportHeight: 500,
      requestedWidth: 320, requestedMaxHeight: 380,
    })
    expect(p).toMatchObject({ left: 8, width: 264, side: 'below' })
  })

  it('publishes the actual height available below the anchor', () => {
    const p = anchoredPlacement({
      anchor: anchor(220, 180), viewportWidth: 360, viewportHeight: 300,
      requestedWidth: 304, requestedMaxHeight: 360, gap: 6,
    })
    expect(p.side).toBe('above')
    expect(p.maxHeight).toBe(166)
    expect(p.top).toBe(8)
  })

  it('right-aligns without crossing the viewport safe margin', () => {
    const p = anchoredPlacement({
      anchor: anchor(310, 30), viewportWidth: 360, viewportHeight: 600,
      requestedWidth: 200, requestedMaxHeight: 300, align: 'right',
    })
    expect(p.left).toBe(150)
    expect(p.width).toBe(200)
  })

  it('converts viewport placement into a transformed containing block frame', () => {
    const p = anchoredPlacement({
      anchor: anchor(320, 240), viewportWidth: 800, viewportHeight: 600,
      requestedWidth: 240, requestedMaxHeight: 300, panelHeight: 120,
      containingBlockOrigin: { left: 100, top: 80 },
    })
    expect(p).toMatchObject({ left: 220, top: 196, width: 240, maxHeight: 300, side: 'below' })
  })

  it('places an above panel by its rendered height while preserving maxHeight', () => {
    const p = anchoredPlacement({
      anchor: anchor(320, 520), viewportWidth: 800, viewportHeight: 600,
      requestedWidth: 240, requestedMaxHeight: 300, panelHeight: 120,
      containingBlockOrigin: { left: 100, top: 80 }, gap: 6,
    })
    expect(p).toMatchObject({ left: 220, top: 314, maxHeight: 300, side: 'above' })
  })
})

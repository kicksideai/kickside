export const OVERLAY_PICKER_Z_INDEX = 2000

export interface AnchoredPlacementInput {
  anchor: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom' | 'width'>
  viewportWidth: number
  viewportHeight: number
  requestedWidth: number
  requestedMaxHeight: number
  align?: 'left' | 'right'
  margin?: number
  gap?: number
  containingBlockOrigin?: { left: number; top: number }
  panelHeight?: number
}

export interface AnchoredPlacement {
  left: number
  width: number
  maxHeight: number
  side: 'above' | 'below'
  top: number
}

// Placement is deliberately pure so every fixed picker can share the same compact-host
// contract. `left` and `top` are local to the fixed-position containing block: transformed
// ancestors establish one, so callers can supply the origin measured by temporarily placing
// the panel at local 0,0. Without an origin they are ordinary viewport coordinates.
export function anchoredPlacement(input: AnchoredPlacementInput): AnchoredPlacement {
  const margin = input.margin ?? 8
  const gap = input.gap ?? 4
  const viewportWidth = Math.max(0, input.viewportWidth)
  const viewportHeight = Math.max(0, input.viewportHeight)
  const usableWidth = Math.max(0, viewportWidth - margin * 2)
  const width = Math.min(Math.max(0, input.requestedWidth), usableWidth)

  const requestedLeft = input.align === 'right'
    ? input.anchor.right - width
    : input.anchor.left
  const viewportLeft = Math.max(margin, Math.min(requestedLeft, viewportWidth - margin - width))

  const below = Math.max(0, viewportHeight - input.anchor.bottom - gap - margin)
  const above = Math.max(0, input.anchor.top - gap - margin)
  const side = below < input.requestedMaxHeight && above > below ? 'above' : 'below'
  const availableHeight = side === 'above' ? above : below
  const maxHeight = Math.round(Math.min(Math.max(0, input.requestedMaxHeight), availableHeight))
  const panelHeight = Math.min(Math.max(0, input.panelHeight ?? maxHeight), maxHeight)
  const viewportTop = side === 'above'
    ? input.anchor.top - gap - panelHeight
    : input.anchor.bottom + gap
  const origin = input.containingBlockOrigin ?? { left: 0, top: 0 }

  return {
    left: Math.round(viewportLeft - origin.left),
    width: Math.round(width),
    maxHeight,
    side,
    top: Math.round(viewportTop - origin.top),
  }
}

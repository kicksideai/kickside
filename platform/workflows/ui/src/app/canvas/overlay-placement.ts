export interface OverlayBounds { left: number; top: number; right: number; bottom: number }
export interface OverlayPoint { left: number; top: number }

// Edge overlays are lifted above their anchor by CSS. Clamp the anchor itself so the
// complete surface remains inside the visible canvas instead of painting over app chrome
// or disappearing beyond a compact host.
export function clampLiftedOverlay(
  point: OverlayPoint,
  bounds: OverlayBounds,
  width: number,
  height: number,
  margin = 12,
  lift = 14,
): OverlayPoint {
  const minX = bounds.left + width / 2 + margin
  const maxX = bounds.right - width / 2 - margin
  const left = minX <= maxX
    ? Math.min(Math.max(point.left, minX), maxX)
    : (bounds.left + bounds.right) / 2
  const minY = bounds.top + height + lift + margin
  const maxY = bounds.bottom - margin
  const top = minY <= maxY
    ? Math.min(Math.max(point.top, minY), maxY)
    : Math.max(bounds.top + margin, maxY)
  return { left, top }
}

function liftedRect(point: OverlayPoint, width: number, height: number, lift: number): OverlayBounds {
  return {
    left: point.left - width / 2,
    right: point.left + width / 2,
    top: point.top - lift - height,
    bottom: point.top - lift,
  }
}

function overlapArea(a: OverlayBounds, b: OverlayBounds): number {
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
  return width * height
}

// Keep edge intent surfaces close to the edge while refusing to cover the nodes the
// user is connecting. Candidates are deterministic, so reconnecting or resizing does
// not make the prompt jump unpredictably between equivalent locations.
export function placeLiftedOverlay(
  point: OverlayPoint,
  bounds: OverlayBounds,
  width: number,
  height: number,
  obstacles: OverlayBounds[],
  margin = 12,
  lift = 14,
): OverlayPoint {
  const candidates: OverlayPoint[] = [point]
  for (const obstacle of obstacles) {
    candidates.push(
      { left: point.left, top: obstacle.top - margin },
      { left: point.left, top: obstacle.bottom + height + lift + margin },
      { left: obstacle.left - width / 2 - margin, top: point.top },
      { left: obstacle.right + width / 2 + margin, top: point.top },
    )
  }

  let best = clampLiftedOverlay(candidates[0], bounds, width, height, margin, lift)
  let bestScore = Number.POSITIVE_INFINITY
  for (const candidate of candidates) {
    const placed = clampLiftedOverlay(candidate, bounds, width, height, margin, lift)
    const rect = liftedRect(placed, width, height, lift)
    const overlap = obstacles.reduce((sum, obstacle) => sum + overlapArea(rect, obstacle), 0)
    const distance = (placed.left - point.left) ** 2 + (placed.top - point.top) ** 2
    const score = overlap * 1_000_000 + distance
    if (score < bestScore) {
      best = placed
      bestScore = score
    }
  }
  return best
}

export function clampPointerHint(point: OverlayPoint, viewportWidth: number, viewportHeight: number): OverlayPoint {
  return {
    left: Math.min(Math.max(point.left + 14, 8), Math.max(8, viewportWidth - 190)),
    top: Math.min(Math.max(point.top + 14, 8), Math.max(8, viewportHeight - 44)),
  }
}

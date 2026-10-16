// Click-to-place cascade. Each consecutive placement steps down-right from canvas
// centre so a run of placements never stacks on one point; the offset wraps after
// CASCADE_WRAP steps back to zero. Kept pure so the cascade is unit-tested
// independently of the canvas.

export const CASCADE_STEP = 28
export const CASCADE_WRAP = 8

export function cascadeOffset(index: number, step = CASCADE_STEP, wrap = CASCADE_WRAP): { dx: number; dy: number } {
  const k = ((index % wrap) + wrap) % wrap
  return { dx: k * step, dy: k * step }
}

// Two placement anchors collide when both axes fall within one node's footprint — a new
// node dropped inside that box would visually cover the existing one.
export const OVERLAP_GAP = 64

export interface Point { x: number; y: number }
export interface Rect extends Point { width: number; height: number }

export function overlaps(a: Point, b: Point, gap = OVERLAP_GAP): boolean {
  return Math.abs(a.x - b.x) < gap && Math.abs(a.y - b.y) < gap
}

// Nudge a desired drop point down-right until it clears every occupied anchor. A click-to-
// place lands on canvas centre and a drop lands under the cursor; either way, if that point
// already holds a node the placement steps off it instead of stacking. Bounded by maxSteps
// so a dense canvas still resolves to a finite (last-tried) point rather than looping.
export function freePosition(
  desired: Point,
  occupied: Point[],
  step = CASCADE_STEP,
  gap = OVERLAP_GAP,
  maxSteps = 40,
): Point {
  let pos = { x: desired.x, y: desired.y }
  let tries = 0
  while (tries < maxSteps && occupied.some((o) => overlaps(pos, o, gap))) {
    pos = { x: pos.x + step, y: pos.y + step }
    tries++
  }
  return pos
}

export function rectsOverlap(a: Rect, b: Rect, margin = 20): boolean {
  return a.x < b.x + b.width + margin
    && a.x + a.width + margin > b.x
    && a.y < b.y + b.height + margin
    && a.y + a.height + margin > b.y
}

// Node anchors alone are not enough for real cards: two top-left points can be 100px
// apart while their 216px-wide cards still cover each other. Search a deterministic
// square ring around the pointer and return the nearest full-card slot. This keeps the
// user's drop intent while guaranteeing the new card does not visually stack on an
// existing one.
export function freeRectPosition(
  desired: Point,
  size: Pick<Rect, 'width' | 'height'>,
  occupied: Rect[],
  step = CASCADE_STEP,
  margin = 20,
  maxRings = 24,
): Point {
  const free = (point: Point) => !occupied.some((rect) => rectsOverlap({ ...point, ...size }, rect, margin))
  if (free(desired)) return { ...desired }
  for (let ring = 1; ring <= maxRings; ring++) {
    const distance = ring * step
    const candidates: Point[] = [
      { x: desired.x + distance, y: desired.y },
      { x: desired.x, y: desired.y + distance },
      { x: desired.x - distance, y: desired.y },
      { x: desired.x, y: desired.y - distance },
      { x: desired.x + distance, y: desired.y + distance },
      { x: desired.x - distance, y: desired.y + distance },
      { x: desired.x + distance, y: desired.y - distance },
      { x: desired.x - distance, y: desired.y - distance },
    ]
    const candidate = candidates.find(free)
    if (candidate) return candidate
  }
  return { x: desired.x + maxRings * step, y: desired.y + maxRings * step }
}

// Keep a midpoint badge off both endpoint cards by moving it perpendicular to the edge.
// Bias upward when either normal is possible so it stays clear of ordinary edge labels.
export function completenessBadgePosition(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  _midpointX: number,
  _midpointY: number,
  zoom = 1,
) {
  const dx = targetX - sourceX
  const dy = targetY - sourceY
  const length = Math.max(Math.hypot(dx, dy), 1)
  let nx = -dy / length
  let ny = dx / length
  if (ny > 0) { nx = -nx; ny = -ny }
  // A perpendicular gutter keeps the badge off the wire. Anchor at 35% of the endpoint
  // span instead of trusting the Bezier midpoint: a strongly curved path's midpoint may
  // already be inside the target card even though the endpoints remain well separated.
  // 48px includes the rendered badge's 15px half-width plus a full handle/gutter safety
  // margin. sourceX/Y/targetX/Y are flow coordinates, and the badge's own translate lands
  // inside VueFlow's zoom-scaled transform pane — an offset expressed in flow units is
  // therefore multiplied by zoom again on screen, so a small graph's tighter auto-fit
  // zoom balloons the gutter into visibly detached floating badges. Dividing by zoom here
  // keeps the badge the same screen distance off the wire at any zoom.
  const offset = 48 / Math.max(zoom, 0.1)
  return {
    x: sourceX + dx * 0.35 + nx * offset,
    y: sourceY + dy * 0.35 + ny * offset,
  }
}

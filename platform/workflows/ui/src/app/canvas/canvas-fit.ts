import type { FitViewParams } from '@vue-flow/core'

// A fit is navigation, not a thumbnail. Below this floor a standard 216px workflow card
// becomes too small to scan, so large graphs intentionally overflow the viewport; the
// minimap and pan controls preserve the whole-graph overview/navigation.
export const READABLE_FIT_MIN_ZOOM = 0.7

export function readableFitOptions(duration = 250, padding = 0.2, uiScale = 1): FitViewParams {
  // CSS UI zoom multiplies VueFlow's own zoom. Compensate only for enlargement so the
  // displayed card floor remains 0.7 (151px for a standard card) at 100% and 125% alike.
  // This is not a smaller visual floor; it prevents page zoom from turning Fit into crop.
  const normalizedScale = Number.isFinite(uiScale) ? Math.max(1, uiScale) : 1
  // Fit frames, it never magnifies: a small graph stays at its designed 100% card size
  // instead of being inflated to fill the viewport with oversized nodes and voids.
  return { padding, minZoom: READABLE_FIT_MIN_ZOOM / normalizedScale, maxZoom: 1 / normalizedScale, duration }
}

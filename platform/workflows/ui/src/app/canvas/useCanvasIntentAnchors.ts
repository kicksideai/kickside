import { computed, reactive, ref, watch, type Ref } from 'vue'
import type { SyncEngine } from '../mapping/sync'
import { placeLiftedOverlay, clampPointerHint, type OverlayBounds } from './overlay-placement'
import type { OverlayMeasure } from './use-overlay-measure'
import type { AutoMappedEdge, PendingEdge } from './canvas-connect'

interface CanvasIntentAnchorsOptions {
  engine: SyncEngine
  flowNodes: Ref<Array<{ id: string }>>
  canvasEl: Ref<HTMLElement | null>
  findNode: (id: string) => any
  getViewport: () => { x: number; y: number; zoom: number }
  revision: Ref<number>
  viewportRevision: Ref<number>
  intentRevision: Ref<number>
  pendingEdge: Ref<PendingEdge | null>
  autoMapped: Map<string, AutoMappedEdge>
  connectXY: Ref<{ x: number; y: number } | null>
  rebuild: () => void
}

export function useCanvasIntentAnchors(options: CanvasIntentAnchorsOptions) {
  const {
    engine, flowNodes, canvasEl, findNode, getViewport, revision,
    viewportRevision, intentRevision, pendingEdge, autoMapped, connectXY, rebuild,
  } = options
  const pendingOverlaySize = ref<OverlayMeasure | null>(null)
  const autoOverlaySizes = reactive(new Map<string, OverlayMeasure>())
  const overlayMeasureRev = ref(0)

  watch(intentRevision, () => {
    for (const id of [...autoOverlaySizes.keys()]) if (!autoMapped.has(id)) autoOverlaySizes.delete(id)
    if (!pendingEdge.value) pendingOverlaySize.value = null
    rebuild()
  })
  watch(() => pendingEdge.value?.id, () => { pendingOverlaySize.value = null })

  function sameMeasure(a: OverlayMeasure | null | undefined, b: OverlayMeasure) {
    return !!a && Math.abs(a.width - b.width) < 0.5 && Math.abs(a.height - b.height) < 0.5
  }
  function measurePending(measure: OverlayMeasure) {
    if (sameMeasure(pendingOverlaySize.value, measure)) return
    pendingOverlaySize.value = measure
    overlayMeasureRev.value++
  }
  function measureAuto(id: string, measure: OverlayMeasure) {
    if (sameMeasure(autoOverlaySizes.get(id), measure)) return
    autoOverlaySizes.set(id, measure)
    overlayMeasureRev.value++
  }

  // The screen-space edge midpoint anchors the intent popover and auto-map reveal.
  function nodeCenter(id: string): { x: number; y: number } | null {
    const node = findNode(id)
    if (!node) return null
    const position = node.computedPosition || node.position
    const dimensions = node.dimensions || { width: 180, height: 64 }
    if (!position) return null
    return { x: position.x + (dimensions.width || 180) / 2, y: position.y + (dimensions.height || 64) / 2 }
  }
  function nodeScreenBounds(canvasRect: DOMRect): OverlayBounds[] {
    const viewport = getViewport()
    return flowNodes.value.flatMap((flowNode) => {
      const node = findNode(flowNode.id)
      if (!node) return []
      const position = node.computedPosition || node.position
      const dimensions = node.dimensions || { width: 180, height: 64 }
      if (!position) return []
      const left = canvasRect.left + viewport.x + position.x * viewport.zoom
      const top = canvasRect.top + viewport.y + position.y * viewport.zoom
      return [{
        left,
        top,
        right: left + (dimensions.width || 180) * viewport.zoom,
        bottom: top + (dimensions.height || 64) * viewport.zoom,
      }]
    })
  }
  function edgeMidScreen(sourceId: string, targetId: string, size: OverlayMeasure): { left: number; top: number; maxHeight: number } | null {
    const source = nodeCenter(sourceId)
    const target = nodeCenter(targetId)
    if (!source || !target) return null
    const rect = canvasEl.value?.getBoundingClientRect()
    const viewport = getViewport()
    const flowX = (source.x + target.x) / 2
    const flowY = (source.y + target.y) / 2
    const raw = { left: (rect?.left || 0) + viewport.x + flowX * viewport.zoom, top: (rect?.top || 0) + viewport.y + flowY * viewport.zoom }
    if (!rect) return { ...raw, maxHeight: Math.max(80, window.innerHeight - 24) }
    return {
      ...placeLiftedOverlay(raw, rect, size.width, size.height, nodeScreenBounds(rect)),
      maxHeight: Math.max(80, rect.height - 24),
    }
  }

  const pendingAnchor = computed(() => {
    void revision.value; void viewportRevision.value; void intentRevision.value; void overlayMeasureRev.value
    const pending = pendingEdge.value
    return pending ? edgeMidScreen(pending.sourceId, pending.targetId, pendingOverlaySize.value || { width: 300, height: 1 }) : null
  })
  const autoMapAnchored = computed(() => {
    void revision.value; void viewportRevision.value; void intentRevision.value; void overlayMeasureRev.value
    const result: Array<{ id: string; entry: AutoMappedEdge; left: number; top: number; maxHeight: number; placed: boolean }> = []
    for (const entry of autoMapped.values()) {
      if (!engine.doc.edges[entry.id]) continue
      const size = autoOverlaySizes.get(entry.id)
      const anchor = edgeMidScreen(entry.sourceId, entry.targetId, size || { width: 300, height: 1 })
      if (anchor) result.push({ id: entry.id, entry, left: anchor.left, top: anchor.top, maxHeight: anchor.maxHeight, placed: !!size })
    }
    return result
  })
  const connectHintPosition = computed(() => {
    if (!connectXY.value) return null
    return clampPointerHint(
      { left: connectXY.value.x, top: connectXY.value.y },
      window.innerWidth,
      window.innerHeight,
    )
  })

  return {
    pendingOverlaySize, autoOverlaySizes, pendingAnchor, autoMapAnchored, connectHintPosition,
    measurePending, measureAuto,
  }
}

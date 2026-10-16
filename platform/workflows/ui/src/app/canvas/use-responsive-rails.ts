import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

interface ResponsiveRailsCtx {
  rootEl: Ref<HTMLElement | null>
  panelOpen: Ref<boolean>
  paletteOpen: Ref<boolean>
  hasSelection: Ref<boolean>
  viewingRun: Ref<unknown | null>
  reframe: () => void
}

// One responsive state machine owns palette/inspector composition. The canvas asks to
// open a rail; this module enforces mutual exclusion and reframes only after flex layout
// and VueFlow's own ResizeObserver have settled.
export function useResponsiveRails(ctx: ResponsiveRailsCtx) {
  const { rootEl, panelOpen, paletteOpen, hasSelection, viewingRun, reframe } = ctx
  const compact = ref(false)
  const narrow = ref(false)
  const inspectorVisible = computed(() => panelOpen.value && (hasSelection.value || !!viewingRun.value))
  let observer: ResizeObserver | null = null
  let reframeGeneration = 0
  let canvasActionPending = false

  function reframeAfterRailChange() {
    const generation = ++reframeGeneration
    nextTick(() => requestAnimationFrame(() => requestAnimationFrame(() => {
      if (generation === reframeGeneration) reframe()
    })))
  }
  function togglePalette() {
    const opening = !paletteOpen.value
    if (opening && compact.value && inspectorVisible.value) panelOpen.value = false
    paletteOpen.value = opening
  }
  function openInspector() {
    if (compact.value) paletteOpen.value = false
    panelOpen.value = true
  }
  function closeInspector() { panelOpen.value = false }
  // Fit/Auto layout must operate on the canvas the user will actually keep. At the compact
  // tier the palette is an overlay over much of that surface, so close it deliberately and
  // let the existing double-rAF reframe run after the canvas regains its full width.
  async function prepareCanvasAction(): Promise<boolean> {
    if (!compact.value || !paletteOpen.value) return false
    canvasActionPending = true
    paletteOpen.value = false
    // Wait for both the Vue render and the browser's observed flex geometry. The caller
    // then performs exactly one Fit/Auto action against the canvas the user keeps.
    await nextTick()
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    canvasActionPending = false
    return true
  }

  watch([compact, inspectorVisible], ([isCompact, inspector], previous) => {
    if (isCompact && inspector && paletteOpen.value) paletteOpen.value = false
    if (previous && previous[1] !== inspector) reframeAfterRailChange()
  })
  watch(paletteOpen, (open, previous) => {
    if (open && compact.value && inspectorVisible.value) panelOpen.value = false
    if (open !== previous && !canvasActionPending) reframeAfterRailChange()
  })
  onMounted(() => {
    const root = rootEl.value
    if (!root || typeof ResizeObserver === 'undefined') return
    const update = (width: number) => {
      if (width <= 0) return
      compact.value = width <= 1180
      narrow.value = width <= 640
    }
    update(root.getBoundingClientRect().width)
    observer = new ResizeObserver((entries) => update(entries[0]?.contentRect.width || 0))
    observer.observe(root)
  })
  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })

  return { compact, narrow, inspectorVisible, togglePalette, openInspector, closeInspector, prepareCanvasAction }
}

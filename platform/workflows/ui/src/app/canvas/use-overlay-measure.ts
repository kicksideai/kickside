import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

export interface OverlayMeasure { width: number; height: number }

// Reports the rendered footprint rather than asking the canvas to guess it. ResizeObserver
// catches phase changes (intent -> preview, reveal -> trace) and async error/result content.
export function useOverlayMeasure(report: (measure: OverlayMeasure) => void) {
  const overlayEl = ref<HTMLElement | null>(null)
  let observer: ResizeObserver | null = null

  function measure() {
    const rect = overlayEl.value?.getBoundingClientRect()
    if (!rect || rect.width <= 0 || rect.height <= 0) return
    report({ width: rect.width, height: rect.height })
  }

  onMounted(async () => {
    await nextTick()
    measure()
    if (typeof ResizeObserver === 'undefined' || !overlayEl.value) return
    observer = new ResizeObserver(measure)
    observer.observe(overlayEl.value)
  })
  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })

  return { overlayEl }
}

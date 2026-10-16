import { ref } from 'vue'

// UI-shell visibility is intentionally separate from workflow/run state. These flags
// control editor chrome only and never affect the stored definition.
export function useCanvasShell() {
  const panelOpen = ref(true)
  const paletteOpen = ref(true)
  const historyOpen = ref(false)
  const addTriggerOpen = ref(false)
  const shareOpen = ref(false)
  const shareHost = ref<HTMLElement | null>(null)

  return {
    panelOpen,
    paletteOpen,
    historyOpen,
    addTriggerOpen,
    shareOpen,
    shareHost,
  }
}

import { nextTick, type Ref } from 'vue'
import { mountWorkflowShare } from '../share'
import { ADD_TRIGGER_PUBLISH_FIRST, canAddTrigger } from '../panels/add-trigger'

interface CanvasOverlayActionsOptions {
  workflowId: string
  shareOpen: Ref<boolean>
  shareHost: Ref<HTMLElement | null>
  historyOpen: Ref<boolean>
  addTriggerOpen: Ref<boolean>
  runsOpen: Ref<boolean>
  simOpen: Ref<boolean>
  publishedVersion: Ref<number>
  error: Ref<string>
  clearIntentOverlays: () => void
  rememberOverlayInvoker: (fallback?: HTMLElement | null) => void
  restoreOverlayFocusFallback: () => Promise<void>
  openRunDialog: () => void
  closeSim: () => void
  toggleRunsPanel: () => void
}

export function useCanvasOverlayActions(options: CanvasOverlayActionsOptions) {
  const {
    workflowId, shareOpen, shareHost, historyOpen, addTriggerOpen, runsOpen, simOpen,
    publishedVersion, error, clearIntentOverlays, rememberOverlayInvoker,
    restoreOverlayFocusFallback, openRunDialog, closeSim, toggleRunsPanel,
  } = options

  async function openShare(invoker: HTMLElement | null = null) {
    clearIntentOverlays()
    rememberOverlayInvoker(invoker)
    shareOpen.value = true
    await nextTick()
    if (shareHost.value) await mountWorkflowShare(shareHost.value, workflowId, 'Workflow', closeShare)
  }
  function closeShare() {
    shareOpen.value = false
    void restoreOverlayFocusFallback()
  }

  function toggleHistory(invoker: HTMLElement | null = null) {
    clearIntentOverlays()
    if (!historyOpen.value) rememberOverlayInvoker(invoker)
    historyOpen.value = !historyOpen.value
    if (historyOpen.value) { runsOpen.value = false; simOpen.value = false }
  }
  function closeHistory() {
    historyOpen.value = false
    void restoreOverlayFocusFallback()
  }
  function openAddTrigger(invoker: HTMLElement | null = null) {
    if (!canAddTrigger(publishedVersion.value)) {
      error.value = `${ADD_TRIGGER_PUBLISH_FIRST}.`
      return
    }
    clearIntentOverlays()
    rememberOverlayInvoker(invoker)
    addTriggerOpen.value = true
    historyOpen.value = false
    runsOpen.value = false
    simOpen.value = false
  }
  function closeAddTrigger() {
    addTriggerOpen.value = false
    void restoreOverlayFocusFallback()
  }

  function openSim(invoker: HTMLElement | null = null) {
    clearIntentOverlays()
    rememberOverlayInvoker(invoker)
    openRunDialog()
  }
  function closeRunDialog() {
    closeSim()
    void restoreOverlayFocusFallback()
  }
  function toggleRuns(invoker: HTMLElement | null = null) {
    clearIntentOverlays()
    if (!runsOpen.value) rememberOverlayInvoker(invoker)
    toggleRunsPanel()
  }
  function closeRuns() {
    runsOpen.value = false
    void restoreOverlayFocusFallback()
  }

  return {
    openShare, closeShare, toggleHistory, closeHistory, openAddTrigger, closeAddTrigger,
    openSim, closeRunDialog, toggleRuns, closeRuns,
  }
}

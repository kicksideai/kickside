// Keyboard handling for the workflow canvas, extracted from WorkflowCanvas. Owns the root
// element ref (the keydown target and palette-search anchor); the actions it triggers are
// passed in.
import { nextTick, ref, type ComputedRef, type Ref } from 'vue'
import { isEditingTarget, resolveAction } from './keymap'

export interface KeyboardCtx {
  deleteSelection: () => void
  runHistory: (action: 'undo' | 'redo') => void | Promise<void>
  paletteOpen: Ref<boolean>
  hasSelection: ComputedRef<boolean>
  clearSelection: () => void
  fit?: () => void
  zoomSelection?: () => void
}

export function useCanvasKeyboard(ctx: KeyboardCtx) {
  const { deleteSelection, runHistory, paletteOpen, hasSelection, clearSelection, fit, zoomSelection } = ctx

  const rootEl = ref<HTMLElement | null>(null)

  function consume(e: KeyboardEvent) { e.preventDefault(); e.stopPropagation() }
  function isDialogEvent(e: KeyboardEvent) {
    return e.composedPath().some((target) => {
      const candidate = target as { getAttribute?: (name: string) => string | null }
      return typeof candidate.getAttribute === 'function' && candidate.getAttribute('role') === 'dialog'
    })
  }
  function focusPaletteSearch() {
    nextTick(() => {
      const input = rootEl.value?.querySelector('.wf-palette-search input') as HTMLInputElement | null
      input?.focus()
    })
  }
  function onKeyDown(e: KeyboardEvent) {
    // PrimeVue owns Escape, focus trapping, and focus restoration for Dialogs.
    // Let dialog events reach its document listener instead of unmounting the
    // dialog from the canvas handler before PrimeVue can restore the invoker.
    if (isDialogEvent(e)) return
    if (isEditingTarget(e.target)) {
      if (e.key === 'Escape') { (e.target as HTMLElement).blur?.(); consume(e) }
      return
    }
    const action = resolveAction({ key: e.key, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, target: e.target })
    if (action === 'delete') { consume(e); deleteSelection() }
    else if (action === 'undo') { consume(e); void runHistory('undo') }
    else if (action === 'redo') { consume(e); void runHistory('redo') }
    else if (action === 'palette') { consume(e); paletteOpen.value = true; focusPaletteSearch() }
    else if (action === 'fit') { if (fit) { consume(e); fit() } }
    else if (action === 'zoom-selection') { if (zoomSelection && hasSelection.value) { consume(e); zoomSelection() } }
    else if (action === 'escape') {
      if (hasSelection.value) { consume(e); clearSelection() }
    }
  }

  return { rootEl, onKeyDown, focusPaletteSearch }
}

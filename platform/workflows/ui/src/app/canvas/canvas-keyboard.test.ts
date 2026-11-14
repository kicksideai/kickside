import { computed, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useCanvasKeyboard } from './canvas-keyboard'

function keyboardHarness() {
  const clearSelection = vi.fn()
  const keyboard = useCanvasKeyboard({
    deleteSelection: vi.fn(),
    runHistory: vi.fn(),
    paletteOpen: ref(true),
    hasSelection: computed(() => true),
    clearSelection,
  })
  return { ...keyboard, clearSelection }
}

function escapeEvent(path: unknown[] = []) {
  return {
    key: 'Escape',
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    target: null,
    composedPath: () => path,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  } as unknown as KeyboardEvent
}

describe('canvas keyboard ownership', () => {
  it('leaves dialog Escape handling to PrimeVue', () => {
    const { onKeyDown, clearSelection } = keyboardHarness()
    const event = escapeEvent([{ getAttribute: (name: string) => name === 'role' ? 'dialog' : null }])

    onKeyDown(event)

    expect(clearSelection).not.toHaveBeenCalled()
    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('clears the canvas selection from a canvas-level Escape', () => {
    const { onKeyDown, clearSelection } = keyboardHarness()
    const event = escapeEvent()

    onKeyDown(event)

    expect(clearSelection).toHaveBeenCalledOnce()
    expect(event.preventDefault).toHaveBeenCalledOnce()
  })
})

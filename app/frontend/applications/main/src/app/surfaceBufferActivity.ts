import type { SwapSlot } from '@wippy-fe/layout'

// `topIndex` changes as soon as a buffer owns navigation. It deliberately does
// not wait for the incoming surface to be paint-ready: the outgoing surface may
// remain visible as a visual fallback but is already logically inactive.
export function isSurfaceBufferActive<T>(slot: SwapSlot<T>, topIndex: number, presented = true): boolean {
  return presented && slot.index === topIndex
}

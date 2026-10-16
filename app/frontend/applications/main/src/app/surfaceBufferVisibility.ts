import type { SwapSlot } from '@wippy-fe/layout'

export function isSurfaceBufferVisible<E>(
  slot: SwapSlot<E>,
  slots: readonly (SwapSlot<E> | null)[],
  topIndex: number,
): boolean {
  if (!slot.ready) return false

  const active = slots[topIndex]
  if (active?.ready) return slot.index === topIndex

  let fallback: SwapSlot<E> | null = null
  for (const candidate of slots) {
    if (!candidate?.ready) continue
    if (!fallback || candidate.lastActiveAt > fallback.lastActiveAt) fallback = candidate
  }
  return fallback?.index === slot.index
}

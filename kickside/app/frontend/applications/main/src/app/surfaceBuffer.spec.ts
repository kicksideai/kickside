import { effectScope } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useSwapBuffer } from '@wippy-fe/layout'

function createBuffer(onTimeout?: () => void) {
  const scope = effectScope()
  const buffer = scope.run(() => useSwapBuffer<{ key: string; path: string }>({
    keyOf: entry => entry.key,
    buffers: 2,
    readyTimeoutMs: 8000,
    onReadyTimeout: 'reveal',
    onReadyTimeoutFired: onTimeout,
  }))!
  return { buffer, stop: () => scope.stop() }
}

describe('ordinary surface double buffering', () => {
  it('reuses the live A slot after A to B to A navigation', () => {
    const { buffer, stop } = createBuffer()
    const a = buffer.push({ key: 'a', path: '/a' })
    buffer.markReady(a.index, a.key)
    const b = buffer.push({ key: 'b', path: '/b' })
    buffer.markReady(b.index, b.key)
    const again = buffer.push({ key: 'a', path: '/a/nested' })
    expect(again.index).toBe(a.index)
    expect(buffer.slots.value[a.index]?.ready).toBe(true)
    expect(buffer.slots.value[a.index]?.entry.path).toBe('/a/nested')
    stop()
  })

  it('rejects stale readiness and keeps failures scoped per slot', () => {
    const { buffer, stop } = createBuffer()
    const a = buffer.push({ key: 'a', path: '/a' })
    const b = buffer.push({ key: 'b', path: '/b' })
    buffer.markFailed(b.index, new Error('B failed'), b.key)
    expect(buffer.slots.value[a.index]?.error).toBeNull()
    const c = buffer.push({ key: 'c', path: '/c' })
    buffer.markReady(c.index, a.key)
    expect(buffer.slots.value[c.index]?.ready).toBe(false)
    stop()
  })

  it('logs and reveals after the eight-second readiness ceiling', async () => {
    const timedOut = vi.fn()
    const { buffer, stop } = createBuffer(timedOut)
    const slot = buffer.push({ key: 'slow', path: '/slow' })
    await vi.advanceTimersByTimeAsync(8000)
    expect(timedOut).toHaveBeenCalledOnce()
    expect(buffer.slots.value[slot.index]?.ready).toBe(true)
    stop()
  })
})

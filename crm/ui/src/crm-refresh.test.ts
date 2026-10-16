import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { coalesce } from './crm-refresh'

describe('read-model refresh coalescing', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('turns a burst of advances into a single refresh once the stream settles', () => {
    const run = vi.fn()
    const refresh = coalesce(run, { quietMs: 300, maxWaitMs: 2000 })
    for (let i = 0; i < 20; i++) { refresh.signal(); vi.advanceTimersByTime(50) }
    expect(run).not.toHaveBeenCalled()
    vi.advanceTimersByTime(300)
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('refreshes at the ceiling rate while advances never stop arriving', () => {
    const run = vi.fn()
    const refresh = coalesce(run, { quietMs: 300, maxWaitMs: 2000 })
    // A sync writing continuously: one advance every 100ms for 10s. Without the
    // ceiling the trailing timer would be pushed out and never fire.
    for (let i = 0; i < 100; i++) { refresh.signal(); vi.advanceTimersByTime(100) }
    expect(run).toHaveBeenCalledTimes(5)
  })

  it('refreshes promptly for a single write rather than waiting for the ceiling', () => {
    const run = vi.fn()
    const refresh = coalesce(run, { quietMs: 300, maxWaitMs: 2000 })
    refresh.signal()
    vi.advanceTimersByTime(299)
    expect(run).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('starts a fresh ceiling for the next burst', () => {
    const run = vi.fn()
    const refresh = coalesce(run, { quietMs: 300, maxWaitMs: 2000 })
    refresh.signal()
    vi.advanceTimersByTime(300)
    expect(run).toHaveBeenCalledTimes(1)
    for (let i = 0; i < 25; i++) { refresh.signal(); vi.advanceTimersByTime(100) }
    expect(run).toHaveBeenCalledTimes(2)
  })

  it('drops a pending refresh when the surface goes away', () => {
    const run = vi.fn()
    const refresh = coalesce(run, { quietMs: 300, maxWaitMs: 2000 })
    refresh.signal()
    refresh.cancel()
    vi.advanceTimersByTime(5000)
    expect(run).not.toHaveBeenCalled()
  })
})

const CLOCK_APIS = ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] as const
type ClockApi = typeof CLOCK_APIS[number]
type RegisterHook = (callback: () => void) => unknown

interface TestTimers {
  useFakeTimers(options: { toFake: ClockApi[] }): unknown
  clearAllTimers(): unknown
  useRealTimers(): unknown
}

// Dependencies come from the calling package's installation, so this shared
// helper needs neither a root node_modules nor another Vue/Vitest instance.
export function installFrontendTestClock(
  beforeEach: RegisterHook,
  afterEach: RegisterHook,
  vi: TestTimers,
  enableAutoUnmount: (register: RegisterHook) => void,
) {
  let restoreWindow: (() => void) | undefined

  beforeEach(() => {
    const browser = typeof window === 'undefined'
      ? undefined
      : window as unknown as Record<ClockApi, unknown>
    const originals = browser && CLOCK_APIS.map(name => browser[name])
    // Vue rejects events older than their listener's attachment time. Freeze
    // the clock per test and advance debounces explicitly: a backward jump in
    // system time must not silently discard a mounted button/form event.
    // Keep setImmediate real for @vue/test-utils' flushPromises.
    vi.useFakeTimers({ toFake: [...CLOCK_APIS] })

    // Happy DOM's window APIs can differ from Vitest's global APIs. Components
    // using window.setTimeout must use the same clock as bare setTimeout.
    if (browser && originals) {
      const globals = globalThis as unknown as Record<ClockApi, unknown>
      CLOCK_APIS.forEach(name => { browser[name] = globals[name] })
      restoreWindow = () => {
        CLOCK_APIS.forEach((name, index) => { browser[name] = originals[index] })
      }
    }
  })

  // One hook guarantees cleanup order regardless of Vitest's hook ordering.
  // Dispose mounted components even after failed assertions before dropping
  // callbacks, restoring system time, and restoring the browser's APIs.
  enableAutoUnmount(unmount => {
    afterEach(() => {
      try {
        unmount()
      } finally {
        try {
          vi.clearAllTimers()
          vi.useRealTimers()
        } finally {
          restoreWindow?.()
          restoreWindow = undefined
        }
      }
    })
  })
}

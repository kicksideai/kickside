import { beforeEach as beforeClockTest, afterEach as afterClockTest, vi as clockTimers } from 'vitest'
import { enableAutoUnmount as unmountClockTests } from '@vue/test-utils'
import { installFrontendTestClock } from '../../../../scripts/testing/frontend-test-clock'
import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'

;(globalThis as any).__props__ = {}
;(globalThis as any).__api__ = {}
;(globalThis as any).__confirm__ = vi.fn(() => Promise.resolve(true))
;(globalThis as any).__visibilityRefresh__ = undefined
;(globalThis as any).__hostVisible__ = null
;(globalThis as any).__setHostVisible__ = async (next: boolean) => {
  const previous = (globalThis as any).__hostVisible__
  ;(globalThis as any).__hostVisible__ = next
  if (previous === false && next === true) await (globalThis as any).__visibilityRefresh__?.()
}

function resp(url: string, body?: unknown) {
  const store = (globalThis as any).__api__
  for (const k of Object.keys(store)) {
    if (url.includes(k)) {
      const v = store[k]
      return typeof v === 'function' ? v(body) : v
    }
  }
  return { success: true }
}

const api = {
  get: vi.fn((u: string) => Promise.resolve({ data: resp(u) })),
  post: vi.fn((u: string, body: unknown) => Promise.resolve({ data: resp(u, body) })),
  patch: vi.fn((u: string, body: unknown) => Promise.resolve({ data: resp(u, body) })),
  delete: vi.fn((u: string) => Promise.resolve({ data: resp(u) })),
}
;(globalThis as any).__api_mock__ = api

// Force a spyable clipboard so copy tests can assert the written text (happy-dom
// ships a real, non-spy clipboard).
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn(() => Promise.resolve()) },
  configurable: true,
})

vi.mock('@wippy-fe/proxy', () => ({
  api,
  host: {
    toast: vi.fn(),
    handleError: vi.fn(),
    confirm: (...a: unknown[]) => (globalThis as any).__confirm__(...a),
  },
  loadByTagName: vi.fn(() => Promise.resolve()),
}))

// Application specs do not exercise Iconify's remote icon loader. Mock it so
// Happy DOM has no pending asset requests while disposing the test window.
vi.mock('@iconify/vue', () => ({
  Icon: { name: 'Icon', template: '<svg />' },
}))

// useEvents returns one persistent spy per test so specs assert emitted events; the
// spec resets __emit__ in beforeEach.
vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => ({ value: (globalThis as any).__props__ }),
  useEvents: () => { const g = globalThis as any; if (!g.__emit__) g.__emit__ = vi.fn(); return g.__emit__ },
  useHostVisibilityRefresh: (callback: () => unknown) => {
    ;(globalThis as any).__visibilityRefresh__ = callback
    void callback()
    return { value: (globalThis as any).__hostVisible__ }
  },
}))

config.global.stubs = { Icon: true, teleport: true }
config.global.config = config.global.config || {}
;(config.global.config as any).compilerOptions = { isCustomElement: (t: string) => t.startsWith('wc-') || t.startsWith('kickside-') }

// The component installs PrimeVue (unstyled) via vueConfig.plugins when the host
// mounts it; @vue/test-utils' mount() bypasses that bridge, so PrimeVue Dialog
// mounted in specs needs the same plugin installed or it faults on $primevue.
config.global.plugins = config.global.plugins || []
config.global.plugins.push(PrimeVuePlugin)

installFrontendTestClock(beforeClockTest, afterClockTest, clockTimers, unmountClockTests)

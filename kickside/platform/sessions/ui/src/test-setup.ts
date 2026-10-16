import { beforeEach as beforeClockTest, afterEach as afterClockTest, vi as clockTimers } from 'vitest'
import { enableAutoUnmount as unmountClockTests } from '@vue/test-utils'
import { installFrontendTestClock } from '../../../../scripts/testing/frontend-test-clock'
import { beforeEach, vi } from 'vitest'
import { watch, type Ref } from 'vue'
import { config } from '@vue/test-utils'

;(globalThis as any).__props__ = {}
;(globalThis as any).__events__ = []
;(globalThis as any).__api__ = {}
;(globalThis as any).__hostVisible__ = undefined

function response(url: string) {
  const routes = (globalThis as any).__api__ as Record<string, unknown>
  for (const key of Object.keys(routes)) if (url.includes(key)) return routes[key]
  return { success: true }
}

const api = {
  get: vi.fn((url: string) => Promise.resolve({ data: response(url) })),
  post: vi.fn((url: string) => Promise.resolve({ data: response(url) })),
  delete: vi.fn((url: string) => Promise.resolve({ data: response(url) })),
}

beforeEach(() => vi.clearAllMocks())

// `on` returns its own unsubscribe function, which every caller stores and
// invokes on teardown - a mock without it throws during mount, not at assert
// time, so the whole file fails before a single expectation runs.
vi.mock('@wippy-fe/proxy', () => ({
  api,
  host: { confirm: vi.fn(() => Promise.resolve(false)) },
  on: vi.fn(() => vi.fn()),
  getLayoutManager: vi.fn(() => null),
}))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span aria-hidden="true" />' } }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => ({ value: (globalThis as any).__props__ }),
  useEvents: () => vi.fn((name, detail) => (globalThis as any).__events__.push({ name, detail })),
  useHostVisibilityRefresh: (callback: () => unknown) => {
    const visible = (globalThis as any).__hostVisible__ as Ref<boolean> | undefined
    if (!visible) return callback()
    let previous = visible.value
    callback()
    watch(visible, (next) => {
      if (!previous && next) void callback()
      previous = next
    })
  },
}))

config.global.stubs = { Icon: true, Drawer: true }

installFrontendTestClock(beforeClockTest, afterClockTest, clockTimers, unmountClockTests)

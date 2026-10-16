import { vi } from 'vitest'
import { config } from '@vue/test-utils'

;(globalThis as any).__props__ = { config: {} }
;(globalThis as any).__api__ = {}

function resp(url: string) {
  const store = (globalThis as any).__api__
  for (const k of Object.keys(store)) {
    if (url.includes(k)) return store[k]
  }
  return { success: true }
}

const api = {
  get: vi.fn((u: string) => Promise.resolve({ data: resp(u) })),
  post: vi.fn((u: string) => Promise.resolve({ data: resp(u) })),
  put: vi.fn((u: string) => Promise.resolve({ data: resp(u) })),
  patch: vi.fn((u: string) => Promise.resolve({ data: resp(u) })),
  delete: vi.fn((u: string) => Promise.resolve({ data: resp(u) })),
}

vi.mock('@wippy-fe/proxy', () => ({
  api,
  host: { toast: vi.fn(), handleError: vi.fn() },
  on: vi.fn(() => vi.fn()),
  loadByTagName: vi.fn(() => Promise.resolve()),
}))

vi.mock('@iconify/vue', () => ({
  Icon: { template: '<span aria-hidden="true" />' },
}))

// useEvents returns one persistent spy per test run so specs can assert emitted
// events; the spec resets __emit__ in beforeEach.
vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => ({ value: (globalThis as any).__props__ }),
  useEvents: () => { const g = globalThis as any; if (!g.__emit__) g.__emit__ = vi.fn(); return g.__emit__ },
}))

config.global.stubs = { teleport: true, Icon: true, 'wc-icon-picker': true, 'wc-model-picker': true, 'wc-resource-view': true }
config.global.config = config.global.config || {}
;(config.global.config as any).compilerOptions = { isCustomElement: (t: string) => t.startsWith('wc-') || t.startsWith('kickside-') }

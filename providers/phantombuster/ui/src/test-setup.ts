import { vi } from 'vitest'
import { config } from '@vue/test-utils'

globalThis.__props__ = { config: {} }
globalThis.__api__ = {}
globalThis.__events__ = []

function resp(url: string) {
  const o = globalThis.__api__
  for (const k of Object.keys(o)) if (url.includes(k)) return o[k]
  return { success: true }
}

const api = {
  get: vi.fn((u: string) => Promise.resolve({ data: resp(u) })),
  post: vi.fn((u: string) => Promise.resolve({ data: resp(u) })),
  put: vi.fn((u: string) => Promise.resolve({ data: resp(u) })),
  delete: vi.fn((u: string) => Promise.resolve({ data: resp(u) })),
}

vi.mock('@wippy-fe/proxy', () => ({
  api,
  host: { toast: vi.fn(), handleError: vi.fn() },
  on: vi.fn(() => vi.fn()),
  loadByTagName: vi.fn(() => Promise.resolve()),
}))

vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => ({ value: globalThis.__props__ }),
  useEvents: () => vi.fn((name, detail) => globalThis.__events__.push({ name, detail })),
  WippyVueElement: class {},
  define: vi.fn(),
}))

Object.assign(window, {
  $W: {
    api: () => Promise.resolve(api),
    instance: () => Promise.resolve({ host: { toast: vi.fn() } }),
  },
})
config.global.stubs = { Icon: true }
config.global.config.compilerOptions = {
  isCustomElement: (t: string) => t.startsWith('wc-') || t.startsWith('kx-'),
}

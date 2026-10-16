import { vi } from 'vitest'

;(globalThis as any).__props__ = { route: '' }
;(globalThis as any).__events__ = []
;(globalThis as any).__api__ = {}
;(globalThis as any).__calls__ = []

function response(url: string) {
  const store = (globalThis as any).__api__ || {}
  for (const key of Object.keys(store)) {
    if (url.includes(key)) return store[key]
  }
  return { success: true }
}

const api = {
  get: vi.fn((url: string) => {
    ;((globalThis as any).__calls__ ||= []).push({ method: 'get', url })
    return Promise.resolve({ data: response(url) })
  }),
  post: vi.fn((url: string, body?: unknown, config?: unknown) => {
    ;((globalThis as any).__calls__ ||= []).push({ method: 'post', url, body, config })
    return Promise.resolve({ data: response(url) })
  }),
  put: vi.fn((url: string, body?: unknown) => {
    ;((globalThis as any).__calls__ ||= []).push({ method: 'put', url, body })
    return Promise.resolve({ data: response(url) })
  }),
  delete: vi.fn((url: string) => {
    ;((globalThis as any).__calls__ ||= []).push({ method: 'delete', url })
    return Promise.resolve({ data: response(url) })
  }),
}

;(globalThis as any).__host_api__ = api

vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => ({ value: (globalThis as any).__props__ }),
  useEvents: () => vi.fn((name, detail) => {
    ;((globalThis as any).__events__ ||= []).push({ name, detail })
  }),
}))


;(globalThis as any).window = (globalThis as any).window || globalThis

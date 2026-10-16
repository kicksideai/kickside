import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// ── Host seams, mocked once for every kb10 component test ────────────────────
// A mutable props bag so each test can set the kb config (e.g. kb_id) before mount.
;(globalThis as any).__kbProps__ = { config: { kb_id: 'kb1' } }
// Per-URL api responses a test can override.
;(globalThis as any).__kbApi__ = {}

function resp(url: string) {
  const over = (globalThis as any).__kbApi__ as Record<string, any>
  for (const key of Object.keys(over)) if (url.includes(key)) return over[key]
  return { success: true }
}

vi.mock('@wippy-fe/proxy', () => ({
  api: {
    get: vi.fn((url: string) => Promise.resolve({ data: resp(url) })),
    post: vi.fn((url: string) => Promise.resolve({ data: resp(url) })),
    put: vi.fn((url: string) => Promise.resolve({ data: resp(url) })),
    patch: vi.fn((url: string) => Promise.resolve({ data: resp(url) })),
    delete: vi.fn((url: string) => Promise.resolve({ data: resp(url) })),
  },
  host: { toast: vi.fn(), handleError: vi.fn() },
  // Capture realtime handlers so tests can emit messages; returns an unbind fn.
  on: vi.fn((_topic: string, cb: (m: any) => void) => {
    ;((globalThis as any).__kbHandlers__ ||= []).push(cb)
    return () => { const a = (globalThis as any).__kbHandlers__ || []; const i = a.indexOf(cb); if (i >= 0) a.splice(i, 1) }
  }),
  loadByTagName: vi.fn(() => Promise.resolve()),
}))
;(globalThis as any).__kbEmit__ = (msg: any) => {
  for (const cb of (globalThis as any).__kbHandlers__ || []) cb(msg)
}

;(globalThis as any).window = (globalThis as any).window || globalThis

// The host event emitter, shared so a test can read what an element published to
// the surface hosting it.
;(globalThis as any).__kbEmitEvent__ = vi.fn()

vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => ({ value: (globalThis as any).__kbProps__ }),
  useEvents: () => (globalThis as any).__kbEmitEvent__,
}))

// Stub iconify + host custom elements so unknown tags don't warn/fail on mount.
vi.mock('@iconify/vue', () => ({
  Icon: { name: 'Icon', template: '<span />' },
}))
config.global.stubs = {
  Icon: true,
  'wc-model-picker': true,
  'wc-resource-view': true,
  'wc-icon-picker': true,
}

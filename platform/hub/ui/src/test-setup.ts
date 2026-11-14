import { vi } from 'vitest'
import { onMounted, ref, watch } from 'vue'

// @wippy-fe/proxy throws on import outside the Wippy host (no dev-proxy globals).
// Mock the whole module so specs run headless. Specs drive the data path by
// setting implementations on the exported `api` spies (see each spec's installHost).
vi.mock('@wippy-fe/proxy', () => ({
  api: {
    get: vi.fn(() => Promise.resolve({ data: { success: true }, status: 200 })),
    post: vi.fn(() => Promise.resolve({ data: { success: true }, status: 200 })),
    delete: vi.fn(() => Promise.resolve({ data: { success: true }, status: 200 })),
  },
  host: { toast: vi.fn(), confirm: vi.fn(() => Promise.resolve(true)) },
  on: vi.fn(() => () => {}),
  loadByTagName: vi.fn(() => Promise.resolve()),
}))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span aria-hidden="true" />' } }))
;(globalThis as any).__hostVisibility__ = ref(false)
function useHostVisibilityRefresh(callback: () => unknown) {
  const visible = (globalThis as any).__hostVisibility__
  onMounted(() => callback())
  watch(visible, (next: boolean, previous: boolean) => {
    if (previous === false && next === true) callback()
  })
  return visible
}
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useHostVisibilityRefresh }))

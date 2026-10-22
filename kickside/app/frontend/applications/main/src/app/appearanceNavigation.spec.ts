// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'

const { api, listeners } = vi.hoisted(() => ({
  api: { get: vi.fn() }, listeners: new Map<string, () => void>(),
}))
vi.mock('../composables/useWippy', () => ({
  useApi: () => api,
  useHost: () => ({ layout: { broadcast: vi.fn(), on: () => () => {} } }),
  useWippy: () => ({ on: (topic: string, handler: () => void) => {
    listeners.set(topic, handler)
    return () => listeners.delete(topic)
  } }),
}))
vi.mock('@wippy-fe/proxy', () => ({ on: () => () => {} }))
vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/system', fullPath: '/system', query: {} }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))
vi.mock('./useShellBranding', () => ({ useShellBranding: () => ({
  markUrl: ref(''), appTitle: ref('Workspace'), applyBranding: vi.fn(),
}) }))
vi.mock('./useShellAccount', () => ({ useShellAccount: () => ({
  currentUser: ref(null), accountItems: ref([]), profileOpen: ref(false), profileWcOpen: ref(false),
  profileWcHost: ref(null), toggleProfile: vi.fn(), openComponentModal: vi.fn(), openProfile: vi.fn(),
  closeProfile: vi.fn(), loadAccountItems: vi.fn(), fetchMe: vi.fn(), logout: vi.fn(),
}) }))
vi.mock('./useToneOverlay', () => ({ useToneOverlay: () => ({ start: vi.fn(), stop: vi.fn() }) }))
vi.mock('@wippy-fe/layout', () => ({
  LayoutManager: class { setLayout() {} },
  LayoutManagerView: defineComponent({ setup: () => () => h('div', [
    'nav', 'surface', 'sessions', 'chat',
  ].map(name => h('div', { id: 'kickside-layout-' + name }))) }),
}))
vi.mock('./BufferedSurfaceHost.vue', () => ({ default: { render: () => null } }))
vi.mock('./CommandPalette.vue', () => ({ default: { render: () => null } }))
vi.mock('./ChatPanel.vue', () => ({ default: { render: () => null } }))
vi.mock('./ChatFlap.vue', () => ({ default: { render: () => null } }))
vi.mock('./ArtifactsGalleryPanel.vue', () => ({ default: { render: () => null } }))
import { useSurfaces } from '../composables/useSurfaces'

const items = [
  { id: 'one', label: 'First tool', path: '/one', route_name: 'one', category: '', order: 0 },
  { id: 'two', label: 'Second tool', path: '/two', route_name: 'two', category: '', order: 10 },
]

import App from './app.vue'

describe('shell navigation after appearance saves', () => {
  it('renders each saved category membership without replacing the shell', async () => {
    const surfaces = useSurfaces()
    surfaces.loaded.value = true
    const wrapper = mount(App, { attachTo: document.body })
    await flushPromises()
    const shell = wrapper.element
    for (const count of [1, 2]) {
      api.get.mockResolvedValueOnce({ data: {
        success: true, layout: 'horizontal', items,
        categories: [
          { key: '', label: '', order: 0, collapsed: false, items: items.slice(count) },
          { key: 'tools', label: 'Workspace tools', order: 10, collapsed: false, items: items.slice(0, count) },
        ],
      } })
      listeners.get('nav.changed')!()
      await vi.advanceTimersByTimeAsync(0)
      await flushPromises()
      expect(wrapper.element).toBe(shell)
      const nav = document.querySelector('header[aria-label="App navigation"]')!
      const category = Array.from(nav.querySelectorAll('button')).find(button => button.textContent?.includes('Workspace tools'))!
      if (category.getAttribute('aria-expanded') !== 'true') category.click()
      await flushPromises()
      const menu = nav.querySelector('.h-cat-menu')!
      expect(menu.textContent).toContain('First tool')
      expect(menu.textContent?.includes('Second tool')).toBe(count === 2)
    }
    expect(api.get).toHaveBeenCalledTimes(2)
    wrapper.unmount()
    expect(listeners.has('nav.changed')).toBe(false)
  })
})

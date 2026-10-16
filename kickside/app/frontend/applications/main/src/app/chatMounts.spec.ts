// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, reactive, ref } from 'vue'

const state = vi.hoisted(() => ({ route: null as any, push: vi.fn(), broadcast: vi.fn() }))
vi.mock('vue-router', () => ({ useRoute: () => state.route, useRouter: () => ({ push: state.push, replace: state.push }) }))
vi.mock('../composables/useWippy', () => ({
  useApi: () => ({}),
  useHost: () => ({ layout: { broadcast: state.broadcast } }),
  useWippy: () => ({ on: () => vi.fn(), loadByTagName: async () => undefined }),
}))
vi.mock('../composables/useSurfaces', () => ({ useSurfaces: () => ({
  renderableCategories: ref([]), navItems: ref([]), layout: ref('vertical'), home: ref(''),
  splash: ref(null), splashError: ref(''), splashSaving: ref(false), loaded: ref(true), error: ref(''),
  loadNav: async () => undefined, reloadNav: async () => undefined,
  dismissSplash: vi.fn(), advanceSplash: vi.fn(),
}) }))
vi.mock('./useShellBranding', () => ({ useShellBranding: () => ({
  markUrl: ref(''), appTitle: ref('KickSide'), applyBranding: vi.fn(),
}) }))
vi.mock('./useShellAccount', () => ({ useShellAccount: () => ({
  currentUser: ref(null), accountItems: ref([]), profileOpen: ref(false), profileWcOpen: ref(false),
  profileWcHost: ref(null), toggleProfile: vi.fn(), openComponentModal: vi.fn(), openProfile: vi.fn(),
  closeProfile: vi.fn(), loadAccountItems: vi.fn(), userInitials: vi.fn(), fetchMe: vi.fn(), logout: vi.fn(),
}) }))
vi.mock('./useToneOverlay', () => ({ useToneOverlay: () => ({ start: vi.fn(), stop: vi.fn() }) }))
vi.mock('@wippy-fe/layout', () => ({
  LayoutManager: class { setLayout() {} },
  LayoutManagerView: defineComponent({ setup: () => () => h('div', [
    'nav', 'surface', 'sessions', 'chat',
  ].map(name => h('div', { id: 'kickside-layout-' + name }))) }),
}))
vi.mock('./BufferedSurfaceHost.vue', () => ({ default: defineComponent({
  setup: () => () => h('section', { class: 'generic-component-page' }, [h('kickside-sessions')]),
}) }))
vi.mock('./ChatPanel.vue', () => ({ default: defineComponent({
  name: 'ChatPanel', props: ['generation', 'sessionId', 'startToken', 'closable', 'sessionsAppearance'],
  setup: () => () => h('div', { class: 'chat-test-panel' }),
}) }))
vi.mock('./CommandPalette.vue', () => ({ default: { render: () => null } }))
vi.mock('./AppNavigation.vue', () => ({ default: { render: () => null } }))
vi.mock('./ChatFlap.vue', () => ({ default: { render: () => null } }))
vi.mock('./ArtifactsGalleryPanel.vue', () => ({ default: { render: () => null } }))

import App from './app.vue'
import ChatPanel from './ChatPanel.vue'

function intent(element: Element, name: string, detail?: unknown) {
  element.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }))
}

describe('chat actions from mounted components', () => {
  beforeAll(() => {
    if (!customElements.get('kickside-sessions')) customElements.define('kickside-sessions', class extends HTMLElement {})
  })
  beforeEach(() => {
    state.route = reactive({ path: '/session-manager', fullPath: '/session-manager', query: {} })
    state.push.mockReset().mockImplementation(async (path: string) => {
      state.route.path = path
      state.route.fullPath = path
    })
    state.broadcast.mockClear()
  })

  it('resets chat once when New chat comes from a generic component page', async () => {
    const wrapper = mount(App, { attachTo: document.body })
    await flushPromises()
    const element = wrapper.get('.generic-component-page kickside-sessions').element
    intent(element, 'kickside-chat-open', { kind: 'session', sessionId: 'saved-session' })
    await flushPromises()
    expect(wrapper.findComponent(ChatPanel).props('sessionId')).toBe('saved-session')
    intent(element, 'new-chat')
    await flushPromises()
    expect(wrapper.findComponent(ChatPanel).props('sessionId')).toBe('')
    expect(wrapper.findComponent(ChatPanel).props('generation')).toBe(1)
    expect(state.route.path).toBe('/sessions')
  })

  it('resets chat once when New chat comes from the Sessions panel', async () => {
    state.route.path = state.route.fullPath = '/sessions/saved-session'
    const wrapper = mount(App, { attachTo: document.body })
    await flushPromises()
    const element = wrapper.get('.sessions-panel kickside-sessions').element
    expect(wrapper.findComponent(ChatPanel).props('sessionId')).toBe('saved-session')
    intent(element, 'new-chat')
    await flushPromises()
    expect(wrapper.findComponent(ChatPanel).props('sessionId')).toBe('')
    expect(wrapper.findComponent(ChatPanel).props('generation')).toBe(1)
    expect(state.route.path).toBe('/sessions')
  })
})

// @vitest-environment happy-dom
// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { shallowRef } from 'vue'
import PrimeVue from 'primevue/config'
import { createAppRouter } from '../router'
import System from './system.vue'

const mocks = vi.hoisted(() => ({
  confirm: vi.fn(),
  navigate: vi.fn(),
  onRouteChanged: vi.fn(),
  loadByTagName: vi.fn(),
  tabs: [
    { key: 'work', label: 'Work', render: 'component', component_tag: 'test-work-admin' },
    { key: 'pim', label: 'Catalogs', render: 'component', component_tag: 'test-pim-admin' },
  ],
}))

vi.mock('@wippy-fe/proxy', () => ({
  host: { navigate: mocks.navigate, onRouteChanged: mocks.onRouteChanged },
}))
vi.mock('@wippy-fe/router', async () => {
  const { createMemoryHistory, createRouter } = await import('vue-router')
  return {
    createAppRouter(routes: Parameters<typeof createRouter>[0]['routes'], options: {
      host: { onRouteChanged(path: string): void }
    }) {
      const router = createRouter({ history: createMemoryHistory(), routes })
      router.afterEach(to => options.host.onRouteChanged(to.fullPath))
      return router
    },
  }
})
vi.mock('../composables/useWippy', () => ({
  useApi: () => ({ get: async () => ({ data: { success: true, tabs: mocks.tabs } }) }),
  useHost: () => ({ confirm: mocks.confirm }),
  useWippy: () => ({ loadByTagName: mocks.loadByTagName }),
}))
vi.mock('../composables/useSurfaces', () => ({
  hasRenderer: () => false, loadRenderer: vi.fn(),
  isComponentTag: (tag: string) => tag.startsWith('test-'),
  useSurfaces: () => ({
    navItems: shallowRef([{ path: '/system' }]), loaded: shallowRef(true), loadNav: vi.fn(),
  }),
}))

mocks.loadByTagName.mockImplementation(async (tag: string) => {
  if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {})
})

let wrapper: ReturnType<typeof mount> | undefined
afterEach(() => {
  wrapper?.unmount()
  vi.clearAllMocks()
})

async function render(path: string) {
  const router = createAppRouter(path, { on: null })
  await router.push(path)
  const view = mount(System, { global: { plugins: [router, PrimeVue] } })
  wrapper = view
  await flushPromises()
  return { router, view }
}

function childEvent(node: Element, name: string, detail: unknown) {
  node.dispatchEvent(new CustomEvent(name, { detail }))
}

it('mounts the declared System tab with the relative deep link and restores it on Back', async () => {
  const { router, view } = await render('/system/work/board-1/items/type-2')
  const work = view.get('test-work-admin')
  expect(work.attributes('route')).toBe('board-1/items/type-2')
  childEvent(work.element, 'navigate', { route: 'board-1/workflow/state-3' })
  await flushPromises()
  expect(router.currentRoute.value.path).toBe('/system/work/board-1/workflow/state-3')
  expect(work.attributes('route')).toBe('board-1/workflow/state-3')

  await view.findAll('[role=tab]')[1].trigger('keydown', { key: 'Enter', code: 'Enter' })
  await flushPromises()
  expect(router.currentRoute.value.path).toBe('/system/pim')
  expect(view.get('test-pim-admin').attributes('route')).toBe('')
  router.back()
  await flushPromises()
  expect(view.get('test-work-admin').attributes('route')).toBe('board-1/workflow/state-3')
})

it.each([
  { name: 'Work', tab: 'work', route: 'board-1/items', next: 'board-2/general', otherTab: 1 },
  { name: 'Catalogs', tab: 'pim', route: 'catalog-1/fields', next: 'catalog-2/general', otherTab: 0 },
])('guards leaving $name when its component emits dirty-change', async ({ name, tab, route, next, otherTab }) => {
  const path = `/system/${tab}/${route}`
  const component = `test-${tab}-admin`
  const { router, view } = await render(path)
  const admin = view.get(component)
  childEvent(admin.element, 'dirty-change', { dirty: true })
  const unload = new Event('beforeunload', { cancelable: true })
  expect(window.dispatchEvent(unload)).toBe(false)

  mocks.confirm.mockResolvedValueOnce(false)
  mocks.onRouteChanged.mockClear()
  await view.findAll('[role=tab]')[otherTab].trigger('click')
  await flushPromises()
  expect(mocks.confirm).toHaveBeenCalledOnce()
  expect(router.currentRoute.value.path).toBe(path)
  expect(view.get('[aria-selected=true]').text()).toBe(name)
  expect(mocks.onRouteChanged).not.toHaveBeenCalled()
  expect(mocks.navigate).toHaveBeenCalledWith(path)
  expect(view.get(component).element).toBe(admin.element)

  mocks.confirm.mockResolvedValueOnce(true)
  await router.push(`/system/${tab}/${next}`)
  expect(mocks.confirm).toHaveBeenCalledTimes(2)
  expect(admin.attributes('route')).toBe(next)
  expect(window.dispatchEvent(new Event('beforeunload', { cancelable: true }))).toBe(true)
})

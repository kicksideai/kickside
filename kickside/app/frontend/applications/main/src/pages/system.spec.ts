// @vitest-environment happy-dom

import { flushPromises, mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

describe('System retained-surface refresh', () => {
  const navigate = vi.fn()
  const host = {
    navigate,
    classifyLink: (href: string) => ({ kind: href.startsWith('https:') ? 'external' : 'host-nav', href }),
  }
  beforeEach(() => { navigate.mockClear() })
  afterEach(() => {
    vi.doUnmock('vue-router')
    vi.doUnmock('../composables/useWippy')
    vi.doUnmock('../composables/useSurfaces')
    vi.doUnmock('../composables/useRefreshLadder')
    vi.doUnmock('../app/surfaceActivity')
    vi.doUnmock('../app/WcSurface.vue')
    vi.resetModules()
  })

  it('states that System is not available when the account lacks the System capability', async () => {
    const get = vi.fn()
    vi.doMock('vue-router', () => ({
      useRoute: () => ({ path: '/system/users', params: { tab: 'users' } }),
      useRouter: () => ({ replace: vi.fn() }),
    }))
    vi.doMock('../composables/useWippy', () => ({ useHost: () => host, useApi: () => ({ get }) }))
    vi.doMock('../composables/useSurfaces', () => ({
      hasRenderer: () => false,
      loadRenderer: vi.fn(),
      useSurfaces: () => ({ navItems: ref([{ id: 'kickside.agents:nav_item', path: '/agents' }]), loaded: ref(true), loadNav: vi.fn() }),
    }))
    vi.doMock('../app/surfaceActivity', () => ({ useSurfaceActivity: () => ref(true) }))
    vi.doMock('../composables/useRefreshLadder', () => ({
      createRefreshLadder: () => ({ schedule: vi.fn(), clear: vi.fn() }),
    }))
    vi.doMock('../app/WcSurface.vue', () => ({ default: { template: '<div />' } }))

    const { default: System } = await import('./system.vue')
    const wrapper = mount(System)
    await flushPromises()
    expect(wrapper.text()).toContain('System is not available for this account.')
    expect(wrapper.text()).not.toContain('System sections could not be loaded.')
    expect(get).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('serializes a reveal behind the initial load and keeps the registry refresh ladder', async () => {
    const surfaceActive = ref(true)
    const first = deferred<{ data: { success: boolean; tabs: unknown[] } }>()
    const second = deferred<{ data: { success: boolean; tabs: unknown[] } }>()
    const get = vi.fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
    const schedule = vi.fn()

    vi.doMock('vue-router', () => ({
      useRoute: () => ({ path: '/system', params: { tab: '' } }),
      useRouter: () => ({ replace: vi.fn() }),
    }))
    vi.doMock('../composables/useWippy', () => ({ useHost: () => host, useApi: () => ({ get }) }))
    vi.doMock('../composables/useSurfaces', () => ({
      hasRenderer: () => false,
      loadRenderer: vi.fn(),
      useSurfaces: () => ({ navItems: ref([{ id: 'app.ui:system', path: '/system' }]), loaded: ref(true), loadNav: vi.fn() }),
    }))
    vi.doMock('../app/surfaceActivity', () => ({ useSurfaceActivity: () => surfaceActive }))
    vi.doMock('../composables/useRefreshLadder', () => ({
      createRefreshLadder: () => ({ schedule, clear: vi.fn() }),
    }))
    vi.doMock('../app/WcSurface.vue', () => ({ default: { template: '<div />' } }))

    const { default: System } = await import('./system.vue')
    const wrapper = mount(System)
    expect(get).toHaveBeenCalledTimes(1)

    surfaceActive.value = false
    await nextTick()
    surfaceActive.value = true
    await nextTick()
    expect(get).toHaveBeenCalledTimes(1)

    first.resolve({ data: { success: true, tabs: [] } })
    await flushPromises()
    expect(get).toHaveBeenCalledTimes(2)
    second.resolve({ data: { success: true, tabs: [] } })
    await flushPromises()

    window.dispatchEvent(new Event('kickside:registry-changed'))
    expect(schedule).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('routes registry header links through the host and preserves native modified and external clicks', async () => {
    const links = [
      { key: 'console', label: 'Console', icon: 'tabler:settings', render: 'link', url: '/console' },
      { key: 'docs', label: 'Docs', icon: 'tabler:book', render: 'link', url: 'https://docs.example.org/' },
    ]
    vi.doMock('vue-router', () => ({
      useRoute: () => ({ path: '/system', params: { tab: '' } }),
      useRouter: () => ({ replace: vi.fn(), resolve: (to: string) => ({ href: to }) }),
    }))
    vi.doMock('../composables/useWippy', () => ({
      useHost: () => host,
      useApi: () => ({ get: vi.fn().mockResolvedValue({ data: { success: true, tabs: links } }) }),
    }))
    vi.doMock('../composables/useSurfaces', () => ({
      hasRenderer: () => false,
      loadRenderer: vi.fn(),
      useSurfaces: () => ({ navItems: ref([{ id: 'app.ui:system', path: '/system' }]), loaded: ref(true), loadNav: vi.fn() }),
    }))
    vi.doMock('../app/surfaceActivity', () => ({ useSurfaceActivity: () => ref(true) }))
    vi.doMock('../composables/useRefreshLadder', () => ({
      createRefreshLadder: () => ({ schedule: vi.fn(), clear: vi.fn() }),
    }))
    vi.doMock('../app/WcSurface.vue', () => ({ default: { template: '<div />' } }))

    const { default: System } = await import('./system.vue')
    const wrapper = mount(System)
    await flushPromises()
    const anchors = wrapper.findAll('a.system-head-link')
    expect(anchors.map(link => link.attributes('href'))).toEqual(links.map(link => link.url))
    const plain = new MouseEvent('click', { button: 0, cancelable: true })
    anchors[0].element.dispatchEvent(plain)
    expect(plain.defaultPrevented).toBe(true)
    expect(navigate).toHaveBeenCalledExactlyOnceWith('/console')
    navigate.mockClear()
    for (const modifiers of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) {
      const event = new MouseEvent('click', { cancelable: true, ...modifiers })
      anchors[0].element.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
    }
    const external = new MouseEvent('click', { button: 0, cancelable: true })
    anchors[1].element.dispatchEvent(external)
    expect(external.defaultPrevented).toBe(false)
    expect(navigate).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})

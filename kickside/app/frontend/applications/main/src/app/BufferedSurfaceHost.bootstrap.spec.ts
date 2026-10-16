// @vitest-environment happy-dom

import { mount } from '@vue/test-utils'
import { nextTick, reactive, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('BufferedSurfaceHost navigation bootstrap', () => {
  afterEach(() => {
    vi.doUnmock('vue-router')
    vi.doUnmock('../composables/useSurfaces')
    vi.doUnmock('@wippy-fe/layout')
    vi.resetModules()
  })

  it('waits for the owning nav declaration before creating a buffer', async () => {
    const route = reactive({ path: '/', name: 'surface' })
    const navItems = ref<unknown[]>([])
    const loaded = ref(false)
    const push = vi.fn()

    vi.doMock('vue-router', () => ({ useRoute: () => route }))
    vi.doMock('../composables/useSurfaces', () => ({
      useSurfaces: () => ({ navItems, loaded }),
    }))
    vi.doMock('@wippy-fe/layout', () => ({
      useSwapBuffer: () => ({
        slots: ref([null, null]),
        topIndex: ref(-1),
        active: ref(null),
        showLoader: ref(false),
        push,
        markReady: vi.fn(),
        markFailed: vi.fn(),
      }),
    }))

    const { default: BufferedSurfaceHost } = await import('./BufferedSurfaceHost.vue')
    const wrapper = mount(BufferedSurfaceHost, {
      global: { stubs: { SurfaceHost: true } },
    })

    expect(push).not.toHaveBeenCalled()

    navItems.value = [{
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'tabler:layout-dashboard',
      path: '/',
      route_name: 'home',
      category: '',
      order: 0,
      render: 'component',
      component_tag: 'kickside-dashboard',
    }]
    loaded.value = true
    await nextTick()

    expect(push).toHaveBeenCalledTimes(1)
    expect(push).toHaveBeenCalledWith(expect.objectContaining({
      key: 'nav:dashboard',
      path: '/',
    }))

    wrapper.unmount()
  })
})

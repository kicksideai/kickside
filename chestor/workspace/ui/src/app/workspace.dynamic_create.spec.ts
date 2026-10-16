import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Workspace from './Workspace.vue'

const stubs = {
  Icon: { template: '<span />' },
  IconField: { template: '<span />' },
  ShareHost: { template: '<div />' },
  ComponentView: { template: '<div />' },
  EntryRenderer: {
    props: ['tag', 'attrs'],
    template: '<div data-testid="entry-renderer" :data-tag="tag" :data-type="attrs.type" :data-mode="attrs.mode" />',
  },
}

function resetApi() {
  ;(globalThis as any).__props__ = { route: '' }
  ;(globalThis as any).__events__ = []
  ;(globalThis as any).__calls__ = []
  ;(globalThis as any).__api__ = {
    '/api/v1/workspace/entries/types': {
      success: true,
      types: [{
        value: 'graph',
        label: 'Graph',
        icon: 'tabler:network',
        creatable: true,
        container: false,
        create: { view: 'wc-entry-create', surface: 'popup' },
      }],
    },
    '/api/v1/workspace/entries': { success: true, entries: [] },
  }
}

afterEach(() => vi.restoreAllMocks())

describe('workspace dynamic create contract', () => {
  beforeEach(resetApi)

  it('offers a newly discovered Graph kind and mounts its declared popup', async () => {
    const wrapper = mount(Workspace, { global: { stubs } })
    await flushPromises()

    await wrapper.get('button.km-btn-primary').trigger('click')
    const graph = wrapper.findAll('.ws-type-btn').find((button) => button.text() === 'Graph')
    expect(graph).toBeTruthy()

    await graph!.trigger('click')
    const renderer = wrapper.get('[data-testid="entry-renderer"]')
    expect(renderer.attributes()).toMatchObject({
      'data-tag': 'wc-entry-create',
      'data-type': 'graph',
      'data-mode': 'create',
    })
    wrapper.unmount()
  })
  it('dismisses the new-entry dialog with Escape', async () => {
    const wrapper = mount(Workspace, { global: { stubs } })
    await flushPromises()
    await wrapper.get('button.km-btn-primary').trigger('click')
    expect(wrapper.find('.ws-type-grid').exists()).toBe(true)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()
    expect(wrapper.find('.ws-type-grid').exists()).toBe(false)
    wrapper.unmount()
  })

})

describe('workspace action menu geometry', () => {
  it('measures the menu instead of assuming an offset from the viewport', async () => {
    resetApi()
    ;(globalThis as any).__api__['/api/v1/workspace/entries'] = { success: true, entries: [{ id: 'northwind', name: 'Northwind', type: 'graph', access_level: 31 }] }
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if (this.classList.contains('ws-menu-layer')) return { x: 224, y: 44, left: 224, top: 44, right: 900, bottom: 800, width: 676, height: 756 } as DOMRect
      return { x: 0, y: 0, left: 0, top: 0, right: 190, bottom: 220, width: 190, height: 220 } as DOMRect
    })
    const view = mount(Workspace, { global: { stubs } })
    await flushPromises()
    await view.get('.ws-row').trigger('contextmenu', { clientX: 890, clientY: 790 })
    await flushPromises()
    const panel = view.get('.ws-menu').element as HTMLElement
    expect(panel.style.left).toBe('486px')
    expect(panel.style.top).toBe('536px')
    view.unmount()
  })
})

describe('workspace preview resizing', () => {
  it('captures the pointer on its own divider and keeps the host document untouched', async () => {
    resetApi()
    ;(globalThis as any).__api__['/api/v1/workspace/entries'] = { success: true, entries: [{ id: 'northwind', name: 'Northwind', type: 'graph', access_level: 31 }] }
    const view = mount(Workspace, { global: { stubs } })
    await flushPromises()
    await view.get('.ws-row').trigger('click')
    const divider = view.get('.ws-divider')
    const capture = vi.fn()
    Object.assign(divider.element, { setPointerCapture: capture })
    const children = document.body.childElementCount
    await divider.trigger('pointerdown', { pointerId: 7, clientX: 800 })
    expect(capture).toHaveBeenCalledWith(7)
    await divider.trigger('pointermove', { pointerId: 7, clientX: 700 })
    expect(view.get('.ws-divider').classes()).toContain('resizing')
    expect(document.body.childElementCount).toBe(children)
    await divider.trigger('pointerup', { pointerId: 7 })
    expect(view.get('.ws-divider').classes()).not.toContain('resizing')
    view.unmount()
    expect(document.body.childElementCount).toBe(children)
  })
})

describe('workspace load recovery', () => {
  it('retries a failed folder load from its error notice', async () => {
    resetApi()
    ;(globalThis as any).__api__['/api/v1/workspace/entries'] = { success: false, error: 'Northwind folder is temporarily unavailable.' }
    const view = mount(Workspace, { global: { stubs } })
    await flushPromises()
    expect(view.get('.km-notice').text()).toContain('Northwind folder is temporarily unavailable.')
    ;(globalThis as any).__api__['/api/v1/workspace/entries'] = { success: true, entries: [{ id: 'northwind', name: 'Northwind', type: 'folder' }] }
    const retry = view.findAll('button').find(button => button.text() === 'Retry')!
    expect(retry).toBeTruthy()
    await retry.trigger('click')
    await flushPromises()
    expect(view.get('.ws-row').text()).toContain('Northwind')
    expect(view.find('.km-notice.t-error').exists()).toBe(false)
    view.unmount()
  })
})

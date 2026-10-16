// @vitest-environment happy-dom

import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const loadByTagName = vi.fn()
let connectedVisibility: string[] = []

vi.mock('../composables/useWippy', () => ({
  useWippy: () => ({ loadByTagName }),
}))

vi.mock('../composables/useSurfaces', () => ({
  isComponentTag: (tag: unknown) => tag === 'example-surface' || tag === 'other-surface',
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

import WcSurface from './WcSurface.vue'

function deferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

describe('WcSurface visibility lifecycle', () => {
  beforeAll(() => {
    if (!customElements.get('example-surface')) {
      customElements.define('example-surface', class extends HTMLElement {
        connectedCallback() {
          connectedVisibility.push(this.getAttribute('data-wippy-visible') || '')
        }
      })
    }
    if (!customElements.get('other-surface')) {
      customElements.define('other-surface', class extends HTMLElement {})
    }
  })

  beforeEach(() => {
    loadByTagName.mockReset()
    loadByTagName.mockResolvedValue(undefined)
    connectedVisibility = []
  })

  afterEach(() => {
    document.body.replaceChildren()
  })

  it('sets host visibility before connection and updates the retained element in place', async () => {
    const wrapper = mount(WcSurface, {
      props: { tag: 'example-surface', path: '/example', visible: false },
      attachTo: document.body,
    })
    await flushPromises()

    const element = wrapper.find('example-surface').element
    expect(element.getAttribute('data-wippy-visible')).toBe('false')
    expect(connectedVisibility).toEqual(['false'])
    expect(loadByTagName).toHaveBeenCalledTimes(1)

    await wrapper.setProps({ visible: true })
    expect(wrapper.find('example-surface').element).toBe(element)
    expect(element.getAttribute('data-wippy-visible')).toBe('true')
    expect(connectedVisibility).toEqual(['false'])
    expect(loadByTagName).toHaveBeenCalledTimes(1)
  })

  it('clears the stale host and rejects delayed readiness from an evicted attempt', async () => {
    const first = deferred()
    const second = deferred()
    loadByTagName.mockImplementation((tag: string) => tag === 'example-surface' ? first.promise : second.promise)
    const wrapper = mount(WcSurface, {
      props: { tag: 'example-surface', path: '/example' },
      attachTo: document.body,
    })
    await flushPromises()

    await wrapper.setProps({ tag: 'other-surface', path: '/other' })
    expect(wrapper.find('.wc-surface-host').element.childElementCount).toBe(0)

    second.resolve()
    await flushPromises()
    const current = wrapper.find('other-surface').element
    current.dispatchEvent(new Event('load'))
    await flushPromises()

    first.resolve()
    await flushPromises()
    expect(wrapper.find('other-surface').exists()).toBe(true)
    expect(wrapper.find('example-surface').exists()).toBe(false)
    expect(wrapper.emitted('ready')).toHaveLength(1)
  })

  it('recovers a failed attempt when a later valid mount is requested', async () => {
    loadByTagName.mockRejectedValueOnce(new Error('missing bundle'))
    const wrapper = mount(WcSurface, {
      props: { tag: 'example-surface', basePath: '/example', path: '/example' },
      attachTo: document.body,
    })
    await flushPromises()
    expect(wrapper.text()).toContain('Component is not available')
    expect(wrapper.emitted('error')).toHaveLength(1)

    loadByTagName.mockResolvedValue(undefined)
    await wrapper.setProps({ basePath: '/recovered', path: '/recovered' })
    await flushPromises()
    expect(wrapper.find('example-surface').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Component is not available')
  })

  it('does not resurrect a component or emit after its buffer unmounts', async () => {
    const pending = deferred()
    loadByTagName.mockReturnValue(pending.promise)
    const wrapper = mount(WcSurface, {
      props: { tag: 'example-surface', path: '/example' },
      attachTo: document.body,
    })
    await flushPromises()
    wrapper.unmount()

    pending.resolve()
    await flushPromises()
    expect(document.body.querySelector('example-surface')).toBeNull()
    expect(wrapper.emitted('ready')).toBeUndefined()
    expect(wrapper.emitted('error')).toBeUndefined()
  })

  it('ignores a rejected A attempt after valid B has mounted', async () => {
    const first = deferred()
    loadByTagName.mockImplementationOnce(() => first.promise).mockResolvedValueOnce(undefined)
    const wrapper = mount(WcSurface, {
      props: { tag: 'example-surface', path: '/example' },
      attachTo: document.body,
    })
    await flushPromises()
    await wrapper.setProps({ tag: 'other-surface', path: '/other' })
    await flushPromises()
    expect(wrapper.find('other-surface').exists()).toBe(true)

    first.reject(new Error('obsolete A'))
    await flushPromises()
    expect(wrapper.find('other-surface').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Component is not available')
    expect(wrapper.emitted('error')).toBeUndefined()
  })
})

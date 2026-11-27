// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { reactive, ref } from 'vue'
import BufferedSurfaceHost from './BufferedSurfaceHost.vue'

let route = reactive({ path: '/workflows', name: 'workflows' })
vi.mock('vue-router', () => ({ useRoute: () => route }))
vi.mock('../composables/useSurfaces', () => ({
  useSurfaces: () => ({
    loaded: ref(true),
    navItems: ref([
      { path: '/workflows', render: 'component', component_tag: 'test-workflows' },
      { path: '/agents', render: 'component', component_tag: 'test-agents' },
      { path: '/knowledge', render: 'component', component_tag: 'test-knowledge' },
    ]),
  }),
}))
vi.mock('./SurfaceHost.vue', async () => {
  const { defineComponent, h } = await import('vue')
  return { default: defineComponent({
    name: 'TestSurface',
    props: ['path', 'routeName', 'active'],
    emits: ['ready', 'attached', 'error'],
    setup(props) { return () => h('article', { 'data-page': props.path }, props.path) },
  }) }
})

let wrapper: VueWrapper
function page(path = route.path) {
  const found = wrapper.findAllComponents({ name: 'TestSurface' }).find(c => c.props('path') === path)
  if (!found) throw new Error(`No mounted surface for ${path}`)
  return found
}
function visible(path: string) {
  return wrapper.findAll('.surface-buffer--visible').some(c => c.find(`[data-page="${path}"]`).exists())
}
async function advance(ms: number) { await vi.advanceTimersByTimeAsync(ms); await flushPromises() }
beforeEach(() => {
  vi.useFakeTimers()
  route = reactive({ path: '/workflows', name: 'workflows' })
  wrapper = mount(BufferedSurfaceHost)
})
afterEach(() => { wrapper.unmount(); vi.clearAllTimers(); vi.useRealTimers() })

describe('surface readiness and loader timing', () => {
  it('keeps pending content hidden and inert and skips the indicator for a fast mount', async () => {
    await flushPromises()
    expect(visible('/workflows')).toBe(false)
    const pending = wrapper.get('[data-page="/workflows"]').element.closest('.surface-buffer') as HTMLElement
    expect(pending.inert).toBe(true)
    await advance(249)
    expect(wrapper.find('.surface-buffer__loader').exists()).toBe(false)
    page().vm.$emit('ready')
    await flushPromises()
    expect(visible('/workflows')).toBe(true)
    expect(wrapper.find('.surface-buffer__loader').exists()).toBe(false)
    await advance(500)
    expect(wrapper.find('.surface-buffer__loader').exists()).toBe(false)
  })

  it('reveals and removes the visible indicator together after its 400 ms minimum', async () => {
    await advance(250)
    expect(wrapper.findAll('.surface-buffer__loader')).toHaveLength(1)
    page().vm.$emit('ready')
    await advance(399)
    expect(visible('/workflows')).toBe(false)
    expect(wrapper.findAll('.surface-buffer__loader')).toHaveLength(1)
    await advance(1)
    expect(visible('/workflows')).toBe(true)
    expect(wrapper.find('.surface-buffer__loader').exists()).toBe(false)
  })

  it('reveals immediately when the indicator has already met its minimum', async () => {
    await advance(651)
    page().vm.$emit('ready')
    await flushPromises()
    expect(visible('/workflows')).toBe(true)
    expect(wrapper.find('.surface-buffer__loader').exists()).toBe(false)
  })

  it.each([false, undefined])('fails an unsupported or unattached pending attempt at one deadline (%s)', async legacy => {
    await flushPromises()
    if (legacy !== undefined) page().vm.$emit('attached', legacy)
    await advance(7999)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    await advance(1)
    expect(wrapper.get('[role="alert"]').text()).toContain('Surface unavailable')
    expect(wrapper.findComponent({ name: 'TestSurface' }).exists()).toBe(false)
    expect(wrapper.find('.surface-buffer__loader').exists()).toBe(false)
  })

  it('keeps the timeout reveal fallback for an attached legacy element', async () => {
    await flushPromises()
    page().vm.$emit('attached', true)
    await advance(8000)
    expect(visible('/workflows')).toBe(true)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('gives Retry a fresh element and a fresh eight-second attempt', async () => {
    await advance(8000)
    await wrapper.get('.surface-buffer__retry').trigger('click')
    await flushPromises()
    expect(page().exists()).toBe(true)
    expect(visible('/workflows')).toBe(false)
    await advance(7999)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    await advance(1)
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })

  it('does not extend a pending attempt on a sub-route change', async () => {
    await advance(7900)
    route.path = '/workflows/detail'
    await flushPromises()
    await advance(100)
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })

  it('retains the outgoing ready page through rapid navigation', async () => {
    await flushPromises()
    page().vm.$emit('ready')
    await flushPromises()
    route.path = '/agents'; route.name = 'agents'
    await advance(300)
    expect(visible('/workflows')).toBe(true)
    expect(visible('/agents')).toBe(false)
    route.path = '/knowledge'; route.name = 'knowledge'
    await flushPromises()
    expect(visible('/workflows')).toBe(true)
    expect(wrapper.findAll('[data-page="/agents"]')).toHaveLength(0)
    page().vm.$emit('ready')
    await advance(400)
    expect(visible('/knowledge')).toBe(true)
    route.path = '/workflows'; route.name = 'workflows'
    await flushPromises()
    expect(visible('/workflows')).toBe(true)
    expect(wrapper.find('.surface-buffer__loader').exists()).toBe(false)
  })
})

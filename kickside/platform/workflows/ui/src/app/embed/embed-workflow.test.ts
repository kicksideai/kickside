// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'

// Mount-level self-review: the embed actually renders. Without a flow-id it resolves to
// the published Flow picker; the pinned/access-denied path renders the directed message.
// The element runtime and proxy are stubbed so the component runs as it would in the shadow
// DOM, verifying setup ordering (no forward-reference at mount) and the honest empty/denied
// states end to end.

const propsRef = ref<Record<string, unknown>>({})
const emit = vi.fn()
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useProps: () => propsRef, useEvents: () => emit }))

const get = vi.fn()
const post = vi.fn()
vi.mock('@wippy-fe/proxy', () => ({ api: { get, post }, loadByTagName: vi.fn(async () => {}) }))
vi.mock('@iconify/vue', () => ({ Icon: { name: 'Icon', props: ['icon'], template: '<i class="ic" :data-icon="icon" />' } }))

const EmbedWorkflow = (await import('./EmbedWorkflow.vue')).default

describe('EmbedWorkflow mount', () => {
  it('renders the published Flow picker when no flow-id is pinned', async () => {
    propsRef.value = {}
    get.mockResolvedValueOnce({ data: { success: true, workflows: [] } })
    const wrapper = mount(EmbedWorkflow)
    await flushPromises()
    expect(get).toHaveBeenCalledWith('/api/v1/workflows?published=true&fields=labels%2Chead_seq%2Cinterface%2Cpublished_interface%2Cpublished_def_seq%2Chas_draft_changes%2Cparent_id%2Cparent_name%2Cbreadcrumb%2Clast_run%2Cnode_count%2Crun_count&limit=100&offset=0')
    expect(wrapper.text()).toContain('No published Workflows available.')
  })

  it('renders a directed message when a pinned Flow is not published or not accessible', async () => {
    propsRef.value = { flowId: 'missing-wf' }
    get.mockResolvedValueOnce({ data: { success: true, workflows: [{ id: 'other', title: 'Other', published_version: 1 } as unknown] } })
    const wrapper = mount(EmbedWorkflow)
    await flushPromises()
    expect(wrapper.text()).toContain('isn’t published, or you don’t have access')
  })

  it('routes the open-in-editor link through the shell navigate channel, not a raw browser nav', async () => {
    emit.mockClear()
    propsRef.value = { flowId: 'wf-1' }
    get.mockResolvedValueOnce({ data: { success: true, workflows: [{ id: 'wf-1', title: 'Lead score', published_version: 3 } as unknown] } })
    const wrapper = mount(EmbedWorkflow)
    await flushPromises()
    const link = wrapper.find('.wf-embed-open')
    expect(link.exists()).toBe(true)
    // The href stays for accessibility, but points at the canonical workflow route.
    expect(link.attributes('href')).toBe('/workflows/wf-1')
    await link.trigger('click')
    expect(emit).toHaveBeenCalledWith('navigate', { route: '/workflows/wf-1' })
    wrapper.unmount()
  })
})

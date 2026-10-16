// @vitest-environment happy-dom
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'

const propsRef = ref<Record<string, unknown>>({ componentInstanceId: 'crm-1' })
const loadByTagName = vi.fn(async () => {})
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useProps: () => propsRef, useEvents: () => vi.fn() }))
vi.mock('@wippy-fe/proxy', () => ({ loadByTagName }))
vi.mock('@iconify/vue', () => ({ Icon: { name: 'Icon', props: ['icon'], template: '<i class="ic" :data-icon="icon" />' } }))

const ComponentWorkflows = (await import('./ComponentWorkflows.vue')).default

describe('component-hosted Workflows', () => {
  beforeAll(() => {
    if (!customElements.get('kickside-automation-manager')) customElements.define('kickside-automation-manager', class extends HTMLElement {})
  })

  it('mounts the component-scoped Automation manager as the single binding surface', async () => {
    const wrapper = mount(ComponentWorkflows)
    await flushPromises()
    expect(wrapper.find('kickside-automation-manager').attributes('component-id')).toBe('crm-1')
    expect(wrapper.find('kickside-automation-manager').attributes('type-id')).toBeUndefined()
    expect(wrapper.find('kickside-automation-manager').attributes('mode')).toBe('component')
    expect(wrapper.text()).toContain('Workflows')
    wrapper.unmount()
  })

  it('does not own a second binding concept', async () => {
    const wrapper = mount(ComponentWorkflows)
    await flushPromises()
    expect(wrapper.find('kickside-automation-manager').attributes('component-id')).toBe('crm-1')
    expect(wrapper.text()).not.toContain('Defaults')
    wrapper.unmount()
  })
})

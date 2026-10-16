import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import AgentForm from './AgentForm.vue'

const props = {
  open: true,
  embedded: true,
  agentId: null,
  traits: [],
  tools: [],
  models: [{ name: 'class:fast' }],
  agents: [],
}

const capabilityTraits = [
  {
    id: 'kickside.agents.traits:artifacts',
    title: 'Artifacts',
    description: 'Creates artifacts.',
    affects: { tools: true, behavior: true },
  },
  {
    id: 'kickside.uploads.traits:file_manager',
    title: 'File Manager',
    description: 'Reads uploaded attachments.',
    affects: { tools: true, behavior: true },
  },
  ...Array.from({ length: 8 }, (_, index) => ({
    id: `test:cap-${index}`,
    title: `Capability ${index}`,
    description: `Capability option ${index}`,
    affects: { tools: true },
  })),
]

beforeEach(() => {
  ;(globalThis as any).__api__ = {}
  ;(api.post as any).mockClear()
  ;(api.put as any).mockClear()
})

describe('AgentForm discovery visibility', () => {
  it('creates private agents with artifacts and file access by default', async () => {
    const wrapper = mount(AgentForm, { props })
    await wrapper.get('[data-agent-name]').setValue('Private helper')
    await wrapper.get('[data-testid="agent-form-save"]').trigger('click')
    await flushPromises()

    expect((api.post as any).mock.calls.at(-1)?.[1]).toMatchObject({
      public: false,
      traits: ['kickside.agents.traits:artifacts', 'kickside.uploads.traits:file_manager'],
    })
    wrapper.unmount()
  })

  it('offers no public visibility control — every readable agent lists in pickers', () => {
    const wrapper = mount(AgentForm, { props })
    expect(wrapper.find('#agent-public').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Show in agent pickers')
    wrapper.unmount()
  })

  it('lets the user remove both default capabilities before creating', async () => {
    const wrapper = mount(AgentForm, { props: { ...props, traits: capabilityTraits } })
    await wrapper.get('[data-agent-name]').setValue('No artifacts helper')
    await wrapper.findAll('[role="tab"]').find(item => item.text().includes('Capabilities'))!.trigger('click')
    await wrapper.get('[aria-label="Remove Artifacts capability"]').trigger('click')
    await wrapper.get('[aria-label="Remove File Manager capability"]').trigger('click')
    await wrapper.get('[data-testid="agent-form-save"]').trigger('click')
    await flushPromises()

    const postCall = (api.post as any).mock.calls.find((call: any[]) => call[0] === '/api/v1/user-agents')
    expect(postCall?.[1]?.traits).toEqual([])
    wrapper.unmount()
  })

  it('exposes an ARIA combobox and supports filtering and keyboard selection', async () => {
    const wrapper = mount(AgentForm, { props: { ...props, traits: capabilityTraits } })
    await wrapper.findAll('[role="tab"]').find(item => item.text().includes('Capabilities'))!.trigger('click')

    const input = wrapper.get('[role="combobox"]')
    await input.trigger('focus')
    expect(input.attributes('aria-expanded')).toBe('true')
    expect(input.attributes('aria-controls')).toBe('agent-capabilities-listbox')
    expect(wrapper.get('#agent-capabilities-listbox').attributes('role')).toBe('listbox')
    expect(wrapper.findAll('[role="option"]').every(option => option.attributes('tabindex') === '-1')).toBe(true)

    await input.trigger('keydown', { key: 'End' })
    expect(input.attributes('aria-activedescendant')).toBe('agent-capability-option-7')
    await input.trigger('keydown', { key: 'Home' })
    expect(input.attributes('aria-activedescendant')).toBe('agent-capability-option-0')
    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(input.attributes('aria-activedescendant')).toBe('agent-capability-option-1')

    await input.setValue('Capability 7')
    expect(wrapper.get('[role="option"]').text()).toContain('Capability 7')
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.text()).toContain('3 active')
    expect(input.attributes('aria-expanded')).toBe('false')

    await input.trigger('focus')
    await input.trigger('keydown', { key: 'Tab' })
    expect(input.attributes('aria-expanded')).toBe('false')
    await input.trigger('focus')
    await input.trigger('keydown', { key: 'Escape' })
    expect(input.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('shows and hides thinking effort through the PrimeVue switch', async () => {
    const wrapper = mount(AgentForm, { props })
    await wrapper.findAll('[role="tab"]').find((item) => item.text().includes('Model'))!.trigger('click')

    const control = wrapper.get('#agent-thinking')
    expect(control.attributes('role')).toBe('switch')
    expect(control.attributes('aria-checked')).toBe('false')
    expect(wrapper.find('.kx-think').exists()).toBe(false)

    await control.setValue(true)
    expect(control.attributes('aria-checked')).toBe('true')
    expect(wrapper.get('.kx-think').text()).toContain('Effort: 50%')

    await control.setValue(false)
    expect(control.attributes('aria-checked')).toBe('false')
    expect(wrapper.find('.kx-think').exists()).toBe(false)
    wrapper.unmount()
  })
})

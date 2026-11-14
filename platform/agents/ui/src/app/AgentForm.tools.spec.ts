import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import { describe, expect, it, vi } from 'vitest'
import AgentForm from './AgentForm.vue'
import { REDIRECT_TRAIT } from './agent-form.types'

const description = 'Reads every part of a document.\nPreserve this final sentence and its declared setup instructions.'
const tools = [
  { id: 'test:read', title: 'Read document', llm_alias: 'ReadDocument', llm_description: description },
  { id: 'test:write', title: 'Write document', llm_description: 'Writes a document to the configured destination.' },
  { id: 'test:undocumented', title: 'Undocumented tool' },
]
const traits = [{ id: 'test:documents', title: 'Document workflow', description: 'Read before writing.', prompt: 'Read the complete document before making changes.', tools: ['test:read', 'test:write'] }]
async function form() {
  const wrapper = mount(AgentForm, { props: { open: true, embedded: true, agentId: null, traits, tools, models: [{ name: 'class:fast' }], agents: [] } })
  await wrapper.findAll('[role="tab"]').find(tab => tab.text().includes('Capabilities'))!.trigger('click')
  return wrapper
}

describe('agent capability tools', () => {
  it('passes the declared context schema to capability configuration controls', async () => {
    if (!customElements.get('wc-test-scope')) customElements.define('wc-test-scope', class extends HTMLElement {})
    const schema = { type: 'object', properties: { namespaces: { type: 'array' } }, additionalProperties: false }
    const wrapper = mount(AgentForm, { props: { open: true, embedded: true, agentId: null,
      traits: [{ id: 'test:scope', title: 'Scoped capability', context_schema: schema, web_component: 'wc-test-scope' }],
      tools: [], models: [{ name: 'class:fast' }], agents: [] } })
    try {
      await wrapper.findAll('[role="tab"]').find(tab => tab.text().includes('Capabilities'))!.trigger('click')
      await wrapper.get('[aria-label="Search capabilities to add"]').trigger('focus')
      await wrapper.get('[role="option"]').trigger('click')
      await flushPromises()
      expect(JSON.parse(wrapper.get('wc-test-scope').attributes('schema')!)).toEqual(schema)
    } finally {
      wrapper.unmount()
    }
  })

  it('keeps capabilities managed in routing out of the capability and tool pickers', async () => {
    const routing = { id: REDIRECT_TRAIT, title: 'Agent routing', tools: ['test:read'] }
    const wrapper = mount(AgentForm, { props: { open: true, embedded: true, agentId: null,
      traits: [...traits, routing], tools, models: [{ name: 'class:fast' }], agents: [] } })
    await wrapper.findAll('[role="tab"]').find(tab => tab.text().includes('Capabilities'))!.trigger('click')
    await wrapper.get('[aria-label="Search capabilities to add"]').trigger('focus')
    expect(wrapper.findAll('[role="option"]')).toHaveLength(1)
    expect(wrapper.find('[aria-label="Tool reference"]').exists()).toBe(false)
    expect(wrapper.find('[aria-label="Remove Agent routing capability"]').exists()).toBe(false)
    wrapper.unmount()
  })
  it('offers tools through capabilities only when creating an agent', async () => {
    const wrapper = await form()
    expect(wrapper.find('[aria-label="Tool reference"]').exists()).toBe(false)
    expect(wrapper.find('[aria-label="Search tool reference"]').exists()).toBe(false)
    expect(wrapper.find('[aria-label="Existing direct tools"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Search tools')
    wrapper.unmount()
  })

  it('preserves existing direct tools on save and permits removal without adding tools', async () => {
    ;(globalThis as any).__api__ = {
      '/user-agents/existing': { success: true, agent: {
        title: 'Document helper', model: 'class:fast', traits: [], tools: ['test:read', 'missing:tool'],
      } },
    }
    const wrapper = mount(AgentForm, { props: { open: true, embedded: true, agentId: 'existing',
      traits, tools, models: [{ name: 'class:fast' }], agents: [] } })
    await flushPromises()
    await wrapper.findAll('[role="tab"]').find(tab => tab.text().includes('Capabilities'))!.trigger('click')
    const direct = wrapper.get('[aria-label="Existing direct tools"]')
    expect(direct.text()).toContain('Read document')
    expect(direct.text()).toContain('missing:tool')
    expect(direct.findAll('button')).toHaveLength(2)
    expect(direct.findAll('input')).toHaveLength(0)
    expect(wrapper.find('[aria-label="Search tool reference"]').exists()).toBe(false)
    await wrapper.get('[data-testid="agent-form-save"]').trigger('click')
    await flushPromises()
    expect(vi.mocked(api.put).mock.calls.at(-1)?.[1]).toMatchObject({ tools: ['test:read', 'missing:tool'] })
    await direct.get('[aria-label="Remove Read document tool"]').trigger('click')
    await wrapper.get('[data-testid="agent-form-save"]').trigger('click')
    await flushPromises()
    expect(vi.mocked(api.put).mock.calls.at(-1)?.[1]).toMatchObject({ tools: ['missing:tool'] })
    await direct.get('[aria-label="Remove missing:tool tool"]').trigger('click')
    expect(wrapper.find('[aria-label="Existing direct tools"]').exists()).toBe(false)
    wrapper.unmount()
    ;(globalThis as any).__api__ = {}
  })

  it('shows capability details in the existing picker and selected row without a second capability surface', async () => {
    const wrapper = await form()
    expect(wrapper.text()).not.toMatch(/combinations/i)
    const search = wrapper.get('[aria-label="Search capabilities to add"]')
    await search.trigger('focus')
    let option = wrapper.get('[role="option"]')
    expect(option.text()).not.toContain(traits[0].prompt)
    await option.get('[aria-label="Show Document workflow details"]').trigger('click')
    option = wrapper.get('[role="option"]')
    for (const text of [traits[0].description, traits[0].prompt, description, tools[1].llm_description]) {
      expect(option.text()).toContain(text)
    }
    expect(wrapper.find('[aria-label="Remove Document workflow capability"]').exists()).toBe(false)
    await option.get('.kx-trait-cfg').trigger('click')
    expect(wrapper.findAll('.kx-trait')).toHaveLength(1)
    const row = wrapper.get('.kx-trait')
    expect(row.text()).not.toContain(traits[0].prompt)
    expect(row.text()).not.toContain(traits[0].description)
    expect(row.get('.kx-trait-fold').attributes('aria-expanded')).toBe('false')
    await search.trigger('focus')
    expect(wrapper.findAll('[role="option"]')).toHaveLength(0)
    await row.get('.kx-trait-fold').trigger('click')
    expect(row.text()).toContain(traits[0].prompt)
    expect(row.text().split(traits[0].description)).toHaveLength(2)
    expect(row.text()).toContain(description)
    await row.get('.kx-trait-fold').trigger('click')
    expect(row.text()).not.toContain(traits[0].prompt)
    wrapper.unmount()
  })

  it('previews capability details with the keyboard before adding the active option', async () => {
    const wrapper = await form()
    const search = wrapper.get('[aria-label="Search capabilities to add"]')
    await search.trigger('focus')
    await search.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.get('[role="option"]').text()).toContain(traits[0].prompt)
    await search.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.get('[role="option"]').text()).not.toContain(traits[0].prompt)
    await search.trigger('keydown', { key: 'Enter' })
    expect(wrapper.get('.kx-trait').text()).not.toContain(traits[0].prompt)
    wrapper.unmount()
  })

  it('resolves overlapping declarations once and retains unavailable declarations inside a capability row', async () => {
    const wrapper = mount(AgentForm, { props: { open: true, embedded: true, agentId: null,
      traits: [{ id: 'test:all', title: 'All document tools', tools: ['test:*', 'test:read', 'absent:*'] }],
      tools, models: [{ name: 'class:fast' }], agents: [] } })
    await wrapper.findAll('[role="tab"]').find(tab => tab.text().includes('Capabilities'))!.trigger('click')
    await wrapper.get('[aria-label="Search capabilities to add"]').trigger('focus')
    await wrapper.get('[role="option"]').trigger('click')
    const row = wrapper.get('.kx-trait')
    await row.get('.kx-trait-fold').trigger('click')
    expect(row.text()).toContain(description)
    expect(row.text()).toContain('Write document')
    expect(row.text()).toContain('absent:*')
    expect(row.text()).toContain('This tool is not in the available catalog.')
    expect(row.findAll('[data-declared-tool-id="test:read"]')).toHaveLength(1)
    expect(row.findAll('[data-declared-tool-id]')).toHaveLength(4)
    wrapper.unmount()
  })

})

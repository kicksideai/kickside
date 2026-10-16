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
const traits = [{ id: 'test:documents', title: 'Document workflow', description: 'Read before writing.', tools: ['test:read', 'test:write'] }]
async function form() {
  const wrapper = mount(AgentForm, { props: { open: true, embedded: true, agentId: null, traits, tools, models: [{ name: 'class:fast' }], agents: [] } })
  await wrapper.findAll('[role="tab"]').find(tab => tab.text().includes('Capabilities'))!.trigger('click')
  return wrapper
}

describe('agent creation tool reference', () => {
  it('documents capabilities managed by other settings without adding them through the capability picker', async () => {
    const routing = { id: REDIRECT_TRAIT, title: 'Agent routing', description: 'Routes work to another agent.',
      prompt: 'Choose a target in agent routing settings.', tools: ['test:read'] }
    const wrapper = mount(AgentForm, { props: { open: true, embedded: true, agentId: null,
      traits: [...traits, routing], tools, models: [{ name: 'class:fast' }], agents: [] } })
    await wrapper.findAll('[role="tab"]').find(tab => tab.text().includes('Capabilities'))!.trigger('click')
    const combinations = wrapper.get('[aria-label="Tool combinations"]')
    expect(combinations.findAll('details')).toHaveLength(2)
    const row = combinations.findAll('details').find(row => row.get('summary').text() === routing.title)!
    expect(row.text()).toContain(routing.description)
    expect(row.text()).toContain(routing.prompt)
    expect(row.text()).toContain(description)
    expect(row.get('button').text()).toBe('Managed in agent settings')
    expect(row.get('button').attributes('disabled')).toBeDefined()
    expect(wrapper.find('[aria-label="Remove Agent routing capability"]').exists()).toBe(false)
    wrapper.unmount()
  })
  it('shows every declared description in full and marks missing documentation honestly', async () => {
    const wrapper = await form()
    expect(wrapper.get('[aria-label="Tool reference"]').text()).toContain(description)
    expect(wrapper.text()).toContain('No description declared.')
    expect(wrapper.findAll('[data-tool-id]')).toHaveLength(3)
    wrapper.unmount()
  })

  it('searches descriptions and aliases while keeping selected tools in the save payload', async () => {
    vi.mocked(api.post).mockClear()
    const wrapper = await form()
    await wrapper.get('[aria-label="Search tool reference"]').setValue('final sentence')
    expect(wrapper.findAll('[data-tool-id]')).toHaveLength(1)
    await wrapper.get('[data-tool-id="test:read"] input[type="checkbox"]').setValue(true)
    await wrapper.get('[aria-label="Search tool reference"]').setValue('Write document')
    expect(wrapper.findAll('[data-tool-id]')).toHaveLength(1)
    await wrapper.get('[data-agent-name]').setValue('Document helper')
    await wrapper.get('[data-testid="agent-form-save"]').trigger('click')
    await flushPromises()
    expect(vi.mocked(api.post).mock.calls.at(-1)?.[1]).toMatchObject({ tools: ['test:read'] })
    await wrapper.get('[aria-label="Search tool reference"]').setValue('ReadDocument')
    expect(wrapper.findAll('[data-tool-id]')).toHaveLength(1)
    wrapper.unmount()
  })

  it('shows only declared capability combinations with their constituent tool descriptions', async () => {
    const wrapper = await form()
    const combinations = wrapper.get('[aria-label="Tool combinations"]')
    expect(combinations.text()).toContain('Document workflow')
    expect(combinations.text()).toContain('Read before writing.')
    expect(combinations.text()).toContain(description)
    expect(combinations.text()).toContain(tools[1].llm_description)
    expect(combinations.text()).not.toContain('Discord')
    await combinations.get('button').trigger('click')
    expect(wrapper.text()).toContain('Document workflow')
    expect(wrapper.find('[aria-label="Remove Document workflow capability"]').exists()).toBe(true)
    wrapper.unmount()
  })
  it('expands a capability’s declared wildcard to available tools without inventing entries', async () => {
    const wrapper = mount(AgentForm, { props: { open: true, embedded: true, agentId: null,
      traits: [{ id: 'test:all', title: 'All document tools', tools: ['test:*'] }],
      tools, models: [{ name: 'class:fast' }], agents: [] } })
    await wrapper.findAll('[role="tab"]').find(tab => tab.text().includes('Capabilities'))!.trigger('click')
    const combinations = wrapper.get('[aria-label="Tool combinations"]')
    expect(combinations.text()).toContain('Read document')
    expect(combinations.text()).toContain(description)
    expect(combinations.text()).toContain('Write document')
    expect(combinations.text()).not.toContain('not in the available catalog')
    wrapper.unmount()
  })

})

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AgentForm from './AgentForm.vue'

const models = [
  { name: 'fixture/fast', title: 'Fast', class: ['fast'], capabilities: ['generate'], output_tokens: 16384 },
  { name: 'fixture/small', title: 'Small', class: ['fast'], capabilities: ['generate'], output_tokens: 8192 },
]
async function modelForm(cards = models) {
  const wrapper = mount(AgentForm, { props: { open: true, embedded: true, agentId: null,
    traits: [], tools: [], models: cards, agents: [] } })
  await wrapper.get('[data-agent-name]').setValue('Fixture agent')
  await wrapper.findAll('[role="tab"]').find(row => row.text().includes('Model'))!.trigger('click')
  return wrapper
}
describe('Agent model constraints', () => {
  it('uses the smallest declared output budget for a selected class and refuses an excess', async () => {
    const wrapper = await modelForm()
    const tokens = wrapper.get('input[type="number"]')
    expect(tokens.attributes('max')).toBe('8192')
    expect(tokens.attributes('step')).toBe('1')
    await tokens.setValue(9000)
    expect(wrapper.get('[data-testid="agent-form-save"]').attributes('disabled')).toBeDefined()
    await tokens.setValue(4000)
    expect(wrapper.get('[data-testid="agent-form-save"]').attributes('disabled')).toBeUndefined()
    wrapper.unmount()
  })
  it('withholds sampling temperature for reasoning models and extended thinking', async () => {
    const wrapper = await modelForm([{ ...models[0], capabilities: ['generate', 'reasoning'] }])
    expect(wrapper.find('#agent-temperature').exists()).toBe(false)
    expect(wrapper.text()).toContain('temperature is not applied')
    wrapper.unmount()
    const sampling = await modelForm()
    expect(sampling.find('#agent-temperature').exists()).toBe(true)
    await sampling.get('#agent-thinking').setValue(true)
    expect(sampling.find('#agent-temperature').exists()).toBe(false)
    expect(sampling.text()).toContain('Extended thinking sets its own temperature')
    sampling.unmount()
  })
})

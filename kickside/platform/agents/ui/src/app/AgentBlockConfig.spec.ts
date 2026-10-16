// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Message from 'primevue/message'
import Select from 'primevue/select'
import type { AgentBlockConfigValue } from '../agent_block_config'
import AgentBlockConfig from './AgentBlockConfig.vue'

const webComponentBridge = vi.hoisted(() => ({
  props: { value: { config: {} as AgentBlockConfigValue } },
  emit: vi.fn(),
}))
const proxyBridge = vi.hoisted(() => ({
  loadByTagName: vi.fn(async (_tag: string, _options?: { timeoutMs?: number }) => {}),
}))

vi.mock('@wippy-fe/proxy', () => ({ loadByTagName: proxyBridge.loadByTagName }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => webComponentBridge.props,
  useEvents: () => webComponentBridge.emit,
}))

describe('AgentBlockConfig', () => {
  beforeEach(() => {
    proxyBridge.loadByTagName.mockReset()
    proxyBridge.loadByTagName.mockResolvedValue(undefined)
  })

  it('switches modes without emitting ambiguous Agent configuration', async () => {
    webComponentBridge.props.value.config = { agent_id: 'userspace.agents:researcher', model: 'class:fast' }
    webComponentBridge.emit.mockClear()
    const wrapper = mount(AgentBlockConfig)
    await flushPromises()
    expect(wrapper.find('wc-agent-picker').exists()).toBe(true)
    const radios = wrapper.findAll('input[type="radio"]')
    await radios[1].setValue(true)
    // This is the exact event WcMount consumes for a declaration-owned config WC.
    const config = webComponentBridge.emit.mock.calls.at(-1)![1] as Record<string, unknown>
    expect(webComponentBridge.emit.mock.calls.at(-1)![0]).toBe('config-changed')
    expect(config.agent_id).toBeUndefined()
    expect(config.model).toBe('class:fast')
    expect(wrapper.find('textarea[placeholder="What should this step do?"]').exists()).toBe(true)
  })

  it('emits inline instructions through the canonical config contract', async () => {
    webComponentBridge.props.value.config = {}
    webComponentBridge.emit.mockClear()
    const wrapper = mount(AgentBlockConfig)
    await wrapper.find('textarea[placeholder="What should this step do?"]').setValue('Ground the answer in the supplied data.')
    const config = webComponentBridge.emit.mock.calls.at(-1)![1] as Record<string, unknown>
    expect(config.instructions).toBe('Ground the answer in the supplied data.')
    expect(config.agent_id).toBeUndefined()
  })

  it('clears contradictory tool configuration when tool calling is disabled', async () => {
    webComponentBridge.props.value.config = {
      instructions: 'Research.', tools: ['example:search'], exit_schema: { type: 'object' }, tool_calling: 'auto',
    }
    webComponentBridge.emit.mockClear()
    const wrapper = mount(AgentBlockConfig)
    wrapper.findComponent(Select).vm.$emit('update:modelValue', 'none')
    await wrapper.vm.$nextTick()
    const config = webComponentBridge.emit.mock.calls.at(-1)![1] as Record<string, unknown>
    expect(config.tool_calling).toBe('none')
    expect(config.tools).toBeUndefined()
    expect(config.exit_schema).toBeUndefined()
  })

  it('shows an actionable error instead of an inert picker when registration fails', async () => {
    proxyBridge.loadByTagName.mockImplementation(async (tag: string) => {
      if (tag === 'wc-agent-picker') throw new Error('unavailable')
    })
    webComponentBridge.props.value.config = { agent_id: 'userspace.agents:researcher' }
    const wrapper = mount(AgentBlockConfig)
    await flushPromises()

    expect(proxyBridge.loadByTagName).toHaveBeenCalledWith('wc-agent-picker', { timeoutMs: 8000 })
    expect(wrapper.html()).not.toContain('<wc-agent-picker')
    expect(wrapper.findComponent(Message).text()).toContain('Couldn’t load the Agent picker')
    expect(wrapper.text()).toContain('Switch to inline instructions or try again.')
  })
})

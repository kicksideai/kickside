import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Agents from './agents.vue'
import { api } from '@wippy-fe/proxy'

vi.mock('@widgets/app/WcMount.vue', () => ({ default: {
  name: 'WcMount', props: ['tag', 'attrs', 'config'], emits: ['created', 'error'], template: '<div />',
} }))
const id = '5dc0887e-bb81-41b1-b3ca-f55e3fb3a460'
function fixture(access = 15) {
  ;(globalThis as any).__api__ = {
    '/user-agents': { success: true, agents: [{ id, title: 'Analyst', start_token: 'unchanged-start', access_level: access }] },
    '/agents/traits': { success: true, traits: [] }, '/agents/tools': { success: true, tools: [] },
    '/models/list': { success: true, models: [] },
  }
}
beforeEach(() => { vi.clearAllMocks(); fixture() })
describe('Agents entry points', () => {
  it.each([1, 15])('offers chat and editing without a background task control (access %s)', async access => {
    fixture(access)
    const wrapper = mount(Agents, { global: { stubs: { AgentForm: true } } })
    await flushPromises()
    expect(wrapper.find('button[title="Run in background"]').exists()).toBe(false)
    expect(wrapper.find('.kx-background-run').exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'WcMount' }).exists()).toBe(false)
    expect(wrapper.find('button[aria-label="Edit Analyst"]').exists()).toBe(true)
    ;(globalThis as any).__events__ = []
    await wrapper.get('.kx-card-chat').trigger('click')
    expect((globalThis as any).__events__).toContainEqual({ name: 'kickside-chat-open', detail: { kind: 'start', startToken: 'unchanged-start' } })
    expect(api.post).not.toHaveBeenCalled()
  })
})

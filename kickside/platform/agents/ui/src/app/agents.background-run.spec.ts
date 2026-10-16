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
async function open() {
  const wrapper = mount(Agents, { global: { stubs: { AgentForm: true } } })
  await flushPromises()
  await wrapper.get('button[aria-label="Run Analyst in background"]').trigger('click')
  return wrapper
}
function button(wrapper: Awaited<ReturnType<typeof open>>, label: string) {
  return wrapper.findAll('button').find(b => b.text() === label)!
}

describe('Agents shared background task launch', () => {
  it('opens an inline background-run form without changing ordinary Chat behavior', async () => {
    const wrapper = await open()
    expect(wrapper.find('[aria-label="Background agent run"]').exists()).toBe(true)
    expect(wrapper.find('[role=dialog]').exists()).toBe(false)
    ;(globalThis as any).__events__ = []
    await wrapper.get('.kx-card-chat').trigger('click')
    expect((globalThis as any).__events__).toContainEqual({ name: 'kickside-chat-open', detail: { kind: 'start', startToken: 'unchanged-start' } })
    expect(api.post).not.toHaveBeenCalled()
  })
  it('requires a prompt before exposing the shared launcher', async () => {
    const wrapper = await open()
    expect(button(wrapper, 'Prepare background run').attributes('disabled')).toBeDefined()
    expect(wrapper.findComponent({ name: 'WcMount' }).exists()).toBe(false)
    await wrapper.get('textarea[aria-label="Task prompt"]').setValue('   ')
    expect(button(wrapper, 'Prepare background run').attributes('disabled')).toBeDefined()
  })
  it('mounts the one manual launcher with the ordinary agent parent and fixed target', async () => {
    const wrapper = await open()
    await wrapper.get('textarea[aria-label="Task prompt"]').setValue('Write the report')
    await button(wrapper, 'Prepare background run').trigger('click')
    const launcher = wrapper.getComponent({ name: 'WcMount' })
    expect(launcher.props('tag')).toBe('wc-manual-task-launcher')
    expect(launcher.props('attrs')).toEqual({ parent: id, title: 'Run Analyst', target: JSON.stringify({ kind: 'agent', agent_id: id, prompt: 'Write the report' }) })
    expect(wrapper.get('textarea[aria-label="Task prompt"]').attributes('readonly')).toBeDefined()
    expect(api.post).not.toHaveBeenCalled()
  })
  it('keeps loaded-agent mutations separate from already prepared task declarations', async () => {
    const wrapper = await open()
    await wrapper.get('textarea[aria-label="Task prompt"]').setValue('Fixed prompt')
    await button(wrapper, 'Prepare background run').trigger('click')
    const target = wrapper.getComponent({ name: 'WcMount' }).props('attrs')
    fixture()
    ;(globalThis as any).__api__['/user-agents'].agents[0].title = 'Renamed agent'
    ;(globalThis as any).__hostVisibility__.value = false
    await flushPromises()
    ;(globalThis as any).__hostVisibility__.value = true
    await flushPromises()
    expect(wrapper.getComponent({ name: 'WcMount' }).props('attrs')).toEqual(target)
  })
  it('hides background launch for a read-only agent while preserving chat and editing discovery', async () => {
    fixture(1)
    const wrapper = mount(Agents, { global: { stubs: { AgentForm: true } } })
    await flushPromises()
    expect(wrapper.find('button[aria-label="Run Analyst in background"]').exists()).toBe(false)
    expect(wrapper.get('.kx-card-chat').attributes('disabled')).toBeUndefined()
    expect(wrapper.find('button[aria-label="Edit Analyst"]').exists()).toBe(true)
  })
  it('clears the forwarded failure after the shared launcher confirms admission', async () => {
    const wrapper = await open()
    await wrapper.get('textarea[aria-label="Task prompt"]').setValue('Retried prompt')
    await button(wrapper, 'Prepare background run').trigger('click')
    const launcher = wrapper.getComponent({ name: 'WcMount' })
    launcher.vm.$emit('error', { message: 'Permission denied' })
    await flushPromises()
    expect(wrapper.get('[role=alert]').text()).toContain('Permission denied')
    launcher.vm.$emit('created', { id: 'admitted-root' })
    await flushPromises()
    expect(wrapper.find('[role=alert]').exists()).toBe(false)
  })
  it('starts a new prepared declaration only after an explicit new run', async () => {
    const wrapper = await open()
    await wrapper.get('textarea[aria-label="Task prompt"]').setValue('First prompt')
    await button(wrapper, 'Prepare background run').trigger('click')
    await button(wrapper, 'Close background run').trigger('click')
    await wrapper.get('button[aria-label="Run Analyst in background"]').trigger('click')
    expect(wrapper.get('textarea[aria-label="Task prompt"]').element).toHaveProperty('value', '')
    expect(wrapper.findComponent({ name: 'WcMount' }).exists()).toBe(false)
  })
})

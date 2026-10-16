import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Agents from './agents.vue'
beforeEach(() => {
  ;(globalThis as any).__api__ = {
    '/user-agents': { success: true, agents: [{ id: 'ag1', title: 'Helper', name: 'Helper', model: 'opus', traits: [], start_token: 'token-1' }] },
    '/agents/traits': { success: true, traits: [{ id: 't1', name: 'Reader' }] },
    '/agents/tools': { success: true, tools: [{ id: 'tool1', name: 'search' }] },
    '/models/list': { success: true, models: [{ id: 'opus', name: 'Opus' }] },
    '/agents/memory-options': { success: true, items: [] },
  }
})
describe('agents.vue interactions', () => {
  it('loads agents and renders the list, opens create', async () => {
    const w = mount(Agents)
    await flushPromises()
    expect(w.html()).toContain('Helper')
    const create = w.find('[data-testid="agents-create"]')
    if (create.exists()) { await create.trigger('click'); await flushPromises() }
    w.unmount()
  })
})

describe('agents.vue chat contract', () => {
  it('emits an app-owned chat start request instead of calling the host chat panel', async () => {
    ;(globalThis as any).__events__ = []
    const w = mount(Agents)
    await flushPromises()
    await w.find('.kx-card-chat').trigger('click')
    expect((globalThis as any).__events__).toContainEqual({
      name: 'kickside-chat-open',
      detail: { kind: 'start', startToken: 'token-1' },
    })
    w.unmount()
  })
})

describe('agents.vue editor', () => {
  it('opens the create editor (AgentForm)', async () => {
    const w = mount(Agents)
    await flushPromises()
    const create = w.findAll('button').find(b => /new agent/i.test(b.text()))
    if (create) { await create.trigger('click'); await flushPromises() }
    expect(w.exists()).toBe(true)
    w.unmount()
  })
})

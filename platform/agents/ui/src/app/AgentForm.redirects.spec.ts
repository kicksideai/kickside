import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import AgentForm from './AgentForm.vue'

// The redirects picker is the same wc-agent-picker used for delegates: its
// idKey is the canonical "user_agent:<id>" ref (list_agents.lua's agent.name),
// so every id it emits -- kept chips and fresh picks alike -- already carries
// the prefix. The redirects handler must store that ref verbatim, exactly
// like delegates does, not re-prefix it.
beforeEach(() => {
  ;(globalThis as any).__api__ = {
    '/user-agents/ag1': {
      success: true,
      agent: {
        title: 'Router',
        traits: ['kickside.agents.traits:redirect'],
        trait_contexts: {
          'kickside.agents.traits:redirect': {
            targets: [{ agent_id: 'user_agent:existing-id', comment: 'existing' }],
          },
        },
      },
    },
  }
})

describe('AgentForm redirects', () => {
  it('stores a freshly picked redirect target with a single user_agent: prefix, not doubled', async () => {
    const w = mount(AgentForm, {
      props: {
        open: true,
        embedded: true,
        agentId: 'ag1',
        traits: [],
        tools: [],
        models: [{ name: 'opus' }],
        agents: [
          { id: 'existing-id', title: 'Existing' },
          { id: 'new-id', title: 'New' },
        ],
      },
    })
    await flushPromises()

    const routingTab = w.findAll('button').find((b) => /Routing/.test(b.text()))
    expect(routingTab).toBeTruthy()
    await routingTab!.trigger('click')

    const redirectsSeg = w.findAll('button').find((b) => /Redirects/.test(b.text()))
    expect(redirectsSeg).toBeTruthy()
    await redirectsSeg!.trigger('click')

    const pickers = w.findAll('wc-agent-picker')
    expect(pickers.length).toBe(1)
    const redirectsPicker = pickers[0]

    // Simulate the real web component's change event: it always reports the
    // full current selection in its canonical (already-prefixed) ref form,
    // whether the chip was kept from the initial `selected` or freshly picked.
    redirectsPicker.element.dispatchEvent(
      new CustomEvent('change', { detail: { selected: ['user_agent:existing-id', 'user_agent:new-id'] } })
    )
    await flushPromises()

    const saveBtn = w.find('[data-testid="agent-form-save"]')
    await saveBtn.trigger('click')
    await flushPromises()

    const putCall = (api.put as any).mock.calls.find((c: any[]) => c[0] === '/api/v1/user-agents/ag1')
    expect(putCall).toBeTruthy()
    expect(putCall[1].traits).toEqual(['kickside.agents.traits:redirect'])
    const targets = putCall[1].trait_contexts['kickside.agents.traits:redirect'].targets
    const ids = targets.map((t: any) => t.agent_id).sort()
    expect(ids).toEqual(['user_agent:existing-id', 'user_agent:new-id'])

    w.unmount()
  })
})

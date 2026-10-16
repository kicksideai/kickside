// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@iconify/vue', () => ({ Icon: { name: 'Icon', props: ['icon'], template: '<i :data-icon="icon" />' } }))

const { assistConfig } = vi.hoisted(() => ({ assistConfig: vi.fn() }))
vi.mock('./assist-config', () => ({
  assistConfig,
  isConfigAssistOk: (value: unknown) => !!value && typeof value === 'object' && 'config' in value,
}))

import ConfigAssist from './ConfigAssist.vue'

const INBOX_SCHEMA = {
  type: 'object', required: ['prompt'], properties: {
    prompt: { type: 'string', title: 'Prompt' },
    context: { type: 'string', title: 'Context expression' },
    form: { type: 'object', title: 'Form schema', format: 'json-schema' },
    assignee: { type: 'string', title: 'Assignee', picker: 'wc-principal-picker', kinds: 'user' },
    approve_label: { type: 'string', title: 'Approve label' },
    reject_label: { type: 'string', title: 'Reject label' },
    priority: { type: 'string', title: 'Priority', enum: ['low', 'normal', 'high', 'urgent'] },
  },
}

function mountAssist(overrides: Record<string, unknown> = {}) {
  return mount(ConfigAssist, {
    props: {
      workflowId: 'wf-1', resetKey: 'node-1',
      configSchema: INBOX_SCHEMA, currentConfig: { priority: 'normal' }, ...overrides,
    },
    global: { stubs: { Icon: true } },
  })
}

describe('ConfigAssist', () => {
  beforeEach(() => assistConfig.mockReset())

  it('uses canonical authoring controls through idle, disabled, and loading states', async () => {
    let resolveDraft!: (value: unknown) => void
    assistConfig.mockImplementationOnce(() => new Promise((resolve) => { resolveDraft = resolve }))
    const wrapper = mountAssist()
    const textarea = wrapper.get('textarea')
    const draftButton = wrapper.get<HTMLButtonElement>('.wf-config-assist__compose button')

    expect(textarea.classes()).toContain('wf-textarea')
    expect(draftButton.element.disabled).toBe(true)
    await textarea.setValue('Route urgent invoices for finance review')
    expect(draftButton.element.disabled).toBe(false)
    await draftButton.trigger('click')
    expect(draftButton.element.disabled).toBe(true)
    expect(draftButton.text()).toContain('Drafting')
    expect(draftButton.attributes('data-p')).toContain('loading')

    resolveDraft({ config: { priority: 'urgent' } })
    await flushPromises()
    expect(wrapper.get('[aria-label="Drafted settings"] .wf-config-assist__actions').text()).toContain('Accept')
    expect(wrapper.get('[aria-label="Drafted settings"] .wf-config-assist__actions').text()).toContain('Cancel')
  })

  it('previews seven assistable Inbox controls while picker identity stays human-owned', async () => {
    const draft = {
      prompt: 'Approve payment?', context: 'output.invoice',
      form: { type: 'object', properties: { reason: { type: 'string' } } },
      assignee: 'alex', approve_label: 'Pay', reject_label: 'Hold', priority: 'urgent', timeout: 86400,
    }
    assistConfig.mockResolvedValue({ config: draft, notes: 'Finance review.' })
    const wrapper = mountAssist()
    await wrapper.get('textarea').setValue('Urgent finance review for Alex with a reason')
    await wrapper.get('.wf-config-assist__draft').trigger('click')
    await flushPromises()

    expect(wrapper.get('[aria-label="Drafted settings"]').text()).toContain('7 changed')
    for (const label of ['Prompt', 'Context expression', 'Form schema', 'Approve label', 'Reject label', 'Priority']) {
      expect(wrapper.text()).toContain(label)
    }
    expect(wrapper.text()).not.toContain('actor-alex')
    expect(wrapper.text()).toContain('normal')
    expect(wrapper.text()).toContain('urgent')
    expect(wrapper.text()).toContain('1 field')
    expect(wrapper.text()).not.toContain('"properties"')

    await wrapper.get('.wf-config-assist__accept').trigger('click')
    const { assignee: _ignored, ...assistableDraft } = draft
    expect(wrapper.emitted('accept')?.[0]).toEqual([assistableDraft])
    expect(wrapper.text()).toContain('Draft applied')
    expect(wrapper.get('.wf-config-assist__applied button').text()).toBe('Undo')
    await wrapper.get('.wf-config-assist__applied button').trigger('click')
    expect(wrapper.emitted('undo')?.[0]).toEqual([{ priority: 'normal' }])
  })

  it('uses the same surface for another declared external node kind', async () => {
    assistConfig.mockResolvedValue({ config: { profile: 'strict', max_attempts: 10 } })
    const wrapper = mountAssist({
      currentConfig: {},
      configSchema: {
        type: 'object', required: ['profile'], properties: {
          profile: { type: 'string', title: 'Profile' }, max_attempts: { type: 'integer', title: 'Max attempts' },
        },
      },
    })
    await wrapper.get('textarea').setValue('Strict profile, ten attempts')
    await wrapper.get('.wf-config-assist__draft').trigger('click')
    await flushPromises()
    expect(assistConfig).toHaveBeenCalledWith({ workflowId: 'wf-1', nodeId: 'node-1', intent: 'Strict profile, ten attempts' })
    expect(wrapper.text()).toContain('Max attempts')
  })

  it('uses the server-returned schema for a compiler-owned node without a mirrored client declaration', async () => {
    assistConfig.mockResolvedValue({
      config: { prompt: 'Approve invoice?', context: '{ total: output.invoice.total }', approve_label: 'Pay', reject_label: 'Hold' },
      configSchema: {
        type: 'object', properties: {
          prompt: { type: 'string', title: 'Question' },
          context: { type: 'string', title: 'Context shown to approver' },
          approve_label: { type: 'string', title: 'Approve path label' },
          reject_label: { type: 'string', title: 'Reject path label' },
        },
      },
    })
    const wrapper = mountAssist({
      configSchema: undefined,
      currentConfig: { prompt: 'Old?', assignee: 'user-owned' },
      upstreamSchema: { type: 'object', properties: { invoice: { type: 'object' } } },
    })
    await wrapper.get('textarea').setValue('Ask finance to approve the invoice')
    await wrapper.get('.wf-config-assist__draft').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Context shown to approver')
    expect(wrapper.text()).toContain('Approve path label')
    await wrapper.get('.wf-config-assist__accept').trigger('click')
    expect(wrapper.emitted('accept')?.[0]).toEqual([{
      prompt: 'Approve invoice?', assignee: 'user-owned',
      context: '{ total: output.invoice.total }', approve_label: 'Pay', reject_label: 'Hold',
    }])
  })

  it('preserves omitted optional settings and previews the union before accept', async () => {
    assistConfig.mockResolvedValue({ config: { prompt: 'Updated prompt?' } })
    const wrapper = mountAssist({ currentConfig: { prompt: 'Old prompt?', context: 'output.invoice', priority: 'high' } })
    await wrapper.get('textarea').setValue('Update only the question')
    await wrapper.get('.wf-config-assist__draft').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Context expression')
    expect(wrapper.text()).toContain('output.invoice')
    expect(wrapper.text()).toContain('Priority')
    expect(wrapper.text()).toContain('high')
    expect(wrapper.text()).toContain('1 changed')
    await wrapper.get('.wf-config-assist__accept').trigger('click')
    expect(wrapper.emitted('accept')?.[0]).toEqual([{
      prompt: 'Updated prompt?', context: 'output.invoice', priority: 'high',
    }])
  })

  it('preserves picker-owned identity through Accept and Undo even if a response includes it', async () => {
    assistConfig.mockResolvedValue({ config: { prompt: 'Updated?', assignee: 'model-invented-user' } })
    const current = { prompt: 'Old?', assignee: 'user-ada', priority: 'normal' }
    const wrapper = mountAssist({ currentConfig: current })
    await wrapper.get('textarea').setValue('Update the prompt')
    await wrapper.get('.wf-config-assist__draft').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('user-ada')
    expect(wrapper.text()).not.toContain('model-invented-user')
    await wrapper.get('.wf-config-assist__accept').trigger('click')
    expect(wrapper.emitted('accept')?.[0]).toEqual([{ prompt: 'Updated?', assignee: 'user-ada', priority: 'normal' }])
    await wrapper.get('.wf-config-assist__applied button').trigger('click')
    expect(wrapper.emitted('undo')?.[0]).toEqual([current])
  })

  it('keeps applied Undo when the parent echoes semantically identical nested config in a different key order', async () => {
    assistConfig.mockResolvedValue({
      config: { presentation: { title: 'New', hint: 'Keep' }, priority: 'urgent' },
    })
    const current = { priority: 'normal', presentation: { hint: 'Old hint', title: 'Old' } }
    const wrapper = mountAssist({
      currentConfig: current,
      configSchema: {
        type: 'object', properties: {
          presentation: {
            type: 'object', properties: { title: { type: 'string' }, hint: { type: 'string' } },
          },
          priority: { type: 'string' },
        },
      },
    })
    await wrapper.get('textarea').setValue('Update presentation and priority')
    await wrapper.get('.wf-config-assist__draft').trigger('click')
    await flushPromises()
    await wrapper.get('.wf-config-assist__accept').trigger('click')
    expect(wrapper.text()).toContain('Draft applied')

    await wrapper.setProps({
      currentConfig: { priority: 'urgent', presentation: { hint: 'Keep', title: 'New' } },
    })
    expect(wrapper.text()).toContain('Draft applied')
    await wrapper.get('.wf-config-assist__applied button').trigger('click')
    expect(wrapper.emitted('undo')?.[0]).toEqual([current])
    wrapper.unmount()
  })

  it('keeps nested picker identities and optional sibling settings human-owned', async () => {
    assistConfig.mockResolvedValue({
      config: {
        presentation: { title: 'New' },
        routing: { assignee: 'model-invented-user', note: 'model route' },
      },
    })
    const current = {
      presentation: { title: 'Old', hint: 'Keep this' },
      routing: { assignee: 'user-ada', note: 'human route' },
    }
    const wrapper = mountAssist({
      currentConfig: current,
      configSchema: {
        type: 'object', properties: {
          presentation: { type: 'object', properties: { title: { type: 'string' }, hint: { type: 'string' } } },
          routing: {
            type: 'object', properties: {
              assignee: { type: 'string', picker: 'wc-principal-picker' }, note: { type: 'string' },
            },
          },
        },
      },
    })
    await wrapper.get('textarea').setValue('Update presentation')
    await wrapper.get('.wf-config-assist__draft').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Keep this')
    expect(wrapper.text()).toContain('user-ada')
    expect(wrapper.text()).not.toContain('model-invented-user')
    await wrapper.get('.wf-config-assist__accept').trigger('click')
    expect(wrapper.emitted('accept')?.[0]).toEqual([{
      presentation: { title: 'New', hint: 'Keep this' },
      routing: { assignee: 'user-ada', note: 'human route' },
    }])
  })

  it('ignores a late response from the previously selected node', async () => {
    let resolveA!: (value: unknown) => void
    let resolveB!: (value: unknown) => void
    let pendingA!: Promise<unknown>
    let pendingB!: Promise<unknown>
    assistConfig
      .mockImplementationOnce(() => (pendingA = new Promise((resolve) => { resolveA = resolve })))
      .mockImplementationOnce(() => (pendingB = new Promise((resolve) => { resolveB = resolve })))
    const wrapper = mountAssist({ currentConfig: {} })
    await wrapper.get('textarea').setValue('Configure A')
    await wrapper.get('.wf-config-assist__draft').trigger('click')

    await wrapper.setProps({ resetKey: 'node-2', currentConfig: {} })
    await wrapper.get('textarea').setValue('Configure B')
    await wrapper.get('.wf-config-assist__draft').trigger('click')
    resolveB({ config: { prompt: 'B wins' } })
    await pendingB
    await flushPromises()
    expect(wrapper.text()).toContain('B wins')

    resolveA({ config: { prompt: 'A is stale' } })
    await pendingA
    await flushPromises()
    expect(wrapper.text()).toContain('B wins')
    expect(wrapper.text()).not.toContain('A is stale')
    wrapper.unmount()
  })

  it('rejects a long response after a manual edit on the same node', async () => {
    let resolveDraft!: (value: unknown) => void
    const pending = new Promise((resolve) => { resolveDraft = resolve })
    assistConfig.mockReturnValue(pending)
    const wrapper = mountAssist({ currentConfig: { prompt: 'Before' } })
    await wrapper.get('textarea').setValue('Change the prompt')
    await wrapper.get('.wf-config-assist__draft').trigger('click')

    await wrapper.setProps({ currentConfig: { prompt: 'Manual edit' } })
    resolveDraft({ config: { prompt: 'Stale AI edit' } })
    await pending
    await flushPromises()

    expect(wrapper.text()).toContain('This step changed while the draft was being prepared')
    expect(wrapper.text()).not.toContain('Stale AI edit')
    expect(wrapper.emitted('accept')).toBeUndefined()
    wrapper.unmount()
  })

  async function expectContextChangeRejected(changedProps: Record<string, unknown>) {
    let resolveDraft!: (value: unknown) => void
    const pending = new Promise((resolve) => { resolveDraft = resolve })
    assistConfig.mockReturnValueOnce(pending)
    const wrapper = mountAssist({ currentConfig: { prompt: 'Before' } })
    await wrapper.get('textarea').setValue('Change the prompt')
    await wrapper.get('.wf-config-assist__draft').trigger('click')
    await wrapper.setProps(changedProps)
    resolveDraft({ config: { prompt: 'Wrong context' } })
    await pending
    await flushPromises()
    expect(wrapper.text()).toContain('This step changed while the draft was being prepared')
    expect(wrapper.text()).not.toContain('Wrong context')
    expect(wrapper.find('[aria-label="Drafted settings"]').exists()).toBe(false)
    wrapper.unmount()
  }

  it('rejects a same-node response after its workflow context changes', async () => {
    await expectContextChangeRejected({ workflowId: 'wf-2' })
  })

  it('rejects a same-node response after its schema context changes', async () => {
    await expectContextChangeRejected({
      configSchema: { ...INBOX_SCHEMA, properties: { ...INBOX_SCHEMA.properties, prompt: { type: 'string', title: 'Question' } } },
    })
  })
})

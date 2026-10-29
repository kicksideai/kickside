// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import SelectButton from 'primevue/selectbutton'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import RetryPolicyPanel from './RetryPolicyPanel.vue'
import NodeConfigPanel from './NodeConfigPanel.vue'
import { registerBlocks } from '../domain/node-policy'
vi.mock('@wippy-fe/proxy', () => ({ api: { get: vi.fn(async () => ({ data: {} })) }, loadByTagName: vi.fn(async () => {}) }))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<i />' } }))

const node = { id: 'step', kind: 'block' as const, title: 'Step', ref: 'example:step', config: {} }
const defaults = { kind: 'function', retry_policy: { maximum_attempts: 3, initial_interval: '2s' }, start_to_close_timeout: '10s' }
describe('Retry inspector', () => {
  it('renders the section only for function and tool Block executions', () => {
    for (const kind of ['function', 'tool', 'agent', 'wait']) {
      registerBlocks([{ id: 'example:step', label: 'Step', execution: { kind } }])
      const wrapper = mount(NodeConfigPanel, {
        props: { workflowId: 'example', node, edge: null, note: null, catalog: [] },
        global: { stubs: { SchemaEditor: true, FlowPicker: true, ConfigAssist: true } },
      })
      expect(wrapper.findComponent(RetryPolicyPanel).exists()).toBe(['function', 'tool'].includes(kind))
      wrapper.unmount()
    }
  })
  it('shows declaration defaults and starts a whole policy override', async () => {
    const wrapper = mount(RetryPolicyPanel, { props: { node, execution: defaults } })
    expect(wrapper.text()).toContain('Retries')
    expect((wrapper.get('[aria-label="Maximum attempts"]').element as HTMLInputElement).value).toBe('3')
    expect((wrapper.get('[aria-label="Initial interval"]').element as HTMLInputElement).value).toBe('2s')
    await wrapper.get('[aria-label="Maximum attempts"]').setValue('5')
    await wrapper.get('[aria-label="Maximum attempts"]').trigger('blur')
    expect(wrapper.emitted('update-node')!.at(-1)![0]).toEqual({ retry_policy: { maximum_attempts: 5, initial_interval: '2s' } })
  })
  it('resets fields independently and keeps timeouts outside Block config', async () => {
    const wrapper = mount(RetryPolicyPanel, { props: { node: { ...node, retry_policy: { maximum_attempts: 4 }, start_to_close_timeout: 2000 }, execution: defaults } })
    await wrapper.get('[aria-label="Reset retry policy"]').trigger('click')
    expect(wrapper.emitted('update-node')!.at(-1)![0]).toEqual({ retry_policy: false })
    await wrapper.get('[aria-label="Total window"]').setValue('30s')
    await wrapper.get('[aria-label="Total window"]').trigger('change')
    expect(wrapper.emitted('update-node')!.at(-1)![0]).toEqual({ schedule_to_close_timeout: '30s' })
    await wrapper.get('[aria-label="Reset per-attempt timeout"]').trigger('click')
    expect(wrapper.emitted('update-node')!.at(-1)![0]).toEqual({ start_to_close_timeout: false })
  })
  it('explains one attempt without a policy and allows explicit retry defaults for tools', async () => {
    const wrapper = mount(RetryPolicyPanel, { props: { node, execution: { kind: 'tool' } } })
    expect(wrapper.text()).toContain('One attempt')
    await wrapper.get('[aria-label="Override retry policy"]').trigger('click')
    expect(wrapper.emitted('update-node')!.at(-1)![0]).toEqual({ retry_policy: {} })
  })
  it('ships retry layout with the inline shadow stylesheet and shares inspector controls', () => {
    const component = readFileSync(resolve('src/app/panels/RetryPolicyPanel.vue'), 'utf8')
    const panels = readFileSync(resolve('src/styles/panels.css'), 'utf8')
    expect(component).not.toContain('<style')
    expect(panels).toContain('.wf-retry-field')
    const wrapper = mount(RetryPolicyPanel, { props: { node: { ...node, retry_policy: {}, start_to_close_timeout: '1s', schedule_to_close_timeout: '5s' }, execution: defaults } })
    const resets = wrapper.findAll('button[aria-label^="Reset"]')
    expect(resets).toHaveLength(3)
    for (const reset of resets) expect(reset.element.parentElement?.classList.contains('wf-retry-heading')).toBe(true)
    const fields = wrapper.findAll('input')
    for (const field of fields) expect(field.classes()).toContain('wf-input')
    expect(wrapper.text().match(/Block default: 3/g)).toHaveLength(1)
  })
  it('ships the published run panel layout in the inline stylesheet too', () => {
    expect(readFileSync(resolve('src/app/panels/PublishedRunPanel.vue'), 'utf8')).not.toContain('<style')
    expect(readFileSync(resolve('src/styles/panels.css'), 'utf8')).toContain('.wf-published-run header')
  })
  it('edits non-retryable kinds as an array and preserves the policy', async () => {
    const wrapper = mount(RetryPolicyPanel, { props: { node, execution: defaults } })
    const select = wrapper.getComponent(SelectButton)
    expect(select.props('multiple')).toBe(true)
    expect(select.props('options')).toEqual(['NotFound', 'AlreadyExists', 'Invalid', 'PermissionDenied', 'Unavailable', 'Internal', 'Canceled', 'Conflict', 'Timeout', 'RateLimited'])
    select.vm.$emit('update:modelValue', ['Invalid', 'PermissionDenied'])
    expect(wrapper.emitted('update-node')!.at(-1)![0]).toEqual({ retry_policy: { ...defaults.retry_policy, non_retryable_error_types: ['Invalid', 'PermissionDenied'] } })
  })
})

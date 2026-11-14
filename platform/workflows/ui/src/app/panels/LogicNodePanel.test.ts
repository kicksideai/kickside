// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Select from 'primevue/select'
import type { WfNode } from '../types'

vi.mock('@iconify/vue', () => ({ Icon: { template: '<i />' } }))
vi.mock('./ConfigAssist.vue', () => ({
  default: {
    name: 'ConfigAssist',
    props: ['workflowId', 'resetKey', 'configSchema', 'currentConfig', 'upstreamSchema'],
    emits: ['accept', 'undo'],
    template: '<button class="assist-stub" :data-reset-key="resetKey" @click="$emit(\'accept\', { predicate: `output.score >= 90` })">Draft</button>',
  },
}))

const LogicNodePanel = (await import('./LogicNodePanel.vue')).default
const upstream = { type: 'object', properties: { score: { type: 'number' }, rows: { type: 'array', items: { type: 'object' } } } }
const node = (kind: string, config: Record<string, unknown> = {}): WfNode => ({ id: `${kind}-1`, kind, title: kind, config } as WfNode)

describe('LogicNodePanel assistive authoring', () => {
  it('introduces Condition without leaking Combine implementation choices', () => {
    const wrapper = mount(LogicNodePanel, { props: { workflowId: 'wf-1', node: node('branch'), upstreamSchema: upstream } })
    expect(wrapper.text()).toContain('connect True and False')
    expect(wrapper.text()).not.toContain('first-wins')
  })

  it('makes Condition field-first, explains both outcomes, and keeps AI tied to this node', async () => {
    const wrapper = mount(LogicNodePanel, { props: { workflowId: 'wf-1', node: node('branch'), upstreamSchema: upstream } })
    expect(wrapper.findAllComponents(Select)[0].props('options')).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: 'score' })]),
    )
    expect(wrapper.get('.p-panel-toggle-button').attributes('aria-expanded')).toBe('false')
    expect(wrapper.get('[aria-label="Condition outcomes"]').text()).toContain('True')
    expect(wrapper.get('[aria-label="Condition outcomes"]').text()).toContain('False')
    expect(wrapper.get('.assist-stub').attributes('data-reset-key')).toBe('branch-1')
    const assist = wrapper.getComponent({ name: 'ConfigAssist' })
    expect(assist.props('configSchema')).toBeUndefined()
    expect(assist.props('upstreamSchema')).toEqual(upstream)

    await wrapper.get('.assist-stub').trigger('click')
    const updates = wrapper.emitted('update-node') ?? []
    expect(updates[updates.length - 1]).toEqual([{ config: { predicate: 'output.score >= 90' } }])
  })

  it('does not teach periodic polling as a Loop authoring pattern', () => {
    const wrapper = mount(LogicNodePanel, { props: { workflowId: 'wf-1', node: node('cycle'), upstreamSchema: upstream } })
    expect(wrapper.text().toLowerCase()).not.toContain('polling')
    expect(wrapper.text()).toContain('bounded operation')
  })

  it('selects an upstream array for For each instead of asking for a typed key', async () => {
    const wrapper = mount(LogicNodePanel, { props: { workflowId: 'wf-1', node: node('for_each'), upstreamSchema: upstream } })
    expect(wrapper.find('[aria-label="Source array key"]').exists()).toBe(false)
    const picker = wrapper.get('[aria-label="Items to iterate"]')
    expect(wrapper.findAllComponents(Select)[0].props('options')).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: 'rows' })]),
    )
    wrapper.findAllComponents(Select)[0].vm.$emit('update:modelValue', 'rows')
    await wrapper.vm.$nextTick()
    const updates = wrapper.emitted('update-node') ?? []
    expect(updates[updates.length - 1]?.[0]).toMatchObject({ kind: 'for_each', config: { source_array_key: 'rows' } })
  })

  it('reuses the visual composer for a Loop predicate over its declared upstream input', async () => {
    const wrapper = mount(LogicNodePanel, { props: { workflowId: 'wf-1', node: node('cycle'), upstreamSchema: upstream } })
    wrapper.findAllComponents(Select)[0].vm.$emit('update:modelValue', 'score')
    await wrapper.vm.$nextTick()
    wrapper.findAllComponents(Select)[1].vm.$emit('update:modelValue', 'lt')
    await wrapper.vm.$nextTick()
    await wrapper.get('[aria-label="Condition value"]').setValue('100')
    await wrapper.get('[aria-label="Condition value"]').trigger('blur')
    const updates = wrapper.emitted('update-node') ?? []
    expect(updates[updates.length - 1]?.[0]).toMatchObject({ config: { continue_condition: 'input.score < 100' } })
  })
})

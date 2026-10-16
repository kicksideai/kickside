// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const assistEdgeMapping = vi.hoisted(() => vi.fn(async () => ({ transform: '{ query: output.query }' })))

vi.mock('@iconify/vue', () => ({ Icon: { props: ['icon'], template: '<i :data-icon="icon" />' } }))
vi.mock('@widgets/app/FieldMapper.vue', () => ({
  default: { props: ['simple', 'sourceTitle', 'targetTitle'], emits: ['assist'], template: '<div class="field-mapper-stub" :data-simple="String(simple)"><button class="assist-stub" @click="$emit(\'assist\')">Assist</button></div>' },
}))
vi.mock('../api/api', () => ({ listRuns: vi.fn(async () => []), getRunNodeData: vi.fn(async () => []) }))
vi.mock('./assist', () => ({
  assistEdgeMapping,
  isAssistTransform: (value: unknown) => !!value && typeof value === 'object' && 'transform' in value,
}))

const EdgePanel = (await import('./EdgePanel.vue')).default

describe('EdgePanel composition', () => {
  it('leads with endpoint-aware data mapping and does not offer a second conditional vocabulary', async () => {
    const wrapper = mount(EdgePanel, {
      props: {
        workflowId: 'wf-1',
        edge: { id: 'e1', source_id: 'start', target_id: 'google' },
        sourceTitle: 'Start',
        targetTitle: 'Google Search',
        edgeUpstreamSchema: { type: 'object', properties: { query: { type: 'string' } } },
        edgeDownstreamSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
      },
    })

    expect(wrapper.get('.wf-edge-route').text()).toContain('Start')
    expect(wrapper.get('.wf-edge-route').text()).toContain('Google Search')
    expect(wrapper.get('.field-mapper-stub').attributes()).toHaveProperty('data-simple')
    expect(wrapper.find('[aria-label="Condition field"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Advanced routing')
    expect(wrapper.text()).not.toContain('Rare one-way filter')
  })

  it('refuses a late assist result after the inspector switches to another edge', async () => {
    let resolveAssist!: (value: { transform: string }) => void
    assistEdgeMapping.mockImplementationOnce(() => new Promise((resolve) => { resolveAssist = resolve }))
    const wrapper = mount(EdgePanel, {
      props: {
        workflowId: 'wf-1',
        edge: { id: 'edge-a', source_id: 'start', target_id: 'search' },
      },
    })

    await wrapper.get('.assist-stub').trigger('click')
    await flushPromises()
    await wrapper.setProps({ edge: { id: 'edge-b', source_id: 'start', target_id: 'finish' } })
    resolveAssist({ transform: '{ query: output.query }' })
    await flushPromises()

    expect(wrapper.emitted('update-edge')).toBeUndefined()
  })
})

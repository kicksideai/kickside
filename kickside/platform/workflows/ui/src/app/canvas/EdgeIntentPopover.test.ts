// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const assistEdgeIntent = vi.hoisted(() => vi.fn())
vi.mock('@iconify/vue', () => ({ Icon: { props: ['icon'], template: '<i :data-icon="icon" />' } }))
vi.mock('../panels/assist', () => ({
  assistEdgeIntent,
  isEdgeIntentPreview: (value: unknown) => !!value && typeof value === 'object' && 'kind' in value,
}))
vi.mock('./use-overlay-measure', async () => {
  const { ref } = await import('vue')
  return { useOverlayMeasure: () => ({ overlayEl: ref(null) }) }
})

const EdgeIntentPopover = (await import('./EdgeIntentPopover.vue')).default
const edge = (id: string) => ({
  id,
  sourceId: 'start',
  targetId: 'search',
  sourceSchema: { type: 'object' },
  targetSchema: { type: 'object' },
  sourceRoot: 'output',
  sourceFailureAvailable: true,
  unresolved: [{ key: 'query', title: 'Query', reason: 'none' as const, candidates: [] }],
})
const availableSteps = [{ kind: 'branch', title: 'Condition' }, { kind: 'block', title: 'Wait for' }]

describe('EdgeIntentPopover request identity', () => {
  it('is a named non-modal region, focuses its PrimeVue input, and dismisses on Escape', async () => {
    const wrapper = mount(EdgeIntentPopover, { attachTo: document.body, props: { workflowId: 'wf-1', edge: edge('edge-a11y'), availableSteps } })
    await flushPromises()

    expect(wrapper.attributes('role')).toBe('region')
    expect(wrapper.attributes('aria-label')).toBe('Describe this connection')
    expect(document.activeElement).toBe(wrapper.get('.wf-intent-input').element)
    expect(wrapper.html()).toMatchSnapshot('editing connection intent')

    await wrapper.trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('dismiss')).toEqual([[]])
    wrapper.unmount()
  })

  it('drops an old draft when the popover is reused for another edge', async () => {
    let resolveAssist!: (value: { kind: 'mapping'; transform: string; summary: string }) => void
    assistEdgeIntent.mockImplementationOnce(() => new Promise((resolve) => { resolveAssist = resolve }))
    const wrapper = mount(EdgeIntentPopover, { props: { workflowId: 'wf-1', edge: edge('edge-a'), availableSteps } })
    await wrapper.get('.wf-intent-input').setValue('send the query')
    await wrapper.get('.wf-intent-submit').trigger('click')
    await wrapper.setProps({ edge: edge('edge-b') })
    resolveAssist({ kind: 'mapping', transform: '{ query: output.query }', summary: 'Map query.' })
    await flushPromises()

    expect(wrapper.find('.wf-intent-rows').exists()).toBe(false)
    expect(wrapper.get('.wf-intent-input').attributes('disabled')).toBeUndefined()
    expect(wrapper.emitted('accept')).toBeUndefined()
  })

  it('previews a canonical Condition before emitting the graph action', async () => {
    assistEdgeIntent.mockResolvedValueOnce({ kind: 'condition', predicate: 'output.approved == true', summary: 'Continue when approved.' })
    const wrapper = mount(EdgeIntentPopover, { props: { workflowId: 'wf-1', edge: edge('edge-condition'), availableSteps } })
    await wrapper.get('.wf-intent-input').setValue('only continue if the result is approved')
    await wrapper.get('.wf-intent-submit').trigger('click')
    await flushPromises()
    expect(assistEdgeIntent).toHaveBeenCalledWith(
      'wf-1', expect.objectContaining({ source_id: 'start', target_id: 'search' }),
      { type: 'object' }, { type: 'object' }, 'only continue if the result is approved',
      true, availableSteps, {}, expect.any(AbortSignal),
    )
    expect(wrapper.text()).toContain('Add a Condition?')
    expect(wrapper.text()).toContain('output.approved == true')
    expect(wrapper.text()).not.toContain('Open mapper')
    expect(wrapper.emitted('accept')).toBeUndefined()
    expect(wrapper.html()).toMatchSnapshot('validated condition preview')
    await wrapper.get('.wf-intent-submit').trigger('click')
    expect(wrapper.emitted('accept')?.[0]?.[0]).toMatchObject({ kind: 'condition', predicate: 'output.approved == true' })
  })

  it('keeps insert-node as a declared palette suggestion with no direct mutation', async () => {
    assistEdgeIntent.mockResolvedValueOnce({ kind: 'insert_node', block_id: 'signal', block_title: 'Wait for', summary: 'Wait for a signal.' })
    const wrapper = mount(EdgeIntentPopover, { props: { workflowId: 'wf-1', edge: edge('edge-insert'), availableSteps } })
    await wrapper.get('.wf-intent-input').setValue('ask someone to approve this')
    await wrapper.get('.wf-intent-submit').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Wait for')
    await wrapper.get('.wf-intent-submit').trigger('click')
    expect(wrapper.emitted('suggest-node')).toEqual([['signal']])
    expect(wrapper.emitted('accept')).toBeUndefined()
  })
})

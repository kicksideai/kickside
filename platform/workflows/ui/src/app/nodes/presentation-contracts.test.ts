// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('@iconify/vue', () => ({ Icon: { props: ['icon'], template: '<i :data-icon="icon" />' } }))
vi.mock('@vue-flow/core', () => ({
  Position: { Top: 'top', Bottom: 'bottom', Left: 'left', Right: 'right' },
  Handle: { inheritAttrs: true, props: ['id', 'type', 'position'], template: '<span class="vue-flow__handle" v-bind="$attrs" />' },
}))
const ContainerNode = (await import('./ContainerNode.vue')).default
const WorkflowNode = (await import('./WorkflowNode.vue')).default

describe('node presentation contracts', () => {
  it('uses For each instead of the retired Parallel name', () => {
    const wrapper = mount(ContainerNode, { props: { data: { kind: 'for_each', label: 'For each', icon: 'tabler:x' } } })
    expect(wrapper.text()).toContain('For each')
    expect(wrapper.text()).not.toContain('Parallel')
  })

  it('exposes named output and Failed labels to assistive tech', () => {
    const wrapper = mount(WorkflowNode, { props: { data: {
      kind: 'block', kindLabel: 'Block', title: 'Review lead', ref: 'test.blocks:review', icon: 'tabler:inbox', hueVar: '--wf-rose',
      runStatus: 'idle', outPorts: [{ id: 'approved', label: 'Approved' }],
      failedPort: true, failedWired: true, pinned: false,
    } } })
    expect(wrapper.get('.wfn-portrow').attributes('aria-label')).toBe('Outputs')
    expect(wrapper.find('[aria-label="Connect from Approved"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Connect from Failed"]').exists()).toBe(true)
  })
})

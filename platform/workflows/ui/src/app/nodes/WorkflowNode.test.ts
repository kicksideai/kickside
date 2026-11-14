// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkflowNode from './WorkflowNode.vue'
import type { WfNodeData } from '../domain/graph-data'

vi.mock('@vue-flow/core', () => ({
  Position: { Top: 'top', Bottom: 'bottom', Left: 'left', Right: 'right' },
  Handle: { props: ['id', 'type', 'position'], template: '<span class="vue-flow__handle" :data-handleid="id" :data-handlepos="position" />' },
}))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<i />' } }))

function data(count: number, failedPort = false): WfNodeData {
  return {
    kind: 'block', kindLabel: 'Block', title: 'Many outcomes', ref: '', icon: 'tabler:test-pipe', hueVar: '--wf-violet',
    runStatus: 'idle', outPorts: Array.from({ length: count }, (_, i) => ({ id: `route_${i}`, label: `Route ${i}` })),
    failedPort, failedWired: failedPort, pinned: false,
  }
}

function defaultData(): WfNodeData {
  return {
    ...data(0),
    outPorts: [{ id: '', label: '' }],
  }
}

describe('WorkflowNode outcome grid', () => {
  it('renders the declared review wait state on an awaiting node', () => {
    const waiting = { ...defaultData(), runStatus: 'awaiting' as const }
    const wrapper = mount(WorkflowNode, { props: { data: waiting } })
    expect(wrapper.get('.wfn-await').text()).toBe('Waiting for review')
    expect(wrapper.get('.wfn').classes()).toContain('is-awaiting')
  })

  it('applies the canonical base dimensions to an unnamed default-port card', () => {
    const wrapper = mount(WorkflowNode, { props: { data: defaultData() } })
    const card = wrapper.get<HTMLElement>('.wfn')
    expect(card.element.style.width).toBe('216px')
    expect(card.element.style.minHeight).toBe('76px')
    expect(wrapper.find('.wfn-portrow').exists()).toBe(false)
    expect(wrapper.findAll('.vue-flow__handle')).toHaveLength(4)
  })

  it.each([
    [1, '216px', '76px', '1', '1', '196px', '20px'],
    [2, '216px', '76px', '2', '1', '95px', '20px'],
    [4, '294px', '76px', '4', '1', '64px', '20px'],
    [8, '294px', '102px', '4', '2', '64px', '46px'],
    [12, '294px', '128px', '4', '3', '64px', '72px'],
  ])('renders %i outcomes from the canonical grid variables', (count, width, height, columns, rows, cell, padding) => {
    const wrapper = mount(WorkflowNode, { props: { data: data(count as number) } })
    const style = wrapper.get('.wfn').attributes('style')
    expect(style).toContain(`width: ${width}`)
    expect(style).toContain(`min-height: ${height}`)
    expect(style).toContain(`--wfn-port-columns: ${columns}`)
    expect(style).toContain(`--wfn-port-rows: ${rows}`)
    expect(style).toContain(`--wfn-port-cell-width: ${cell}`)
    expect(style).toContain('--wfn-port-left: 10px')
    expect(style).toContain('--wfn-port-right: 10px')
    expect(style).toContain('--wfn-port-gap: 6px')
    expect(style).toContain('--wfn-port-min-width: 64px')
    expect(style).toContain(`padding-bottom: ${padding}`)
    expect(wrapper.findAll('.wfn-portslot')).toHaveLength(count as number)
    expect(wrapper.findAll('.wfn-portlabel').every((label) => label.attributes('title')?.startsWith('Route'))).toBe(true)
  })

  it('keeps a dedicated Failed gutter while wrapping twelve success routes to three columns', () => {
    const wrapper = mount(WorkflowNode, { props: { data: data(12, true) } })
    const style = wrapper.get('.wfn').attributes('style')
    expect(style).toContain('width: 258px')
    expect(style).toContain('min-height: 154px')
    expect(style).toContain('--wfn-port-columns: 3')
    expect(style).toContain('--wfn-port-rows: 4')
    expect(style).toContain('--wfn-port-right: 44px')
    expect(wrapper.get('.wfn-faillabel').text()).toBe('Failed')
  })
})

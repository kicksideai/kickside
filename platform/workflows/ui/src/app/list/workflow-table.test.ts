// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { ListItem } from './workflow-row'

vi.mock('../api/api', () => ({
  exportWorkflow: vi.fn(),
  humanError: (_error: unknown, fallback: string) => fallback,
  setWorkflowLabels: vi.fn(),
}))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span aria-hidden="true" />' } }))

const WorkflowTable = (await import('./WorkflowTable.vue')).default

const items: ListItem[] = [{
  kind: 'row',
  key: 'wf-1',
  row: {
    id: 'wf-1', title: 'Lead intake', steps: 3, runs: 2, labels: ['CRM'],
    location: { present: true, label: 'Sales', title: 'In Sales' },
    subline: '3 steps · 2 runs',
    status: { published: true, publishedVersion: 2, version: 'v2', hasDraft: false, label: 'v2', tone: 'published' },
    lastRun: { present: true, tone: 'ok', icon: 'tabler:circle-check', label: '2m ago', status: 'completed', cause: '', title: 'Completed · 2m ago' },
    updated: '1m ago',
  },
}]

describe('WorkflowTable row menu layer', () => {
  it('opens an owned menu layer outside the scrolling table', async () => {
    const wrapper = mount(WorkflowTable, { props: { items }, attachTo: document.body })
    const button = wrapper.get('.wf-row-menu-btn')

    await button.trigger('click')

    const menu = document.body.querySelector<HTMLElement>('.wf-row-menu')!
    expect(menu).not.toBeNull()
    expect(menu.getAttribute('role')).toBe('menu')
    expect(wrapper.find('.wf-table .wf-row-menu').exists()).toBe(false)
    expect(menu.textContent).toContain('Share')
    wrapper.unmount()
  })

  it('renders separators without clickable commands or labels', async () => {
    const wrapper = mount(WorkflowTable, { props: { items }, attachTo: document.body })
    await wrapper.get('.wf-row-menu-btn').trigger('click')
    const separators = document.body.querySelectorAll<HTMLElement>('.wf-row-menu [role="separator"]')
    expect(separators).toHaveLength(2)
    for (const separator of separators) {
      expect(separator.tagName).toBe('DIV')
      expect(separator.textContent).toBe('')
      expect(separator.hasAttribute('tabindex')).toBe(false)
      separator.click()
    }
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('ask-delete')).toBeUndefined()
    expect(wrapper.emitted('ask-share')).toBeUndefined()
    wrapper.unmount()
  })

  it('hands the row action button to dialog-owning menu commands', async () => {
    const item = items[0]
    if (item.kind !== 'row') throw new Error('expected the workflow fixture to be a row')
    const wrapper = mount(WorkflowTable, { props: { items }, attachTo: document.body })
    const button = wrapper.get('.wf-row-menu-btn')

    await button.trigger('click')
    const deleteItem = document.body.querySelector<HTMLElement>('.wf-row-menu-item--danger')!
    deleteItem.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('ask-delete')?.[0]).toEqual([item.row, button.element])
    wrapper.unmount()
  })
})

describe('WorkflowTable last run', () => {
  it('shows the recorded cause beside a failed last run', () => {
    const [base] = items
    if (base.kind !== 'row') throw new Error('fixture is a row')
    const failed: ListItem[] = [{
      ...base,
      row: {
        ...base.row,
        lastRun: { present: true, tone: 'error', icon: 'tabler:alert-triangle', label: '5m ago', status: 'failed',
          cause: 'Northwind stock is missing', title: 'Failed · 5m ago · Northwind stock is missing' },
      },
    }]
    const wrapper = mount(WorkflowTable, { props: { items: failed } })
    const cause = wrapper.get('.wf-lastrun .wf-last-run-cause')
    expect(cause.text()).toBe('Northwind stock is missing')
    expect(cause.attributes('title')).toBe('Northwind stock is missing')
    wrapper.unmount()
  })

  it('renders no cause element for a successful last run', () => {
    const wrapper = mount(WorkflowTable, { props: { items } })
    expect(wrapper.find('.wf-last-run-cause').exists()).toBe(false)
    wrapper.unmount()
  })
})

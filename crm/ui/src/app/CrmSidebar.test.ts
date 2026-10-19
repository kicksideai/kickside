// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { CrmObject } from '../crm-types'

const countRecords = vi.fn()
const mergeReviews = vi.fn()

vi.mock('../crm-api', () => ({
  countRecords: (...args: unknown[]) => countRecords(...args),
  mergeReviews: (...args: unknown[]) => mergeReviews(...args),
}))
vi.mock('@iconify/vue', () => ({ Icon: { props: ['icon'], template: '<i :data-icon="icon" />' } }))

const CrmSidebar = (await import('./CrmSidebar.vue')).default
const objects: CrmObject[] = [{ type: 'person', label: 'People' }, { type: 'company', label: 'Companies' }]

function make(props: Record<string, unknown> = {}) {
  return mount(CrmSidebar, { props: { crmId: 'crm-1', objects, activeObject: 'person', workspaceLabel: 'GTM', canWrite: true, ...props } })
}

describe('CRM instrument rail', () => {
  beforeEach(() => {
    countRecords.mockReset(); mergeReviews.mockReset()
    countRecords.mockImplementation((_id: string, type: string) => Promise.resolve(type === 'person' ? 1284 : 42))
    mergeReviews.mockResolvedValue({ rows: [], total: 1, limit: 1, offset: 0 })
  })

  it('lists objects with live counts and the workspace label', async () => {
    const wrapper = make()
    await flushPromises()
    expect(wrapper.text()).toContain('People')
    expect(wrapper.text()).toContain('GTM')
    const counts = wrapper.findAll('.crm-rail-count').map((node) => node.text())
    expect(counts.some((text) => text.includes('1.3k'))).toBe(true)
    expect(counts).toContain('42')
  })

  it('badges the review queue from pending merge suggestions', async () => {
    const wrapper = make()
    await flushPromises()
    const review = wrapper.findAll('button').find((node) => node.text().includes('Needs review'))!
    expect(review.get('.crm-rail-badge').text()).toBe('1')
  })

  it('renders the single workspace as a non-interactive scope label', async () => {
    const wrapper = make()
    expect(wrapper.get('.crm-rail-scope').element.tagName).toBe('DIV')
    expect(wrapper.get('.crm-rail-scope').text()).toContain('GTM')
  })

  it('re-reads counts when the CRM data revision advances', async () => {
    const wrapper = make({ revision: 0 })
    await flushPromises()
    expect(wrapper.findAll('.crm-rail-count').map((node) => node.text())).toContain('42')
    countRecords.mockImplementation((_id: string, type: string) => Promise.resolve(type === 'person' ? 1284 : 50))
    await wrapper.setProps({ revision: 1 })
    await flushPromises()
    expect(wrapper.findAll('.crm-rail-count').map((node) => node.text())).toContain('50')
  })

  it('folds to read-only by removing mutation affordances', async () => {
    const wrapper = make({ canWrite: false })
    await flushPromises()
    expect(wrapper.findAll('button').some((node) => node.text().includes('New object'))).toBe(false)
  })
})

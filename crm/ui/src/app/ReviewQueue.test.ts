// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { CrmAttribute, CrmObject } from '../crm-types'

const mergeReviews = vi.fn()
const recordsByIds = vi.fn()
const navigate = vi.fn()

vi.mock('../crm-api', () => ({
  mergeReviews: (...args: unknown[]) => mergeReviews(...args),
  recordsByIds: (...args: unknown[]) => recordsByIds(...args),
  crmErrorMessage: (_error: unknown, fallback: string) => fallback,
}))
vi.mock('@wippy-fe/proxy', () => ({ host: { navigate: (...args: unknown[]) => navigate(...args) } }))
vi.mock('@iconify/vue', () => ({ Icon: { props: ['icon'], template: '<i :data-icon="icon" />' } }))

const ReviewQueue = (await import('./ReviewQueue.vue')).default
const objects: CrmObject[] = [{ type: 'person', label: 'People' }]
const attributes: CrmAttribute[] = [
  { object_type: 'person', attr: 'name', label: 'Name', data_type: 'text', config: { ui: { role: 'title' } } },
  { object_type: 'person', attr: 'email', label: 'Email', data_type: 'email', config: { ui: { role: 'subtitle' } } },
  { object_type: 'person', attr: 'title', label: 'Title', data_type: 'text' },
]

function make(props: Record<string, unknown> = {}) {
  return mount(ReviewQueue, { props: { crmId: 'crm-1', objects, attributes, canWrite: true, ...props } })
}

describe('CRM review queue', () => {
  beforeEach(() => {
    mergeReviews.mockReset(); recordsByIds.mockReset(); navigate.mockReset()
    mergeReviews.mockResolvedValue({ rows: [{ left_id: 'person:1', right_id: 'person:2', object_type: 'person', decision: 'pending', confidence: 0.93, reason: 'email_exact' }], total: 1, limit: 50, offset: 0 })
    recordsByIds.mockResolvedValue([
      { record_id: 'person:1', object_type: 'person', values: { name: 'Priya Example', email: 'priya@example.test' } },
      { record_id: 'person:2', object_type: 'person', values: { name: 'P. Example', email: 'priya@example.test' } },
    ])
  })

  it('reads merge suggestions and hydrates the side-by-side grid with confidence', async () => {
    const wrapper = make()
    await flushPromises()
    expect(mergeReviews).toHaveBeenCalledWith('crm-1', { limit: 50 })
    expect(recordsByIds).toHaveBeenCalledWith('crm-1', ['person:1', 'person:2'])
    const merge = wrapper.get('.crm-merge')
    expect(merge.text()).toContain('Priya Example')
    expect(merge.text()).toContain('P. Example')
    expect(merge.get('.crm-pill').text()).toContain('93%')
    expect(merge.find('.crm-meter.tone-high').exists()).toBe(true)
  })

  it('routes resolution to the review inbox rather than forking a decision', async () => {
    const wrapper = make()
    await flushPromises()
    await wrapper.findAll('button').find((node) => node.text().includes('Resolve in inbox'))!.trigger('click')
    expect(navigate).toHaveBeenCalledWith('/inbox')
  })

  it('disables resolution actions on a read-only workspace', async () => {
    const wrapper = make({ canWrite: false })
    await flushPromises()
    const resolve = wrapper.findAll('button').find((node) => node.text().includes('Resolve in inbox'))!
    expect(resolve.attributes('disabled')).toBeDefined()
  })
})

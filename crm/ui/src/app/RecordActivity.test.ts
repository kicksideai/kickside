// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { CrmActivity } from '../crm-types'
import { recordRoute } from '../crm-route'

const get = vi.fn()
const navigate = vi.fn()

vi.mock('@wippy-fe/proxy', () => ({
  api: { get: (...args: unknown[]) => get(...args) },
  host: { navigate: (...args: unknown[]) => navigate(...args) },
}))
vi.mock('@iconify/vue', () => ({ Icon: { props: ['icon'], template: '<i :data-icon="icon" />' } }))

const RecordActivity = (await import('./RecordActivity.vue')).default

function meeting(id: string, overrides: Record<string, unknown> = {}): CrmActivity {
  return {
    activity_id: `fireflies:${id}`,
    activity_type: 'meeting',
    occurred_at: '2026-08-05T19:30:00.000Z',
    source: 'fireflies',
    external_id: `fireflies:${id}`,
    payload: { title: `Call ${id}`, attendee_emails: ['sam.example@example.test', 'jules.example@example.test'] },
    ...overrides,
  } as CrmActivity
}

function make(activities: CrmActivity[], props: Record<string, unknown> = {}) {
  return mount(RecordActivity, { props: { activities, selfEmail: 'jules.example@example.test', ...props } })
}

function meetingsPage(pairs: Array<[string, string]>) {
  return { data: { success: true, items: pairs.map(([reference, meetingId]) => ({ meeting_id: meetingId, refs: [{ system: 'fireflies', external_id: reference }] })) } }
}

describe('record activity timeline', () => {
  beforeEach(() => {
    get.mockReset(); navigate.mockReset()
    get.mockResolvedValue(meetingsPage([]))
  })

  it('asks the meetings API for the bare external references of the meetings on screen', async () => {
    const wrapper = make([meeting('A'), meeting('B')])
    await flushPromises()
    expect(get).toHaveBeenCalledTimes(1)
    expect(get).toHaveBeenCalledWith('/api/v1/meetings?limit=2&external_ids=A%2CB')
    wrapper.unmount()
  })

  it('never asks about meetings when the chronology holds none', async () => {
    const wrapper = make([{ activity_id: 'n1', activity_type: 'note', payload: { title: 'Left a note' } } as CrmActivity])
    await flushPromises()
    expect(get).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Left a note')
    wrapper.unmount()
  })

  it('links a resolved meeting to its own page and leaves an unresolved one with no way in', async () => {
    get.mockResolvedValueOnce(meetingsPage([['A', 'm-1']]))
    const wrapper = make([meeting('A'), meeting('B')])
    await flushPromises()
    const rows = wrapper.findAll('.crm-timeline-row')
    expect(rows).toHaveLength(2)
    expect(rows[0].element.tagName).toBe('A')
    expect(rows[0].attributes('href')).toBe('/meetings/m-1')
    expect(rows[1].element.tagName).toBe('DIV')
    expect(rows[1].attributes('href')).toBeUndefined()
    expect(wrapper.find('[data-test="link-error"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('hands a plain click on a linked row to the workbench router', async () => {
    get.mockResolvedValueOnce(meetingsPage([['A', 'm-1']]))
    const wrapper = make([meeting('A')])
    await flushPromises()
    await wrapper.find('.crm-timeline-row').trigger('click', { button: 0 })
    expect(navigate).toHaveBeenCalledWith('/meetings/m-1')
    wrapper.unmount()
  })

  it('leaves a modified click to the browser so the link opens in a new tab', async () => {
    get.mockResolvedValueOnce(meetingsPage([['A', 'm-1']]))
    const wrapper = make([meeting('A')])
    await flushPromises()
    await wrapper.find('.crm-timeline-row').trigger('click', { button: 0, metaKey: true })
    expect(navigate).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  // A failed lookup has not found that the viewer lacks access, and must not be
  // rendered as the silence that finding produces.
  it('reports a failed lookup instead of showing it as unshared meetings', async () => {
    get.mockRejectedValueOnce(new Error('meetings service unavailable'))
    const wrapper = make([meeting('A')])
    await flushPromises()
    const notice = wrapper.find('[data-test="link-error"]')
    expect(notice.exists()).toBe(true)
    expect(notice.text()).toContain('meetings service unavailable')
    expect(wrapper.find('.crm-timeline-row').element.tagName).toBe('DIV')
    wrapper.unmount()
  })

  it('reports a refusal envelope from the meetings API as a failure, not as absence', async () => {
    get.mockResolvedValueOnce({ data: { success: false, error: 'meetings are not installed' } })
    const wrapper = make([meeting('A')])
    await flushPromises()
    expect(wrapper.find('[data-test="link-error"]').text()).toContain('meetings are not installed')
    wrapper.unmount()
  })

  it('splits a chronology longer than one meetings page into bounded batches', async () => {
    const rows = Array.from({ length: 120 }, (_, index) => meeting(`X${index}`))
    const wrapper = make(rows)
    await flushPromises()
    expect(get).toHaveBeenCalledTimes(2)
    expect(get.mock.calls[0][0]).toContain('limit=100')
    expect(get.mock.calls[1][0]).toContain('limit=20')
    wrapper.unmount()
  })

  it('shows what each row was, not a bare title and date', async () => {
    const wrapper = make([meeting('A', { duration_sec: 2700, has_transcript: true, outcome: 'COMPLETED' })])
    await flushPromises()
    const row = wrapper.find('.crm-timeline-row')
    expect(row.text()).toContain('Call A')
    expect(row.text()).toContain('Meeting')
    expect(row.text()).toContain('45 min')
    expect(row.text()).toContain('Completed')
    expect(row.text()).toContain('Transcript')
    // Who it was with, minus the record whose page this is.
    expect(row.text()).toContain('Sam Example')
    expect(row.text()).not.toContain('Jules Example')
    // No identifiers reach the reader.
    expect(row.text()).not.toContain('fireflies')
    expect(row.text()).not.toContain('COMPLETED')
    wrapper.unmount()
  })

  it('counts the history in the words of what it holds', async () => {
    const one = make([meeting('A')])
    await flushPromises()
    expect(one.text()).toContain('1 meeting')
    one.unmount()
    const many = make([meeting('A'), meeting('B'), { activity_id: 'e1', activity_type: 'email' } as CrmActivity])
    await flushPromises()
    expect(many.text()).toContain('3 entries')
    many.unmount()
  })

  it('offers earlier activity only when more may exist', async () => {
    const wrapper = make([meeting('A')], { hasMore: true })
    await flushPromises()
    await wrapper.find('.crm-timeline-more').trigger('click')
    expect(wrapper.emitted('more')).toHaveLength(1)
    wrapper.unmount()
    const done = make([meeting('A')])
    await flushPromises()
    expect(done.find('.crm-timeline-more').exists()).toBe(false)
    done.unmount()
  })

  it('shows an empty history as nothing rather than as a warning', async () => {
    const wrapper = make([])
    await flushPromises()
    expect(wrapper.findAll('.crm-timeline-row')).toHaveLength(0)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Nothing has been logged')
    wrapper.unmount()
  })

  // The header line counts a history. With nothing to count it has nothing to
  // say, and saying it anyway states the emptiness twice in two inches.
  it('states an empty history once', async () => {
    const wrapper = make([])
    await flushPromises()
    expect(wrapper.find('.crm-card-head p').exists()).toBe(false)
    expect(wrapper.findAll('.crm-empty-copy')).toHaveLength(1)
    wrapper.unmount()
  })
})

// A company holds no call of its own: its history is its people's calls and its
// deals' meetings, rolled up one relation hop. A rolled-up row must say which
// record it belongs to, or the chronology reads as the company's own.
describe('a chronology gathered from connected records', () => {
  beforeEach(() => {
    get.mockReset(); navigate.mockReset()
    get.mockResolvedValue(meetingsPage([]))
  })

  const names = {
    'person:ada': { name: 'Ada Example', type: 'person' },
    'deal:renewal': { name: 'Acme renewal', type: 'deal' },
  }

  it('names the record a rolled-up row belongs to and routes to it', async () => {
    const wrapper = make([meeting('A', { record_id: 'person:ada' })], { recordId: 'company:acme', names })
    await flushPromises()
    const anchor = wrapper.find('[data-test="activity-anchor"]')
    expect(anchor.exists()).toBe(true)
    expect(anchor.text()).toContain('Ada Example')
    await anchor.find('button').trigger('click')
    expect(wrapper.emitted('navigate')).toEqual([[recordRoute('person', 'person:ada')]])
    wrapper.unmount()
  })

  it('says nothing about the record a row belongs to when it is the record being read', async () => {
    const wrapper = make([meeting('A', { record_id: 'company:acme' })], { recordId: 'company:acme', names })
    await flushPromises()
    expect(wrapper.find('[data-test="activity-anchor"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('names a record it has no name for by what kind of record it is', async () => {
    const wrapper = make([meeting('A', { record_id: 'deal:8f2c1a3e-1111-4222-8333-444455556666' })], { recordId: 'company:acme', names })
    await flushPromises()
    const anchor = wrapper.find('[data-test="activity-anchor"]')
    expect(anchor.text()).toContain('Deal')
    expect(anchor.find('button').exists()).toBe(false)
    wrapper.unmount()
  })

  it('reads out a note body and where the row came from', async () => {
    const note = {
      activity_id: 'hubspot:note:1',
      activity_type: 'note',
      occurred_at: '2026-08-05T19:30:00.000Z',
      source: 'hubspot',
      payload: { title: 'Scoping call recap', body: 'Agreed on a two-week discovery.' },
    } as CrmActivity
    const wrapper = make([note], { recordId: 'deal:renewal', names })
    await flushPromises()
    expect(wrapper.find('[data-test="activity-source"]').text()).toContain('Hubspot')
    const details = wrapper.find('[data-test="activity-details"]')
    expect(details.exists()).toBe(true)
    expect(details.text()).toContain('Agreed on a two-week discovery.')
    wrapper.unmount()
  })

  it('offers no detail disclosure when the payload says nothing the row has not said', async () => {
    const wrapper = make([meeting('A')], { recordId: 'company:acme', names })
    await flushPromises()
    expect(wrapper.find('[data-test="activity-details"]').exists()).toBe(false)
    wrapper.unmount()
  })
})

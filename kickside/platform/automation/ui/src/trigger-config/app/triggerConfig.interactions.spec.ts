import { describe, expect, it, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { api } from '@wippy-fe/proxy'
import Select from 'primevue/select'
import PickerSelect from '@widgets/app/PickerSelect.vue'
import TriggerConfig from './TriggerConfig.vue'
import type { SourceRow } from '../spec'

// Host-surface tests: seeding, section visibility by resolution, and the
// change event contract { spec, valid, error? }. Emits are captured through a
// file-local useEvents mock; inner web components are inert defined elements
// whose events are dispatched by hand (the WcMount forwarding seam).

vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => ({ value: (globalThis as any).__props__ }),
  useEvents: () => (name: string, detail?: unknown) => {
    ;((globalThis as any).__emits__ as Array<[string, unknown]>).push([name, detail])
  },
}))

for (const tag of ['wc-schema-form', 'wc-component-picker', 'wc-connection-picker', 'kickside-webhook-detail']) {
  if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {})
}

const WATCH_SOURCE = 'kickside.webhooks:webhook'
const POLL_SOURCE = 'providers.fireflies:transcripts'
const ACME_SOURCE = 'providers.acme:mailbox'
const MULTI_EVENT_SOURCE = 'kickside.inbox:inbox'
const WEBHOOK_OUTPUT_SCHEMA = { type: 'object', properties: { payload: { type: 'object' } } }
const CATALOG: SourceRow[] = [
  {
    id: WATCH_SOURCE, surface: 'events', event: 'kickside.webhooks.events:webhook.inbound',
    class: 'kickside.webhooks', title: 'Webhook event received', group: 'Webhooks',
    config_schema: { thread_id: { picker: 'wc-component-picker', title: 'Webhook', detail: 'kickside-webhook-detail' } },
    output_schema: WEBHOOK_OUTPUT_SCHEMA,
  },
  {
    id: POLL_SOURCE, surface: 'collection', class: 'providers.fireflies', title: 'Fireflies transcripts',
    group: 'Fireflies',
    config_schema: {
      connection_id: { picker: 'wc-connection-picker', title: 'Connection' },
      content_scope: { type: 'string', title: 'Content scope' },
    },
  },
  { id: ACME_SOURCE, surface: 'events', event: 'providers.acme.events:mail.received', class: 'providers.acme', title: 'Mail received' },
  { id: MULTI_EVENT_SOURCE, surface: 'events', event: 'kickside.inbox.events:item.created', class: 'kickside.inbox', title: 'Inbox item created' },
  { id: MULTI_EVENT_SOURCE, surface: 'events', event: 'kickside.inbox.events:item.updated', class: 'kickside.inbox', title: 'Inbox item updated' },
]

function changes(): Array<{ spec: Record<string, unknown>; valid: boolean; error?: string; output_schema?: unknown }> {
  return ((globalThis as any).__emits__ as Array<[string, unknown]>)
    .filter(([n]) => n === 'change')
    .map(([, d]) => d as { spec: Record<string, unknown>; valid: boolean; error?: string; output_schema?: unknown })
}
function lastChange() {
  const all = changes()
  return all[all.length - 1]
}
function emitted(name: string): unknown[] {
  return ((globalThis as any).__emits__ as Array<[string, unknown]>).filter(([n]) => n === name).map(([, d]) => d)
}

async function openPicker(w: ReturnType<typeof mount>) {
  await pickerSelect(w).get('[role="combobox"]').trigger('click')
  await flushPromises()
}
function pickerSelect(w: ReturnType<typeof mount>) {
  const comp = w.findComponent(PickerSelect)
  expect(comp.exists(), 'source PickerSelect').toBe(true)
  return comp
}
function pickerOptions(w: ReturnType<typeof mount>) {
  return pickerSelect(w).props('items')
}
function pickerTitles(w: ReturnType<typeof mount>) {
  return pickerOptions(w).map(option => option.title)
}
async function pick(w: ReturnType<typeof mount>, title: string) {
  await openPicker(w)
  const opt = pickerSelect(w).findAll('[role="option"]').find(option => option.text().includes(title))
  expect(opt, `picker option "${title}"`).toBeTruthy()
  await opt!.trigger('click')
  await flushPromises()
}
function dispatch(w: ReturnType<typeof mount>, selector: string, event: string, detail: unknown) {
  const el = w.element.querySelector(selector)
  expect(el, `mounted element ${selector}`).toBeTruthy()
  el!.dispatchEvent(new CustomEvent(event, { detail }))
}
// The unit/preset/weekday/history choosers are now PrimeVue Selects (they render a
// <div>, so native setValue()/.element.value no longer apply). data-test lands on
// the Select root (ptmi merges $attrs), so match it against the mounted Select
// components. Driving a selection emits the same pair PrimeVue emits on pick:
// update:modelValue (updates the v-model / :model-value binding) and change (the
// event the schedule fields listen on to re-derive the spec).
function selectByTest(w: ReturnType<typeof mount>, test: string) {
  const el = w.find(`[data-test="${test}"]`).element
  const comp = w.findAllComponents(Select).find(c => c.element === el)
  expect(comp, `Select [data-test="${test}"]`).toBeTruthy()
  return comp!
}
function selectValue(w: ReturnType<typeof mount>, test: string): unknown {
  return selectByTest(w, test).props('modelValue')
}
async function setSelect(w: ReturnType<typeof mount>, test: string, value: string) {
  const comp = selectByTest(w, test)
  comp.vm.$emit('update:modelValue', value)
  comp.vm.$emit('change', { value })
  await nextTick()
  await flushPromises()
}
async function setPeriodic(w: ReturnType<typeof mount>, n: number, unit: string) {
  await w.find('[data-test="tc-periodic-n"]').setValue(String(n))
  await setSelect(w, 'tc-periodic-unit', unit)
}
async function enableSpecificTimes(w: ReturnType<typeof mount>) {
  await w.find('[data-test="tc-specific-toggle"]').setValue(true)
  await flushPromises()
}
async function choosePeriodic(w: ReturnType<typeof mount>) {
  await w.find('[data-test="tc-specific-toggle"]').setValue(false)
  await flushPromises()
}

beforeEach(() => {
  ;(globalThis as any).__props__ = {}
  ;(globalThis as any).__emits__ = []
  ;(globalThis as any).__api__ = {
    '/api/v1/automations/sources': { success: true, sources: CATALOG },
  }
})

describe('catalog offering', () => {
  it('offers "On a schedule" plus sources grouped by port id, and reports load + initial state', async () => {
    const w = mount(TriggerConfig)
    await flushPromises()
    expect(emitted('load')).toHaveLength(1)
    expect(lastChange()).toMatchObject({ valid: false, error: 'Pick when this runs.' })
    const titles = pickerTitles(w)
    expect(titles.some(t => t.includes('On a schedule'))).toBe(true)
    expect(titles.some(t => t.includes('Webhook event received'))).toBe(true)
    // A port's two event rows fold into ONE catalog entry (titled by the first row).
    expect(titles.filter(t => t.includes('Inbox item created')).length).toBe(1)
    expect(titles.some(t => t.includes('Inbox item updated'))).toBe(false)
    w.unmount()
  })

  it('allowed="timer" preselects the schedule family and never fetches the catalog', async () => {
    ;(globalThis as any).__props__ = { allowed: 'timer', value: { v: 2 } }
    ;(api.get as any).mockClear()
    const w = mount(TriggerConfig)
    await flushPromises()
    const sourceCalls = (api.get as any).mock.calls.filter((c: unknown[]) => String(c[0]).includes('/automations/sources'))
    expect(sourceCalls).toHaveLength(0)
    expect(w.find('[data-test="tc-schedule"]').exists()).toBe(true)
    expect(lastChange()).toMatchObject({ spec: { v: 2 }, valid: false })
    await choosePeriodic(w)
    await setPeriodic(w, 45, 'm')
    expect(lastChange()).toMatchObject({
      spec: { v: 2, schedule: { type: 'ticker', expression: '45m' } },
      valid: true,
    })
    w.unmount()
  })

  it('a source-only editor whose catalog offers nothing shows an explicit empty state', async () => {
    ;(globalThis as any).__props__ = { allowed: 'source' }
    ;(globalThis as any).__api__ = { '/api/v1/automations/sources': { success: true, sources: [] } }
    const w = mount(TriggerConfig)
    await flushPromises()
    // No offered source and no synthetic schedule row: an empty picker alone would
    // read as broken, so the empty state names the situation in plain words.
    expect(w.find('[data-test="tc-catalog-empty"]').exists()).toBe(true)
    w.unmount()
  })

  it('a timer-or-source editor with an empty catalog still offers the schedule row (no empty state)', async () => {
    ;(globalThis as any).__api__ = { '/api/v1/automations/sources': { success: true, sources: [] } }
    const w = mount(TriggerConfig)
    await flushPromises()
    expect(w.find('[data-test="tc-catalog-empty"]').exists()).toBe(false)
    expect(pickerTitles(w).some(title => title.includes('On a schedule'))).toBe(true)
    w.unmount()
  })

  it('allowed="source" hides the synthetic schedule row; source-classes narrows the offering', async () => {
    ;(globalThis as any).__props__ = { allowed: 'source', sourceClasses: 'providers.acme' }
    const w = mount(TriggerConfig)
    await flushPromises()
    const titles = pickerTitles(w)
    expect(titles.some(t => t.includes('On a schedule'))).toBe(false)
    expect(titles.some(t => t.includes('Mail received'))).toBe(true)
    expect(titles.some(t => t.includes('Webhook event received'))).toBe(false)
    w.unmount()
  })

  it('does not synthesize cadence for a fresh timer', async () => {
    ;(globalThis as any).__props__ = { allowed: 'timer' }
    const w = mount(TriggerConfig)
    await flushPromises()
    expect(lastChange()).toMatchObject({
      spec: { v: 2 },
      valid: false,
    })
    w.unmount()
  })
})

describe('mode-resolved sections', () => {
  it('an events source shows the live note, instance picker, and History (no schedule)', async () => {
    ;(globalThis as any).__props__ = { value: { v: 2 } }
    const w = mount(TriggerConfig)
    await flushPromises()
    await pick(w, 'Webhook event received')
    expect(w.find('[data-test="tc-live-note"]').exists()).toBe(true)
    expect(w.find('[data-test="tc-schedule"]').exists()).toBe(false)
    // Events sources show History: the cursor start position on the thread.
    expect(w.find('[data-test="tc-history"]').exists()).toBe(true)
    // History is an owner choice and remains unset until selected. It offers
    // only the two anchor positions — no time boundary on an events source.
    expect(selectValue(w, 'tc-history-kind')).toBe(null)
    const optionValues = (selectByTest(w, 'tc-history-kind').props('options') as Array<{ value: string }>).map(o => o.value)
    expect(optionValues).toEqual(['all', 'none'])
    expect(lastChange()).toMatchObject({ valid: false, error: 'History is required for this source — choose all or only new.' })
    // Declared instance gate, labeled by the field's own title.
    expect(lastChange()).toMatchObject({ valid: false, error: 'History is required for this source — choose all or only new.' })
    dispatch(w, 'wc-component-picker', 'config-changed', { thread_id: 'th-1' })
    await flushPromises()
    expect(lastChange()).toMatchObject({ valid: false, error: 'History is required for this source — choose all or only new.' })
    await setSelect(w, 'tc-history-kind', 'none')
    expect(lastChange()).toMatchObject({
      spec: { v: 2, source: WATCH_SOURCE, config: { thread_id: 'th-1' }, backfill: 'none' },
      valid: true,
      output_schema: WEBHOOK_OUTPUT_SCHEMA,
    })
    // Opting into full history replays the thread from the start.
    await setSelect(w, 'tc-history-kind', 'all')
    expect(lastChange().spec.backfill).toBe('all')
    // "All" is selected: the hint must not still claim it starts from now — it
    // truthfully says the thread history replays first, then continues live.
    const allHint = w.find('[data-test="tc-history-hint"]').text()
    expect(allHint).toMatch(/replays/i)
    expect(allHint).not.toContain('starts from now')
    // The field-declared detail view mounts once an instance is picked.
    expect(w.element.querySelector('kickside-webhook-detail')).toBeTruthy()
    w.unmount()
  })

  it('a pullable source requires explicit How often and History choices', async () => {
    ;(globalThis as any).__props__ = { value: { v: 2 } }
    const w = mount(TriggerConfig)
    await flushPromises()
    await pick(w, 'Fireflies transcripts')
    expect((w.find('[data-test="tc-periodic-n"]').element as HTMLInputElement).value).toBe('0')
    expect(selectValue(w, 'tc-periodic-unit')).toBe('m')
    expect(w.find('[data-test="tc-history"]').exists()).toBe(true)
    expect(lastChange()).toMatchObject({ valid: false, error: 'History is required for this source — choose all, only new, a number of days, or a start date.' })
    dispatch(w, 'wc-connection-picker', 'config-changed', { connection_id: 'c-1' })
    await flushPromises()
    expect(lastChange()).toMatchObject({ valid: false, error: 'History is required for this source — choose all, only new, a number of days, or a start date.' })
    await choosePeriodic(w)
    await setPeriodic(w, 30, 'm')
    expect(lastChange()).toMatchObject({ valid: false, error: 'History is required for this source — choose all, only new, a number of days, or a start date.' })
    await setSelect(w, 'tc-history-kind', 'all')
    expect(lastChange()).toMatchObject({
      spec: {
        v: 2,
        source: POLL_SOURCE,
        config: { connection_id: 'c-1' },
        schedule: { type: 'ticker', expression: '30m' },
        backfill: 'all',
      },
      valid: true,
    })
    // History semantics: Last N days -> { last_days }, Since -> { since ISO }.
    await setSelect(w, 'tc-history-kind', 'last_days')
    expect(lastChange().spec.backfill).toBeUndefined()
    const days = w.find('[data-test="tc-history-days"]')
    await days.setValue('7')
    await days.trigger('change')
    await flushPromises()
    expect(lastChange().spec.backfill).toEqual({ last_days: 7 })
    await setSelect(w, 'tc-history-kind', 'since')
    const since = w.find('[data-test="tc-history-since"]')
    await since.setValue('2026-06-01')
    await since.trigger('change')
    await flushPromises()
    expect(lastChange().spec.backfill).toEqual({ since: new Date('2026-06-01').toISOString() })
    w.unmount()
  })

  it('ignores the retired schedule type allowlist prop', async () => {
    ;(globalThis as any).__props__ = { 'allowed-schedule-types': 'interval,ticker,cron', value: { v: 2 } }
    const w = mount(TriggerConfig)
    await flushPromises()
    await pick(w, 'Fireflies transcripts')
    expect(w.element.querySelector('wc-schedule-picker')).toBeNull()
    expect(lastChange().spec.schedule).toBeUndefined()
    w.unmount()
  })

  it('derives cron expressions from specific-time presets', async () => {
    ;(globalThis as any).__props__ = { allowed: 'timer', value: { v: 2 } }
    const w = mount(TriggerConfig)
    await flushPromises()
    await setSelect(w, 'tc-cron-preset', 'daily')
    await w.find('[data-test="tc-cron-time"]').setValue('09:15')
    await flushPromises()
    expect(lastChange().spec.schedule).toEqual({ type: 'cron', expression: '15 9 * * *' })

    await setSelect(w, 'tc-cron-preset', 'weekdays')
    await w.find('[data-test="tc-cron-time"]').setValue('08:00')
    await flushPromises()
    expect(lastChange().spec.schedule).toEqual({ type: 'cron', expression: '0 8 * * 1-5' })

    await setSelect(w, 'tc-cron-preset', 'weekly')
    await setSelect(w, 'tc-cron-weekday', '3')
    expect(lastChange().spec.schedule).toEqual({ type: 'cron', expression: '0 8 * * 3' })

    await setSelect(w, 'tc-cron-preset', 'monthly')
    await w.find('[data-test="tc-cron-monthday"]').setValue('12')
    await flushPromises()
    expect(lastChange().spec.schedule).toEqual({ type: 'cron', expression: '0 8 12 * *' })
    w.unmount()
  })

  it('passes a custom cron expression through unchanged', async () => {
    ;(globalThis as any).__props__ = { allowed: 'timer', value: { v: 2 } }
    const w = mount(TriggerConfig)
    await flushPromises()
    await enableSpecificTimes(w)
    await setSelect(w, 'tc-cron-preset', 'custom')
    await w.find('[data-test="tc-custom-cron"]').setValue('*/17 6-18 * * 1,3,5')
    await flushPromises()
    expect(lastChange().spec.schedule).toEqual({ type: 'cron', expression: '*/17 6-18 * * 1,3,5' })
    w.unmount()
  })

  it('the Advanced expression rides under filter.expr for an events source', async () => {
    const w = mount(TriggerConfig)
    await flushPromises()
    await pick(w, 'Webhook event received')
    dispatch(w, 'wc-component-picker', 'config-changed', { thread_id: 'th-1' })
    await flushPromises()
    await w.find('[data-test="tc-expr"]').setValue("item.status == 'open'")
    await w.find('[data-test="tc-expr"]').trigger('change')
    await flushPromises()
    expect(lastChange().spec.filter).toEqual({ expr: "item.status == 'open'" })
    w.unmount()
  })
})

describe('seeding + edit mode', () => {
  it('a non-empty value seeds every section and reports the seeded state', async () => {
    ;(globalThis as any).__props__ = {
      value: JSON.stringify({
        v: 2,
        source: POLL_SOURCE,
        config: { connection_id: 'c-9', content_scope: 'summary' },
        filter: { expr: 'item.ok' },
        schedule: { type: 'interval', expression: '1h' },
        backfill: { since: '2026-01-15T00:00:00.000Z' },
      }),
    }
    const w = mount(TriggerConfig)
    await flushPromises()
    expect(w.find('.kx-ps-val-label').text()).toContain('Fireflies transcripts')
    expect((w.find('[data-test="tc-periodic-n"]').element as HTMLInputElement).value).toBe('1')
    expect(selectValue(w, 'tc-periodic-unit')).toBe('h')
    expect(selectValue(w, 'tc-history-kind')).toBe('since')
    expect((w.find('[data-test="tc-history-since"]').element as HTMLInputElement).value).toBe('2026-01-15')
    expect((w.find('[data-test="tc-expr"]').element as HTMLTextAreaElement).value).toBe('item.ok')
    const c = lastChange()
    expect(c.valid).toBe(true)
    expect(c.spec).toMatchObject({
      source: POLL_SOURCE,
      config: { connection_id: 'c-9', content_scope: 'summary' },
      filter: { expr: 'item.ok' },
      schedule: { type: 'interval', expression: '1h' },
      backfill: { since: '2026-01-15T00:00:00.000Z' },
    })
    w.unmount()
  })

  it('a timer value seeds the schedule family', async () => {
    ;(globalThis as any).__props__ = { value: { v: 2, schedule: { type: 'cron', expression: '0 0 * * *' } } }
    const w = mount(TriggerConfig)
    await flushPromises()
    expect(w.find('.kx-ps-val-label').text()).toContain('On a schedule')
    expect((w.find('[data-test="tc-specific-toggle"]').element as HTMLInputElement).checked).toBe(true)
    expect(selectValue(w, 'tc-cron-preset')).toBe('daily')
    expect(lastChange()).toMatchObject({
      spec: { v: 2, schedule: { type: 'cron', expression: '0 0 * * *' } },
      valid: true,
    })
    w.unmount()
  })

  // The editor resolves a stored source against the whole catalog, not the offered
  // subset, so an id seeded from a stored spec never reads as unavailable while the
  // catalog still publishes it.
  it('a seeded source present in the catalog resolves without the unavailable warning', async () => {
    ;(globalThis as any).__props__ = {
      value: JSON.stringify({ v: 2, source: WATCH_SOURCE, config: { thread_id: 't-1' }, backfill: 'none' }),
      allowed: 'timer,source',
    }
    const w = mount(TriggerConfig)
    await flushPromises()

    expect(w.find('[data-test="tc-source-missing"]').exists()).toBe(false)
    expect(w.find('.kx-ps-val-label').text()).toContain('Webhook event received')
    expect(lastChange()).toMatchObject({ valid: true, spec: { source: WATCH_SOURCE } })
    w.unmount()
  })

  // A class filter narrows what the picker OFFERS; it must never make an already
  // stored source unresolvable.
  it('resolves a seeded source that the offered subset filters out', async () => {
    ;(globalThis as any).__props__ = {
      value: JSON.stringify({ v: 2, source: WATCH_SOURCE, config: { thread_id: 't-1' }, backfill: 'none' }),
      allowed: 'timer,source',
      sourceClasses: 'providers.acme',
    }
    const w = mount(TriggerConfig)
    await flushPromises()

    // Resolution reads the whole catalog, so the stored source stays valid even
    // though the picker would not have offered it.
    expect(w.find('[data-test="tc-source-missing"]').exists()).toBe(false)
    expect(lastChange()).toMatchObject({ valid: true, spec: { source: WATCH_SOURCE } })
    w.unmount()
  })

  it('a seeded source missing from the catalog renders the explicit unavailable state', async () => {
    ;(globalThis as any).__props__ = { value: { v: 2, source: 'gone:source' } }
    const w = mount(TriggerConfig)
    await flushPromises()
    expect(w.find('[data-test="tc-source-missing"]').exists()).toBe(true)
    expect(lastChange()).toMatchObject({ valid: false, error: 'This source is not available.' })
    w.unmount()
  })

  it('reconfigure locks structural fields but keeps the cadence editable', async () => {
    ;(globalThis as any).__props__ = {
      reconfigure: 'true',
      value: { v: 2, source: POLL_SOURCE, config: { connection_id: 'c-1' }, schedule: { type: 'interval', expression: '1h' }, backfill: 'all' },
    }
    const w = mount(TriggerConfig)
    await flushPromises()
    // Locked "When" renders as a plain value — no select chrome, no caret on a
    // control the operator can't open.
    expect(w.find('[data-test="tc-when-locked"]').exists()).toBe(true)
    expect(w.find('[data-test="tc-when-locked"]').text()).toContain('Fireflies transcripts')
    expect(w.findComponent(PickerSelect).exists()).toBe(false)
    expect(w.find('[data-test="tc-instance"]').classes()).toContain('kx-tc-locked')
    expect(w.find('[data-test="tc-history-locked"]').text()).toBe('All')
    expect(w.find('[data-test="tc-history"]').classes()).toContain('kx-tc-locked')
    expect(w.find('[data-test="tc-schedule"]').classes()).not.toContain('kx-tc-locked')
    expect((w.find('[data-test="tc-periodic-n"]').element as HTMLInputElement).disabled).toBe(false)
    await setPeriodic(w, 2, 'h')
    expect(lastChange()).toMatchObject({
      spec: { schedule: { type: 'ticker', expression: '2h' } },
      valid: true,
    })
    w.unmount()
  })

  it('a seeded poll spec in reconfigure mode renders every stored value faithfully', async () => {
    ;(globalThis as any).__props__ = {
      reconfigure: 'true',
      value: {
        v: 2, source: POLL_SOURCE, config: { connection_id: 'c-7', content_scope: 'summary' },
        schedule: { type: 'ticker', expression: '15m' }, backfill: { last_days: 30 },
      },
    }
    const w = mount(TriggerConfig)
    await flushPromises()
    // Source label faithfully shown as a plain value, and locked against a structural swap.
    expect(w.find('[data-test="tc-when-locked"]').text()).toContain('Fireflies transcripts')
    // Stored cadence rendered into the schedule form, which stays editable in place.
    expect((w.find('[data-test="tc-periodic-n"]').element as HTMLInputElement).value).toBe('15')
    expect((w.find('[data-test="tc-periodic-n"]').element as HTMLInputElement).disabled).toBe(false)
    // Stored History faithfully rendered (kind + days) but locked.
    expect(w.find('[data-test="tc-history-locked"]').text()).toBe('Last N days')
    expect((w.find('[data-test="tc-history-days"]').element as HTMLInputElement).value).toBe('30')
    expect(w.find('[data-test="tc-history"]').classes()).toContain('kx-tc-locked')
    // The seed echoes back valid, so a host re-opening an installed trigger can gate Save immediately.
    expect(lastChange().valid).toBe(true)
    w.unmount()
  })

  it('round-trips seeded interval schedules losslessly until the user edits cadence', async () => {
    ;(globalThis as any).__props__ = { allowed: 'timer', value: { v: 2, schedule: { type: 'interval', expression: '1h' } } }
    const w = mount(TriggerConfig)
    await flushPromises()
    expect(lastChange()).toMatchObject({
      spec: { v: 2, schedule: { type: 'interval', expression: '1h' } },
      valid: true,
    })
    await setPeriodic(w, 2, 'h')
    expect(lastChange().spec.schedule).toEqual({ type: 'ticker', expression: '2h' })
    w.unmount()
  })

  it('round-trips unrecognized cron schedules through the custom face', async () => {
    const expr = '13 7 1,15 * 2'
    ;(globalThis as any).__props__ = { allowed: 'timer', value: { v: 2, schedule: { type: 'cron', expression: expr } } }
    const w = mount(TriggerConfig)
    await flushPromises()
    expect((w.find('[data-test="tc-specific-toggle"]').element as HTMLInputElement).checked).toBe(true)
    expect(selectValue(w, 'tc-cron-preset')).toBe('custom')
    expect((w.find('[data-test="tc-custom-cron"]').element as HTMLInputElement).value).toBe(expr)
    expect(lastChange()).toMatchObject({
      spec: { v: 2, schedule: { type: 'cron', expression: expr } },
      valid: true,
    })
    w.unmount()
  })

  it('surfaces a catalog load failure with a retry and an error event', async () => {
    ;(api.get as any).mockImplementationOnce(() => Promise.reject(new Error('boom')))
    const w = mount(TriggerConfig)
    await flushPromises()
    expect(w.find('[data-test="tc-load-error"]').exists()).toBe(true)
    expect(emitted('error')).toHaveLength(1)
    expect(emitted('load')).toHaveLength(0)
    await w.find('.kx-tc-retry').trigger('click')
    await flushPromises()
    expect(w.find('[data-test="tc-load-error"]').exists()).toBe(false)
    w.unmount()
  })
})

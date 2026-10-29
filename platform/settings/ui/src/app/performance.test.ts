// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
/// <reference types="node" />
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { api } from '@wippy-fe/proxy'
import Performance from './performance.vue'
import styles from '../styles.css?raw'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const uiKitDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../../.wippy/npm/@kickside/ui-kit')
const releasedUiKitCss = ['kx-tokens.css', 'kx-controls.css'].map(file =>
  readFileSync(resolve(uiKitDirectory, file), 'utf8'),
).join('\n')

const hooks = vi.hoisted(() => ({ listeners: new Map<string, () => void>(), dispose: vi.fn() }))
vi.mock('@wippy-fe/proxy', () => ({ api: { get: vi.fn(), put: vi.fn() }, on: vi.fn((topic, callback) => {
  hooks.listeners.set(topic, callback); return hooks.dispose
}) }))
vi.mock('@wippy-fe/webcomponent-vue', async () => ({ useHostVisibilityRefresh: (load: () => void) => load() }))
vi.mock('@iconify/vue', () => ({ Icon: { props: ['icon'], template: '<span :data-icon="icon" />' } }))
let wrapper: VueWrapper
let fields: Record<string, any>
let database: string
beforeEach(() => {
  vi.clearAllMocks(); hooks.listeners.clear(); database = 'sqlite'
  fields = {
    'worker.count_postgres': { value: 20, source: 'default', fallback: 20 },
    'worker.count_sqlite': { value: 1, source: 'host', fallback: 1 },
    'worker.awaited_slots': { value: 2, source: 'admin', fallback: 1 },
    'worker.claim_batch': { value: 16, source: 'default', fallback: 16 },
    'fairness.shares': { value: { live: 6, backfill: 2, maintenance: 2 }, source: 'default', fallback: { live: 6, backfill: 2, maintenance: 2 } },
    'lease.timeout': { value: '45s', source: 'default', fallback: '45s' },
    'lease.heartbeat': { value: '10s', source: 'default', fallback: '10s' },
    'retry.max_attempts': { value: 3, source: 'default', fallback: 3 },
    'retry.retry_after_ms': { value: 1000, source: 'default', fallback: 1000 },
    'retry.max_delay_ms': { value: 900000, source: 'default', fallback: 900000 },
    'proc.max_execution': { value: '60m', source: 'default', fallback: '60m' },
  }
  vi.mocked(api.get).mockImplementation(async () => ({ data: { success: true, fields, revision: 1,
    pool: { database, applied_revision: 1, online: true, total: 3, busy: 1, idle: 2, awaited: 1,
      queued: { live: 4, backfill: 2, maintenance: 0 }, running: { live: 1, backfill: 0, maintenance: 0 } } } }))
  vi.mocked(api.put).mockImplementation(async (_url: string, body: any) => {
    fields = structuredClone(fields)
    for (const [key, value] of Object.entries(body.values || {})) fields[key] = { ...fields[key], value, source: 'admin' }
    for (const key of body.unset || []) fields[key] = { ...fields[key], value: fields[key].fallback, source: 'default' }
    return { data: { success: true, committed: true, revision: 2, fields } }
  })
})
afterEach(() => wrapper?.unmount())
async function render() { wrapper = mount(Performance, { global: { plugins: [PrimeVuePlugin] } }); await flushPromises() }
const button = (text: string) => wrapper.findAll('button').find(b => b.text() === text || b.attributes('aria-label') === text)!
describe('Performance settings', () => {
  it('shows sources, bounds, groups and pool state', async () => {
    await render()
    for (const text of ['Workers', 'Claiming and fairness', 'Leases and retries', 'Execution limits', 'Default', 'Host', 'Admin', 'busy', 'idle', 'Live']) expect(wrapper.text()).toContain(text)
    expect(wrapper.get('#worker-count_postgres').attributes()).toMatchObject({ min: '1', max: '256' })
  })
  it('uses product fonts across settings roots and headings', () => {
    expect(styles).toMatch(/:host,\s*:root\s*\{[^}]*font-family:\s*var\(--kx-font-body\)/)
    expect(styles).toMatch(/h1,[^{]*\.ap-h[^{]*\{[^}]*font-family:\s*var\(--kx-font-heading\)/)
  })
  it('matches the shared toolbar, description and saved feedback', async () => {
    await render()
    expect(wrapper.find('.ap-bar [data-icon="tabler:device-floppy"]').exists()).toBe(true)
    expect(wrapper.get('.ap-bar').find('.kx-btn').exists()).toBe(false)
    expect(wrapper.get('.perf-status .ap-sub').text()).toBe('Tune job throughput, queue fairness and execution limits.')
    expect(wrapper.get('#proc-max_execution').element).toHaveProperty('value', '60m')
    await wrapper.get('#worker-count_postgres').setValue('35')
    await button('Save').trigger('click'); await flushPromises()
    expect(wrapper.get('.ap-bar .ks-saved').text()).toContain('Saved')
    expect(wrapper.get('.ks-saved-tick').text()).toBe('✓')
    expect(wrapper.find('.perf-success').exists()).toBe(false)
  })
  it('uses a database badge and aligned numeric tier stats without a footnote', async () => {
    await render()
    expect(wrapper.get('.perf-status .ks-tag.kx-tag-caps').text()).toBe('SQLite')
    expect(wrapper.find('.perf-online').exists()).toBe(false)
    const stats = wrapper.findAll('.perf-tier')
    expect(stats).toHaveLength(3)
    expect(stats[0].get('h3').text()).toBe('Live')
    expect(stats[0].findAll('dd').map(stat => stat.text())).toEqual(['4', '1'])
    expect(stats[0].get('[title="Includes scheduled pending jobs"]').text()).toBe('Queued')
    expect(wrapper.text()).not.toContain('Updates automatically')
  })
  it('edits retry durations and saves the existing millisecond API units', async () => {
    await render()
    expect(wrapper.get('#retry-retry_after_ms').element).toHaveProperty('value', '1s')
    expect(wrapper.get('#retry-max_delay_ms').element).toHaveProperty('value', '15m')
    expect(button('Save').attributes()).toHaveProperty('disabled')
    await wrapper.get('#retry-retry_after_ms').setValue('1.5s')
    await wrapper.get('#retry-max_delay_ms').setValue('20m')
    await button('Save').trigger('click'); await flushPromises()
    expect(api.put).toHaveBeenCalledWith('/api/v1/settings/performance', { values: { 'retry.retry_after_ms': 1500, 'retry.max_delay_ms': 1200000 }, unset: [] })
  })
  it('keeps equivalent duration edits clean and formats reset/discard values', async () => {
    fields['retry.max_delay_ms'] = { value: 1200000, source: 'admin', fallback: 900000 }
    await render()
    await wrapper.get('#retry-retry_after_ms').setValue('1000ms')
    expect(button('Save').attributes()).toHaveProperty('disabled')
    await button('Reset Maximum retry delay to default').trigger('click')
    expect(wrapper.get('#retry-max_delay_ms').element).toHaveProperty('value', '15m')
    await button('Discard').trigger('click')
    expect(wrapper.get('#retry-max_delay_ms').element).toHaveProperty('value', '20m')
    await button('Reset Maximum retry delay to default').trigger('click')
    await button('Save').trigger('click'); await flushPromises()
    expect(api.put).toHaveBeenCalledWith('/api/v1/settings/performance', { values: {}, unset: ['retry.max_delay_ms'] })
  })
  it('validates retry duration bounds and whole stored milliseconds', async () => {
    await render()
    for (const [key, value] of [['retry-retry_after_ms', '0.5ms'], ['retry-retry_after_ms', '1.5ms'], ['retry-retry_after_ms', '1.0000001ms'], ['retry-max_delay_ms', '999ms'], ['retry-max_delay_ms', '25h'], ['retry-max_delay_ms', 'later']]) {
      await wrapper.get('#retry-retry_after_ms').setValue('1s')
      await wrapper.get('#retry-max_delay_ms').setValue('15m')
      await wrapper.get('#' + key).setValue(value)
      expect(wrapper.get('#' + key).attributes('aria-invalid')).toBe('true')
      expect(button('Save').attributes()).toHaveProperty('disabled')
    }
    await wrapper.get('#retry-retry_after_ms').setValue('1ms')
    await wrapper.get('#retry-max_delay_ms').setValue('24h')
    expect(button('Save').attributes()).not.toHaveProperty('disabled')
  })
  for (const backend of ['sqlite', 'postgres']) {
    it(`prioritizes ${backend} workers and annotates the unused backend`, async () => {
      database = backend; await render()
      const workerFields = wrapper.findAll('[data-policy-key]').filter(row => row.attributes('data-policy-key')?.startsWith('worker.count_'))
      expect(workerFields[0].attributes('data-policy-key')).toBe('worker.count_' + backend)
      expect(workerFields[0].text()).not.toContain('Not used by this installation')
      expect(workerFields[1].classes()).toContain('perf-field-unused')
      expect(workerFields[1].text()).toContain('Not used by this installation')
      expect(workerFields[1].get('input').attributes()).not.toHaveProperty('disabled')
    })
  }
  it('uses semantic segment tokens and reserves a desktop line for the capacity summary', async () => {
    await render()
    expect(styles).toMatch(/\.perf-share-live\s*\{[^}]*var\(--p-primary-color\)/)
    expect(styles).toMatch(/\.perf-share-backfill\s*\{[^}]*var\(--kx-surface-4\)/)
    expect(styles).toMatch(/\.perf-share-maintenance\s*\{[^}]*var\(--p-text-muted-color\)/)
    expect(styles).toMatch(/\.perf-share-bar\s*\{[^}]*gap:/)
    expect(styles).not.toMatch(/\.perf-share-(?:live|backfill|maintenance)\s*\{[^}]*--p-(?:info|warn|danger|success|help)/)
    expect(styles).not.toMatch(/\.perf-share-(?:live|backfill|maintenance)\s*\{[^}]*--p-\w+-[0-9]+/)
    expect(wrapper.get('.perf-capacity-summary').text()).toContain('3 total slots · 1 reserved for awaited work')
    expect(styles).toMatch(/\.perf-capacity-summary\s*\{[^}]*white-space:\s*nowrap/)
    expect(styles).toMatch(/@container\s*\(max-width:\s*45rem\)[\s\S]*\.perf-capacity-summary\s*\{[^}]*white-space:\s*normal/)
  })
  it('resets an admin override to the host/default fallback in the save batch', async () => {
    await render(); await button('Reset Awaited slots to default').trigger('click')
    await button('Save').trigger('click'); await flushPromises()
    expect(api.put).toHaveBeenCalledWith('/api/v1/settings/performance', { values: {}, unset: ['worker.awaited_slots'] })
  })
  it('validates heartbeat, integer bounds and fairness before saving', async () => {
    await render()
    await wrapper.get('#lease-heartbeat').setValue('45s')
    expect(wrapper.text()).toContain('shorter than the lease timeout')
    expect(button('Save').attributes()).toHaveProperty('disabled')
    await wrapper.get('#lease-heartbeat').setValue('10s')
    await wrapper.get('#worker-count_postgres').setValue('257')
    expect(wrapper.text()).toContain('1–256')
    expect(api.put).not.toHaveBeenCalled()
  })
  it('installs committed fields on a rejected nudge without offering a no-op retry', async () => {
    await render(); await wrapper.get('#worker-count_postgres').setValue('35')
    fields = structuredClone(fields)
    fields['worker.count_postgres'] = { value: 35, source: 'admin', fallback: 20 }
    vi.mocked(api.put).mockRejectedValueOnce({ response: { data: { success: false, committed: true, fields, revision: 2, error: 'notification unavailable' } } })
    await button('Save').trigger('click'); await flushPromises()
    expect(wrapper.text()).toContain('Settings are saved; owner notification failed: notification unavailable')
    expect(wrapper.text()).toContain('Applying…')
    expect(wrapper.get('[data-policy-key="worker.count_postgres"] [data-source]').text()).toBe('Admin')
    expect(button('Save').attributes()).toHaveProperty('disabled')
    expect(wrapper.text()).not.toContain('Apply saved settings')
    await button('Save').trigger('click'); await flushPromises()
    expect(api.put).toHaveBeenCalledTimes(1)
  })
  it('shows a durable apply error on GET and clears it on a realtime refetch', async () => {
    const state = { database: 'sqlite', online: true, total: 3, busy: 1, idle: 2, awaited: 1,
      queued: {}, running: {} }
    vi.mocked(api.get).mockResolvedValueOnce({ data: { success: true, fields, revision: 2,
      pool: { ...state, applied_revision: 1, apply_error: { kind: 'Unavailable', message: 'Policy read unavailable' } } } })
    await render()
    expect(wrapper.text()).toContain('Policy read unavailable')
    expect(wrapper.text()).toContain('Applying…')
    expect(button('Save').attributes()).toHaveProperty('disabled')
    vi.mocked(api.get).mockResolvedValueOnce({ data: { success: true, fields, revision: 2,
      pool: { ...state, applied_revision: 2, apply_error: null } } })
    hooks.listeners.get('kickside.jobs.performance.changed')!(); await flushPromises()
    expect(wrapper.text()).not.toContain('Policy read unavailable')
    expect(wrapper.text()).not.toContain('Applying…')
  })
  it('keeps Applying through failed or older GETs until SQL confirms the committed revision', async () => {
    await render(); await wrapper.get('#worker-count_postgres').setValue('35')
    await button('Save').trigger('click'); await flushPromises()
    expect(wrapper.text()).toContain('Applying…')
    expect(button('Save').attributes()).toHaveProperty('disabled')
    vi.mocked(api.get).mockRejectedValueOnce({ response: { data: { error: 'Database unavailable' } } })
    hooks.listeners.get('kickside.jobs.performance.changed')!(); await flushPromises()
    expect(wrapper.text()).toContain('Database unavailable')
    expect(wrapper.text()).toContain('Applying…')
    vi.mocked(api.get).mockResolvedValueOnce({ data: { success: true, fields, revision: 2,
      pool: { database, applied_revision: 1, total: 3, busy: 1, idle: 2, awaited: 1, queued: {}, running: {} } } })
    hooks.listeners.get('kickside.jobs.performance.changed')!(); await flushPromises()
    expect(wrapper.text()).toContain('Applying…')
    vi.mocked(api.get).mockResolvedValueOnce({ data: { success: true, fields, revision: 2,
      pool: { database, applied_revision: 2, total: 3, busy: 1, idle: 2, awaited: 1, queued: {}, running: {} } } })
    hooks.listeners.get('kickside.jobs.performance.changed')!(); await flushPromises()
    expect(wrapper.text()).not.toContain('Applying…')
    expect(wrapper.text()).not.toContain('Database unavailable')
    expect(api.put).toHaveBeenCalledTimes(1)
  })
  it('applies PUT fields without a post-save GET and keeps validation drafts on rejected writes', async () => {
    await render(); await wrapper.get('#worker-count_postgres').setValue('35')
    vi.mocked(api.put).mockRejectedValueOnce({ response: { data: { committed: false, error: 'Capacity is invalid', kind: 'Invalid' } } })
    await button('Save').trigger('click'); await flushPromises()
    expect(wrapper.text()).toContain('Capacity is invalid')
    expect(wrapper.get('#worker-count_postgres').element).toHaveProperty('value', '35')
    await button('Save').trigger('click'); await flushPromises()
    expect(api.get).toHaveBeenCalledTimes(1)
    expect(wrapper.get('[data-policy-key="worker.count_postgres"] [data-source]').text()).toBe('Admin')
    expect(wrapper.get('.ks-saved').text()).toContain('Saved')
  })
  it('disables toolbar actions before a baseline and recovers from a rejected first GET', async () => {
    let fail!: (value: unknown) => void
    vi.mocked(api.get).mockImplementationOnce(() => new Promise((_resolve, reject) => { fail = reject }))
    wrapper = mount(Performance, { global: { plugins: [PrimeVuePlugin] } })
    expect(button('Save').attributes()).toHaveProperty('disabled')
    expect(button('Discard').attributes()).toHaveProperty('disabled')
    fail({ response: { data: { error: 'Pool is unavailable' } } }); await flushPromises()
    expect(wrapper.text()).toContain('Pool is unavailable')
    expect(button('Discard').attributes()).toHaveProperty('disabled')
    await button('Reload').trigger('click'); await flushPromises()
    expect(wrapper.get('#proc-max_execution').element).toHaveProperty('value', '60m')
  })
  it('uses shared inputs and only existing accessible descriptions including bounds', async () => {
    await render()
    for (const input of wrapper.findAll('input')) {
      expect(input.classes()).toContain('ks-input')
      expect(input.classes()).toContain('kx-focus-halo')
      for (const id of input.attributes('aria-describedby')!.split(' ')) expect(wrapper.find('#' + id).exists()).toBe(true)
      expect(input.attributes('aria-describedby')).toContain('-bounds')
    }
    await wrapper.get('#lease-heartbeat').setValue('99s')
    expect(wrapper.get('#lease-heartbeat').attributes('aria-describedby')).toContain('lease-heartbeat-error')
  })
  it('accepts duration forms supported by the native parser', async () => {
    await render()
    for (const value of ['+45s', '1.s', '.5s']) {
      await wrapper.get('#proc-max_execution').setValue(value)
      expect(wrapper.get('#proc-max_execution').attributes('aria-invalid')).toBe('false')
    }
  })
  it('rejects zero total fairness and updates the proportional preview on edit', async () => {
    await render()
    for (const tier of ['live', 'backfill', 'maintenance']) await wrapper.get(`#share-${tier}`).setValue('0')
    expect(wrapper.text()).toContain('at least one tier needs a share')
    expect(button('Save').attributes()).toHaveProperty('disabled')
    await wrapper.get('#share-live').setValue('10')
    expect(wrapper.get('[role="img"]').attributes('aria-label')).toContain('Live 100%')
    expect(button('Save').attributes()).not.toHaveProperty('disabled')
  })
  it('retains authoritative PUT fields when an earlier GET finishes after the save', async () => {
    await render()
    const old = structuredClone(fields)
    let complete!: (value: any) => void
    vi.mocked(api.get).mockImplementationOnce(() => new Promise(done => { complete = done }))
    hooks.listeners.get('kickside.jobs.performance.changed')!()
    await wrapper.get('#worker-count_postgres').setValue('35')
    await button('Save').trigger('click'); await flushPromises()
    complete({ data: { success: true, fields: old, pool: { online: true, total: 3, busy: 0, idle: 3, awaited: 1, queued: {}, running: {} } } })
    await flushPromises()
    expect(wrapper.get('#worker-count_postgres').element).toHaveProperty('value', '35')
    expect(wrapper.get('[data-policy-key="worker.count_postgres"] [data-source]').text()).toBe('Admin')
    expect(button('Save').attributes()).toHaveProperty('disabled')
  })
  it('uses product font tokens, visible heading spaces and semantic queue colors', () => {
    expect(styles).toMatch(/:host,\s*:root\s*\{[^}]*font-family:\s*var\(--kx-font-body\)/)
    expect(styles).toMatch(/h1,[^{]*\.ap-h[^{]*\{[^}]*font-family:\s*var\(--kx-font-heading\)/)
    expect(styles).not.toMatch(/letter-spacing:\s*-\.2px/)
    expect(styles).toMatch(/\.ap-h\s*\{[^}]*word-spacing:\s*\.04em/)
    const performanceStyles = styles.slice(styles.indexOf('.perf {'))
    const colors = [...performanceStyles.matchAll(/(?:^|[;{])\s*(?:color|background(?:-color)?)\s*:\s*([^;{}]+)/g)]
    expect(colors.length).toBeGreaterThan(0)
    for (const [, value] of colors) {
      expect(value.trim()).toMatch(/^(?:var\(|color-mix\(|transparent$|currentColor$|inherit$|none$)/)
      expect(value).not.toMatch(/#[\da-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|oklab|oklch|lab|lch)\(/i)
    }
    expect(performanceStyles).not.toMatch(/background:\s*var\(--p-(info|warn|success|danger)/)
    expect(performanceStyles).toMatch(/\.perf-share-live\s*\{[^}]*var\(--p-primary-color\)/)
    expect(performanceStyles).toMatch(/\.perf-share-backfill\s*\{[^}]*var\(--kx-surface-4\)/)
    expect(performanceStyles).toMatch(/\.perf-share-maintenance\s*\{[^}]*var\(--p-text-muted-color\)/)
  })
  it('only references kx tokens defined by the materialized released ui-kit', () => {
    const withoutComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')
    const definitions = new Set([...withoutComments(releasedUiKitCss).matchAll(/(--kx-[\w-]+)\s*:/g)].map(match => match[1]))
    const references = new Set([...withoutComments(styles).matchAll(/var\(\s*(--kx-[\w-]+)/g)].map(match => match[1]))
    expect(definitions.size).toBeGreaterThan(0)
    expect([...references].filter(token => !definitions.has(token)).sort()).toEqual([])
  })
  it('coalesces bursts into one in-flight refresh plus one pending', async () => {
    await render()
    let resolve!: (value: any) => void
    vi.mocked(api.get).mockImplementationOnce(() => new Promise(done => { resolve = done }))
    for (let i = 0; i < 20; i++) hooks.listeners.get('kickside.jobs.performance.changed')!()
    expect(api.get).toHaveBeenCalledTimes(2)
    resolve({ data: { success: true, fields, pool: { online: true, total: 10, busy: 8, idle: 1, awaited: 1, queued: {}, running: {} } } })
    await flushPromises()
    expect(api.get).toHaveBeenCalledTimes(3)
  })
  it('refreshes from realtime, preserves drafts and unsubscribes', async () => {
    await render(); await wrapper.get('#worker-count_postgres').setValue('35')
    hooks.listeners.get('kickside.jobs.performance.changed')!(); await flushPromises()
    expect(api.get).toHaveBeenCalledTimes(2)
    expect((wrapper.get('#worker-count_postgres').element as HTMLInputElement).value).toBe('35')
    wrapper.unmount(); expect(hooks.dispose).toHaveBeenCalledTimes(2)
  })
})

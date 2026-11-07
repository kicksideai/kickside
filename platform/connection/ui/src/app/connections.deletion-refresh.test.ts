// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { api, loadByTagName, on } from '@wippy-fe/proxy'
import Connections from './connections.vue'

vi.hoisted(() => {
  Object.defineProperty(window, '__WIPPY_APP_API__', {
    configurable: true,
    value: {
      api: { get: vi.fn(), delete: vi.fn() },
      on: vi.fn(),
      host: { confirm: vi.fn(), handleError: vi.fn() },
      loadByTagName: vi.fn(),
    },
  })
})
vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => ({ value: {} }),
  useEvents: () => vi.fn(),
  useHostVisibilityRefresh: (refresh: () => Promise<void>) => { void refresh() },
}))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span aria-hidden="true" />' } }))

let wrapper: VueWrapper | undefined
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.resetAllMocks()
})

it('clears a failed list read once a finished deletion is read back', async () => {
  const connection = { component_id: 'connection', name: 'Cleanup connection', provider: 'generic' }
  const receivers: Array<(message: unknown) => void> = []
  vi.mocked(on).mockImplementation((_topic, callback) => {
    receivers.push(callback as (message: unknown) => void)
    return vi.fn()
  })
  let listReads: Array<() => unknown> = [() => ({ success: true, connections: [connection], total_count: 1 })]
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    if (url.startsWith('/api/v1/connections?')) return { data: await (listReads.shift() ?? (() => ({ success: true, connections: [], total_count: 0 })))() } as never
    if (url.endsWith('/providers/discover')) return { data: { success: true, providers: [] } } as never
    if (url === '/api/v1/components/connection') {
      return { data: { success: true, deleting_at: 'marked', deletion_job_id: 'job', deletion_job: { status: 'running', attempts: 1 } } } as never
    }
    return { data: { success: false } } as never
  })
  vi.mocked(api.delete).mockResolvedValue({ data: { success: true, in_progress: true, job_id: 'job' } } as never)
  vi.mocked(loadByTagName).mockResolvedValue(undefined as never)

  wrapper = mount(Connections, { global: { plugins: [PrimeVuePlugin] } })
  await flushPromises()
  expect(wrapper.findAll('.live-card')).toHaveLength(1)

  listReads = [() => { throw new Error('cleanup status unavailable') }]
  await wrapper.get('[aria-label="Remove Cleanup connection"]').trigger('click')
  await wrapper.get('[aria-label="Remove Cleanup connection"]').trigger('click')
  await flushPromises()
  expect(wrapper.get('.msg.err').text()).toContain('cleanup status unavailable')
  expect(wrapper.findAll('.live-card')).toHaveLength(1)
  expect(wrapper.text()).toContain('Deleting')

  for (const receive of receivers) receive({ event: 'component.deleted', component_id: 'connection' })
  await flushPromises()

  expect(wrapper.findAll('.live-card')).toHaveLength(0)
  expect(wrapper.find('.msg.err').exists()).toBe(false)
  expect(vi.mocked(api.get).mock.calls.filter(([url]: unknown[]) => String(url).startsWith('/api/v1/connections?'))).toHaveLength(3)
})

it('keeps the latest list read when an earlier read fails after it', async () => {
  const connection = { component_id: 'connection', name: 'Cleanup connection', provider: 'generic' }
  const receivers: Array<(message: unknown) => void> = []
  vi.mocked(on).mockImplementation((_topic, callback) => {
    receivers.push(callback as (message: unknown) => void)
    return vi.fn()
  })
  let listReads: Array<() => unknown> = [() => ({ success: true, connections: [connection], total_count: 1 })]
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    if (url.startsWith('/api/v1/connections?')) return { data: await (listReads.shift() ?? (() => ({ success: true, connections: [], total_count: 0 })))() } as never
    if (url.endsWith('/providers/discover')) return { data: { success: true, providers: [] } } as never
    if (url === '/api/v1/components/connection') {
      return { data: { success: true, deleting_at: 'marked', deletion_job_id: 'job', deletion_job: { status: 'running', attempts: 1 } } } as never
    }
    return { data: { success: false } } as never
  })
  vi.mocked(api.delete).mockResolvedValue({ data: { success: true, in_progress: true, job_id: 'job' } } as never)
  vi.mocked(loadByTagName).mockResolvedValue(undefined as never)

  wrapper = mount(Connections, { global: { plugins: [PrimeVuePlugin] } })
  await flushPromises()
  expect(wrapper.findAll('.live-card')).toHaveLength(1)

  let rejectFirst!: (error: Error) => void
  listReads = [
    () => new Promise((_resolve, reject) => { rejectFirst = reject }),
    () => ({ success: true, connections: [{ component_id: 'kept', name: 'Kept connection', provider: 'generic' }], total_count: 1 }),
  ]
  await wrapper.get('[aria-label="Remove Cleanup connection"]').trigger('click')
  await wrapper.get('[aria-label="Remove Cleanup connection"]').trigger('click')
  await flushPromises()
  expect(wrapper.find('.msg.err').exists()).toBe(false)
  expect(wrapper.text()).toContain('Deleting')

  for (const receive of receivers) receive({ event: 'component.deleted', component_id: 'connection' })
  await flushPromises()
  expect(wrapper.findAll('.live-card')).toHaveLength(1)
  expect(wrapper.text()).toContain('Kept connection')

  rejectFirst(new Error('cleanup status unavailable'))
  await flushPromises()

  expect(wrapper.find('.msg.err').exists()).toBe(false)
  expect(wrapper.findAll('.live-card')).toHaveLength(1)
  expect(wrapper.text()).toContain('Kept connection')
})

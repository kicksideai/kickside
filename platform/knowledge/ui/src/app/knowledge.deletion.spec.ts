// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { api, host, loadByTagName, on } from '@wippy-fe/proxy'
import Knowledge from './knowledge.vue'

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

it('clears a failed catalog read once a finished deletion is read back', async () => {
  const library = { id: 'library', name: 'Cleanup library', kb_type: 'records' }
  const receivers: Array<(message: unknown) => void> = []
  vi.mocked(on).mockImplementation((_topic, callback) => {
    receivers.push(callback as (message: unknown) => void)
    return vi.fn()
  })
  let listReads: Array<() => unknown> = [() => ({ success: true, items: [library] })]
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    if (url === '/api/v1/knowledge/list') return { data: await (listReads.shift() ?? (() => ({ success: true, items: [] })))() } as never
    if (url === '/api/v1/knowledge/engines') return { data: { success: true, engines: [] } } as never
    if (url === '/api/v1/components/library') {
      return { data: { success: true, deleting_at: 'marked', deletion_job_id: 'job', deletion_job: { status: 'running', attempts: 1 } } } as never
    }
    throw new Error('unexpected request ' + url)
  })
  vi.mocked(api.delete).mockResolvedValue({ data: { success: true, in_progress: true, job_id: 'job' } } as never)
  vi.mocked(host.confirm).mockResolvedValue(true as never)
  vi.mocked(loadByTagName).mockResolvedValue(undefined as never)

  wrapper = mount(Knowledge, { global: { plugins: [PrimeVuePlugin] } })
  await flushPromises()
  expect(wrapper.findAll('.kx-card')).toHaveLength(1)

  listReads = [() => ({ success: false, error: 'cleanup status unavailable' })]
  await wrapper.get('[aria-label="Delete Cleanup library"]').trigger('click')
  await flushPromises()
  expect(wrapper.get('.kx-err').text()).toBe('cleanup status unavailable')
  expect(wrapper.findAll('.kx-card')).toHaveLength(1)
  expect(wrapper.text()).toContain('Deleting')

  for (const receive of receivers) receive({ event: 'component.deleted', component_id: 'library' })
  await flushPromises()

  expect(wrapper.findAll('.kx-card')).toHaveLength(0)
  expect(wrapper.find('.kx-err').exists()).toBe(false)
  expect(vi.mocked(api.get).mock.calls.filter(([url]: unknown[]) => url === '/api/v1/knowledge/list')).toHaveLength(3)
})

it('keeps the latest list read when an earlier read fails after it', async () => {
  const library = { id: 'library', name: 'Cleanup library', kb_type: 'records' }
  const receivers: Array<(message: unknown) => void> = []
  vi.mocked(on).mockImplementation((_topic, callback) => {
    receivers.push(callback as (message: unknown) => void)
    return vi.fn()
  })
  let listReads: Array<() => unknown> = [() => ({ success: true, items: [library] })]
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    if (url === '/api/v1/knowledge/list') return { data: await (listReads.shift() ?? (() => ({ success: true, items: [] })))() } as never
    if (url === '/api/v1/knowledge/engines') return { data: { success: true, engines: [] } } as never
    if (url === '/api/v1/components/library') {
      return { data: { success: true, deleting_at: 'marked', deletion_job_id: 'job', deletion_job: { status: 'running', attempts: 1 } } } as never
    }
    throw new Error('unexpected request ' + url)
  })
  vi.mocked(api.delete).mockResolvedValue({ data: { success: true, in_progress: true, job_id: 'job' } } as never)
  vi.mocked(host.confirm).mockResolvedValue(true as never)
  vi.mocked(loadByTagName).mockResolvedValue(undefined as never)

  wrapper = mount(Knowledge, { global: { plugins: [PrimeVuePlugin] } })
  await flushPromises()
  expect(wrapper.findAll('.kx-card')).toHaveLength(1)

  let rejectFirst!: (error: Error) => void
  listReads = [
    () => new Promise((_resolve, reject) => { rejectFirst = reject }),
    () => ({ success: true, items: [{ id: 'kept', name: 'Kept library', kb_type: 'records' }] }),
  ]
  await wrapper.get('[aria-label="Delete Cleanup library"]').trigger('click')
  await flushPromises()
  expect(wrapper.find('.kx-err').exists()).toBe(false)
  expect(wrapper.text()).toContain('Deleting')

  for (const receive of receivers) receive({ event: 'component.deleted', component_id: 'library' })
  await flushPromises()
  expect(wrapper.findAll('.kx-card')).toHaveLength(1)
  expect(wrapper.text()).toContain('Kept library')

  rejectFirst(new Error('cleanup status unavailable'))
  await flushPromises()

  expect(wrapper.find('.kx-err').exists()).toBe(false)
  expect(wrapper.findAll('.kx-card')).toHaveLength(1)
  expect(wrapper.text()).toContain('Kept library')
})

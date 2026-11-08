// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { api, host, loadByTagName, on } from '@wippy-fe/proxy'
import Agents from './agents.vue'

vi.mock('@wippy-fe/proxy', () => ({
  api: {get: vi.fn(), delete: vi.fn()},
  on: vi.fn(),
  host: {confirm: vi.fn(), handleError: vi.fn(), toast: vi.fn()},
  loadByTagName: vi.fn(),
}))
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
  const agent = { id: 'agent', title: 'Cleanup agent' }
  const receivers: Array<(message: unknown) => void> = []
  vi.mocked(on).mockImplementation((_topic, callback) => {
    receivers.push(callback as (message: unknown) => void)
    return vi.fn()
  })
  let listReads: Array<() => unknown> = [() => ({ success: true, agents: [agent] })]
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    if (url === '/api/v1/user-agents') return { data: await (listReads.shift() ?? (() => ({ success: true, agents: [] })))() } as never
    if (url === '/api/v1/components/agent') {
      return { data: { success: true, deleting_at: 'marked', deletion_job_id: 'job', deletion_job: { status: 'running', attempts: 1 } } } as never
    }
    return { data: { success: false } } as never
  })
  vi.mocked(api.delete).mockResolvedValue({ data: { success: true, in_progress: true, job_id: 'job' } } as never)
  vi.mocked(host.confirm).mockResolvedValue(true as never)
  vi.mocked(loadByTagName).mockResolvedValue(undefined as never)

  wrapper = mount(Agents, { global: { plugins: [PrimeVuePlugin] } })
  await flushPromises()
  expect(wrapper.findAll('.kx-card')).toHaveLength(1)

  listReads = [() => ({ success: false, error: 'cleanup status unavailable' })]
  await wrapper.get('[aria-label="Delete Cleanup agent"]').trigger('click')
  await flushPromises()
  expect(wrapper.get('.kx-err').text()).toBe('cleanup status unavailable')
  expect(wrapper.findAll('.kx-card')).toHaveLength(1)
  expect(wrapper.text()).toContain('Deleting')

  for (const receive of receivers) receive({ event: 'component.deleted', component_id: 'agent' })
  await flushPromises()

  expect(wrapper.findAll('.kx-card')).toHaveLength(0)
  expect(wrapper.find('.kx-err').exists()).toBe(false)
  expect(vi.mocked(api.get).mock.calls.filter(([url]: unknown[]) => url === '/api/v1/user-agents')).toHaveLength(3)
})

it('keeps the latest list read when an earlier read fails after it', async () => {
  const agent = { id: 'agent', title: 'Cleanup agent' }
  const receivers: Array<(message: unknown) => void> = []
  vi.mocked(on).mockImplementation((_topic, callback) => {
    receivers.push(callback as (message: unknown) => void)
    return vi.fn()
  })
  let listReads: Array<() => unknown> = [() => ({ success: true, agents: [agent] })]
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    if (url === '/api/v1/user-agents') return { data: await (listReads.shift() ?? (() => ({ success: true, agents: [] })))() } as never
    if (url === '/api/v1/components/agent') {
      return { data: { success: true, deleting_at: 'marked', deletion_job_id: 'job', deletion_job: { status: 'running', attempts: 1 } } } as never
    }
    return { data: { success: false } } as never
  })
  vi.mocked(api.delete).mockResolvedValue({ data: { success: true, in_progress: true, job_id: 'job' } } as never)
  vi.mocked(host.confirm).mockResolvedValue(true as never)
  vi.mocked(loadByTagName).mockResolvedValue(undefined as never)

  wrapper = mount(Agents, { global: { plugins: [PrimeVuePlugin] } })
  await flushPromises()
  expect(wrapper.findAll('.kx-card')).toHaveLength(1)

  let rejectFirst!: (error: Error) => void
  listReads = [
    () => new Promise((_resolve, reject) => { rejectFirst = reject }),
    () => ({ success: true, agents: [{ id: 'kept', title: 'Kept agent' }] }),
  ]
  await wrapper.get('[aria-label="Delete Cleanup agent"]').trigger('click')
  await flushPromises()
  expect(wrapper.find('.kx-err').exists()).toBe(false)
  expect(wrapper.text()).toContain('Deleting')

  for (const receive of receivers) receive({ event: 'component.deleted', component_id: 'agent' })
  await flushPromises()
  expect(wrapper.findAll('.kx-card')).toHaveLength(1)
  expect(wrapper.text()).toContain('Kept agent')

  rejectFirst(new Error('cleanup status unavailable'))
  await flushPromises()

  expect(wrapper.find('.kx-err').exists()).toBe(false)
  expect(wrapper.findAll('.kx-card')).toHaveLength(1)
  expect(wrapper.text()).toContain('Kept agent')
})

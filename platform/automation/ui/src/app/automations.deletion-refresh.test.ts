// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { api, loadByTagName, on } from '@wippy-fe/proxy'
import Automations from './automations.vue'

vi.hoisted(() => {
  Object.defineProperty(window, '__WIPPY_APP_API__', {
    configurable: true,
    value: {
      api: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
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
  const automation = { id: 'automation', title: 'Cleanup automation', type: 'generic', public_state: { status: 'active' } }
  const receivers: Array<(message: unknown) => void> = []
  vi.mocked(on).mockImplementation((_topic, callback) => {
    receivers.push(callback as (message: unknown) => void)
    return vi.fn()
  })
  let listReads: Array<() => unknown> = [() => ({ success: true, automations: [automation] })]
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    if (url === '/api/v1/automations') return { data: await (listReads.shift() ?? (() => ({ success: true, automations: [] })))() } as never
    if (url === '/api/v1/automations/types') return { data: { success: true, types: [{ id: 'generic' }] } } as never
    if (url === '/api/v1/components/automation') {
      return { data: { success: true, deleting_at: 'marked', deletion_job_id: 'job', deletion_job: { status: 'running', attempts: 1 } } } as never
    }
    return { data: { success: false } } as never
  })
  vi.mocked(api.delete).mockResolvedValue({ data: { success: true, in_progress: true, job_id: 'job' } } as never)
  vi.mocked(loadByTagName).mockResolvedValue(undefined as never)

  wrapper = mount(Automations, { global: { plugins: [PrimeVuePlugin], stubs: { WcMount: true } } })
  await flushPromises()
  expect(wrapper.findAll('.kx-row')).toHaveLength(1)

  listReads = [() => ({ success: false, error: { code: 'unavailable', message: 'cleanup status unavailable' } })]
  await wrapper.get('[aria-label="More actions for Cleanup automation"]').trigger('click')
  await flushPromises()
  await wrapper.get('[data-testid="action-delete"]').trigger('click')
  await flushPromises()
  await wrapper.get('[data-testid="automations-confirm-delete"]').trigger('click')
  await flushPromises()
  expect(wrapper.get('.kx-err').text()).toBe('cleanup status unavailable')
  expect(wrapper.findAll('.kx-row')).toHaveLength(1)
  expect(wrapper.text()).toContain('Deleting')

  for (const receive of receivers) receive({ event: 'component.deleted', component_id: 'automation' })
  await flushPromises()

  expect(wrapper.findAll('.kx-row')).toHaveLength(0)
  expect(wrapper.find('.kx-err').exists()).toBe(false)
  expect(vi.mocked(api.get).mock.calls.filter(([url]: unknown[]) => url === '/api/v1/automations')).toHaveLength(3)
})

it('keeps the latest list read when an earlier read fails after it', async () => {
  const automation = { id: 'automation', title: 'Cleanup automation', type: 'generic', public_state: { status: 'active' } }
  const receivers: Array<(message: unknown) => void> = []
  vi.mocked(on).mockImplementation((_topic, callback) => {
    receivers.push(callback as (message: unknown) => void)
    return vi.fn()
  })
  let listReads: Array<() => unknown> = [() => ({ success: true, automations: [automation] })]
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    if (url === '/api/v1/automations') return { data: await (listReads.shift() ?? (() => ({ success: true, automations: [] })))() } as never
    if (url === '/api/v1/automations/types') return { data: { success: true, types: [{ id: 'generic' }] } } as never
    if (url === '/api/v1/components/automation') {
      return { data: { success: true, deleting_at: 'marked', deletion_job_id: 'job', deletion_job: { status: 'running', attempts: 1 } } } as never
    }
    return { data: { success: false } } as never
  })
  vi.mocked(api.delete).mockResolvedValue({ data: { success: true, in_progress: true, job_id: 'job' } } as never)
  vi.mocked(loadByTagName).mockResolvedValue(undefined as never)

  wrapper = mount(Automations, { global: { plugins: [PrimeVuePlugin], stubs: { WcMount: true } } })
  await flushPromises()
  expect(wrapper.findAll('.kx-row')).toHaveLength(1)

  let rejectFirst!: (error: Error) => void
  listReads = [
    () => new Promise((_resolve, reject) => { rejectFirst = reject }),
    () => ({ success: true, automations: [{ id: 'kept', title: 'Kept automation', type: 'generic', public_state: { status: 'active' } }] }),
  ]
  await wrapper.get('[aria-label="More actions for Cleanup automation"]').trigger('click')
  await flushPromises()
  await wrapper.get('[data-testid="action-delete"]').trigger('click')
  await flushPromises()
  await wrapper.get('[data-testid="automations-confirm-delete"]').trigger('click')
  await flushPromises()
  expect(wrapper.find('.kx-err').exists()).toBe(false)
  expect(wrapper.text()).toContain('Deleting')

  for (const receive of receivers) receive({ event: 'component.deleted', component_id: 'automation' })
  await flushPromises()
  expect(wrapper.findAll('.kx-row')).toHaveLength(1)
  expect(wrapper.text()).toContain('Kept automation')

  rejectFirst(new Error('cleanup status unavailable'))
  await flushPromises()

  expect(wrapper.find('.kx-err').exists()).toBe(false)
  expect(wrapper.findAll('.kx-row')).toHaveLength(1)
  expect(wrapper.text()).toContain('Kept automation')
})

it('refreshes after one deletion finishes without reading another component during teardown', async () => {
  const first = { id: 'first', title: 'First automation', type: 'generic' }
  const second = { id: 'second', title: 'Second automation', type: 'generic' }
  let reads = 0
  vi.mocked(on).mockReturnValue(vi.fn())
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    if (url === '/api/v1/automations/types') return { data: { success: true, types: [{ id: 'generic' }] } } as never
    if (url === '/api/v1/automations') return { data: { success: true, automations: reads++ === 0
      ? [first, second]
      : [{ ...second, deleting_at: 'marked', deletion_job_id: 'second-job', deletion_job: {status: 'running', attempts: 1} }] } } as never
    return { data: { success: false, error: 'Component not found or access denied' } } as never
  })
  vi.mocked(loadByTagName).mockResolvedValue(undefined as never)
  wrapper = mount(Automations, { global: { plugins: [PrimeVuePlugin], stubs: { WcMount: true } } })
  await flushPromises()
  const receive = vi.mocked(on).mock.calls.find(([topic]) => topic === '@message')?.[1] as (message: unknown) => void
  expect(receive).toBeTypeOf('function')
  receive({ event: 'component.deleting', component_id: 'first', deletion_job_id: 'first-job' })
  receive({ event: 'component.deleting', component_id: 'second', deletion_job_id: 'second-job' })
  await flushPromises()
  receive({ event: 'component.deleted', component_id: 'first' })
  await flushPromises()
  expect(reads).toBe(2)
  expect(wrapper.findAll('.kx-row')).toHaveLength(1)
  expect(wrapper.text()).toContain('Second automation')
  expect(wrapper.text()).toContain('Deleting')
  expect(vi.mocked(api.get).mock.calls.filter(([url]: unknown[]) => String(url).startsWith('/api/v1/components/'))).toEqual([])
})

// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
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
beforeEach(() => {
  vi.mocked(loadByTagName).mockResolvedValue(undefined as never)
})
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.resetAllMocks()
})

it('offers recovery after the first catalog failure and creation after an empty retry', async () => {
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    if (url === '/api/v1/knowledge/engines') return { data: { success: true, engines: [] } } as never
    return { data: { success: false, error: 'Knowledge catalog is unavailable' } } as never
  })
  wrapper = mount(Knowledge, { global: { plugins: [PrimeVuePlugin] } })
  await flushPromises()

  expect(wrapper.get('[role="alert"]').text()).toBe('Knowledge catalog is unavailable')
  expect(wrapper.text()).not.toContain('No knowledge bases yet')
  expect(wrapper.find('[data-testid="knowledge-create"]').exists()).toBe(false)

  vi.mocked(api.get).mockResolvedValueOnce({ data: { success: true, items: [] } } as never)
  await wrapper.get('button.kx-cat-retry').trigger('click')
  await flushPromises()
  expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  expect(wrapper.text()).toContain('No knowledge bases yet')
  expect(wrapper.findAll('[data-testid="knowledge-create"]')).toHaveLength(1)
})

it('honors the individual access bits on catalog cards and detail actions', async () => {
  const read = { id: 'shared', name: 'Shared library', access_level: 1 }
  const write = { id: 'editable', name: 'Editable library', access_level: 3 }
  const remove = { id: 'removable', name: 'Removable library', access_level: 5 }
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    if (url === '/api/v1/knowledge/list') return { data: { success: true, items: [read, write, remove] } } as never
    if (url.endsWith('/shared')) return { data: { success: true, ...read } } as never
    return { data: { success: true, engines: [] } } as never
  })
  wrapper = mount(Knowledge, { global: { plugins: [PrimeVuePlugin] } })
  await flushPromises()

  const actions = () => wrapper!.findAll('.kx-card-actions button').map(button => button.attributes('aria-label'))
  expect(actions()).toEqual(['Edit Editable library', 'Delete Removable library'])
  expect(wrapper.findAll('.kx-card').find(card => card.find('[aria-label="Open Shared library"]').exists())?.text()).toContain('Read only')
  await wrapper.get('[aria-label="Open Shared library"]').trigger('click')
  await flushPromises()
  expect(wrapper.get('.kx-bar').text()).toContain('Read only')
  expect(wrapper.find('.kx-bar-r button').exists()).toBe(false)
})

it('clears a failed catalog read once a finished deletion is read back', async () => {
  const library = { id: 'library', name: 'Cleanup library', kb_type: 'records', access_level: 15 }
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

  const remove = wrapper.get('button[aria-label="Delete Cleanup library"]')
  const pressSpace = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
  expect(remove.element.dispatchEvent(pressSpace)).toBe(true)
  expect(api.get).not.toHaveBeenCalledWith('/api/v1/knowledge/library')

  listReads = [() => ({ success: false, error: 'cleanup status unavailable' })]
  await remove.trigger('click')
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
  const library = { id: 'library', name: 'Cleanup library', kb_type: 'records', access_level: 15 }
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

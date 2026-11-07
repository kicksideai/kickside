// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { api, loadByTagName, on } from '@wippy-fe/proxy'
import WorkflowList from './WorkflowList.vue'

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
  const workflow = { id: 'workflow', title: 'Cleanup workflow' }
  const receivers: Array<(message: unknown) => void> = []
  vi.mocked(on).mockImplementation((_topic, callback) => {
    receivers.push(callback as (message: unknown) => void)
    return vi.fn()
  })
  let listReads: Array<() => unknown> = [() => ({ success: true, workflows: [workflow] })]
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    if (url.startsWith('/api/v1/workflows?')) return { data: (listReads.shift() ?? (() => ({ success: true, workflows: [] })))() } as never
    if (url === '/api/v1/components/workflow') {
      return { data: { success: true, deleting_at: 'marked', deletion_job_id: 'job', deletion_job: { status: 'running', attempts: 1 } } } as never
    }
    return { data: { success: false } } as never
  })
  vi.mocked(api.delete).mockResolvedValue({ data: { success: true, in_progress: true, job_id: 'job' } } as never)
  vi.mocked(loadByTagName).mockResolvedValue(undefined as never)

  wrapper = mount(WorkflowList)
  await flushPromises()
  expect(wrapper.findAll('.wf-row')).toHaveLength(1)

  listReads = [() => ({ success: false, error: 'cleanup status unavailable' })]
  await wrapper.get('[aria-label="Actions for Cleanup workflow"]').trigger('click')
  await flushPromises()
  await wrapper.get('[role="menuitem"][aria-label="Delete"]').trigger('click')
  await flushPromises()
  const confirm = [...document.querySelectorAll<HTMLButtonElement>('.wf-del-modal button')].find(button => button.textContent?.trim() === 'Delete')
  confirm!.click()
  await flushPromises()
  expect(wrapper.get('.wf-banner').text()).toContain('cleanup status unavailable')
  expect(wrapper.findAll('.wf-row')).toHaveLength(1)
  expect(wrapper.text()).toContain('Deleting')

  for (const receive of receivers) receive({ event: 'component.deleted', component_id: 'workflow' })
  await flushPromises()

  expect(wrapper.findAll('.wf-row')).toHaveLength(0)
  expect(wrapper.find('.wf-banner').exists()).toBe(false)
  expect(vi.mocked(api.get).mock.calls.filter(([url]: unknown[]) => String(url).startsWith('/api/v1/workflows?'))).toHaveLength(3)
})

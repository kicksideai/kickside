// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { api, host, on } from '@wippy-fe/proxy'
import { useComponentDeletion } from '@kickside/ui-kit/useComponentDeletion'
import { useAutomationRealtime } from './useAutomationRealtime'
import type { Automation } from './automation-types'

vi.hoisted(() => {
  Object.defineProperty(window, '__WIPPY_APP_API__', {
    configurable: true,
    value: {
      api: { get: vi.fn() },
      on: vi.fn(),
      host: { handleError: vi.fn() },
    },
  })
})

let wrapper: ReturnType<typeof mount> | undefined
afterEach(() => { wrapper?.unmount(); vi.clearAllMocks() })

for (const pending of [false, true]) {
  it(`keeps deletion state during ${pending ? 'an outstanding drive read' : 'a metadata wakeup'} without reading the component`, async () => {
    const rows = ref<Automation[]>([{ id: 'automation', type: 'kind', title: 'Original',
      public_state: { status: 'active' }, drive_status: { drives: [] } }])
    const realtime = useAutomationRealtime(rows, () => undefined)
    wrapper = mount(defineComponent({ setup() {
      useComponentDeletion(rows, row => row.id)
      realtime.syncRealtimeSubscriptions()
      return () => null
    } }))
    const notify = vi.mocked(on).mock.calls.find(([topic]) => topic === 'component.automation')?.[1] as ((message: unknown) => void) | undefined
    const deletion = vi.mocked(on).mock.calls.find(([topic]) => topic === '@message')?.[1] as ((message: unknown) => void) | undefined
    expect(notify).toBeTypeOf('function')
    expect(deletion).toBeTypeOf('function')
    let resolve!: (value: unknown) => void
    vi.mocked(api.get).mockImplementation(() => new Promise(done => { resolve = done }) as never)
    if (pending) notify!({ event: 'component.meta.changed', component_id: 'automation', meta: {}, deleted: [] })
    deletion!({ event: 'component.deleting', component_id: 'automation', deletion_job_id: 'job' })
    if (!pending) notify!({ event: 'component.meta.changed', component_id: 'automation', meta: { title: 'Updated' }, deleted: [] })
    const drives = [{ drive_key: 'main', phase: 'active' }]
    resolve({ data: { success: true, drives } })
    await flushPromises()
    expect(rows.value[0].deletion_job_id).toBe('job')
    expect(rows.value[0].title).toBe(pending ? 'Original' : 'Updated')
    expect(rows.value[0].public_state?.status).toBe('active')
    expect(rows.value[0].drive_status?.drives).toEqual(drives)
    expect(host.handleError).not.toHaveBeenCalled()
    expect(vi.mocked(api.get).mock.calls.map(([url]: unknown[]) => url)).toEqual(['/api/v1/automations/automation/status'])
    deletion!({ event: 'component.deleted', component_id: 'automation' })
    expect(rows.value).toHaveLength(0)
    realtime.clearRealtimeSubscriptions()
  })
}

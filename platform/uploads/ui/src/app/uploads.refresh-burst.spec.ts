// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import Uploads from './uploads.vue'

const harness = globalThis as unknown as {
  __hostVisible: boolean
  __uploadHandlers__: unknown[]
  __uploadEmit__: (event: unknown) => void
  __setHostVisible: (visible: boolean) => void
}
const snapshot = (filename: string) => ({ data: { success: true, component_id: 'uploads-owner',
  uploads: [{ uuid: filename, filename, status: 'completed', size: 10, mime_type: 'text/plain' }], meta: { total: 1 } } })

function deferred() {
  let resolve!: (value: ReturnType<typeof snapshot>) => void
  let reject!: (cause: Error) => void
  const promise = new Promise<ReturnType<typeof snapshot>>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
function invalidate() {
  harness.__uploadEmit__({ event: 'component.meta.changed', component_id: 'uploads-owner', meta: { pending_count: 1 } })
}

describe('Uploads invalidation read admission', () => {
  beforeEach(() => {
    harness.__hostVisible = false
    harness.__uploadHandlers__ = []
    vi.mocked(api.get).mockReset().mockResolvedValue(snapshot('initial.txt'))
  })

  it('coalesces a burst while retaining a final read after the first snapshot', async () => {
    const view = mount(Uploads)
    await flushPromises()
    const reads = [deferred(), deferred()]
    vi.mocked(api.get).mockClear().mockImplementationOnce(() => reads[0].promise).mockImplementationOnce(() => reads[1].promise)
    invalidate()
    await flushPromises()
    for (let i = 0; i < 29; i++) invalidate()
    await flushPromises()
    expect(api.get).toHaveBeenCalledTimes(1)
    reads[0].resolve(snapshot('older.txt'))
    await flushPromises()
    expect(api.get).toHaveBeenCalledTimes(2)
    reads[1].resolve(snapshot('latest.txt'))
    await flushPromises()
    expect(api.get).toHaveBeenCalledTimes(2)
    expect(view.text()).toContain('latest.txt')
    expect(view.text()).not.toContain('older.txt')
  })

  it('ignores an old search response and refreshes the current query', async () => {
    const view = mount(Uploads)
    await flushPromises()
    const old = deferred(), current = deferred()
    vi.mocked(api.get).mockClear().mockImplementationOnce(() => old.promise).mockImplementationOnce(() => current.promise)
    invalidate()
    await flushPromises()
    await view.get('[data-testid="uploads-search-input"]').setValue('report')
    await vi.advanceTimersByTimeAsync(300)
    old.resolve(snapshot('obsolete.txt'))
    await flushPromises()
    expect(view.text()).not.toContain('obsolete.txt')
    expect(api.get).toHaveBeenLastCalledWith('/api/v1/uploads/list', { params: { limit: 30, offset: 0, q: 'report' } })
    current.resolve(snapshot('report.txt'))
    await flushPromises()
    expect(view.text()).toContain('report.txt')
  })

  it('continues the queued refresh after a request failure', async () => {
    const view = mount(Uploads)
    await flushPromises()
    const first = deferred()
    vi.mocked(api.get).mockClear().mockImplementationOnce(() => first.promise).mockResolvedValue(snapshot('recovered.txt'))
    invalidate()
    await flushPromises()
    invalidate()
    first.reject(new Error('temporary read failure'))
    await flushPromises()
    expect(api.get).toHaveBeenCalledTimes(2)
    expect(view.text()).toContain('recovered.txt')
    expect(view.text()).not.toContain('temporary read failure')
  })

  it('does not retain a settled read after a synchronous API failure', async () => {
    const view = mount(Uploads)
    await flushPromises()
    vi.mocked(api.get).mockClear().mockImplementationOnce(() => { throw new Error('bridge unavailable') })
    invalidate()
    await flushPromises()
    expect(view.text()).toContain('bridge unavailable')
    vi.mocked(api.get).mockResolvedValue(snapshot('reconnected.txt'))
    invalidate()
    await flushPromises()
    expect(api.get).toHaveBeenCalledTimes(2)
    expect(view.text()).toContain('reconnected.txt')
  })

  it('stops a queued refresh when the surface unmounts', async () => {
    const view = mount(Uploads)
    await flushPromises()
    const pending = deferred()
    vi.mocked(api.get).mockClear().mockImplementation(() => pending.promise)
    invalidate()
    await flushPromises()
    invalidate()
    view.unmount()
    pending.resolve(snapshot('late.txt'))
    await flushPromises()
    expect(api.get).toHaveBeenCalledTimes(1)
    expect(harness.__uploadHandlers__).toHaveLength(0)
  })

  it('does not start a scheduled initial read after immediate unmount', async () => {
    const view = mount(Uploads)
    view.unmount()
    await flushPromises()
    expect(api.get).not.toHaveBeenCalled()
    expect(harness.__uploadHandlers__).toHaveLength(0)
  })

  it('does not resubscribe after an in-flight visibility refresh outlives the surface', async () => {
    const view = mount(Uploads)
    await flushPromises()
    const pending = deferred()
    vi.mocked(api.get).mockClear().mockImplementation(() => pending.promise)
    harness.__setHostVisible(true)
    await flushPromises()
    view.unmount()
    pending.resolve(snapshot('late.txt'))
    await flushPromises()
    expect(api.get).toHaveBeenCalledTimes(1)
    expect(harness.__uploadHandlers__).toHaveLength(0)
  })
})

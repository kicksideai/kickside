import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { api, on } from '@wippy-fe/proxy'
import { useIngest } from './useIngest'

// useIngest uses host realtime + onBeforeUnmount, so it must run inside a
// component setup. This host exposes the returned API for assertions.
function host(onDone = () => {}) {
  let ig: ReturnType<typeof useIngest>
  const Comp = defineComponent({
    setup(_, { expose }) {
      ig = useIngest(() => 'kb1', onDone)
      expose(ig as any)
      return () => null
    },
  })
  const w = mount(Comp)
  return { w, ig: ig! }
}

const emit = (msg: any) => (globalThis as any).__kbEmit__(msg)
const uploadMessage = (uuid: string, status: string, error?: string) => ({
  topic: `upload:${uuid}`,
  data: {
    uuid, status, mime_type: 'text/plain', size: 1,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:01:00Z',
    meta: { filename: 'file.txt' }, ...(error ? { error } : {}),
  },
})

describe('useIngest', () => {
  beforeEach(() => { (globalThis as any).__kbHandlers__ = []; (globalThis as any).__kbApi__ = {}; vi.clearAllMocks() })
  afterEach(() => { vi.useRealTimers() })

  it('ingestText posts and shows a success message', async () => {
    ;(globalThis as any).__kbApi__ = { '/ingest': { success: true, external_id: 'text-1' } }
    const { w, ig } = host()
    await ig.ingestText('hello world', 'Note', 'text/markdown')
    await flushPromises()
    // Queued into the KB: terminal immediately (embedding runs in background).
    expect(ig.busy.value).toBe(false)
    expect(ig.okMsg.value).toContain('Added')
    w.unmount()
  })

  it('ingestText surfaces a server error', async () => {
    ;(globalThis as any).__kbApi__ = { '/ingest': { success: false, error: 'bad content' } }
    const { w, ig } = host()
    await ig.ingestText('x', '', 'text/plain')
    await flushPromises()
    expect(ig.errMsg.value).toBe('bad content')
    expect(ig.busy.value).toBe(false)
    w.unmount()
  })

  it('ignores empty content and missing kb', async () => {
    const { w, ig } = host()
    await ig.ingestText('   ', '', 'text/plain')
    expect(ig.busy.value).toBe(false)
    expect(ig.errMsg.value).toBe('')
    w.unmount()
  })

  it('uploadFile queues then completes via a realtime message', async () => {
    ;(globalThis as any).__kbApi__ = {
      '/upload-token': { success: true, upload_token: 't' },
      '/api/v1/uploads': { success: true, uuid: 'u9', component_id: 'uploads-u1' },
    }
    let done = 0
    const { w, ig } = host(() => { done++ })
    await ig.uploadFile(new File(['x'], 'f.txt', { type: 'text/plain' }))
    await flushPromises()
    expect(ig.busy.value).toBe(true) // queued, waiting on realtime
    // Drive upload completion; KB materialization is reflected by later component meta.
    emit(uploadMessage('u9', 'completed'))
    await flushPromises()
    expect(ig.busy.value).toBe(false)
    expect(done).toBe(1)
    w.unmount()
  })

  it('settles an upload that completed before realtime arrives', async () => {
    ;(globalThis as any).__kbApi__ = {
      '/upload-token': { success: true, upload_token: 't' },
      '/api/v1/uploads/u-fast': { success: true, upload: { uuid: 'u-fast', status: 'completed' } },
      '/api/v1/uploads': { success: true, uuid: 'u-fast', component_id: 'uploads-u1' },
    }
    const { w, ig } = host()
    await ig.uploadFile(new File(['x'], 'fast.txt', { type: 'text/plain' }))
    await flushPromises()
    await flushPromises()
    expect(ig.busy.value).toBe(false)
    expect(ig.okMsg.value).toContain('Added')
    w.unmount()
  })

  it('tracks upload completion when the response has no component id', async () => {
    ;(globalThis as any).__kbApi__ = {
      '/upload-token': { success: true, upload_token: 't' },
      '/api/v1/uploads': { success: true, uuid: 'u-no-topic' },
    }
    const { w, ig } = host()
    await ig.uploadFile(new File(['x'], 'file.txt', { type: 'text/plain' }))
    await flushPromises()
    expect(on).toHaveBeenCalledWith('@message', expect.any(Function))
    expect(ig.busy.value).toBe(true)
    emit(uploadMessage('u-no-topic', 'completed'))
    await flushPromises()
    expect(ig.busy.value).toBe(false)
    w.unmount()
  })

  it.each(['completed', 'error'])('settles delayed %s after the final status read', async (status) => {
    vi.useFakeTimers()
    ;(globalThis as any).__kbApi__ = {
      '/upload-token': { success: true, upload_token: 't' },
      '/api/v1/uploads/u-delayed': { success: true, upload: { uuid: 'u-delayed', status: 'processing' } },
      '/api/v1/uploads': { success: true, uuid: 'u-delayed', component_id: 'uploads-u1' },
    }
    const done = vi.fn()
    const { w, ig } = host(done)
    try {
      ig.uploadFile(new File(['x'], 'delayed.txt', { type: 'text/plain' }))
      await flushPromises()
      await vi.advanceTimersByTimeAsync(30000)
      const reads = vi.mocked(api.get).mock.calls.length
      expect(ig.items.value[0].status).toBe('processing')
      expect(ig.busy.value).toBe(true)
      emit(uploadMessage('u-delayed', status, status === 'error' ? 'Conversion failed' : undefined))
      await flushPromises()
      expect(ig.items.value[0].status).toBe(status === 'completed' ? 'done' : 'error')
      expect(ig.busy.value).toBe(false)
      expect(api.get).toHaveBeenCalledTimes(reads)
      expect(done).toHaveBeenCalledTimes(status === 'completed' ? 1 : 0)
      if (status === 'error') expect(ig.items.value[0].error).toBe('Conversion failed')
      emit(uploadMessage('u-delayed', status))
      emit(uploadMessage('u-delayed', 'processing'))
      expect(ig.busy.value).toBe(false)
      expect(done).toHaveBeenCalledTimes(status === 'completed' ? 1 : 0)
    } finally { w.unmount() }
  })

  it('settles only the matching upload in a batch and unbinds on unmount', async () => {
    ;(globalThis as any).__kbApi__ = { '/upload-token': { success: true, upload_token: 't' } }
    vi.mocked(api.post).mockResolvedValueOnce({ data: { success: true, upload_token: 't' } })
      .mockResolvedValueOnce({ data: { success: true, upload_token: 't' } })
      .mockResolvedValueOnce({ data: { success: true, uuid: 'first', component_id: 'uploads-u1' } })
      .mockResolvedValueOnce({ data: { success: true, uuid: 'second', component_id: 'uploads-u1' } })
    const done = vi.fn()
    const { w, ig } = host(done)
    try {
      ig.uploadFiles([new File(['a'], 'a.txt'), new File(['b'], 'b.txt')])
      await flushPromises()
      expect(ig.items.value.map(i => i.uuid)).toEqual(['first', 'second'])
      emit({ ...uploadMessage('first', 'completed'), topic: 'upload:other' })
      emit({ ...uploadMessage('other', 'completed'), topic: 'upload:first' })
      emit(uploadMessage('other', 'completed'))
      expect(ig.items.value.map(i => i.status)).toEqual(['processing', 'processing'])
      emit(uploadMessage('first', 'completed'))
      expect(ig.items.value.map(i => i.status)).toEqual(['done', 'processing'])
      expect(ig.busy.value).toBe(true)
      emit(uploadMessage('second', 'error', 'Conversion failed'))
      expect(ig.items.value.map(i => i.status)).toEqual(['done', 'error'])
      expect(ig.busy.value).toBe(false)
      expect(done).toHaveBeenCalledTimes(1)
    } finally { w.unmount() }
    expect((globalThis as any).__kbHandlers__).toHaveLength(0)
  })

  it('rejects unsupported files before requesting an upload token', async () => {
    const { w, ig } = host()
    await ig.uploadFile(new File(['x'], 'photo.png', { type: 'image/png' }))
    await flushPromises()
    expect(ig.busy.value).toBe(false)
    expect(ig.errMsg.value).toContain('not supported')
    expect(api.post).not.toHaveBeenCalledWith('/api/v1/knowledge/kb1/upload-token')
    w.unmount()
  })

  it('reports an embedding failure from realtime', async () => {
    ;(globalThis as any).__kbApi__ = { '/upload-token': { success: true, upload_token: 't' }, '/api/v1/uploads': { success: true, uuid: 'u1', component_id: 'uploads-u1' } }
    const { w, ig } = host()
    await ig.uploadFile(new File(['x'], 'f.txt'))
    await flushPromises()
    emit({
      topic: 'component.kb1',
      data: {
        event: 'component.meta.changed',
        component_id: 'kb1',
        meta: { status: 'error', last_error: 'embed boom' },
      },
    })
    await flushPromises()
    expect(ig.errMsg.value).toBe('embed boom')
    expect(ig.busy.value).toBe(false)
    w.unmount()
  })
})

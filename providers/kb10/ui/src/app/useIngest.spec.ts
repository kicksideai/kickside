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
    emit({ topic: 'component.uploads-u1.events', data: { event: 'kickside.uploads.events:upload.status.changed', upload_id: 'u9', status: 'completed' } })
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

  it('tracks upload completion by upload id when the response has no event topic', async () => {
    ;(globalThis as any).__kbApi__ = {
      '/upload-token': { success: true, upload_token: 't' },
      '/api/v1/uploads': { success: true, uuid: 'u-no-topic' },
    }
    const { w, ig } = host()
    await ig.uploadFile(new File(['x'], 'fallback.txt', { type: 'text/plain' }))
    await flushPromises()
    expect(on).toHaveBeenCalledWith('@message', expect.any(Function))
    expect(ig.busy.value).toBe(true)
    emit({ topic: 'any.topic', data: { event: 'kickside.uploads.events:upload.status.changed', upload_id: 'u-no-topic', status: 'completed' } })
    await flushPromises()
    expect(ig.busy.value).toBe(false)
    w.unmount()
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

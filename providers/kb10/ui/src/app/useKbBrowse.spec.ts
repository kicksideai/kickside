import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { api } from '@wippy-fe/proxy'
import { useKbBrowse } from './useKbBrowse'
import type { BrowseNode } from './types'

// useKbBrowse uses host realtime + onBeforeUnmount, so it must run inside a
// component setup. This host exposes the returned API for assertions.
function host(onChanged = () => {}) {
  let kb: ReturnType<typeof useKbBrowse>
  const Comp = defineComponent({
    setup(_, { expose }) {
      kb = useKbBrowse(() => 'kb1', { onChanged })
      expose(kb)
      return () => null
    },
  })
  const w = mount(Comp)
  return { w, kb: kb! }
}

const emit = (msg: any) => (globalThis as any).__kbEmit__(msg)
const metaEvent = () => ({
  topic: 'component.kb1',
  data: { event: 'component.meta.changed', component_id: 'kb1', meta: {} },
})

function doc(id: string, externalId: string | null, updatedAt?: string): BrowseNode {
  const metadata: Record<string, any> = { filename: `${id}.pdf` }
  if (externalId) metadata.external_id = externalId
  return { id, node_type: 'document', metadata, created_at: updatedAt, updated_at: updatedAt }
}

function deferred<T>() {
  let resolve!: (v: T) => void
  const promise = new Promise<T>((r) => { resolve = r })
  return { promise, resolve }
}

function browseCalls(): number {
  return vi.mocked(api.get).mock.calls.filter((c: Parameters<typeof api.get>) => String(c[0]).includes('/browse')).length
}

describe('useKbBrowse hardening', () => {
  beforeEach(() => {
    ;(globalThis as any).__kbHandlers__ = []
    ;(globalThis as any).__kbApi__ = {}
    vi.clearAllMocks()
  })

  it('collapses transient duplicate document nodes (same external_id) to the newest row', async () => {
    // The ingest window can briefly expose more than one document node for one
    // canonical source; the list must never show it twice.
    ;(globalThis as any).__kbApi__ = {
      '/kb10/kb1/browse': {
        success: true,
        nodes: [
          doc('A', 'upload:x', '2024-01-01T00:00:00Z'),
          doc('B', 'upload:x', '2024-01-02T00:00:00Z'),
          { id: 'C', node_type: 'chunk', parent_id: 'B', metadata: {} },
        ],
      },
    }
    const { w, kb } = host()
    await flushPromises()
    expect(kb.documents.value.map((n) => n.id)).toEqual(['B'])
    w.unmount()
  })

  it('fetches only the current page in one browse call and takes total from the API', async () => {
    // Server-side pagination: one page is read at a time and total is the real
    // match count, so a large KB never pulls its whole node set into one list.
    const page0 = Array.from({ length: 50 }, (_, i) => doc(`p0-${i}`, null))
    ;(globalThis as any).__kbApi__ = {
      'browse?limit=50&offset=0': { success: true, nodes: page0, total: 137 },
    }
    const { w, kb } = host()
    await flushPromises()
    expect(browseCalls()).toBe(1)
    expect(kb.documents.value.length).toBe(50)
    expect(kb.total.value).toBe(137)
    // total (not the page length) drives the page count.
    expect(kb.pageCount.value).toBe(Math.ceil(137 / 50))
    expect(kb.hasPrev.value).toBe(false)
    expect(kb.hasNext.value).toBe(true)
    w.unmount()
  })

  it('next() fetches the next offset and advances the page', async () => {
    const page0 = Array.from({ length: 50 }, (_, i) => doc(`p0-${i}`, null))
    const page1 = [doc('p1-a', null), doc('p1-b', null)]
    ;(globalThis as any).__kbApi__ = {
      'browse?limit=50&offset=0': { success: true, nodes: page0, total: 52 },
      'browse?limit=50&offset=50': { success: true, nodes: page1, total: 52 },
    }
    const { w, kb } = host()
    await flushPromises()
    vi.clearAllMocks()

    kb.next()
    await flushPromises()
    expect(kb.page.value).toBe(1)
    const lastUrl = String(vi.mocked(api.get).mock.calls.at(-1)?.[0])
    expect(lastUrl).toContain('offset=50')
    expect(kb.documents.value.map((n) => n.id)).toEqual(['p1-a', 'p1-b'])
    expect(kb.hasNext.value).toBe(false)
    w.unmount()
  })

  it('keeps documents without a canonical source identity as distinct rows', async () => {
    ;(globalThis as any).__kbApi__ = {
      '/kb10/kb1/browse': { success: true, nodes: [doc('A', null), doc('B', null)] },
    }
    const { w, kb } = host()
    await flushPromises()
    expect(kb.documents.value.map((n) => n.id).sort()).toEqual(['A', 'B'])
    w.unmount()
  })

  it('never lets a stale in-flight reload overwrite a newer one', async () => {
    ;(globalThis as any).__kbApi__ = { '/kb10/kb1/browse': { success: true, nodes: [] } }
    const { w, kb } = host()
    await flushPromises()
    vi.clearAllMocks()

    const stale = deferred<any>()
    const fresh = deferred<any>()
    vi.mocked(api.get).mockReturnValueOnce(stale.promise as any).mockReturnValueOnce(fresh.promise as any)

    const p1 = kb.reload()
    const p2 = kb.reload()
    // The newer request resolves first, the stale one later.
    fresh.resolve({ data: { success: true, nodes: [doc('FRESH', 'upload:z')] } })
    await flushPromises()
    stale.resolve({ data: { success: true, nodes: [doc('STALE', 'upload:y')] } })
    await flushPromises()
    await Promise.all([p1, p2])

    expect(kb.nodes.value.map((n) => n.id)).toEqual(['FRESH'])
    w.unmount()
  })

  it('coalesces a burst of realtime events into a bounded number of reloads', async () => {
    ;(globalThis as any).__kbApi__ = { '/kb10/kb1/browse': { success: true, nodes: [] } }
    const { w, kb } = host()
    await flushPromises()
    vi.clearAllMocks()

    for (let i = 0; i < 8; i++) emit(metaEvent())
    await flushPromises()

    // Single-flight + one trailing reload: a burst collapses to at most 2 GETs,
    // not one per event.
    expect(browseCalls()).toBeLessThanOrEqual(2)
    expect(browseCalls()).toBeGreaterThanOrEqual(1)
    w.unmount()
    void kb
  })

  it('reloads the current page on delete, clearing the pending row and decrementing total', async () => {
    ;(globalThis as any).__kbApi__ = {
      '/kb10/kb1/browse': { success: true, nodes: [doc('A', 'upload:gone')], total: 1 },
      '/knowledge/kb1/content': { success: true },
    }
    let changed = 0
    const { w, kb } = host(() => { changed++ })
    await flushPromises()
    expect(kb.total.value).toBe(1)

    const target = kb.documents.value[0]
    await kb.remove(target)
    await flushPromises()
    expect(kb.deleting.value[target.id]).toBe(true)
    vi.clearAllMocks()

    // Materialization drops the source; the reconcile reloads the current page,
    // clears the spinner, and total falls to the reported count.
    ;(globalThis as any).__kbApi__['/kb10/kb1/browse'] = { success: true, nodes: [], total: 0 }
    emit(metaEvent())
    await flushPromises()

    expect(browseCalls()).toBeGreaterThanOrEqual(1)
    const lastUrl = String(vi.mocked(api.get).mock.calls.at(-1)?.[0])
    expect(lastUrl).toContain('offset=0')
    expect(kb.deleting.value[target.id]).toBeUndefined()
    expect(kb.total.value).toBe(0)
    expect(changed).toBe(1)
    w.unmount()
  })
})

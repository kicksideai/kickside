import { describe, expect, it, vi } from 'vitest'
import { hasMore, loadWholeGraph, mergePage, newLoadState, progressOf } from './load-all'
import type { BundleRequest, GraphBundlePage } from './load-all'
import type { GraphEdge, GraphNode } from './types'

const node = (id: string, revision = 1): GraphNode =>
  ({ id, label: id, kind: 'observation', child_count: 0, revision, created_at: 1, updated_at: 1 })
const edge = (id: string, revision = 1): GraphEdge =>
  ({ id, from: 'a', to: 'b', kind: 'supports', revision, created_at: 1, updated_at: 1 })

function page(nodes: GraphNode[], edges: GraphEdge[], totals: [number, number], more = true): GraphBundlePage {
  return {
    manifest: { node_count: totals[0], edge_count: totals[1] },
    nodes,
    edges,
    complete: !more,
    omissions: {
      nodes: { continuation: more ? { node_offset: 1 } : undefined },
      edges: { continuation: undefined },
    },
  }
}

describe('whole-graph pages', () => {
  it('folds pages without doubling a record that arrives twice', () => {
    const state = newLoadState()
    mergePage(state, page([node('a'), node('b')], [edge('e1')], [3, 2]))
    mergePage(state, page([node('b'), node('c')], [edge('e1'), edge('e2')], [3, 2], false))
    expect(state.nodes.map(item => item.id)).toEqual(['a', 'b', 'c'])
    expect(state.edges.map(item => item.id)).toEqual(['e1', 'e2'])
    expect(state.chunks).toBe(2)
  })

  it('keeps the newer revision when a record is rewritten mid-load', () => {
    const state = newLoadState()
    mergePage(state, page([node('a', 4)], [], [1, 0]))
    mergePage(state, page([{ ...node('a', 7), label: 'renamed' }], [], [1, 0], false))
    expect(state.nodes).toHaveLength(1)
    expect(state.nodes[0].label).toBe('renamed')
    mergePage(state, page([{ ...node('a', 2), label: 'stale' }], [], [1, 0], false))
    expect(state.nodes[0].label).toBe('renamed')
  })

  it('folds each page into the index it already holds rather than rebuilding it', () => {
    const state = newLoadState()
    let reads = 0
    const watched = { ...node('watched') }
    Object.defineProperty(watched, 'id', { get() { reads++; return 'watched' }, enumerable: true, configurable: true })
    mergePage(state, page([watched], [], [40, 0]))
    const afterFirst = reads
    for (let index = 0; index < 20; index++) mergePage(state, page([node(`n${index}`)], [], [40, 0]))
    // A record already accumulated is never walked again by a later page, so a
    // whole-graph read costs the pages it reads rather than their square.
    expect(reads).toBe(afterFirst)
    expect(state.nodeIndex.get('watched')).toBe(0)
    expect(state.nodes).toHaveLength(21)
  })

  it('states the total from the manifest, never from what has arrived', () => {
    const state = newLoadState()
    mergePage(state, page([node('a')], [], [900, 1400]))
    expect(progressOf(state)).toEqual({ loaded: 1, total: 2300, ratio: 1 / 2300 })
  })

  it('never reports a ratio above one when the manifest lags the read', () => {
    const state = newLoadState()
    mergePage(state, page([node('a'), node('b'), node('c')], [], [1, 0], false))
    expect(progressOf(state).ratio).toBe(1)
  })

  it('reads a continuation on either collection as more to come', () => {
    expect(hasMore({ omissions: { nodes: { continuation: {} } } })).toBe(true)
    expect(hasMore({ omissions: { edges: { continuation: {} } } })).toBe(true)
    expect(hasMore({ omissions: { nodes: {}, edges: {} } })).toBe(false)
    expect(hasMore({})).toBe(false)
  })
})

describe('load all', () => {
  it('follows continuations to the end and reports every chunk', async () => {
    const pages = [
      page([node('a'), node('b')], [edge('e1')], [4, 2]),
      page([node('c'), node('d')], [edge('e2')], [4, 2], false),
    ]
    const fetchPage = vi.fn(async (request: { nodeOffset: number; edgeOffset: number }) => pages[request.nodeOffset / 2])
    const seen: number[] = []
    const state = await loadWholeGraph(fetchPage, { onChunk: value => seen.push(value.nodes.length) })
    expect(state.done).toBe(true)
    expect(state.nodes).toHaveLength(4)
    expect(seen).toEqual([2, 4])
    expect(fetchPage).toHaveBeenCalledTimes(2)
    expect(fetchPage.mock.calls[1][0]).toEqual({ nodeOffset: 2, edgeOffset: 1 })
  })

  it('stops when the reader stops it and keeps what arrived', async () => {
    const cancellation = { cancelled: false }
    const fetchPage = vi.fn(async () => page([node(`n${fetchPage.mock.calls.length}`)], [], [50, 0]))
    const state = await loadWholeGraph(fetchPage, {
      cancellation,
      onChunk: () => { cancellation.cancelled = true },
    })
    expect(state.cancelled).toBe(true)
    expect(state.done).toBe(false)
    expect(state.nodes).toHaveLength(1)
    expect(fetchPage).toHaveBeenCalledTimes(1)
  })

  it('stops rather than looping when a page carries no records at all', async () => {
    const fetchPage = vi.fn(async () => page([], [], [900, 0]))
    const state = await loadWholeGraph(fetchPage)
    expect(fetchPage).toHaveBeenCalledTimes(1)
    expect(state.done).toBe(true)
    expect(state.nodes).toHaveLength(0)
  })

  it('keeps following the continuation when a page only repeats records already read', async () => {
    // A graph written while it is being read hands back pages that overlap. The
    // server still routes the next page, and the records past the overlap are
    // only reached by following it.
    const pages: GraphBundlePage[] = [
      page([node('a'), node('b')], [], [3, 0]),
      page([node('a'), node('b')], [], [3, 0]),
      page([node('c')], [], [3, 0], false),
    ]
    let call = 0
    const fetchPage = vi.fn(async () => pages[Math.min(call++, pages.length - 1)])
    const state = await loadWholeGraph(fetchPage)
    expect(fetchPage).toHaveBeenCalledTimes(3)
    expect(state.nodes.map(item => item.id)).toEqual(['a', 'b', 'c'])
    expect(state.done).toBe(true)
  })

  it('reads the offsets from the pages the server answered, overlap included', async () => {
    const pages: GraphBundlePage[] = [
      page([node('a'), node('b')], [edge('e1')], [4, 2]),
      page([node('b'), node('c')], [edge('e1'), edge('e2')], [4, 2], false),
    ]
    const asked: BundleRequest[] = []
    await loadWholeGraph(async request => {
      asked.push(request)
      return pages[asked.length - 1]
    })
    expect(asked).toEqual([{ nodeOffset: 0, edgeOffset: 0 }, { nodeOffset: 2, edgeOffset: 1 }])
  })

  it('honours the chunk ceiling', async () => {
    let index = 0
    const fetchPage = vi.fn(async () => page([node(`n${index++}`)], [], [10_000, 0]))
    const state = await loadWholeGraph(fetchPage, { maxChunks: 5 })
    expect(fetchPage).toHaveBeenCalledTimes(5)
    expect(state.chunks).toBe(5)
    expect(state.done).toBe(true)
  })

  it('surfaces a failed page as an error and keeps earlier chunks', async () => {
    let call = 0
    const fetchPage = vi.fn(async () => {
      call++
      if (call === 2) throw new Error('the journal did not answer')
      return page([node('a')], [], [40, 0])
    })
    const state = await loadWholeGraph(fetchPage)
    expect(state.error).toBe('the journal did not answer')
    expect(state.nodes).toHaveLength(1)
    expect(state.done).toBe(false)
  })
})

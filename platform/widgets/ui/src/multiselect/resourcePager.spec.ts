import { describe, it, expect, vi } from 'vitest'
import { ResourcePager, toggleValue, type Page, type PageRequest, type PickRow } from './resourcePager.ts'

function row(id: string, extra: Partial<PickRow> = {}): PickRow {
  return { value: id, drillId: id, label: id, description: '', icon: '', meta: '', selectable: true, drillable: false, raw: { id }, ...extra }
}

function page(ids: string[], nextCursor: string | null = null, search?: boolean): Page {
  return { rows: ids.map(id => row(id)), nextCursor, search }
}

function deferred<T>() {
  let resolve!: (v: T) => void
  const promise = new Promise<T>(r => { resolve = r })
  return { promise, resolve }
}

describe('ResourcePager paging', () => {
  it('follows next_cursor page by page and appends the rows', async () => {
    const fetch = vi.fn(async (r: PageRequest) => r.cursor === 'c2' ? page(['c', 'd']) : page(['a', 'b'], 'c2'))
    const pager = new ResourcePager(fetch)
    await pager.search('')
    expect(pager.rows.map(r => r.value)).toEqual(['a', 'b'])
    expect(pager.hasMore).toBe(true)

    await pager.loadMore()
    expect(fetch).toHaveBeenLastCalledWith({ cursor: 'c2' })
    expect(pager.rows.map(r => r.value)).toEqual(['a', 'b', 'c', 'd'])
    expect(pager.hasMore).toBe(false)
    await pager.loadMore()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('keeps one row per id when a later page repeats one', async () => {
    const fetch = vi.fn(async (r: PageRequest) => r.cursor ? page(['b', 'c']) : page(['a', 'b'], 'next'))
    const pager = new ResourcePager(fetch)
    await pager.search('')
    await pager.loadMore()
    expect(pager.rows.map(r => r.value)).toEqual(['a', 'b', 'c'])
  })

  it('drops a page answered after the request was replaced', async () => {
    const slow = deferred<Page>()
    const fetch = vi.fn((r: PageRequest) => r.q === 'old' ? slow.promise : Promise.resolve(page(['fresh'])))
    const pager = new ResourcePager(fetch)
    const first = pager.search('old')
    await pager.search('new')
    slow.resolve(page(['stale']))
    await first
    expect(pager.rows.map(r => r.value)).toEqual(['fresh'])
    expect(pager.loading).toBe(false)
  })
})

describe('ResourcePager search', () => {
  it('sends the search text to a source that searches server-side', async () => {
    const fetch = vi.fn(async () => page(['a']))
    const pager = new ResourcePager(fetch, 'server')
    await pager.search('  alp ')
    expect(fetch).toHaveBeenLastCalledWith({ q: 'alp' })
    expect(pager.filtersLocally).toBe(false)
  })

  it('filters the loaded rows without asking a source that cannot search', async () => {
    const fetch = vi.fn(async () => ({ rows: [row('alpha'), row('beta', { description: 'has alp inside' }), row('gamma')], nextCursor: 'more' }))
    const pager = new ResourcePager(fetch, 'local')
    await pager.search('')
    await pager.search('alp')
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith({})
    expect(pager.filtersLocally).toBe(true)
    expect(pager.visible.map(r => r.value)).toEqual(['alpha', 'beta'])
    await pager.search('')
    expect(pager.visible).toHaveLength(3)
  })

  it('follows the search capability the source declares on its page', async () => {
    const fetch = vi.fn(async () => page(['a'], null, false))
    const pager = new ResourcePager(fetch, 'server')
    await pager.search('')
    expect(pager.serverSearch).toBe(false)
    await pager.search('a')
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(pager.filtersLocally).toBe(true)
  })

  it('asks again with the query once a source declares it searches', async () => {
    const fetch = vi.fn(async (r: PageRequest) => r.q ? page(['match'], null, true) : page(['x', 'y'], null, true))
    const pager = new ResourcePager(fetch, 'local')
    await pager.search('mat')
    expect(fetch).toHaveBeenNthCalledWith(1, {})
    expect(fetch).toHaveBeenNthCalledWith(2, { q: 'mat' })
    expect(pager.rows.map(r => r.value)).toEqual(['match'])
    expect(pager.filtersLocally).toBe(false)
  })
})

describe('ResourcePager drill-down', () => {
  it('opens a container with its id as parent and walks back up the trail', async () => {
    const fetch = vi.fn(async (r: PageRequest) => {
      if (r.parentId === 'ws') return page(['ws/repo'])
      if (r.parentId === 'team') return page(['team/repo'])
      return { rows: [row('ws', { value: '', drillable: true, selectable: false, label: 'Workspace' })], nextCursor: null }
    })
    const pager = new ResourcePager(fetch)
    await pager.search('')
    await pager.drill(pager.rows[0])
    expect(fetch).toHaveBeenLastCalledWith({ parentId: 'ws' })
    expect(pager.trail).toEqual([{ id: 'ws', label: 'Workspace' }])
    expect(pager.rows.map(r => r.value)).toEqual(['ws/repo'])

    await pager.drill(row('team', { drillable: true, label: 'Team' }))
    expect(pager.trail.map(l => l.id)).toEqual(['ws', 'team'])
    await pager.up(1)
    expect(pager.trail.map(l => l.id)).toEqual(['ws'])
    expect(fetch).toHaveBeenLastCalledWith({ parentId: 'ws' })
    await pager.up(0)
    expect(pager.trail).toEqual([])
    expect(fetch).toHaveBeenLastCalledWith({})
  })

  it('keeps the search text when drilling on a searching source', async () => {
    const fetch = vi.fn(async () => page(['a']))
    const pager = new ResourcePager(fetch)
    await pager.search('api')
    await pager.drill(row('org', { drillable: true }))
    expect(fetch).toHaveBeenLastCalledWith({ q: 'api', parentId: 'org' })
  })

  it('refuses to drill a row that is not a container', async () => {
    const fetch = vi.fn(async () => page(['a']))
    const pager = new ResourcePager(fetch)
    await pager.drill(row('leaf'))
    expect(fetch).not.toHaveBeenCalled()
    expect(pager.trail).toEqual([])
  })
})

describe('ResourcePager errors', () => {
  it('holds the failure and retries the page that failed', async () => {
    const boom = new Error('provider unavailable')
    let fail = true
    const fetch = vi.fn(async (r: PageRequest) => {
      if (r.cursor && fail) throw boom
      return r.cursor ? page(['b']) : page(['a'], 'c2')
    })
    const pager = new ResourcePager(fetch)
    await pager.search('')
    await pager.loadMore()
    expect(pager.error).toBe(boom)
    expect(pager.loading).toBe(false)
    expect(pager.rows.map(r => r.value)).toEqual(['a'])

    fail = false
    await pager.retry()
    expect(fetch).toHaveBeenLastCalledWith({ cursor: 'c2' })
    expect(pager.error).toBeNull()
    expect(pager.rows.map(r => r.value)).toEqual(['a', 'b'])
  })

  it('retries the first page when nothing loaded', async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValue(page(['a']))
    const pager = new ResourcePager(fetch)
    await pager.search('')
    expect(pager.error).toBeInstanceOf(Error)
    expect(pager.loaded).toBe(false)
    await pager.retry()
    expect(pager.rows.map(r => r.value)).toEqual(['a'])
  })
})

describe('toggleValue', () => {
  it('adds a value that is absent and removes one that is present', () => {
    expect(toggleValue(['a'], 'b')).toEqual(['a', 'b'])
    expect(toggleValue(['a', 'b'], 'a')).toEqual(['b'])
  })
})

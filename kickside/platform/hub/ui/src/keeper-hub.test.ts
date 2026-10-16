import { describe, it, expect } from 'vitest'
import { keeperHub, KeeperHubError, type Api } from './keeper-hub.ts'

// Minimal Api stub: each verb returns whatever the test queues, or records calls.
function stubApi(handlers: Partial<Record<'get' | 'post' | 'delete', (url: string, arg?: any) => Promise<any>>>): Api {
  const notImpl = (v: string) => () => Promise.reject(new Error(`${v} not stubbed`))
  return {
    get: (handlers.get || notImpl('get')) as Api['get'],
    post: (handlers.post || notImpl('post')) as Api['post'],
    delete: (handlers.delete || notImpl('delete')) as Api['delete'],
  }
}

describe('keeperHub — unwrap success', () => {
  it('returns the body on a successful response', async () => {
    const hub = keeperHub(stubApi({ get: async () => ({ data: { success: true, dependencies: [{ id: 'a' }] }, status: 200 }) }))
    const res = await hub.listDependencies()
    expect(res.dependencies).toEqual([{ id: 'a' }])
  })
})

describe('keeperHub — error mapping', () => {
  it('maps a { success:false } body to KeeperHubError with its code', async () => {
    const hub = keeperHub(stubApi({ get: async () => ({ data: { success: false, code: 'CONFLICT', error: 'nope' }, status: 200 }) }))
    await expect(hub.listDependencies()).rejects.toMatchObject({ name: 'KeeperHubError', code: 'CONFLICT', message: 'nope' })
  })

  it('maps an empty/malformed body to UNKNOWN', async () => {
    const hub = keeperHub(stubApi({ get: async () => ({ data: null, status: 200 }) }))
    await expect(hub.listDependencies()).rejects.toMatchObject({ code: 'UNKNOWN' })
  })

  it('maps a 401 rejection to UNAUTHORIZED', async () => {
    const hub = keeperHub(stubApi({ get: async () => { throw { response: { status: 401, data: {} } } } }))
    await expect(hub.authStatus()).rejects.toMatchObject({ code: 'UNAUTHORIZED', status: 401 })
  })

  it('maps a 403 rejection to FORBIDDEN', async () => {
    const hub = keeperHub(stubApi({ get: async () => { throw { response: { status: 403, data: {} } } } }))
    await expect(hub.authStatus()).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 })
  })

  it('maps a structured error in an axios rejection body', async () => {
    const hub = keeperHub(stubApi({ get: async () => { throw { response: { status: 409, data: { success: false, code: 'LOCKED', error: 'busy' } } } } }))
    await expect(hub.authStatus()).rejects.toMatchObject({ code: 'LOCKED', message: 'busy', status: 409 })
  })

  it('maps a bare network error to NETWORK', async () => {
    const hub = keeperHub(stubApi({ get: async () => { throw new Error('boom') } }))
    await expect(hub.authStatus()).rejects.toMatchObject({ code: 'NETWORK', message: 'boom' })
  })

  it('preserves a thrown KeeperHubError as-is', async () => {
    const original = new KeeperHubError('CUSTOM', 'x')
    const hub = keeperHub(stubApi({ get: async () => { throw original } }))
    await expect(hub.authStatus()).rejects.toBe(original)
  })
})

describe('keeperHub — fetchAllByKeyword', () => {
  it('uses the private catalog query to retain visibility across search identities and pages', async () => {
    const hub = keeperHub(stubApi({
      get: async (_url, cfg?: any) => {
        const { q, visibility, page } = cfg.params
        if (q) return { data: { success: true, items: [
          { full_name: 'acme/notes', keywords: ['tools'], visibility: 'unspecified' },
          { full_name: 'other/tasks', keywords: ['tools'], visibility: 'public' },
        ], total: 2 } }
        expect(visibility).toBe('private')
        return { data: { success: true, items: page === 1
          ? [{ full_name: 'unrelated/hidden', visibility: 'unspecified' }]
          : [{ org: 'acme', name: 'notes', visibility: 'unspecified' }], total: 2 } }
      },
    }))
    const rows = await hub.fetchAllByKeyword('tools', 1)
    expect(rows).toEqual([
      { full_name: 'acme/notes', keywords: ['tools'], visibility: 'private' },
      { full_name: 'other/tasks', keywords: ['tools'], visibility: 'public' },
    ])
  })

  it('surfaces private catalog errors instead of returning an incomplete visibility map', async () => {
    const hub = keeperHub(stubApi({
      get: async (_url, cfg?: any) => {
        if (cfg.params.q) return { data: { success: true, items: [
          { full_name: 'acme/notes', keywords: ['tools'], visibility: 'unspecified' },
        ], total: 1 } }
        throw new Error('private catalog unavailable')
      },
    }))
    await expect(hub.fetchAllByKeyword('tools')).rejects.toMatchObject({ message: 'private catalog unavailable' })
  })

  it('returns [] for empty / whitespace keywords without calling the api', async () => {
    let calls = 0
    const hub = keeperHub(stubApi({ get: async () => { calls++; return { data: { success: true, items: [] } } } }))
    expect(await hub.fetchAllByKeyword(['', '  '])).toEqual([])
    expect(calls).toBe(0)
  })

  it('filters by keyword and dedupes across tag queries', async () => {
    const byQ: Record<string, any[]> = {
      kickside: [
        { full_name: 'kickside/core', keywords: ['kickside'] },
        { full_name: 'kickside/self-reflection', keywords: [] },
        { org: 'kickside', name: 'sso' },
        { full_name: 'noise/thing', keywords: ['unrelated'] }, // dropped: no matching keyword
      ],
      'agent-tools': [
        { org: 'kickside', name: 'core', id: 'different-row-id', keywords: ['kickside', 'agent-tools'] }, // dup of above
        { full_name: 'acme/tools', keywords: ['agent-tools'] },
      ],
    }
    const hub = keeperHub(stubApi({
      get: async (_url: string, cfg?: any) => ({ data: { success: true, items: byQ[cfg.params.q] || [], total: (byQ[cfg.params.q] || []).length } }),
    }))
    const out = await hub.fetchAllByKeyword(['kickside', 'agent-tools'])
    expect(out.map(m => m.full_name || `${m.org}/${m.name}`)).toEqual([
      'kickside/core',
      'kickside/self-reflection',
      'kickside/sso',
      'acme/tools',
    ])
  })
})

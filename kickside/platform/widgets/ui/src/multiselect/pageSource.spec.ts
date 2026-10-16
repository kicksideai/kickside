import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api } from '@wippy-fe/proxy'
import { discoverySource, listSource, type RowKeys } from './pageSource.ts'

const keys: RowKeys = { idKey: 'id', labelKey: 'name', descKey: 'description', iconKey: 'icon', metaKey: '', drillKey: 'id' }

beforeEach(() => {
  vi.mocked(api.get).mockReset()
  vi.mocked(api.post).mockReset()
})

describe('listSource', () => {
  it('requests a page with the search text, cursor, and parent, and reads the cursor and search declaration', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { repositories: [{ id: 'r1', name: 'one' }], next_cursor: 'n2', search: false } } as never)
    const fetch = listSource({ source: '/api/v1/things', responseKey: 'repositories', pageSize: 25, keys })
    const page = await fetch({ q: 'o ne', cursor: 'c1', parentId: 'p1' })
    expect(api.get).toHaveBeenCalledWith('/api/v1/things?q=o+ne&limit=25&cursor=c1&parent_id=p1')
    expect(page.nextCursor).toBe('n2')
    expect(page.search).toBe(false)
    expect(page.rows[0]).toMatchObject({ value: 'r1', label: 'one', selectable: true, drillable: false })
  })

  it('appends to a source that already carries a query string and leaves the search capability undeclared when absent', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { items: [] } } as never)
    const page = await listSource({ source: '/api/x?kind=a', responseKey: '', pageSize: 20, keys })({})
    expect(api.get).toHaveBeenCalledWith('/api/x?kind=a&limit=20')
    expect(page.search).toBeUndefined()
    expect(page.nextCursor).toBeNull()
  })

  it('reads selectable and drillable flags a row declares', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { items: [
      { id: 'org', name: 'Org', selectable: false, drillable: true },
      { id: 'archived', name: 'Archived', selectable: false },
    ] } } as never)
    const page = await listSource({ source: '/s', responseKey: '', pageSize: 20, keys })({})
    expect(page.rows.map(r => [r.selectable, r.drillable])).toEqual([[false, true], [false, false]])
  })
})

describe('discoverySource', () => {
  it('posts the page request to the connection and takes the flags from the envelope items', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {
      success: true,
      resources: [
        { id: 'ws', name: 'Workspace', type: 'workspace' },
        { id: '42', name: 'api', full_path: 'acme/api', description: 'API service', type: 'repo' },
      ],
      items: [
        { id: 'ws', label: 'Workspace', selectable: false, drillable: true },
        { id: '42', label: 'api', selectable: true, drillable: false },
      ],
      next_cursor: 'p2',
    } } as never)
    const fetch = discoverySource({ connectionId: 'conn/1', discoverPath: '/api/v1/connections/{id}/discover_resources', pageSize: 50, keys: { ...keys, idKey: 'full_path' } })
    const page = await fetch({ q: 'ap', cursor: 'p1', parentId: 'ws' })
    expect(api.post).toHaveBeenCalledWith('/api/v1/connections/conn%2F1/discover_resources', { limit: 50, q: 'ap', cursor: 'p1', parent_id: 'ws' })
    expect(page.nextCursor).toBe('p2')
    expect(page.search).toBeUndefined()
    expect(page.rows[0]).toMatchObject({ value: '', drillId: 'ws', selectable: false, drillable: true })
    expect(page.rows[1]).toMatchObject({ value: 'acme/api', drillId: '42', label: 'api', description: 'API service', selectable: true })
  })

  it('treats a row the provider left unflagged as neither selectable nor drillable', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { resources: [{ id: 'x', name: 'X' }], items: [{ id: 'x', label: 'X', selectable: false, drillable: false }] } } as never)
    const page = await discoverySource({ connectionId: 'c', discoverPath: '/d/{id}', pageSize: 20, keys })({})
    expect(page.rows[0]).toMatchObject({ selectable: false, drillable: false })
  })

  it('refuses an envelope whose items do not pair with its resources', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { resources: [{ id: 'x', name: 'X' }], items: [] } } as never)
    await expect(discoverySource({ connectionId: 'c', discoverPath: '/d/{id}', pageSize: 20, keys })({})).rejects.toThrow(/do not match/)
  })
})

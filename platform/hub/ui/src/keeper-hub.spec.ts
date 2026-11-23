// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { describe, expect, it, vi } from 'vitest'
import { keeperHub, type Api } from './keeper-hub.ts'

describe('batch install planning', () => {
  it('uses the plan endpoint and returns the combined response intact', async () => {
    const args = { dependencies: [{ component: 'example/alpha', version: '>=1.1.0' }],
      run_migrations: true, migration_policy: 'up' as const }
    const result = { success: true, applicable: true, plans: [], install_payload: args }
    const post = vi.fn().mockResolvedValue({ data: result })
    const hub = keeperHub({ post } as unknown as Api)
    expect(await hub.planBatchInstall(args)).toBe(result)
    expect(post).toHaveBeenCalledWith('/api/v1/keeper/hub/dependencies/plan', args)
  })

  it('propagates a planner refusal without an install request', async () => {
    const post = vi.fn().mockResolvedValue({ data: { success: false, code: 'CONFLICT', error: 'incompatible roots' } })
    const hub = keeperHub({ post } as unknown as Api)
    await expect(hub.planBatchInstall({ dependencies: [{ component: 'example/alpha' }] })).rejects.toThrow('incompatible roots')
    expect(post).toHaveBeenCalledTimes(1)
  })
})

describe('catalog discovery', () => {
  const tagged = { full_name: 'kickside/sso', keywords: ['kickside'] }
  const foreign = { full_name: 'acme/presenter', keywords: ['slides'] }
  function browseApi() {
    const get = vi.fn(async (_url: string, config?: { params?: Record<string, unknown> }) => {
      const params = config?.params || {}
      if (params.visibility === 'private') return { data: { success: true, items: [foreign], total: 1 } }
      return { data: { success: true, items: params.q === 'kickside' ? [tagged, foreign] : [], total: 1 } }
    })
    return { get, hub: keeperHub({ get } as unknown as Api) }
  }

  it('lists readable private modules from other organizations with no extra request', async () => {
    const scoped = browseApi()
    expect((await scoped.hub.fetchAllByKeyword(['kickside', 'kickside-plugin'])).map(m => m.full_name))
      .toEqual(['kickside/sso'])
    const all = browseApi()
    const rows = await all.hub.fetchAllByKeyword(['kickside', 'kickside-plugin'], 100, true)
    expect(rows.map(m => [m.full_name, m.visibility])).toEqual([['kickside/sso', undefined], ['acme/presenter', 'private']])
    expect(all.get).toHaveBeenCalledTimes(scoped.get.mock.calls.length)
    expect(all.get).toHaveBeenCalledTimes(3)
  })
})

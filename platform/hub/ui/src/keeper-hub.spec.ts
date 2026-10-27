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

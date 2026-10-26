// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useModuleUpdates } from './useModuleUpdates.ts'
import type { InstalledRow } from './modules-page.types.ts'
import type { keeperHub } from '../keeper-hub.ts'

function fixture(withCycle = false) {
  const rows: InstalledRow[] = [{ id: 'app.deps:independent', namespace: 'app.deps', name: 'independent',
    component: 'example/independent', version: '1.0.0', is_root: true, used_by: [] }]
  if (withCycle) {
    for (const [name, dependent] of [['alpha', 'beta'], ['beta', 'alpha']]) {
      rows.push({ id: `app.deps:${name}`, namespace: 'app.deps', name,
        component: `example/${name}`, version: '1.0.0', is_root: true, used_by: [`example/${dependent}`] })
    }
  }
  const hub = { planInstall: vi.fn().mockResolvedValue({ success: true }),
    install: vi.fn().mockResolvedValue({ success: true }) }
  const refreshAll = vi.fn(async () => {})
  const refreshSelectedDetail = vi.fn(async () => {})
  const showToast = vi.fn()
  // The test supplies only the two Hub operations this update path invokes.
  const updates = useModuleUpdates({ hub: hub as unknown as ReturnType<typeof keeperHub>,
    installed: ref(rows), installedError: ref(null), installedCanUpdate: () => true,
    installedIsRoot: () => true, notifyModulesChanged: vi.fn(), showToast,
    refreshAll, refreshSelectedDetail })
  for (const row of rows) updates.updateScan.value[row.component] = {
    component: row.component, currentVersion: '1.0.0', latestVersion: '1.1.0', status: 'available',
  }
  return { updates, hub, refreshAll, refreshSelectedDetail, showToast }
}

describe('Update all status refresh', () => {
  it('refreshes committed independent updates even if the remaining graph contains a cycle', async () => {
    const f = fixture(true)
    await f.updates.updateAllAvailable()
    expect(f.hub.install).toHaveBeenCalledTimes(1)
    expect(f.updates.updateScan.value['example/independent'].status).toBe('updated')
    expect(f.updates.updateScan.value['example/alpha'].status).toBe('failed')
    expect(f.refreshAll).toHaveBeenCalledTimes(1)
    expect(f.refreshSelectedDetail).toHaveBeenCalledTimes(1)
    expect(f.updates.updateAllRunning.value).toBe(false)
  })

  it('reports a refresh failure without replaying or reclassifying committed installs', async () => {
    const f = fixture()
    f.refreshAll.mockRejectedValueOnce(new Error('list unavailable'))
    await f.updates.updateAllAvailable()
    expect(f.hub.install).toHaveBeenCalledTimes(1)
    expect(f.updates.updateScan.value['example/independent'].status).toBe('updated')
    expect(f.showToast).toHaveBeenLastCalledWith('error', expect.stringContaining('status could not be refreshed'))
    expect(f.updates.updateAllRunning.value).toBe(false)
  })
})

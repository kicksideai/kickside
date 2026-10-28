// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useInstallSecurityScan } from './useInstallSecurityScan.ts'
import type { InstallDialogProps } from './useInstallDialog.ts'

function fixture(current = true) {
  const plan = ref({ graph: [{ module: 'example/alpha', version: '1.0.0' }] })
  const planCurrent = ref(current)
  const hub = { scan: vi.fn().mockResolvedValue({ overall_status: 'clean', modules: [
    { module: 'example/alpha', version: '1.0.0', status: 'clean', findings: [] },
  ], scanned: 1, total: 1 }) }
  const props: InstallDialogProps = { open: true, mode: 'install', component: 'example/alpha', version: '1.0.0' }
  const securityScan = useInstallSecurityScan({ props, hub: hub as never, plan, planCurrent, versionArg: () => '1.0.0' })
  return { ...securityScan, hub, plan, planCurrent }
}

describe('install security scans', () => {
  it('starts only for the current install plan', async () => {
    const f = fixture(false)
    await f.runScanNow()
    expect(f.hub.scan).not.toHaveBeenCalled()

    f.planCurrent.value = true
    await f.runScanNow()
    expect(f.hub.scan).toHaveBeenCalledWith({ component: 'example/alpha', version: '1.0.0' })
  })

  it('retains a completed scan when the resolved plan artifacts are unchanged', async () => {
    const f = fixture()
    f.resetScanForPlan([{ module: 'example/alpha', version: '1.0.0' }])
    await f.runScanNow()
    expect(f.scan.value.status).toBe('clean')

    f.resetScanForPlan([{ module: 'example/alpha', version: '1.0.0' }])
    expect(f.scan.value.status).toBe('clean')

    f.resetScanForPlan([{ module: 'example/alpha', version: '1.1.0' }])
    expect(f.scan.value.status).toBe('idle')
  })

  it('refuses a scan that resolves a newer root than the current plan', async () => {
    const f = fixture()
    f.hub.scan.mockResolvedValueOnce({ overall_status: 'clean', modules: [
      { module: 'example/alpha', version: '1.1.0', status: 'clean', findings: [] },
    ], scanned: 1, total: 1 })

    await f.runScanNow()
    expect(f.scan.value.status).toBe('error')
    expect(f.scan.value.error).toContain('different module versions')
  })

  it('refuses a scan whose transitive dependency differs from the current plan', async () => {
    const f = fixture()
    f.plan.value.graph.push({ module: 'example/beta', version: '2.0.0' })
    f.hub.scan.mockResolvedValueOnce({ overall_status: 'clean', modules: [
      { module: 'example/alpha', version: '1.0.0', status: 'clean', findings: [] },
      { module: 'example/beta', version: '2.1.0', status: 'clean', findings: [] },
    ], scanned: 2, total: 2 })

    await f.runScanNow()
    expect(f.scan.value.status).toBe('error')
  })

  it('ignores an in-flight result after the plan artifacts change', async () => {
    const f = fixture()
    let complete!: (result: { overall_status: string; modules: { module: string; version: string; status: string; findings: never[] }[]; scanned: number; total: number }) => void
    f.hub.scan.mockImplementationOnce(() => new Promise(resolve => { complete = resolve }))
    f.resetScanForPlan(f.plan.value.graph)
    const pending = f.runScanNow()
    f.resetScanForPlan([{ module: 'example/alpha', version: '1.1.0' }])
    complete({ overall_status: 'clean', modules: [
      { module: 'example/alpha', version: '1.0.0', status: 'clean', findings: [] },
    ], scanned: 1, total: 1 })
    await pending
    expect(f.scan.value.status).toBe('idle')
  })
})

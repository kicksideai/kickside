import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useOnboardingInstallQueue } from './useOnboardingInstallQueue.ts'
import type { keeperHub } from '../keeper-hub.ts'

function fixture() {
  const installed = ref(new Set<string>())
  const hub = {
    securityProjectionStatus: vi.fn(async () => ({ current: true })),
    planInstall: vi.fn(async () => ({ success: true, requirements: [
      { name: 'required_setup', default: 'registry:v1:acme.tools:setup' },
    ] })),
    install: vi.fn(async () => { installed.value.add('acme/tools'); return { success: true } }),
    requiredSetupStatus: vi.fn(async () => ({ success: true, descriptor: 'acme.tools:setup', contract: 'setup:v1', ready: false, status: 'missing' })),
    applyRequiredSetup: vi.fn(async () => ({ success: true, descriptor: 'acme.tools:setup', contract: 'setup:v1', ready: true, status: 'ready' })),
  }
  const error = ref('')
  let controls!: ReturnType<typeof useOnboardingInstallQueue>
  const w = mount({ setup() {
    controls = useOnboardingInstallQueue({
      hub: hub as unknown as ReturnType<typeof keeperHub>, installed,
      installedCount: ref(0), error,
      selectableCandidates: () => installed.value.has('acme/tools') ? [] : [{ full_name: 'acme/tools' }],
      candidateKey: () => 'acme/tools', candidateById: () => ({ full_name: 'acme/tools' }),
      queuedLabel: () => 'Tools', profileParameters: () => undefined,
      loadInstalled: async () => {}, apiMessage: cause => String(cause),
    })
    return () => null
  } })
  controls.addQueued(['acme/tools'])
  return { controls, hub, error, w }
}

describe('onboarding required setup completion', () => {
  it('retains a failed setup for retry after the package installs', async () => {
    const { controls, hub, w } = fixture()
    hub.applyRequiredSetup.mockRejectedValueOnce(new Error('Setup fails'))
    await controls.startQueue()
    expect(controls.queueLedger.value[0].status).toBe('failed')
    expect(controls.queueCompleted.value).toBe(0)
    expect(controls.queue.value).toEqual(['acme/tools'])
    hub.requiredSetupStatus.mockResolvedValueOnce({ success: true, descriptor: 'acme.tools:setup', contract: 'setup:v1', ready: false, status: 'missing' })
      .mockResolvedValueOnce({ success: true, descriptor: 'acme.tools:setup', contract: 'setup:v1', ready: true, status: 'ready' })
    await controls.startQueue()
    expect(controls.queueLedger.value[0].status).toBe('installed')
    expect(controls.queueCompleted.value).toBe(1)
    expect(hub.install).toHaveBeenCalledTimes(1)
    w.unmount()
  })
})

import { describe, expect, it, vi } from 'vitest'
import { KeeperHubError } from '../keeper-hub.ts'
import { requiredSetupDescriptors, runRequiredSetups } from './requiredSetup.ts'

function client() {
  return {
    requiredSetupStatus: vi.fn(async () => ({ success: true, descriptor: 'acme.tools:setup', contract: 'setup:v1', ready: false, status: 'missing' })),
    applyRequiredSetup: vi.fn(async () => ({ success: true, descriptor: 'acme.tools:setup', contract: 'setup:v1', ready: true, status: 'ready' })),
  }
}

describe('module-declared required setup', () => {
  it('collects every declared setup once, including dependencies', () => {
    expect(requiredSetupDescriptors([
      { name: 'required_setup', default: 'registry:v1:acme.tools:setup' },
      { name: 'required_setup', value: 'registry:v1:acme.tools:setup' },
      { short_name: 'required_setup', transitive: true, default: 'registry:v1:acme.dep:setup' },
      { name: 'router', default: 'app:api' },
    ])).toEqual(['acme.tools:setup', 'acme.dep:setup'])
  })

  it('rejects a malformed declaration instead of claiming installation succeeds', () => {
    expect(() => requiredSetupDescriptors([{ name: 'required_setup', default: 'https://example.com/setup' }])).toThrow('required setup')
  })

  it('applies missing setup and verifies readiness before completing', async () => {
    const hub = client()
    hub.requiredSetupStatus.mockResolvedValueOnce({ success: true, descriptor: 'acme.tools:setup', contract: 'setup:v1', ready: false, status: 'missing' })
      .mockResolvedValueOnce({ success: true, descriptor: 'acme.tools:setup', contract: 'setup:v1', ready: true, status: 'ready' })
    await runRequiredSetups(hub, ['acme.tools:setup'])
    expect(hub.applyRequiredSetup).toHaveBeenCalledWith('acme.tools:setup')
    expect(hub.requiredSetupStatus).toHaveBeenCalledTimes(2)
  })

  it('does not apply already-ready setup or dispatch anything for ordinary modules', async () => {
    const hub = client()
    hub.requiredSetupStatus.mockResolvedValue({ success: true, descriptor: 'acme.tools:setup', contract: 'setup:v1', ready: true, status: 'ready' })
    await runRequiredSetups(hub, [])
    expect(hub.requiredSetupStatus).not.toHaveBeenCalled()
    await runRequiredSetups(hub, ['acme.tools:setup'])
    expect(hub.applyRequiredSetup).not.toHaveBeenCalled()
  })

  it('fails on an unsuccessful action and on a failed verification', async () => {
    const hub = client()
    hub.applyRequiredSetup.mockRejectedValueOnce(new KeeperHubError('SETUP_FAILED', 'Setup fails'))
    await expect(runRequiredSetups(hub, ['acme.tools:setup'])).rejects.toThrow('Setup fails')
    await expect(runRequiredSetups(hub, ['acme.tools:setup'])).rejects.toThrow('verification')
  })

  it('keeps a superseded installation from applying setup', async () => {
    const hub = client()
    await expect(runRequiredSetups(hub, ['acme.tools:setup'], { isCurrent: () => false })).rejects.toThrow('superseded')
    expect(hub.applyRequiredSetup).not.toHaveBeenCalled()
  })
  it('keeps the 30-second descriptor visibility deadline', async () => {
    vi.useFakeTimers()
    try {
      const hub = client()
      hub.requiredSetupStatus.mockRejectedValue(new KeeperHubError('NOT_FOUND', 'Not visible', 404))
      const result = expect(runRequiredSetups(hub, ['acme.tools:setup'])).rejects.toThrow('does not become available')
      await vi.advanceTimersByTimeAsync(30_000)
      await result
      expect(hub.applyRequiredSetup).not.toHaveBeenCalled()
    } finally { vi.useRealTimers() }
  })

})

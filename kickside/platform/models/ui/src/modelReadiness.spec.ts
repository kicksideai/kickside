import { describe, expect, it } from 'vitest'
import { usableFastModelContext } from './modelReadiness.ts'

const model = { name: 'gpt-fast', provider_id: 'provider', provider_profile_id: 'p1', capabilities: ['generate'], enabled: true }
const fast = { name: 'fast', declared: true, capability: 'generate', models: [{ name: 'gpt-fast' }] }

describe('onboarding model readiness', () => {
  it('is false without a persisted provider profile', () => {
    expect(usableFastModelContext([], [model], [fast])).toBeNull()
  })

  it('is false for an unhealthy provider profile', () => {
    expect(usableFastModelContext([
      { id: 'p1', name: 'Broken', provider_id: 'provider', enabled: true, status: 'unhealthy' },
    ], [model], [fast])).toBeNull()
  })

  it('is true for an enabled assigned fast generation model on a usable profile', () => {
    const profiles = [
      { id: 'p1', name: 'Ready', provider_id: 'provider', enabled: true, status: 'healthy' },
    ]
    expect(usableFastModelContext(profiles, [model], [fast])).not.toBeNull()
    expect(usableFastModelContext(profiles, [{ ...model, title: 'Fast GPT' }], [fast])).toEqual({
      class: 'fast',
      model: 'gpt-fast',
      title: 'Fast GPT',
      provider_id: 'provider',
    })
  })

  it('does not substitute a different configured generation class for fast', () => {
    expect(usableFastModelContext([
      { id: 'p1', name: 'Ready', provider_id: 'provider', enabled: true },
    ], [model], [{ ...fast, name: 'balanced' }])).toBeNull()
  })

  it('does not rescue an explicitly unhealthy profile with a healthy profile for the same provider', () => {
    expect(usableFastModelContext([
      { id: 'p1', name: 'Broken', provider_id: 'provider', enabled: true, status: 'unhealthy' },
      { id: 'p2', name: 'Healthy', provider_id: 'provider', enabled: true, status: 'healthy' },
    ], [model], [fast])).toBeNull()
  })

  it('rejects a stale cross-provider profile binding', () => {
    expect(usableFastModelContext([
      { id: 'p1', name: 'Other provider', provider_id: 'provider-b', enabled: true, status: 'healthy' },
    ], [model], [fast])).toBeNull()
  })
})

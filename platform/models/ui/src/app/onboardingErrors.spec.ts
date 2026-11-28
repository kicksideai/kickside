// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { beforeEach, describe, expect, it, vi } from 'vitest'

const post = vi.fn()
const get = vi.fn()
vi.mock('@wippy-fe/proxy', () => ({ api: { post, get } }))

const { useModelsApi } = await import('./useModelsApi.ts')
const { connectFailure } = await import('../providerBilling.ts')

describe('onboarding connection failure', () => {
  beforeEach(() => {
    post.mockReset()
    get.mockReset()
    get.mockResolvedValue({ data: { adapters: [], presets: [], profiles: [], models: [] } })
  })

  it('passes the provider error type from a failed probe', async () => {
    post.mockRejectedValue({ response: { data: { success: false, error: 'connection test failed', diagnostics: { error_type: 'insufficient_credits', status_code: 400 } } } })
    const result = await useModelsApi().testProfile('p1')
    expect(result).toEqual({ ok: false, message: 'connection test failed', errorType: 'insufficient_credits' })
  })

  it('passes the provider error type from a failed discovery body', async () => {
    post.mockResolvedValue({ data: { success: false, error: 'provider request failed', diagnostics: { error_type: 'invalid_key' } } })
    const result = await useModelsApi().discover('p1')
    expect(result.errorType).toBe('invalid_key')
  })

  it('ignores an unknown error type', async () => {
    post.mockRejectedValue({ response: { data: { error: 'boom', diagnostics: { error_type: 'other' } } } })
    const result = await useModelsApi().testProfile('p1')
    expect(result.errorType).toBeUndefined()
  })

  it('shows add credits with the provider billing page for an empty balance', () => {
    expect(connectFailure('x', 'insufficient_credits', 'wippy.llm.claude:provider')).toEqual({
      message: 'The key works, but the provider account has no credits. Add credits, then connect again.',
      errorType: 'insufficient_credits',
      billingUrl: 'https://platform.claude.com/settings/billing',
    })
    expect(connectFailure('x', 'insufficient_credits', 'wippy.llm.openai:provider').billingUrl)
      .toBe('https://platform.openai.com/settings/organization/billing')
    expect(connectFailure('x', 'insufficient_credits', 'wippy.llm.google.generative_ai:provider').billingUrl)
      .toBe('https://aistudio.google.com/billing')
    expect(connectFailure('x', 'insufficient_credits', 'wippy.llm.openai_compat:provider').billingUrl).toBeUndefined()
  })

  it('tells a bad key apart from an empty balance', () => {
    const failure = connectFailure('x', 'invalid_key', 'wippy.llm.claude:provider')
    expect(failure.billingUrl).toBeUndefined()
    expect(failure.message).toContain('does not accept this API key')
    expect(connectFailure('raw message', undefined, 'wippy.llm.claude:provider')).toEqual({ message: 'raw message' })
  })
})

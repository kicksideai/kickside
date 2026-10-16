import { describe, expect, it, vi } from 'vitest'
import { handleInstrumentRequirementResolution } from './instrumentRequirementResolution'

describe('instrument requirement resolution bridge', () => {
  it('accepts the host request and forwards bounded planner context', async () => {
    const post = vi.fn().mockResolvedValue({ data: { success: true, parameters: [{ name: 'acme:router', value: 'app:api' }] } })
    const accept = vi.fn()
    const respond = vi.fn()
    await handleInstrumentRequirementResolution({ api: { post } }, {
      component: 'acme/tools',
      version: '>=1.0.0',
      parameters: [{ name: 'acme:db', value: 'app:db' }],
      requirement_bindings: [{ name: 'dep:enabled', value: false }],
      requirements: [{ name: 'acme:router', candidates: [{ value: 'app:api' }] }],
      accept,
      respond,
    })
    expect(accept).toHaveBeenCalledOnce()
    expect(post).toHaveBeenCalledWith('/api/v1/onboarding/requirement-resolution', expect.objectContaining({
      component: 'acme/tools',
      version: '>=1.0.0',
      requirement_bindings: [{ name: 'dep:enabled', value: false }],
    }), { signal: undefined })
    expect(respond).toHaveBeenCalledWith({ success: true, parameters: [{ name: 'acme:router', value: 'app:api' }] })
  })

  it('does not accept malformed or already-aborted requests', async () => {
    const post = vi.fn()
    const respond = vi.fn()
    await handleInstrumentRequirementResolution({ api: { post } }, { component: '', requirements: [], respond })
    expect(post).not.toHaveBeenCalled()
    expect(respond).toHaveBeenCalledWith(expect.objectContaining({ code: 'BAD_REQUEST' }))

    const controller = new AbortController()
    controller.abort()
    respond.mockClear()
    await handleInstrumentRequirementResolution({ api: { post } }, {
      component: 'acme/tools', requirements: [], signal: controller.signal, respond,
    })
    expect(respond).toHaveBeenCalledWith(expect.objectContaining({ code: 'ABORTED' }))
  })
})

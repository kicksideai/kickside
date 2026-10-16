import { describe, expect, it, vi } from 'vitest'
import {
  handleInstrumentRecommendationRequest,
  requestInstrumentRecommendations,
  type InstrumentAssistRuntime,
  type InstrumentCandidate,
  type InstrumentConfiguredComponent,
  type InstrumentModelContext,
} from './instrumentRecommendations'

const candidates: InstrumentCandidate[] = [{
  component: 'kickside/analysis',
  title: 'Statistical Analysis',
  description: 'Analyze uploaded datasets.',
  keywords: ['analysis', 'data'],
}]
const configuredComponents: InstrumentConfiguredComponent[] = [
  { component: 'kickside/core', title: 'Core', version: '0.1.18', relationship: 'transitive' },
  { component: 'kickside/agents', title: 'Agents', version: '0.1.4', relationship: 'root' },
]
const modelContext: InstrumentModelContext = {
  class: 'fast',
  model: 'gpt-fast',
  title: 'Fast GPT',
  provider_id: 'wippy.llm.openai:provider',
}

function runtimeReturning(data: unknown) {
  const post = vi.fn<InstrumentAssistRuntime['api']['post']>(async () => ({ data }))
  return { runtime: { api: { post } }, post }
}

describe('instrument recommendation one-shot POST bridge', () => {
  it('posts the grounded request to the admin-only recommendation endpoint', async () => {
    const { runtime, post } = runtimeReturning({
      success: true,
      component_ids: ['kickside/analysis'],
    })
    const controller = new AbortController()

    await expect(requestInstrumentRecommendations(
      runtime,
      'Analyze sales',
      candidates,
      configuredComponents,
      controller.signal,
    )).resolves.toEqual({ success: true, component_ids: ['kickside/analysis'] })

    expect(post).toHaveBeenCalledOnce()
    expect(post).toHaveBeenCalledWith('/api/v1/onboarding/module-recommendations', {
      need: 'Analyze sales',
      candidates,
      workspace_context: { configured_components: configuredComponents },
    }, { signal: controller.signal })
  })

  it('normalizes and bounds candidate and workspace data before posting', async () => {
    const { runtime, post } = runtimeReturning({ success: true, component_ids: [] })
    const rawCandidates = Array.from({ length: 62 }, (_, index) => ({
      component: `  kickside/module-${index}  `,
      title: ` ${'t'.repeat(120)} `,
      description: ` ${'d'.repeat(260)} `,
      keywords: Array.from({ length: 10 }, (_, keyword) => ` ${index}-${keyword}-${'k'.repeat(60)} `),
    }))
    const rawConfigured = Array.from({ length: 82 }, (_, index) => ({
      component: `  kickside/configured-${index}  `,
      title: ` ${'c'.repeat(120)} `,
      version: ` ${'1'.repeat(60)} `,
      relationship: index % 2 ? 'root' : 'transitive',
    }))

    await handleInstrumentRecommendationRequest(runtime, modelContext, {
      need: `  ${'n'.repeat(1300)}  `,
      candidates: rawCandidates,
      workspace_context: { configured_components: rawConfigured },
      respond: vi.fn(),
    })

    const body = post.mock.calls[0]?.[1] as {
      need: string
      candidates: InstrumentCandidate[]
      workspace_context: { configured_components: InstrumentConfiguredComponent[] }
    }
    expect(body.need).toHaveLength(1200)
    expect(body.candidates).toHaveLength(60)
    expect(body.candidates[0]).toEqual({
      component: 'kickside/module-0',
      title: 't'.repeat(100),
      description: 'd'.repeat(240),
      keywords: Array.from({ length: 8 }, (_, keyword) => `0-${keyword}-${'k'.repeat(60)}`.slice(0, 48)),
    })
    expect(body.workspace_context.configured_components).toHaveLength(80)
    expect(body.workspace_context.configured_components[0]).toEqual({
      component: 'kickside/configured-0',
      title: 'c'.repeat(100),
      version: '1'.repeat(48),
      relationship: 'transitive',
    })
  })

  it('gates the request on a valid configured fast model', async () => {
    const { runtime, post } = runtimeReturning({ success: true, component_ids: [] })
    const accept = vi.fn()
    const respond = vi.fn()

    await handleInstrumentRecommendationRequest(runtime, null, {
      need: 'Analyze sales', candidates, accept, respond,
    })

    expect(accept).not.toHaveBeenCalled()
    expect(post).not.toHaveBeenCalled()
    expect(respond).toHaveBeenCalledWith({
      success: false,
      code: 'MODEL_UNAVAILABLE',
      error: 'Configure an AI model to use package recommendations.',
    })
  })

  it('accepts synchronously, then forwards the typed success response', async () => {
    let resolvePost!: (value: { data: unknown }) => void
    const post = vi.fn(() => new Promise<{ data: unknown }>(resolve => { resolvePost = resolve }))
    const runtime = { api: { post } } as InstrumentAssistRuntime
    const accept = vi.fn()
    const respond = vi.fn()

    const pending = handleInstrumentRecommendationRequest(runtime, modelContext, {
      need: 'Analyze sales', candidates, accept, respond,
    })

    expect(accept).toHaveBeenCalledOnce()
    expect(respond).not.toHaveBeenCalled()
    resolvePost({ data: { success: true, component_ids: ['kickside/analysis'] } })
    await pending
    expect(respond).toHaveBeenCalledWith({
      success: true,
      component_ids: ['kickside/analysis'],
    })
  })

  it('forwards typed HTTP errors and maps cancellation without session cleanup', async () => {
    const serverError = {
      success: false,
      code: 'INVALID_AGENT_OUTPUT',
      error: 'The recommendation agent returned invalid JSON.',
    }
    const post = vi.fn()
      .mockRejectedValueOnce({ response: { data: serverError } })
      .mockRejectedValueOnce(Object.assign(new Error('cancelled'), { name: 'AbortError' }))
    const runtime = { api: { post } } as InstrumentAssistRuntime
    const serverRespond = vi.fn()
    const abortRespond = vi.fn()

    await handleInstrumentRecommendationRequest(runtime, modelContext, {
      need: 'Analyze sales', candidates, respond: serverRespond,
    })
    await handleInstrumentRecommendationRequest(runtime, modelContext, {
      need: 'Analyze sales', candidates, respond: abortRespond,
    })

    expect(serverRespond).toHaveBeenCalledWith(serverError)
    expect(abortRespond).toHaveBeenCalledWith({
      success: false,
      code: 'ABORTED',
      error: 'AI recommendations were cancelled.',
    })
    expect(post).toHaveBeenCalledTimes(2)
  })

  it('returns a typed abort before making a request', async () => {
    const { runtime, post } = runtimeReturning({ success: true, component_ids: [] })
    const controller = new AbortController()
    controller.abort()
    const accept = vi.fn()
    const respond = vi.fn()

    await handleInstrumentRecommendationRequest(runtime, modelContext, {
      need: 'Analyze sales', candidates, signal: controller.signal, accept, respond,
    })

    expect(accept).not.toHaveBeenCalled()
    expect(post).not.toHaveBeenCalled()
    expect(respond).toHaveBeenCalledWith({
      success: false,
      code: 'ABORTED',
      error: 'AI recommendations were cancelled.',
    })
  })
})

const RECOMMENDATIONS_ENDPOINT = '/api/v1/onboarding/module-recommendations'

export interface InstrumentCandidate {
  component: string
  title: string
  description: string
  keywords: string[]
}

export interface InstrumentConfiguredComponent {
  component: string
  title?: string
  version?: string
  relationship: 'root' | 'transitive'
}

export interface InstrumentModelContext {
  class: 'fast'
  model: string
  title: string
  provider_id: string
}

interface ApiLike {
  post: (
    url: string,
    body: Record<string, unknown>,
    config?: { signal?: AbortSignal },
  ) => Promise<{ data?: unknown }>
}

export interface InstrumentAssistRuntime {
  api: ApiLike
}

export interface InstrumentRecommendationRequest {
  need?: unknown
  candidates?: unknown
  workspace_context?: unknown
  signal?: AbortSignal
  accept?: () => void
  respond?: (result: unknown) => void
}

function boundedString(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function normalizeModelContext(value: unknown): InstrumentModelContext | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Partial<InstrumentModelContext>
  const model = boundedString(row.model, 160)
  const title = boundedString(row.title, 160)
  const providerId = boundedString(row.provider_id, 200)
  if (row.class !== 'fast' || !model || !title || !providerId) return null
  return { class: 'fast', model, title, provider_id: providerId }
}

function normalizeConfiguredComponents(value: unknown): InstrumentConfiguredComponent[] {
  if (!Array.isArray(value)) return []
  const out: InstrumentConfiguredComponent[] = []
  const seen = new Set<string>()
  for (const raw of value.slice(0, 80)) {
    if (!raw || typeof raw !== 'object') continue
    const row = raw as Partial<InstrumentConfiguredComponent>
    const component = boundedString(row.component, 200)
    const key = component.toLowerCase()
    if (!component || seen.has(key) || (row.relationship !== 'root' && row.relationship !== 'transitive')) continue
    seen.add(key)
    const title = boundedString(row.title, 100)
    const version = boundedString(row.version, 48)
    out.push({
      component,
      ...(title ? { title } : {}),
      ...(version ? { version } : {}),
      relationship: row.relationship,
    })
  }
  return out
}

function normalizeCandidates(value: unknown): InstrumentCandidate[] {
  if (!Array.isArray(value)) return []
  const out: InstrumentCandidate[] = []
  const seen = new Set<string>()
  for (const raw of value.slice(0, 60)) {
    if (!raw || typeof raw !== 'object') continue
    const row = raw as Partial<InstrumentCandidate>
    if (!Array.isArray(row.keywords) || !row.keywords.every(keyword => typeof keyword === 'string')) continue
    const component = boundedString(row.component, 200)
    const key = component.toLowerCase()
    if (!component || seen.has(key)) continue
    seen.add(key)
    out.push({
      component,
      title: boundedString(row.title, 100),
      description: boundedString(row.description, 240),
      keywords: row.keywords.slice(0, 8).map(keyword => boundedString(keyword, 48)).filter(Boolean),
    })
  }
  return out
}

function errorResult(cause: unknown): Record<string, unknown> {
  const body = (cause as { response?: { data?: unknown } })?.response?.data
  if (body && typeof body === 'object') return body as Record<string, unknown>
  if ((cause as { name?: unknown })?.name === 'AbortError') {
    return { success: false, code: 'ABORTED', error: 'AI recommendations were cancelled.' }
  }
  return { success: false, code: 'RECOMMENDER_UNAVAILABLE', error: 'AI recommendations are temporarily unavailable.' }
}

export async function requestInstrumentRecommendations(
  runtime: InstrumentAssistRuntime,
  need: string,
  candidates: InstrumentCandidate[],
  configuredComponents: InstrumentConfiguredComponent[],
  signal?: AbortSignal,
): Promise<unknown> {
  const { data } = await runtime.api.post(RECOMMENDATIONS_ENDPOINT, {
    need,
    candidates,
    workspace_context: { configured_components: configuredComponents },
  }, { signal })
  return data
}

// Hub owns package discovery and selection. The app composition host owns this
// one-shot, admin-only agent call so the generic Hub component stays decoupled
// from Agents, sessions, models, and application security policy details.
export async function handleInstrumentRecommendationRequest(
  runtime: InstrumentAssistRuntime,
  modelContext: InstrumentModelContext | null,
  detail: InstrumentRecommendationRequest,
): Promise<void> {
  if (typeof detail.respond !== 'function') return
  const model = normalizeModelContext(modelContext)
  const need = boundedString(detail.need, 1200)
  const candidates = normalizeCandidates(detail.candidates)
  if (!model) {
    detail.respond({ success: false, code: 'MODEL_UNAVAILABLE', error: 'Configure an AI model to use package recommendations.' })
    return
  }
  if (!need || !candidates.length) {
    detail.respond({ success: false, code: 'BAD_REQUEST', error: 'Describe what you need and provide installable catalog packages.' })
    return
  }
  if (detail.signal?.aborted) {
    detail.respond({ success: false, code: 'ABORTED', error: 'AI recommendations were cancelled.' })
    return
  }

  detail.accept?.()
  try {
    detail.respond(await requestInstrumentRecommendations(
      runtime,
      need,
      candidates,
      normalizeConfiguredComponents(
        (detail.workspace_context as { configured_components?: unknown } | undefined)?.configured_components,
      ),
      detail.signal,
    ))
  } catch (cause) {
    detail.respond(errorResult(cause))
  }
}

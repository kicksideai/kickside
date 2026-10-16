const REQUIREMENT_RESOLUTION_ENDPOINT = '/api/v1/onboarding/requirement-resolution'

interface ApiLike {
  post: (
    url: string,
    body: Record<string, unknown>,
    config?: { signal?: AbortSignal },
  ) => Promise<{ data?: unknown }>
}

export interface RequirementResolutionRuntime { api: ApiLike }

export interface InstrumentRequirementResolutionRequest {
  component?: unknown
  version?: unknown
  current_id?: unknown
  parameters?: unknown
  requirement_bindings?: unknown
  requirements?: unknown
  signal?: AbortSignal
  accept?: () => void
  respond?: (result: unknown) => void
}

function failure(cause: unknown): Record<string, unknown> {
  const body = (cause as { response?: { data?: unknown } })?.response?.data
  if (body && typeof body === 'object') return body as Record<string, unknown>
  if ((cause as { name?: unknown })?.name === 'AbortError') {
    return { success: false, code: 'ABORTED', error: 'AI requirement resolution was cancelled.' }
  }
  return { success: false, code: 'RESOLVER_UNAVAILABLE', error: 'AI requirement resolution is temporarily unavailable.' }
}

// The installed Hub owns the generic interaction. The application host owns
// model access and the admin-only resolver endpoint, so Hub has no dependency
// on Agents or on any application-specific namespace/value convention.
export async function handleInstrumentRequirementResolution(
  runtime: RequirementResolutionRuntime,
  detail: InstrumentRequirementResolutionRequest,
): Promise<void> {
  if (typeof detail.respond !== 'function') return
  const component = typeof detail.component === 'string' ? detail.component.trim().slice(0, 200) : ''
  if (!component || !Array.isArray(detail.requirements)) {
    detail.respond({ success: false, code: 'BAD_REQUEST', error: 'A component and unresolved planner requirements are required.' })
    return
  }
  if (detail.signal?.aborted) {
    detail.respond({ success: false, code: 'ABORTED', error: 'AI requirement resolution was cancelled.' })
    return
  }
  detail.accept?.()
  try {
    const { data } = await runtime.api.post(REQUIREMENT_RESOLUTION_ENDPOINT, {
      component,
      ...(typeof detail.version === 'string' && detail.version.trim() ? { version: detail.version.trim().slice(0, 80) } : {}),
      ...(typeof detail.current_id === 'string' && detail.current_id.trim() ? { current_id: detail.current_id.trim().slice(0, 240) } : {}),
      parameters: Array.isArray(detail.parameters) ? detail.parameters : [],
      ...(Array.isArray(detail.requirement_bindings) ? { requirement_bindings: detail.requirement_bindings } : {}),
      requirements: detail.requirements,
    }, { signal: detail.signal })
    detail.respond(data)
  } catch (cause) {
    detail.respond(failure(cause))
  }
}

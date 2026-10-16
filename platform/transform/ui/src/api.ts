import { api, host } from '@wippy-fe/proxy'
import { errMsg as baseErrMsg } from '@widgets/app/errMsg'
import type { AssistResult, AssistStrategy, InputShape, Transform, ValidateResult } from './types.ts'

interface ApiError {
  response?: { data?: { error?: unknown; errors?: unknown }; status?: number }
  message?: string
}

// Resolve a user-facing message from a thrown api error, routing 401s through the
// host's auth handler. The transform endpoints return the reason in `errors: []` (not
// `error`), so surface that instead of the opaque "Request failed with status code N".
export function errMsg(e: unknown, fallback: string): string {
  if (e && typeof e === 'object') {
    const ax = e as ApiError
    if (ax.response?.status === 401) host.handleError('auth-expired', ax as Record<string, unknown>)
    const errs = ax.response?.data?.errors
    if (Array.isArray(errs) && errs.length) return errs.map(String).join('; ')
  }
  return baseErrMsg(e, fallback)
}

export interface AssistArgs {
  source_schema: unknown
  sink_schema: unknown
  input_shape: InputShape
  samples: unknown[]
  hint?: string
  strategy?: AssistStrategy
}

// Generate a transform for a source->sink pair. The server returns the proposed
// transform (kind-tagged), whether it validated, and a rationale. A hard dispatch
// error throws.
export async function assist(args: AssistArgs): Promise<AssistResult> {
  try {
    const { data } = await api.post('/api/v1/transform/assist', args)
    if (data && (data.ok === false || data.success === false)) throw new Error(data.error || 'assist failed')
    return (data || {}) as AssistResult
  } catch (e) {
    throw new Error(errMsg(e, 'could not generate a transform'))
  }
}

export interface ValidateArgs {
  transform: Transform
  sink_schema: unknown
  input_shape: InputShape
  samples: unknown[]
  source_schema?: unknown
}

// Run a (possibly hand-edited) transform against the destination schema and samples.
// Returns valid/errors plus produced outputs for preview.
export async function validate(args: ValidateArgs): Promise<ValidateResult> {
  try {
    const { data } = await api.post('/api/v1/transform/validate', args)
    if (data && (data.ok === false || data.success === false)) throw new Error(data.error || 'validate failed')
    return (data || {}) as ValidateResult
  } catch (e) {
    throw new Error(errMsg(e, 'could not validate the transform'))
  }
}

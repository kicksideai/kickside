import { api, host } from '@wippy-fe/proxy'
import { errMsg as baseErrMsg } from '@widgets/app/errMsg'
import type { Skill, SkillVersion } from './types.ts'

// Shape of the error objects the proxy api throws (axios-like), narrowed so the
// helper can pull a server message and route auth-expired through the host.
interface ApiError {
  response?: { data?: { error?: unknown }; status?: number }
  message?: string
}

// Resolve a user-facing message from a thrown api error, routing 401s through
// the host's auth handler. Falls back to the supplied default.
export function errMsg(e: unknown, fallback: string): string {
  if (e && typeof e === 'object') {
    const ax = e as ApiError
    if (ax.response?.status === 401) host.handleError('auth-expired', ax as Record<string, unknown>)
  }
  return baseErrMsg(e, fallback)
}

// Fetch the caller's skill list from the native skills API. Throws on failure
// with a message resolved via errMsg so callers can surface it directly.
export async function fetchSkills(): Promise<Skill[]> {
  try {
    const { data } = await api.get('/api/v1/skills?limit=100')
    if (!data?.success) throw new Error(data?.error || 'failed to load skills')
    return (data.skills || []) as Skill[]
  } catch (e) {
    throw new Error(errMsg(e, 'could not load skills'))
  }
}

// Fetch a single skill (head, or a past version when `version` is given). The
// versioned shape returns body/version/license/counts from that version while
// meta + icon stay live.
export async function fetchSkill(id: string, version?: number): Promise<Skill> {
  try {
    const url = version != null
      ? `/api/v1/skills/${id}?version=${version}`
      : `/api/v1/skills/${id}`
    const { data } = await api.get(url)
    if (!data?.success || !data.skill) throw new Error(data?.error || 'failed to load skill')
    return data.skill as Skill
  } catch (e) {
    throw new Error(errMsg(e, 'could not load skill'))
  }
}

// Fetch a skill's version history (newest first).
export async function fetchVersions(id: string): Promise<SkillVersion[]> {
  try {
    const { data } = await api.get(`/api/v1/skills/${id}/versions`)
    if (!data?.success) throw new Error(data?.error || 'failed to load versions')
    return (data.versions || []) as SkillVersion[]
  } catch (e) {
    throw new Error(errMsg(e, 'could not load versions'))
  }
}

export async function fetchSkillFile(id: string, path: string, version: number): Promise<Blob> {
  const { data } = await api.get(`/api/v1/skills/${encodeURIComponent(id)}/file?path=${encodeURIComponent(path)}&version=${version}&format=base64`)
  if (!data?.success || !data.file) throw new Error(data?.error || 'could not read skill file')
  const file = data.file
  const bytes = Uint8Array.from(atob(file.content), char => char.charCodeAt(0))
  return new Blob([bytes], { type: file.mime_type || 'application/octet-stream' })
}

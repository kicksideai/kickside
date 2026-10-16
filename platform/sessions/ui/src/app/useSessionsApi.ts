import { api } from '@wippy-fe/proxy'
import type { ArtifactSummary, ProviderBadge, Session, SessionMessage } from '../types.ts'

const BASE = '/api/v1'

interface ListResponse { success: boolean, count: number, sessions: Session[], error?: string }
interface MessagesResponse { success: boolean, count: number, messages: SessionMessage[], error?: string }
interface TokenResponse { success: boolean, token?: string, error?: string }
interface MutationResponse { success: boolean, error?: string }
interface AgentsResponse { success: boolean, agents?: { id: string, title?: string }[] }
interface ProviderBadgesResponse { success: boolean, providers?: { provider?: string, title?: string, icon?: string }[] }
interface ArtifactsResponse {
  success: boolean
  artifacts?: ArtifactSummary[]
  pagination?: { has_more?: boolean, next_cursor?: string }
  error?: string
}

type ArtifactResponse = ArtifactSummary & { error?: string }

export function useSessionsApi() {
  async function list(limit: number, offset: number): Promise<{ sessions: Session[], total: number }> {
    const { data } = await api.get<ListResponse>(`${BASE}/sessions?limit=${limit}&offset=${offset}`)
    if (!data?.success) throw new Error(data?.error || 'Failed to load sessions')
    return { sessions: data.sessions || [], total: data.count || 0 }
  }

  // Resolve agent component ids -> human titles so rows show a name, never a raw
  // id/uuid. Best-effort: failures yield an empty map (rows fall back to hiding
  // the agent label rather than printing an id).
  async function agentTitles(): Promise<Record<string, string>> {
    try {
      const { data } = await api.get<AgentsResponse>(`${BASE}/user-agents`)
      const map: Record<string, string> = {}
      for (const a of data?.agents || []) {
        if (a.id && a.title) map[a.id] = a.title
      }
      return map
    } catch {
      return {}
    }
  }

  // A compact, authenticated registry catalogue. It deliberately contains
  // provider presentation metadata only, never connection instances or secrets.
  // A catalogue outage cannot prevent someone opening their sessions.
  async function providerBadges(): Promise<Record<string, ProviderBadge>> {
    try {
      const { data } = await api.get<ProviderBadgesResponse>(`${BASE}/connections/providers/badges`)
      const map: Record<string, ProviderBadge> = Object.create(null)
      for (const raw of data?.providers || []) {
        const provider = typeof raw.provider === 'string' ? raw.provider.trim().toLowerCase() : ''
        if (!provider) continue
        const label = typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : provider
        const icon = typeof raw.icon === 'string' && raw.icon.trim() ? raw.icon.trim() : 'tabler:plug-connected'
        map[provider] = { icon, label }
      }
      return map
    } catch {
      return Object.create(null) as Record<string, ProviderBadge>
    }
  }

  async function messages(sessionId: string, limit = 30): Promise<SessionMessage[]> {
    const url = `${BASE}/sessions/messages?session_id=${encodeURIComponent(sessionId)}&limit=${limit}`
    const { data } = await api.get<MessagesResponse>(url)
    if (!data?.success) throw new Error(data?.error || 'Failed to load messages')
    return data.messages || []
  }

  async function rename(sessionId: string, title: string): Promise<void> {
    const { data } = await api.post<MutationResponse>(`${BASE}/sessions/rename`, {
      session_id: sessionId,
      title,
    })
    if (!data?.success) throw new Error(data?.error || 'Failed to rename session')
  }

  async function remove(sessionId: string): Promise<void> {
    const url = `${BASE}/sessions/delete?session_id=${encodeURIComponent(sessionId)}`
    const { data } = await api.delete<MutationResponse>(url)
    if (!data?.success) throw new Error(data?.error || 'Failed to delete session')
  }

  async function setFavorite(sessionId: string, favorite: boolean): Promise<void> {
    const { data } = await api.post<MutationResponse>(`${BASE}/sessions/favorite`, {
      session_id: sessionId,
      favorite,
    })
    if (!data?.success) throw new Error(data?.error || 'Failed to update favorite')
  }

  async function startToken(agent: string, model: string): Promise<string> {
    const { data } = await api.post<TokenResponse>(`${BASE}/sessions/start-token`, { agent, model })
    if (!data?.success || !data.token) throw new Error(data?.error || 'Failed to start a new chat')
    return data.token
  }

  async function artifacts(options: {
    sessionId?: string
    limit?: number
    cursor?: string
  } = {}): Promise<{ artifacts: ArtifactSummary[], hasMore: boolean, nextCursor: string }> {
    const query = new URLSearchParams()
    query.set('limit', String(options.limit || 48))
    if (options.sessionId) query.set('session_id', options.sessionId)
    if (options.cursor) query.set('cursor', options.cursor)
    const { data } = await api.get<ArtifactsResponse>(`${BASE}/artifacts?${query.toString()}`)
    if (!data?.success) throw new Error(data?.error || 'Failed to load artifacts')
    return {
      artifacts: data.artifacts || [],
      hasMore: data.pagination?.has_more === true,
      nextCursor: data.pagination?.next_cursor || '',
    }
  }

  async function artifact(artifactId: string): Promise<ArtifactSummary> {
    const { data } = await api.get<ArtifactResponse>(`${BASE}/artifact/${encodeURIComponent(artifactId)}`)
    if (!data?.uuid) throw new Error(data?.error || 'Failed to load artifact')
    return { ...data, artifact_id: data.artifact_id || data.uuid }
  }

  async function artifactContent(artifactId: string): Promise<string> {
    const { data } = await api.get<string>(`${BASE}/artifact/${encodeURIComponent(artifactId)}/content`, {
      responseType: 'text',
    })
    return typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  }

  return { list, messages, rename, remove, setFavorite, startToken, agentTitles, providerBadges, artifacts, artifact, artifactContent }
}

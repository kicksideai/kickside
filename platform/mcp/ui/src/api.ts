import { api, host } from '@wippy-fe/proxy'
import { errMsg as baseErrMsg } from '@widgets/app/errMsg'
import type { Credential, MintedCredential, Entry } from './types.ts'

interface ApiError {
  response?: { data?: { error?: unknown }; status?: number }
  message?: string
}

// Resolve a user-facing message from a thrown api error, routing 401s through the
// host's auth handler. Falls back to the supplied default.
export function errMsg(e: unknown, fallback: string): string {
  if (e && typeof e === 'object') {
    const ax = e as ApiError
    if (ax.response?.status === 401) host.handleError('auth-expired', ax as Record<string, unknown>)
  }
  return baseErrMsg(e, fallback)
}

// The list also answers "where do agents connect?" — one endpoint serves every
// credential, and the server is the only party that can name it: this page runs
// in a sandboxed frame whose origin is the string "null".
export async function fetchCredentials(): Promise<{ credentials: Credential[]; mcpUrl: string }> {
  try {
    const { data } = await api.get('/api/v1/mcp/credentials')
    if (!data?.success) throw new Error(data?.error || 'failed to load credentials')
    return {
      credentials: (data.credentials || []) as Credential[],
      mcpUrl: typeof data.mcp_url === 'string' ? data.mcp_url : '',
    }
  } catch (e) {
    throw new Error(errMsg(e, 'could not load credentials'))
  }
}

// Browse the canonical component tree to pick a scope target without typing a uuid.
// This is the whole tree the user can see (knowledge bases, agents, folders, ...),
// not the workspace-class projection -- a credential can be scoped to anything they
// can share. parentId undefined lists the root-level components.
export async function fetchEntries(parentId?: string): Promise<Entry[]> {
  try {
    const url = parentId
      ? `/api/v1/mcp/components?parent_id=${encodeURIComponent(parentId)}`
      : '/api/v1/mcp/components'
    const { data } = await api.get(url)
    if (!data?.success) throw new Error(data?.error || 'failed to load components')
    return (data.components || []) as Entry[]
  } catch (e) {
    throw new Error(errMsg(e, 'could not load components'))
  }
}

export interface CreateArgs {
  whitelist_component_ids: string[]
  label?: string
  allowed_tool_ids?: string[]
  allowed_trait_ids?: string[]
  default_active_trait_ids?: string[]
  agent_profile?: Record<string, unknown>
  expires_at?: number
}

export async function createCredential(args: CreateArgs): Promise<MintedCredential> {
  try {
    const { data } = await api.post('/api/v1/mcp/credentials', args)
    if (!data?.success || !data.credential) throw new Error(data?.error || 'create failed')
    return data.credential as MintedCredential
  } catch (e) {
    throw new Error(errMsg(e, 'could not create credential'))
  }
}

// Rename a credential (or change its policy). A label-only call leaves the policy
// untouched on the server.
export async function updateCredential(id: string, args: { label?: string }): Promise<void> {
  try {
    const { data } = await api.patch(`/api/v1/mcp/credentials/${id}`, args)
    if (!data?.success) throw new Error(data?.error || 'update failed')
  } catch (e) {
    throw new Error(errMsg(e, 'could not update credential'))
  }
}

export async function deleteCredential(id: string): Promise<void> {
  try {
    const { data } = await api.delete('/api/v1/mcp/credentials/' + id)
    if (!data?.success) throw new Error(data?.error || 'delete failed')
  } catch (e) {
    throw new Error(errMsg(e, 'could not delete credential'))
  }
}

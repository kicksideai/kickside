import { api } from '@wippy-fe/proxy'

// Canonical frontend projection of the users-owned principal directory. Share and the
// reusable picker both call this module; neither owns a private envelope or type vocabulary.
export type PrincipalType = 'user' | 'group'
export interface PrincipalRef { type: PrincipalType; id: string }
export interface Principal extends PrincipalRef { label: string; sublabel?: string }

function rows(data: unknown): Principal[] {
  const body = data && typeof data === 'object' ? data as Record<string, unknown> : {}
  return Array.isArray(body.principals) ? body.principals.filter((value): value is Principal => {
    if (!value || typeof value !== 'object') return false
    const row = value as Record<string, unknown>
    return (row.type === 'user' || row.type === 'group') && typeof row.id === 'string' && typeof row.label === 'string'
  }) : []
}

function successful(data: unknown, operation: string): Record<string, unknown> {
  const body = data && typeof data === 'object' ? data as Record<string, unknown> : {}
  if (body.success === false) {
    const message = typeof body.error === 'string' && body.error.trim() ? body.error : `${operation} failed`
    throw new Error(message)
  }
  return body
}

export async function searchPrincipals(query: string, limit = 8, kinds?: PrincipalType[]): Promise<Principal[]> {
  const params: Record<string, unknown> = { q: query.trim(), limit }
  if (kinds?.length) params.kinds = kinds.join(',')
  const { data } = await api.get('/api/v1/principals/search', { params })
  return rows(successful(data, 'Principal search'))
}

export async function resolvePrincipals(refs: PrincipalRef[]): Promise<Principal[]> {
  if (!refs.length) return []
  const { data } = await api.post('/api/v1/principals/resolve', { refs })
  return rows(successful(data, 'Principal resolution'))
}

export async function resolvePrincipal(id: string, kinds: PrincipalType[] = ['user', 'group']): Promise<Principal | null> {
  const resolved = await resolvePrincipals(kinds.map((type) => ({ type, id })))
  for (const type of kinds) {
    const found = resolved.find((row) => row.id === id && row.type === type)
    if (found) return found
  }
  return null
}

export const PRINCIPAL_TYPE_LABEL: Record<PrincipalType, string> = { user: 'Person', group: 'Group' }

import { ref } from 'vue'
import { api } from '@wippy-fe/proxy'
import type { Policy, Scope } from '../types.ts'

// Data store for the security surface. Owns the scope catalog and the
// public-policy catalog, the load lifecycle, and custom-scope mutations. Every
// mutation reloads the catalog so the rail and builder stay consistent.

export function messageOf(e: unknown, fallback: string): string {
  const data = (e as any)?.response?.data ?? (e as any)?.data
  if (typeof data?.error === 'string' && data.error) return data.error
  if (typeof data?.message === 'string' && data.message) return data.message
  return e instanceof Error ? e.message : fallback
}

export function useSecurityApi() {
  const scopes = ref<Scope[]>([])
  const policies = ref<Policy[]>([])
  const loading = ref(true)
  const saving = ref(false)
  const error = ref('')

  let loadSeq = 0

  async function load(): Promise<void> {
    const seq = ++loadSeq
    loading.value = true
    error.value = ''
    try {
      const [scopeRes, policyRes] = await Promise.all([
        api.get('/api/v1/security/scopes'),
        api.get('/api/v1/security/policies'),
      ])
      if (seq !== loadSeq) return
      scopes.value = (scopeRes.data?.scopes ?? []) as Scope[]
      policies.value = (policyRes.data?.policies ?? []) as Policy[]
    }
    catch (e) {
      if (seq === loadSeq) error.value = messageOf(e, 'failed to load security')
    }
    finally {
      if (seq === loadSeq) loading.value = false
    }
  }

  // Persist a custom scope (create or update). The backend writes the DB row; the
  // projection service projects it into a security.scope registry entry shortly after.
  async function saveScope(payload: { slug: string, target: string, label: string, description: string, policies: string[], enabled: boolean }): Promise<boolean> {
    saving.value = true
    error.value = ''
    try {
      await api.post('/api/v1/security/scopes', payload)
      await load()
      return true
    }
    catch (e) {
      error.value = messageOf(e, 'failed to save scope')
      return false
    }
    finally {
      saving.value = false
    }
  }

  async function deleteScope(slug: string): Promise<boolean> {
    saving.value = true
    error.value = ''
    try {
      await api.delete(`/api/v1/security/scopes?slug=${encodeURIComponent(slug)}`)
      await load()
      return true
    }
    catch (e) {
      error.value = messageOf(e, 'failed to delete scope')
      return false
    }
    finally {
      saving.value = false
    }
  }

  return { scopes, policies, loading, saving, error, load, saveScope, deleteScope }
}

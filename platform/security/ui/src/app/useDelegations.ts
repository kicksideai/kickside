import { ref } from 'vue'
import { api } from '@wippy-fe/proxy'
import { messageOf } from './useSecurityApi'

export interface Delegation {
  policy_id: string
  principal: { kind: 'user'; id: string }
  root: string
  groups: string[]
  active: boolean
  grantor: string
  created_at: string
}
interface Request {
  principal: Delegation['principal']
  root: string
  groups?: string[]
}

export function useDelegations() {
  const delegations = ref<Delegation[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const confirmation = ref('')
  const pending = ref<{ method: 'save' | 'revoke'; request: Request } | null>(null)
  let loadSequence = 0

  async function load() {
    const sequence = ++loadSequence
    loading.value = true
    error.value = ''
    try {
      const { data } = await api.get('/api/v1/security/delegations')
      if (data?.success !== true || !Array.isArray(data.delegations)) {
        throw new Error(data?.error || 'Delegation inventory is unconfirmed')
      }
      if (sequence === loadSequence) delegations.value = data.delegations
    }
    catch (cause) {
      if (sequence === loadSequence) error.value = messageOf(cause, 'Could not load act-as grants')
    }
    finally {
      if (sequence === loadSequence) loading.value = false
    }
  }

  async function submit() {
    if (!pending.value || saving.value) return
    const operation = pending.value
    saving.value = true
    error.value = ''
    confirmation.value = ''
    try {
      const { data } = operation.method === 'save'
        ? await api.post('/api/v1/security/delegations', operation.request)
        : await api.delete('/api/v1/security/delegations', { data: operation.request })
      if (data?.success !== true) throw new Error(data?.error || 'Act-as request is unconfirmed')
      pending.value = null
      confirmation.value = operation.method === 'save' ? 'Act-as grant saved' : 'Act-as grant revoked'
      await load()
    }
    catch (cause) {
      error.value = messageOf(cause, 'Could not confirm act-as request')
      const status = (cause as { response?: { status?: number } })?.response?.status
      // A definite refusal permits correction. A lost or server-error response
      // keeps the request so the same action can be retried.
      if (status && status >= 400 && status < 500) pending.value = null
    }
    finally {
      saving.value = false
    }
  }

  async function mutate(method: 'save' | 'revoke', request: Request) {
    if (pending.value || saving.value) return
    pending.value = { method, request: { ...request,
      principal: { ...request.principal }, ...(request.groups ? { groups: [...request.groups].sort() } : {}) } }
    await submit()
  }

  return { delegations, loading, saving, error, confirmation, pending, load, mutate, submit }
}

import type { Ref } from 'vue'
import { api } from '@wippy-fe/proxy'
import { errMsg } from '@widgets/app/errMsg'
import { latestRequest } from '@widgets/app/latestRequest'
import type { Automation, AutomationType } from './automation-types'

interface AutomationDataOptions {
  automations: Ref<Automation[]>
  types: Ref<AutomationType[]>
  loading: Ref<boolean>
  error: Ref<string>
  parentId: () => string | undefined
  syncRealtimeSubscriptions: () => void
}

export function useAutomationData({ automations, types, loading, error, parentId, syncRealtimeSubscriptions }: AutomationDataOptions) {
  async function fetchTypes() {
    try {
      const { data } = await api.get('/api/v1/automations/types')
      types.value = data?.success ? (data.types || []) : []
    } catch {
      types.value = []
    }
  }

  const beginFetch = latestRequest()
  async function fetchAutomations() {
    const current = beginFetch()
    loading.value = true
    error.value = ''
    try {
      const { data } = await api.get('/api/v1/automations', { params: { class: 'automation', parent_id: parentId() } })
      if (!data?.success) throw new Error(errMsg(data?.error, 'failed to load automations'))
      if (!current()) return
      automations.value = data.automations || []
      syncRealtimeSubscriptions()
    } catch (e) {
      if (!current()) return
      syncRealtimeSubscriptions()
      error.value = errMsg(e, 'failed to load automations')
    } finally {
      if (current()) loading.value = false
    }
  }

  async function reload() {
    await fetchTypes()
    await fetchAutomations()
  }

  return { fetchTypes, fetchAutomations, reload }
}

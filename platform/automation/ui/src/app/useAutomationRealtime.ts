import { host } from '@wippy-fe/proxy'
import { readDriveStatus } from './read-drive-status'
import type { Ref } from 'vue'
import { subscribeComponentMeta, type ComponentMetaEvent } from '@widgets/app/componentRealtime'
import type { Automation, AutomationType } from './automation-types'

export function useAutomationRealtime(
  automations: Ref<Automation[]>,
  typeFor: (automation: Automation) => AutomationType | undefined,
) {
  const realtimeUnsubs = new Map<string, () => void>()
  const realtimePending = new Set<string>()
  let realtimeGeneration = 0
  const statusReads = new Map<string, symbol>()

  function applyPublicStateEvent(componentId: string, event: ComponentMetaEvent) {
    const meta = event.meta
    automations.value = automations.value.map(automation => {
      if (automation.id !== componentId) return automation
      const next: Automation = {
        ...automation,
        public_state: { ...(automation.public_state || {}), ...meta },
      }
      if (typeof meta.title === 'string') next.title = meta.title
      if (typeof meta.comment === 'string') next.description = meta.comment
      return next
    })
    void refreshDriveStatus(componentId).catch(error => host.handleError('other', { message: String(error) }))
  }

  async function refreshDriveStatus(componentId: string): Promise<void> {
    if (!automations.value.some(a => a.id === componentId && a.drive_status)) return
    const request = Symbol(componentId)
    statusReads.set(componentId, request)
    const status = await readDriveStatus(componentId)
    if (statusReads.get(componentId) !== request) return
    statusReads.delete(componentId)
    automations.value = automations.value.map(a => a.id === componentId ? { ...a, drive_status: status } : a)
  }

  function fieldTypesFor(automation: Automation): Record<string, string> {
    const out: Record<string, string> = {}
    for (const field of typeFor(automation)?.public_state_schema?.fields || []) {
      if (field?.key && field.type) out[field.key] = field.type
    }
    return out
  }

  function clearRealtimeSubscriptions() {
    realtimeGeneration++
    realtimePending.clear()
    statusReads.clear()
    for (const off of realtimeUnsubs.values()) off()
    realtimeUnsubs.clear()
  }

  function syncRealtimeSubscriptions() {
    const live = new Set(automations.value.map(automation => automation.id).filter(Boolean))
    for (const [id, off] of realtimeUnsubs) {
      if (!live.has(id)) {
        off()
        realtimeUnsubs.delete(id)
        statusReads.delete(id)
      }
    }
    const generation = realtimeGeneration
    for (const id of live) {
      if (realtimeUnsubs.has(id) || realtimePending.has(id)) continue
      realtimePending.add(id)
      const row = automations.value.find(automation => automation.id === id)
      const off = subscribeComponentMeta(id, event => applyPublicStateEvent(id, event), row ? fieldTypesFor(row) : undefined)
      realtimePending.delete(id)
      if (!off) continue
      if (generation !== realtimeGeneration || !automations.value.some(automation => automation.id === id)) {
        off()
        continue
      }
      realtimeUnsubs.set(id, off)
    }
  }

  return { syncRealtimeSubscriptions, clearRealtimeSubscriptions, refreshDriveStatus }
}

import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import { on } from '@wippy-fe/proxy'
import { useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'
import { humanError } from '../api/api'
import { loadCatalog, type CatalogItem } from '../catalog/catalog'
import type { SyncEngine } from '../mapping/sync'
import type { WfEvent } from '../types'

interface WorkflowCanvasRealtimeOptions {
  workflowId: string
  engine: SyncEngine
  catalog: Ref<CatalogItem[]>
  catalogErrors: Ref<string[]>
  catalogLoading: Ref<boolean>
  load: (refit?: boolean) => Promise<void>
  loadPublishedState: () => Promise<void>
  rebuild: () => void
}

export function useWorkflowCanvasRealtime(options: WorkflowCanvasRealtimeOptions) {
  const { workflowId, engine, catalog, catalogErrors, catalogLoading, load, loadPublishedState, rebuild } = options

  async function refreshCanvas() {
    // Catalog loading registers extension node-kinds, so it must finish before the
    // first graph projection reads declared ports.
    try {
      const result = await loadCatalog()
      catalog.value = result.items
      catalogErrors.value = result.errors
    } catch (cause) {
      catalog.value = []
      catalogErrors.value = [humanError(cause, 'Couldn’t load Workflow steps.')]
    } finally {
      catalogLoading.value = false
    }
    await load(true)
    void loadPublishedState()
  }

  useHostVisibilityRefresh(refreshCanvas)

  let off: Array<() => void> = []
  onMounted(() => {
    try {
      off.push(
        on(`workflow.${workflowId}`, (message: unknown) => {
          const envelope = (message && typeof message === 'object' ? message : {}) as Record<string, unknown>
          const payload = (envelope.data && typeof envelope.data === 'object' ? envelope.data : envelope) as Record<string, unknown>
          if (payload.workflow_id && String(payload.workflow_id) !== workflowId) return
          const events = Array.isArray(payload.events) ? (payload.events as WfEvent[]) : []
          if (!events.length) return
          const outcome = engine.ingest(events)
          if (outcome.needsRefetch) { void load(); return }
          if (outcome.changed) rebuild()
        }),
      )
    } catch { /* inert outside the host */ }
  })
  onBeforeUnmount(() => {
    for (const stop of off) { try { stop() } catch { /* ignore */ } }
    off = []
  })
}

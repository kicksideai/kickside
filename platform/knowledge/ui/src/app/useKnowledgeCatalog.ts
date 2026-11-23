import { computed, onBeforeUnmount, ref, type Ref } from 'vue'
import { api, on } from '@wippy-fe/proxy'
import { componentMetaEvent, type ComponentMetaEvent } from '@kickside/ui-kit/componentRealtime'
import { errMsg } from '@kickside/ui-kit/errMsg'
import { latestRequest } from '@kickside/ui-kit/latestRequest'
import { KNOWLEDGE_META_FIELD_TYPES, KNOWLEDGE_COUNT_KEYS, STORE_STAT_KEYS, applyStoreStats } from './meta'
import type { EmbeddingModel, Engine, KbDetail, KnowledgeBase, StatItem, StatSpec } from './knowledge.types.ts'

const ENGINE_NOTICE = 'No knowledge engine installed. Install a KB engine to create and browse knowledge bases.'

interface KnowledgeCatalogOptions {
  detail: Ref<KbDetail | null>
}

export function useKnowledgeCatalog({ detail }: KnowledgeCatalogOptions) {
  const loading = ref(false)
  const error = ref('')
  const catalogError = ref('')
  const catalogLoaded = ref(false)
  const notice = ref('')
  const kbs = ref<KnowledgeBase[]>([])
  const query = ref('')
  const models = ref<EmbeddingModel[]>([])
  const engines = ref<Engine[]>([])
  const dialogLoadError = ref('')
  let catalogActive = true
  const beginCatalogLoad = latestRequest()
  let discoveryLoading = false
  let discoveryPending = false
  let catalogLoadVersion = 0
  let storeStatsLoading = false
  const storeStatsPending = new Set<string>()

  const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return kbs.value
    return kbs.value.filter(k =>
      (k.name || '').toLowerCase().includes(q) ||
      (k.description || '').toLowerCase().includes(q),
    )
  })

  function isEngineMissing(msg: string): boolean {
    const m = msg.toLowerCase()
    return m.includes('no implementation')
      || m.includes('no engine')
      || m.includes('contract unavailable')
      || m.includes('not found') && m.includes('binding')
  }

  async function load(): Promise<boolean> {
    if (!catalogActive) return false
    const current = beginCatalogLoad()
    catalogLoadVersion++
    loading.value = true
    error.value = ''
    catalogError.value = ''
    notice.value = ''
    try {
      const { data } = await api.get('/api/v1/knowledge/list')
      if (!data?.success) {
        const msg = data?.error || 'failed to load knowledge bases'
        if (isEngineMissing(msg)) {
          if (current() && catalogActive) {
            notice.value = ENGINE_NOTICE
          }
          return false
        }
        throw new Error(msg)
      }
      if (current() && catalogActive) {
        kbs.value = (data.items || []) as KnowledgeBase[]
        catalogLoaded.value = true
      }
      return true
    } catch (e) {
      const msg = errMsg(e, 'could not load knowledge bases')
      if (current() && catalogActive) {
        if (isEngineMissing(msg)) notice.value = ENGINE_NOTICE
        else catalogError.value = msg
      }
      return false
    } finally {
      if (current()) {
        loading.value = false
        if (catalogActive && discoveryPending && !discoveryLoading) void refreshDiscoveredCatalog()
        if (storeStatsPending.size) void refreshStoreStats()
      }
    }
  }

  async function loadModels() {
    try {
      const { data } = await api.get('/api/v1/knowledge/models')
      models.value = data?.success ? (data.models || []) as EmbeddingModel[] : []
    } catch {
      models.value = []
    }
  }

  async function loadEngines() {
    try {
      const { data } = await api.get('/api/v1/knowledge/engines')
      engines.value = data?.success ? (data.engines || []) as Engine[] : []
    } catch {
      engines.value = []
    }
  }

  function engineFor(kbType: string): Engine | undefined {
    return engines.value.find(e => e.kb_type === kbType)
  }

  async function loadDialogCatalog() {
    dialogLoadError.value = ''
    try {
      const [eng, mod] = await Promise.all([
        api.get('/api/v1/knowledge/engines'),
        api.get('/api/v1/knowledge/models'),
      ])
      if (!eng.data?.success) throw new Error(eng.data?.error || 'Could not load knowledge engines.')
      if (!mod.data?.success) throw new Error(mod.data?.error || 'Could not load embedding models.')
      engines.value = (eng.data.engines || []) as Engine[]
      models.value = (mod.data.models || []) as EmbeddingModel[]
    } catch (e) {
      engines.value = []
      models.value = []
      dialogLoadError.value = errMsg(e, 'Could not load knowledge engines.')
    }
  }

  function isRecord(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value)
  }

  function metaObject(value: unknown): Record<string, unknown> | undefined {
    if (isRecord(value)) return value
    if (typeof value !== 'string' || !value) return undefined
    try {
      const decoded = JSON.parse(value)
      return isRecord(decoded) ? decoded : undefined
    } catch {
      return undefined
    }
  }

  function resolvePath(raw: Record<string, unknown>, path?: string): unknown {
    if (!path) return undefined
    let cur: unknown = raw
    for (const seg of path.split('.')) {
      if (!isRecord(cur)) return undefined
      cur = cur[seg]
    }
    return cur
  }

  function formatStats(raw: Record<string, unknown>, spec?: StatSpec[]): StatItem[] {
    if (!Array.isArray(spec)) return []
    const out: StatItem[] = []
    for (const st of spec) {
      const value = resolvePath(raw, st.path)
      const n = typeof value === 'number' ? value : Number(value || 0)
      if (n < (st.min ?? 0)) continue
      out.push({ icon: st.icon, value: n, label: String(n === 1 ? st.singular : st.plural) })
    }
    return out
  }

  function hasOwn(obj: Record<string, unknown>, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(obj, key)
  }

  function hasStatKey(meta: Record<string, unknown>, spec?: StatSpec[]): boolean {
    if (KNOWLEDGE_COUNT_KEYS.some(k => hasOwn(meta, k))) return true
    if (!Array.isArray(spec)) return false
    return spec.some(st => {
      const path = st.path || ''
      return path !== '' && hasOwn(meta, path.split('.')[0])
    })
  }

  function statsPatch(row: KnowledgeBase, meta: Record<string, unknown>, kbType?: string): Partial<KnowledgeBase> {
    const nextType = String(meta.kb_type || kbType || '')
    const engine = engineFor(nextType)
    const patch: Partial<KnowledgeBase> = {
      kb_type: nextType || kbType,
      badge: engine?.badge,
    }
    for (const key of KNOWLEDGE_COUNT_KEYS) {
      const value = meta[key]
      if (hasOwn(meta, key) && typeof value === 'number') {
        (patch as Record<string, number>)[key] = value
      }
    }
    if (hasStatKey(meta, engine?.stats_spec) || hasOwn(meta, 'kb_type')) {
      patch.stat_items = formatStats({ ...row, ...meta }, engine?.stats_spec)
    }
    return patch
  }

  function applyMetaToKb(row: KnowledgeBase, meta: Record<string, unknown>, deleted: string[] = []): KnowledgeBase {
    const patch: Partial<KnowledgeBase> = {}
    if (typeof meta.title === 'string') patch.name = meta.title
    if (typeof meta.comment === 'string') patch.description = meta.comment
    if (typeof meta.icon === 'string') patch.icon = meta.icon
    if (typeof meta.status === 'string') patch.status = meta.status
    if (typeof meta.auto_summary === 'string') patch.auto_summary = meta.auto_summary
    if (typeof meta.auto_description === 'string') patch.auto_description = meta.auto_description
    if (typeof meta.kb_type === 'string') patch.kb_type = meta.kb_type
    if (!row.stats_from_store) Object.assign(patch, statsPatch(row, meta, patch.kb_type || row.kb_type))

    const next = { ...row, ...patch }
    for (const key of deleted) {
      const mapped = key === 'title' ? 'name' : key
      if (row.stats_from_store && STORE_STAT_KEYS.some(key => key === mapped)) continue
      delete (next as Record<string, unknown>)[mapped]
    }
    return next
  }

  const detailUnsub = ref<(() => void) | null>(null)

  function applyComponentMetaEvent(id: string, payload: ComponentMetaEvent) {
    const meta = metaObject(payload.meta) || {}
    const deleted = payload.deleted || []
    const current = kbs.value.find(k => k.id === id && k.stats_from_store) || (detail.value?.id === id ? detail.value : undefined)
    if (current?.stats_from_store && (STORE_STAT_KEYS.some(key => hasOwn(meta, key) || deleted.includes(key))
      || hasStatKey(meta, engineFor(current.kb_type || '')?.stats_spec))) {
      storeStatsPending.add(id)
      void refreshStoreStats()
    }
    kbs.value = kbs.value.map(k => k.id === id ? applyMetaToKb(k, meta, deleted) : k)
    if (detail.value?.id === id) {
      detail.value = applyMetaToKb(detail.value, meta, deleted) as KbDetail
    }
  }

  async function refreshStoreStats() {
    if (storeStatsLoading || loading.value || !catalogActive || !storeStatsPending.size) return
    storeStatsLoading = true
    try {
      // The page-wide relay and detail subscription can deliver the same event.
      // Gather both callbacks, then refresh only those IDs through READ.
      await Promise.resolve()
      while (catalogActive && !loading.value && storeStatsPending.size) {
        const ids = [...storeStatsPending].slice(0, 100)
        for (const id of ids) storeStatsPending.delete(id)
        const version = catalogLoadVersion
        const { data } = await api.get(`/api/v1/knowledge/list?ids=${ids.map(encodeURIComponent).join(',')}`)
        if (!catalogActive) return
        if (version !== catalogLoadVersion) {
          for (const id of ids) storeStatsPending.add(id)
          continue
        }
        if (!data?.success) continue
        const latest = new Map<string, KnowledgeBase>(
          ((data.items || []) as KnowledgeBase[]).map(row => [row.id, row]),
        )
        const requested = new Set(ids)
        kbs.value = kbs.value.map(row => row.stats_from_store && requested.has(row.id)
          ? applyStoreStats(row, latest.get(row.id)) : row)
        if (detail.value?.stats_from_store && requested.has(detail.value.id)) {
          detail.value = applyStoreStats(detail.value, latest.get(detail.value.id))
        }
      }
    } catch {
      // A later notification or normal page read can refresh a temporarily unavailable store.
    } finally {
      storeStatsLoading = false
      if (storeStatsPending.size) void refreshStoreStats()
    }
  }

  function clearComponentSubscriptions() {
    catalogActive = false
    discoveryPending = false
    storeStatsPending.clear()
    componentUnsub?.()
    detailUnsub.value?.()
    detailUnsub.value = null
  }

  async function refreshDiscoveredCatalog() {
    if (!catalogActive) return
    if (discoveryLoading || loading.value) {
      discoveryPending = true
      return
    }
    discoveryLoading = true
    try {
      do {
        discoveryPending = false
        await load()
      } while (catalogActive && discoveryPending)
    } finally {
      discoveryLoading = false
    }
  }

  const componentUnsub = on('@message', message => {
    const event = componentMetaEvent(message, undefined, KNOWLEDGE_META_FIELD_TYPES)
    if (!event) return
    const known = kbs.value.some(k => k.id === event.component_id)
    if (known || detail.value?.id === event.component_id) applyComponentMetaEvent(event.component_id, event)
    if (!known && typeof event.meta.kb_type === 'string' && event.meta.kb_type) {
      void refreshDiscoveredCatalog()
    }
  })
  onBeforeUnmount(clearComponentSubscriptions)

  return {
    loading, error, catalogError, catalogLoaded, notice, kbs, query, filtered, models, engines, dialogLoadError,
    load, loadModels, loadEngines, engineFor, loadDialogCatalog,
    detailUnsub, applyComponentMetaEvent, clearComponentSubscriptions,
  }
}

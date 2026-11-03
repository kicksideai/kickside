import { computed, onBeforeUnmount, ref, type Ref } from 'vue'
import { api, on } from '@wippy-fe/proxy'
import { componentMetaEvent, type ComponentMetaEvent } from '@widgets/app/componentRealtime'
import { errMsg } from '@widgets/app/errMsg'
import { KNOWLEDGE_META_FIELD_TYPES, KNOWLEDGE_COUNT_KEYS } from './meta'
import type { EmbeddingModel, Engine, KbDetail, KnowledgeBase, StatItem, StatSpec } from './knowledge.types.ts'

const ENGINE_NOTICE = 'No knowledge engine installed. Install a KB engine to create and browse knowledge bases.'

interface KnowledgeCatalogOptions {
  detail: Ref<KbDetail | null>
}

export function useKnowledgeCatalog({ detail }: KnowledgeCatalogOptions) {
  const loading = ref(false)
  const error = ref('')
  const notice = ref('')
  const kbs = ref<KnowledgeBase[]>([])
  const query = ref('')
  const models = ref<EmbeddingModel[]>([])
  const engines = ref<Engine[]>([])
  const dialogLoadError = ref('')
  let catalogActive = true
  let catalogLoadGeneration = 0
  let discoveryLoading = false
  let discoveryPending = false

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

  async function load({ preserve = false }: { preserve?: boolean } = {}): Promise<boolean> {
    if (!catalogActive) return false
    const generation = ++catalogLoadGeneration
    loading.value = true
    error.value = ''
    notice.value = ''
    try {
      const { data } = await api.get('/api/v1/knowledge/list')
      if (!data?.success) {
        const msg = data?.error || 'failed to load knowledge bases'
        if (isEngineMissing(msg)) {
          if (generation === catalogLoadGeneration && catalogActive) {
            if (!preserve) kbs.value = []
            notice.value = ENGINE_NOTICE
          }
          return false
        }
        throw new Error(msg)
      }
      if (generation === catalogLoadGeneration && catalogActive) {
        kbs.value = (data.items || []) as KnowledgeBase[]
      }
      return true
    } catch (e) {
      const msg = errMsg(e, 'could not load knowledge bases')
      if (generation === catalogLoadGeneration && catalogActive) {
        if (!preserve) kbs.value = []
        if (isEngineMissing(msg)) notice.value = ENGINE_NOTICE
        else error.value = msg
      }
      return false
    } finally {
      if (generation === catalogLoadGeneration) {
        loading.value = false
        if (catalogActive && discoveryPending && !discoveryLoading) void refreshDiscoveredCatalog()
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
    Object.assign(patch, statsPatch(row, meta, patch.kb_type || row.kb_type))

    const next = { ...row, ...patch }
    for (const key of deleted) {
      const mapped = key === 'title' ? 'name' : key
      delete (next as Record<string, unknown>)[mapped]
    }
    return next
  }

  const detailUnsub = ref<(() => void) | null>(null)

  function applyComponentMetaEvent(id: string, payload: ComponentMetaEvent) {
    const meta = metaObject(payload.meta) || {}
    const deleted = payload.deleted || []
    kbs.value = kbs.value.map(k => k.id === id ? applyMetaToKb(k, meta, deleted) : k)
    if (detail.value?.id === id) {
      detail.value = applyMetaToKb(detail.value, meta, deleted) as KbDetail
    }
  }

  function clearComponentSubscriptions() {
    catalogActive = false
    discoveryPending = false
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
        await load({ preserve: true })
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
    loading, error, notice, kbs, query, filtered, models, engines, dialogLoadError,
    load, loadModels, loadEngines, engineFor, loadDialogCatalog,
    detailUnsub, applyComponentMetaEvent, clearComponentSubscriptions,
  }
}

import { computed, nextTick, onBeforeUnmount, ref, watch, type ComputedRef, type Ref } from 'vue'
import { api, loadByTagName } from '@wippy-fe/proxy'
import { subscribeComponentMeta, type ComponentMetaEvent } from '@widgets/app/componentRealtime'
import { errMsg } from '@widgets/app/errMsg'
import { KNOWLEDGE_META_FIELD_TYPES } from './meta'
import type { Engine, KbDetail, KnowledgeBase, ViewMode } from './knowledge.types.ts'

interface KnowledgeDetailOptions {
  detail: Ref<KbDetail | null>
  detailUnsub: Ref<(() => void) | null>
  kbs: Ref<KnowledgeBase[]>
  engines: Ref<Engine[]>
  engineFor: (kbType: string) => Engine | undefined
  applyComponentMetaEvent: (id: string, payload: ComponentMetaEvent) => void
  route: ComputedRef<string | undefined>
  navigate: (sub: string) => void
  loadEngines: () => Promise<void>
}

export function useKnowledgeDetail({ detail, detailUnsub, kbs, engines, engineFor, applyComponentMetaEvent, route, navigate, loadEngines }: KnowledgeDetailOptions) {
  const detailLoading = ref(false)
  const detailError = ref('')
  const detailHost = ref<HTMLElement | null>(null)
  let detailEl: HTMLElement | null = null
  let detailRequestSeq = 0
  let detailMountSeq = 0
  const detailManageTag = computed(() =>
    detail.value ? engineFor(detail.value.kb_type || '')?.manage_ui_id : undefined)
  const detailViews = computed<ViewMode[]>(() =>
    (detail.value ? engineFor(detail.value.kb_type || '')?.manage_views : undefined) || [])
  const detailHasViews = computed(() => detailViews.value.length > 1)
  const detailView = ref<string>('')
  const innerRoute = ref('')
  let applyingRoute = false
  let routeApplySeq = 0

  function viewStorageKey(): string | null {
    const type = detail.value?.kb_type
    return type ? `kx:kb:detail-view:${type}` : null
  }

  watch(detailViews, (views) => {
    if (!views.length) { detailView.value = ''; return }
    const ids = views.map(v => v.id)
    let stored = ''
    try { const key = viewStorageKey(); stored = key ? (localStorage.getItem(key) || '') : '' } catch { /* noop */ }
    const next = ids.includes(stored) ? stored : ids[0]
    if (next !== detailView.value) detailView.value = next
  }, { immediate: true })

  function detailConfigJson(): string {
    const config: Record<string, unknown> = { kb_id: detail.value?.id, route: innerRoute.value }
    if (detailView.value) config.view = detailView.value
    return JSON.stringify(config)
  }

  function setDetailView(value: string) {
    if (value === detailView.value) return
    detailView.value = value
    try { const key = viewStorageKey(); if (key) localStorage.setItem(key, value) } catch { /* noop */ }
    try { detailEl?.setAttribute('config', detailConfigJson()) } catch { /* noop */ }
  }

  function onInnerNavigate(event: CustomEvent) {
    event.stopPropagation()
    const id = detail.value?.id
    if (!id || applyingRoute) return
    const raw = typeof event.detail === 'string' ? event.detail : (event.detail?.path ?? event.detail?.route ?? '')
    const sub = String(raw || '').replace(/^\/+/, '')
    innerRoute.value = sub
    pushRoute(sub ? `${id}/${sub}` : id)
  }

  function onKbChanged(event: Event) { event.stopPropagation() }

  function unmountDetailWc(cancelPending = true) {
    if (cancelPending) detailMountSeq++
    if (detailEl) {
      detailEl.removeEventListener('kb-changed', onKbChanged)
      detailEl.removeEventListener('navigate', onInnerNavigate as EventListener)
      detailEl.remove()
      detailEl = null
    }
  }

  async function mountDetailWc() {
    const seq = ++detailMountSeq
    unmountDetailWc(false)
    const tag = detailManageTag.value
    const host = detailHost.value
    const id = detail.value?.id
    if (!tag || !host || !id) return
    try { await loadByTagName(tag, { timeoutMs: 8000 }) } catch { /* inert if undefined */ }
    if (seq !== detailMountSeq || detail.value?.id !== id || detailManageTag.value !== tag || detailHost.value !== host) return
    host.replaceChildren()
    const el = document.createElement(tag)
    try { el.setAttribute('config', detailConfigJson()) } catch { /* non-serializable */ }
    el.addEventListener('kb-changed', onKbChanged as EventListener)
    el.addEventListener('navigate', onInnerNavigate as EventListener)
    host.appendChild(el)
    detailEl = el
  }

  function pushRoute(sub: string) {
    if (applyingRoute) return
    navigate(sub)
  }

  function isActiveDetail(seq: number, id: string): boolean {
    return detailRequestSeq === seq && detail.value?.id === id
  }

  async function openDetail(kb: KnowledgeBase, pushUrl = true) {
    const seq = ++detailRequestSeq
    const id = kb.id
    detail.value = { ...kb }
    detailUnsub.value?.()
    detailUnsub.value = id ? subscribeComponentMeta(id, (event) => applyComponentMetaEvent(id, event), KNOWLEDGE_META_FIELD_TYPES) : null
    detailError.value = ''
    detailLoading.value = true
    unmountDetailWc()
    if (pushUrl) pushRoute(id)
    try {
      const { data } = await api.get(`/api/v1/knowledge/${id}`)
      if (!isActiveDetail(seq, id)) return
      if (data?.success) detail.value = { ...detail.value, ...data } as KbDetail
      else detailError.value = data?.error || 'could not load knowledge base'
    } catch (e) {
      if (!isActiveDetail(seq, id)) return
      detailError.value = errMsg(e, 'could not load knowledge base')
    } finally {
      if (isActiveDetail(seq, id)) detailLoading.value = false
    }
    if (!isActiveDetail(seq, id)) return
    if (!engines.value.length) await loadEngines()
    if (!isActiveDetail(seq, id)) return
    await nextTick()
    if (!isActiveDetail(seq, id)) return
    await mountDetailWc()
  }

  async function refreshOpenDetail() {
    const id = detail.value?.id
    if (!id) return
    const seq = ++detailRequestSeq
    detailError.value = ''
    try {
      const { data } = await api.get(`/api/v1/knowledge/${id}`)
      if (!isActiveDetail(seq, id)) return
      if (data?.success) detail.value = { ...detail.value, ...data } as KbDetail
      else detailError.value = data?.error || 'could not load knowledge base'
    } catch (e) {
      if (!isActiveDetail(seq, id)) return
      detailError.value = errMsg(e, 'could not load knowledge base')
    }
    if (!isActiveDetail(seq, id)) return
    await nextTick()
    if (!isActiveDetail(seq, id)) return
    try { detailEl?.setAttribute('config', detailConfigJson()) } catch { /* noop */ }
  }

  function closeDetail(pushUrl = true) {
    detailRequestSeq++
    unmountDetailWc()
    detailUnsub.value?.()
    detailUnsub.value = null
    detail.value = null
    innerRoute.value = ''
    if (pushUrl) pushRoute('')
  }

  async function applyRoute(raw: string | undefined) {
    const seq = ++routeApplySeq
    const parts = String(raw || '').split('/').filter(Boolean)
    const kbId = parts[0] || ''
    const sub = parts.slice(1).join('/')
    applyingRoute = true
    try {
      if (seq !== routeApplySeq) return
      if (!kbId) {
        if (detail.value) closeDetail(false)
      } else if (detail.value?.id !== kbId) {
        innerRoute.value = sub
        const known = kbs.value.find(kb => kb.id === kbId)
        await openDetail(known || { id: kbId }, false)
        if (seq !== routeApplySeq) return
      } else if (sub !== innerRoute.value) {
        innerRoute.value = sub
        try { detailEl?.setAttribute('config', detailConfigJson()) } catch { /* noop */ }
      }
    } finally {
      if (seq === routeApplySeq) applyingRoute = false
    }
  }

  watch(route, (value) => { void applyRoute(value) })
  onBeforeUnmount(() => {
    unmountDetailWc()
    detailUnsub.value?.()
    detailUnsub.value = null
  })

  return {
    detailLoading, detailError, detailHost, detailManageTag, detailViews, detailHasViews,
    detailView, innerRoute, setDetailView, openDetail, refreshOpenDetail, closeDetail,
    applyRoute, pushRoute, unmountDetailWc,
  }
}

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { api, host, loadByTagName } from '@wippy-fe/proxy'
import { useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'
import KbDialog from './KbDialog.vue'
import KnowledgeStats from './KnowledgeStats.vue'
import AnchoredPanel from '@widgets/app/AnchoredPanel.vue'
import { useComponentProps, useComponentEvents } from '../constants'
import { errMsg } from '@widgets/app/errMsg'
import type { DialogTarget, KbDetail, KnowledgeBase } from './knowledge.types.ts'
import { useKnowledgeCatalog } from './useKnowledgeCatalog.ts'
import { useKnowledgeDetail } from './useKnowledgeDetail.ts'

const formatCount = (n?: number): string => (n ?? 0).toLocaleString()

function badgeSeverity(tone?: string): string | undefined {
  if (tone === 'neutral') return 'secondary'
  if (tone === 'warning') return 'warn'
  if (tone === 'info' || tone === 'success' || tone === 'danger') return tone
  return undefined
}

const detail = ref<KbDetail | null>(null)
const catalog = useKnowledgeCatalog({ detail })
const {
  loading, error, notice, kbs, query, filtered, models, engines, dialogLoadError,
  load, loadModels, loadEngines, engineFor, loadDialogCatalog,
  detailUnsub, applyComponentMetaEvent,
} = catalog
const rprops = useComponentProps()
const remit = useComponentEvents()
const detailState = useKnowledgeDetail({
  detail,
  detailUnsub,
  kbs,
  engines,
  engineFor,
  applyComponentMetaEvent,
  route: computed(() => rprops.value.route),
  navigate: sub => remit('navigate', sub),
  loadEngines,
})
const {
  detailLoading, detailError, detailHost, detailManageTag, detailViews, detailHasViews,
  detailView, innerRoute, setDetailView, openDetail, refreshOpenDetail, closeDetail,
  applyRoute,
} = detailState

function showSurfaceError(msg: string) {
  if (detail.value) detailError.value = msg
  else error.value = msg
}

// ─── create / edit dialog ────────────────────────────────────────────────
const dialogOpen = ref(false)
const dialogTarget = ref<DialogTarget | null>(null)
async function openCreate() {
  dialogTarget.value = null
  await loadDialogCatalog()
  dialogOpen.value = true
}

// Edit needs the KB's stored config + type, so fetch the full record first.
async function openEdit(k: KnowledgeBase) {
  error.value = ''
  detailError.value = ''
  dialogLoadError.value = ''
  if (!engines.value.length) await loadEngines()
  try {
    const { data } = await api.get(`/api/v1/knowledge/${k.id}`)
    if (!data?.success) throw new Error(data?.error || 'could not load knowledge base settings')
    dialogTarget.value = {
      id: k.id,
      name: data.name ?? k.name,
      description: data.description ?? k.description,
      icon: data.icon ?? k.icon,
      kb_type: data.kb_type ?? k.kb_type,
      embedding_model: data.embedding_model,
      config: (data.config && typeof data.config === 'object') ? data.config : {},
    }
    dialogOpen.value = true
  } catch (e) {
    dialogTarget.value = null
    dialogOpen.value = false
    showSurfaceError(errMsg(e, 'could not load knowledge base settings'))
  }
}

async function onDialogSaved() {
  dialogOpen.value = false
  const id = detail.value?.id
  await load()
  // If the edited KB is open in detail, refresh its header from the source.
  if (id && dialogTarget.value && dialogTarget.value.id === id) {
    try {
      const { data } = await api.get(`/api/v1/knowledge/${id}`)
      if (data?.success && detail.value && detail.value.id === id) detail.value = { ...detail.value, ...data } as KbDetail
    } catch { /* keep current header on refresh failure */ }
  }
  dialogTarget.value = null
}

// ─── delete ──────────────────────────────────────────────────────────────
// The destructive confirm runs in the host layer via host.confirm (rendered
// outside this web component), so no in-component modal is needed.
const pendingDeletes = ref<Record<string, string>>({})
const deletionComplete = ref('')
const deletionNotice = computed(() => Object.keys(pendingDeletes.value).length
  ? `Deleting ${Object.values(pendingDeletes.value).join(', ')}: cleanup is in progress and continues in the background.`
  : deletionComplete.value)
let cleanupTimer: ReturnType<typeof setTimeout> | undefined
let disposed = false

function scheduleCleanup() {
  if (disposed || cleanupTimer !== undefined || !Object.keys(pendingDeletes.value).length) return
  cleanupTimer = setTimeout(async () => {
    cleanupTimer = undefined
    const loaded = await load({ preserve: true })
    if (disposed) return
    if (loaded) {
      for (const [id, name] of Object.entries(pendingDeletes.value)) {
        if (kbs.value.some(kb => kb.id === id)) continue
        delete pendingDeletes.value[id]
        deletionComplete.value = `Deletion complete: ${name}.`
      }
    }
    scheduleCleanup()
  }, 1000)
}

onBeforeUnmount(() => {
  disposed = true
  if (cleanupTimer !== undefined) clearTimeout(cleanupTimer)
})

async function askRemove(k: KnowledgeBase) {
  const ok = await host.confirm({
    header: 'Delete knowledge base',
    message: `Delete “${k.name || '(untitled)'}”? This removes the knowledge base and all of its contents. This can't be undone.`,
    icon: 'tabler:trash',
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
  })
  if (!ok) return
  showSurfaceError('')
  error.value = ''
  try {
    const { data } = await api.delete(`/api/v1/knowledge/${k.id}`)
    if (!data?.success) throw new Error(data?.error || 'delete failed')
    deletionComplete.value = ''
    if (data.in_progress === true) {
      pendingDeletes.value[k.id] = k.name || '(untitled)'
      scheduleCleanup()
    }
    if (detail.value?.id === k.id) closeDetail()
    await load({ preserve: data.in_progress === true })
  } catch (e) {
    showSurfaceError(errMsg(e, 'delete failed'))
  }
}

// ─── share ──────────────────────────────────────────────────────────────
// A KB is a component, so it shares through the generic component access
// endpoints + the reusable kickside-share popup, mounted by tag.
const shareOpen = ref(false)
const shareTarget = ref<KnowledgeBase | null>(null)
const shareHost = ref<HTMLElement | null>(null)

function openShare(k: KnowledgeBase) { shareTarget.value = k; shareOpen.value = true }
function closeShare() { shareOpen.value = false; shareTarget.value = null }

// Esc dismisses the topmost open overlay, matching the click-outside behavior.
// KB summary popover anchored in the detail header (the maintained auto_summary /
// auto_description already ride on the detail record, so no extra fetch).
// The summary popover renders through AnchoredPanel, which owns its own
// outside-click + Escape dismissal; only the open state lives here.
const summaryOpen = ref(false)
const summaryAnchor = ref<HTMLElement | null>(null)

function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  // The delete confirm and the create/edit dialog own their own Escape handling
  // (host.confirm overlay, PrimeVue Dialog); only the share popup needs this.
  if (shareOpen.value) closeShare()
}
onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})

async function mountShare() {
  const k = shareTarget.value
  if (!shareHost.value || !k) return
  shareHost.value.innerHTML = ''
  if (!customElements.get('kickside-share')) {
    try { await loadByTagName('kickside-share', { timeoutMs: 8000 }) } catch { /* inert if undefined */ }
  }
  const el = document.createElement('kickside-share')
  el.setAttribute('config', JSON.stringify({
    resource_id: k.id,
    access_url: `/api/v1/component-access/grants/${encodeURIComponent(k.id)}`,
    share_url: `/api/v1/component-access/share/${encodeURIComponent(k.id)}`,
    title: k.name || '',
  }))
  el.style.display = 'block'
  el.addEventListener('close', closeShare)
  shareHost.value.appendChild(el)
}

watch([shareOpen, shareHost], async () => {
  if (shareOpen.value && shareHost.value) await mountShare()
})

useHostVisibilityRefresh(async () => {
  try {
    // The list and the engine catalog are independent; fetch them concurrently so
    // the grid paints as soon as the list resolves instead of waiting on engines
    // (which only the detail/create flows need).
    await Promise.all([load(), loadEngines(), refreshOpenDetail()])
    // Honor an initial deep link (/knowledge/<kbId>[/<node>]) once data is ready.
    if (!detail.value && rprops.value.route) await applyRoute(rprops.value.route)
  } catch (e) {
    error.value = errMsg(e, 'host API unavailable')
  }
})
</script>

<template>
  <div class="kx">
    <div v-if="deletionNotice" class="kx-notice" role="status">{{ deletionNotice }}</div>
    <!-- ─── List view ─────────────────────────────────────────────── -->
    <template v-if="!detail">
      <header class="kx-head">
        <div class="kx-head-icon"><Icon icon="tabler:books" aria-hidden="true" /></div>
        <div class="kx-head-text">
          <h1 class="kx-head-title">Knowledge</h1>
          <p class="kx-head-sub">Knowledge bases your agents search and reason over.</p>
        </div>
        <div class="kx-head-actions">
          <span class="kx-count">{{ kbs.length }} knowledge base{{ kbs.length !== 1 ? 's' : '' }}</span>
          <div class="kx-search">
            <Icon icon="tabler:search" class="kx-search-ico" aria-hidden="true" />
            <input v-model="query" class="kx-search-input" type="text" placeholder="Search knowledge bases…" />
          </div>
          <Button type="button" data-testid="knowledge-create" label="New knowledge base" @click="openCreate">
            <template #icon="{ class: iconClass }"><Icon icon="tabler:plus" :class="iconClass" aria-hidden="true" /></template>
          </Button>
        </div>
      </header>

      <div v-if="error" class="kx-err">{{ error }}</div>
      <div v-if="notice" class="kx-notice">
        <Icon icon="tabler:info-circle" aria-hidden="true" />
        <span><strong>No knowledge engine installed.</strong> Install a KB engine to create and browse knowledge bases.</span>
      </div>

      <div class="kx-body">
        <div v-if="loading && !kbs.length" class="kx-loading">
          <Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading…
        </div>

        <div v-else-if="!kbs.length" class="kx-empty">
          <div class="kx-empty-ico"><Icon icon="tabler:books" aria-hidden="true" /></div>
          <div class="kx-empty-title">No knowledge bases yet</div>
          <div class="kx-empty-sub">A knowledge base your agents can search and reason over.</div>
          <Button type="button" data-testid="knowledge-create" label="New knowledge base" @click="openCreate">
            <template #icon="{ class: iconClass }"><Icon icon="tabler:plus" :class="iconClass" aria-hidden="true" /></template>
          </Button>
        </div>

        <div v-else-if="!filtered.length" class="kx-empty">
          <div class="kx-empty-title">No matches</div>
          <div class="kx-empty-sub">No knowledge bases match the current search.</div>
        </div>

        <div v-else class="kx-grid">
          <div
            v-for="k in filtered"
            :key="k.id"
            class="kx-card"
            role="button"
            tabindex="0"
            :aria-label="`Open ${k.name || 'knowledge base'}`"
            @click="openDetail(k)"
            @keydown.enter="openDetail(k)"
            @keydown.space.prevent="openDetail(k)"
          >
            <div class="kx-card-head">
              <span class="kx-ficon"><Icon :icon="k.icon || k.badge?.icon || 'tabler:books'" aria-hidden="true" /></span>
              <div class="kx-card-id">
                <div class="kx-card-name" :title="k.name || '(untitled)'">{{ k.name || '(untitled)' }}</div>
                <div v-if="k.badge" class="kx-card-meta">
                  <Tag :severity="badgeSeverity(k.badge.tone)" class="kx-pill kx-tag-caps">
                    <Icon :icon="k.badge.icon" aria-hidden="true" />{{ k.badge.label }}
                  </Tag>
                </div>
              </div>
              <div class="kx-card-actions" @click.stop>
                <Button type="button" severity="secondary" outlined size="small" title="Edit" :aria-label="`Edit ${k.name}`" @click="openEdit(k)">
                  <template #icon="{ class: iconClass }"><Icon icon="tabler:pencil" :class="iconClass" aria-hidden="true" /></template>
                </Button>
                <Button type="button" severity="secondary" outlined size="small" title="Share" :aria-label="`Share ${k.name}`" @click="openShare(k)">
                  <template #icon="{ class: iconClass }"><Icon icon="tabler:share" :class="iconClass" aria-hidden="true" /></template>
                </Button>
                <Button type="button" severity="danger" outlined size="small" title="Delete" :aria-label="`Delete ${k.name}`" @click="askRemove(k)">
                  <template #icon="{ class: iconClass }"><Icon icon="tabler:trash" :class="iconClass" aria-hidden="true" /></template>
                </Button>
              </div>
            </div>
            <div class="kx-card-desc">{{ k.description || 'No description' }}</div>
            <div v-if="k.stat_items && k.stat_items.length" class="kx-stats">
              <span
                v-for="(s, i) in k.stat_items"
                :key="i"
                class="kx-stat"
                :title="`${formatCount(s.value)} ${s.label}`"
                :aria-label="`${formatCount(s.value)} ${s.label}`"
              >
                <Icon v-if="s.icon" :icon="s.icon" aria-hidden="true" />{{ formatCount(s.value) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ─── Detail / browse view ─────────────────────────────────────── -->
    <template v-else>
      <div class="kx-bar">
        <div class="kx-bar-l">
          <button class="kx-back" @click="closeDetail()"><Icon icon="tabler:arrow-left" aria-hidden="true" /> Back</button>
          <h1 class="kx-title" :title="detail.name || '(untitled)'">{{ detail.name || '(untitled)' }}</h1>
          <Tag v-if="detail.badge" :severity="badgeSeverity(detail.badge.tone)" class="kx-pill kx-tag-caps">
            <Icon :icon="detail.badge.icon" aria-hidden="true" />{{ detail.badge.label }}
          </Tag>
          <KnowledgeStats :items="detail.stat_items || []" />
          <span
            v-if="detail.auto_summary || detail.auto_description"
            class="kx-summary"
          >
            <Button
              ref="summaryAnchor"
              severity="secondary"
              outlined
              class="kx-summary-btn"
              :class="{ on: summaryOpen }"
              type="button"
              title="About this knowledge base"
              aria-label="About this knowledge base"
              :aria-expanded="summaryOpen"
              @click.stop="summaryOpen = !summaryOpen"
            >
              <template #icon="{ class: iconClass }"><Icon icon="tabler:sparkles" :class="iconClass" aria-hidden="true" /></template>
            </Button>
            <AnchoredPanel v-model:open="summaryOpen" :anchor="summaryAnchor" :width="340">
              <div class="kx-summary-pop" @click.stop>
                <div class="kx-summary-pop-h"><Icon icon="tabler:sparkles" aria-hidden="true" /><span>About this knowledge base</span></div>
                <p v-if="detail.auto_summary" class="kx-summary-pop-sum">{{ detail.auto_summary }}</p>
                <p v-if="detail.auto_description" class="kx-summary-pop-desc">{{ detail.auto_description }}</p>
              </div>
            </AnchoredPanel>
          </span>
        </div>
        <div class="kx-bar-r">
          <div v-if="detailHasViews" class="kx-viewseg" role="tablist" aria-label="View mode">
            <button
              v-for="mode in detailViews"
              :key="mode.id"
              class="kx-viewseg-btn"
              :class="{ on: detailView === mode.id }"
              role="tab"
              :aria-selected="detailView === mode.id"
              @click="setDetailView(mode.id)"
            ><Icon v-if="mode.icon" :icon="mode.icon" aria-hidden="true" /> {{ mode.label }}</button>
          </div>
          <Button type="button" severity="secondary" outlined label="Edit" @click="openEdit(detail)">
            <template #icon="{ class: iconClass }"><Icon icon="tabler:pencil" :class="iconClass" aria-hidden="true" /></template>
          </Button>
          <Button type="button" severity="secondary" outlined label="Share" @click="openShare(detail)">
            <template #icon="{ class: iconClass }"><Icon icon="tabler:share" :class="iconClass" aria-hidden="true" /></template>
          </Button>
          <Button type="button" severity="danger" outlined label="Delete" @click="askRemove(detail)">
            <template #icon="{ class: iconClass }"><Icon icon="tabler:trash" :class="iconClass" aria-hidden="true" /></template>
          </Button>
        </div>
      </div>

      <div v-if="detailError" class="kx-err">{{ detailError }}</div>

      <div class="kx-body" :class="{ 'kx-body-bleed': detailManageTag }">
        <div v-if="detailLoading" class="kx-loading">
          <Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading…
        </div>

        <template v-else>
          <template v-if="!detailManageTag">
            <div class="kx-detail-meta">
              <div v-if="detail.description" class="kx-detail-desc">{{ detail.description }}</div>
              <div class="kx-stats">
                <span v-if="detail.embedding_model" class="kx-stat"><Icon icon="tabler:vector" aria-hidden="true" />{{ detail.embedding_model }}</span>
              </div>
            </div>

            <div v-if="detail.auto_summary" class="kx-detail-summary">
              <div class="kx-detail-summary-lbl">Summary</div>
              {{ detail.auto_summary }}
            </div>
          </template>

          <div ref="detailHost" class="kx-detail-host"></div>
        </template>
      </div>
    </template>

    <!-- Create / edit dialog: generic shell + per-engine custom config UI. -->
    <KbDialog
      :open="dialogOpen"
      :api="api"
      :engines="engines"
      :models="models"
      :target="dialogTarget"
      :load-error="dialogLoadError"
      @retry="loadDialogCatalog"
      @close="dialogOpen = false"
      @saved="onDialogSaved"
    />

    <!-- Share: the reusable kickside-share popup owns its own modal chrome
         (backdrop + panel); we just mount the tag and close on its `close`. -->
    <div v-if="shareOpen" ref="shareHost"></div>
  </div>
</template>

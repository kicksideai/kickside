<script setup lang="ts">
import ComponentDeletion from '@kickside/ui-kit/ComponentDeletion.vue'
import { useComponentDeletion } from '@kickside/ui-kit/useComponentDeletion'
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
import { errMsg } from '@kickside/ui-kit/errMsg'
import type { DialogTarget, KbDetail, KnowledgeBase } from './knowledge.types.ts'
import { useKnowledgeCatalog } from './useKnowledgeCatalog.ts'
import { useKnowledgeDetail } from './useKnowledgeDetail.ts'

const formatCount = (n?: number): string => (n ?? 0).toLocaleString()

// Component access bits are independent. Use the caller's effective mask from
// the authorized list/detail reads for each action's own permission.
const WRITE = 2
const DELETE = 4
const ADMIN = 8
function allows(k: KnowledgeBase, access: number): boolean {
  return ((k.access_level ?? 0) & access) !== 0
}
function readOnly(k: KnowledgeBase): boolean {
  return typeof k.access_level === 'number' && !allows(k, WRITE | DELETE | ADMIN)
}

function badgeSeverity(tone?: string): string | undefined {
  if (tone === 'neutral') return 'secondary'
  if (tone === 'warning') return 'warn'
  if (tone === 'info' || tone === 'success' || tone === 'danger') return tone
  return undefined
}

const detail = ref<KbDetail | null>(null)
const catalog = useKnowledgeCatalog({ detail })
const {
  loading, error, catalogError, catalogLoaded, notice, kbs, query, filtered, models, engines, dialogLoadError,
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
  detailView, innerRoute, setDetailView, openDetail, refreshOpenDetail, closeDetail, backDetail,
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
  if (!allows(k, WRITE)) return
  error.value = ''
  detailError.value = ''
  dialogLoadError.value = ''
  if (!engines.value.length) await loadEngines()
  try {
    const { data } = await api.get(`/api/v1/knowledge/${k.id}`)
    if (!data?.success) throw new Error(data?.error || 'could not load knowledge base settings')
    if (!allows(data, WRITE)) {
      await load()
      if (detail.value?.id === k.id) detail.value = { ...detail.value, access_level: data.access_level }
      showSurfaceError('You no longer have permission to edit this knowledge base.')
      return
    }
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
async function askRemove(k: KnowledgeBase) {
  if (!allows(k, DELETE)) return
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
    acceptDeletion(k.id, data)
    if (detail.value?.id === k.id) closeDetail()
    await load()
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

function openShare(k: KnowledgeBase) {
  if (!allows(k, ADMIN)) return
  shareTarget.value = k
  shareOpen.value = true
}
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
const {acceptDeletion} = useComponentDeletion(kbs, row => row.id, id => { if (detail.value?.id === id) closeDetail() }, load)
</script>

<template>
  <div class="kx">
    <!-- ─── List view ─────────────────────────────────────────────── -->
    <template v-if="!detail">
      <header class="kx-head">
        <div class="kx-head-icon"><Icon icon="tabler:books" aria-hidden="true" /></div>
        <div class="kx-head-text">
          <h1 class="kx-head-title">Knowledge</h1>
          <p class="kx-head-sub">Knowledge bases your agents search and reason over.</p>
        </div>
        <div class="kx-head-actions">
          <span v-if="catalogLoaded" class="kx-count">{{ kbs.length }} knowledge base{{ kbs.length !== 1 ? 's' : '' }}</span>
          <div class="kx-search">
            <Icon icon="tabler:search" class="kx-search-ico" aria-hidden="true" />
            <input v-model="query" class="kx-search-input" type="text" placeholder="Search knowledge bases…" />
          </div>
          <Button v-if="kbs.length" type="button" data-testid="knowledge-create" label="New knowledge base" @click="openCreate">
            <template #icon="{ class: iconClass }"><Icon icon="tabler:plus" :class="iconClass" aria-hidden="true" /></template>
          </Button>
        </div>
      </header>

      <div v-if="error" class="kx-err">{{ error }}</div>
      <div v-if="catalogError" class="kx-err" role="alert">{{ catalogError }}</div>
      <div v-if="notice" class="kx-notice">
        <Icon icon="tabler:info-circle" aria-hidden="true" />
        <span><strong>No knowledge engine installed.</strong> Install a KB engine to create and browse knowledge bases.</span>
      </div>

      <div class="kx-body">
        <div v-if="loading && !kbs.length" class="kx-loading">
          <Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading…
        </div>

        <Button v-else-if="catalogError" type="button" label="Retry" severity="secondary" outlined class="kx-cat-retry" @click="load" />

        <div v-else-if="catalogLoaded && !notice && !kbs.length" class="kx-empty">
          <div class="kx-empty-ico"><Icon icon="tabler:books" aria-hidden="true" /></div>
          <div class="kx-empty-title">No knowledge bases yet</div>
          <div class="kx-empty-sub">A knowledge base your agents can search and reason over.</div>
          <Button type="button" data-testid="knowledge-create" label="New knowledge base" @click="openCreate">
            <template #icon="{ class: iconClass }"><Icon icon="tabler:plus" :class="iconClass" aria-hidden="true" /></template>
          </Button>
        </div>

        <div v-if="kbs.length && !filtered.length" class="kx-empty">
          <div class="kx-empty-title">No matches</div>
          <div class="kx-empty-sub">No knowledge bases match the current search.</div>
        </div>

        <div v-else-if="filtered.length" class="kx-grid">
          <div
            v-for="k in filtered"
            :key="k.id"
            class="kx-card"
          >
            <ComponentDeletion v-if="allows(k, DELETE)" :state="k" @retry="askRemove(k)" />
            <span v-else-if="k.deleting_at" class="kx-sub" role="status">Deletion requested</span>
            <div class="kx-card-head">
              <span class="kx-ficon"><Icon :icon="k.icon || k.badge?.icon || 'tabler:books'" aria-hidden="true" /></span>
              <div class="kx-card-id">
                <button type="button" class="kx-card-name kx-card-open" :title="k.name || '(untitled)'" :aria-label="`Open ${k.name || 'knowledge base'}`" :disabled="!!k.deleting_at" @click="openDetail(k)">{{ k.name || '(untitled)' }}</button>
                <span v-if="readOnly(k)" class="kx-sub">Read only</span>
                <div v-if="k.badge" class="kx-card-meta">
                  <Tag :severity="badgeSeverity(k.badge.tone)" class="kx-pill kx-tag-caps">
                    <Icon :icon="k.badge.icon" aria-hidden="true" />{{ k.badge.label }}
                  </Tag>
                </div>
              </div>
              <div class="kx-card-actions">
                <Button v-if="allows(k, WRITE)" type="button" severity="secondary" outlined size="small" title="Edit" :aria-label="`Edit ${k.name}`" @click="!k.deleting_at && openEdit(k)" :disabled="!!k.deleting_at">
                  <template #icon="{ class: iconClass }"><Icon icon="tabler:pencil" :class="iconClass" aria-hidden="true" /></template>
                </Button>
                <Button v-if="allows(k, ADMIN)" type="button" severity="secondary" outlined size="small" title="Share" :aria-label="`Share ${k.name}`" @click="openShare(k)" :disabled="!!k.deleting_at">
                  <template #icon="{ class: iconClass }"><Icon icon="tabler:share" :class="iconClass" aria-hidden="true" /></template>
                </Button>
                <Button v-if="allows(k, DELETE)" type="button" severity="danger" outlined size="small" title="Delete" :aria-label="`Delete ${k.name}`" @click="askRemove(k)" :disabled="!!k.deleting_at">
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
          <button class="kx-back" @click="backDetail()"><Icon icon="tabler:arrow-left" aria-hidden="true" /> Back</button>
          <h1 class="kx-title" :title="detail.name || '(untitled)'">{{ detail.name || '(untitled)' }}</h1>
          <span v-if="readOnly(detail)" class="kx-sub">Read only</span>
          <Tag v-if="detail.badge" :severity="badgeSeverity(detail.badge.tone)" class="kx-pill kx-tag-caps">
            <Icon :icon="detail.badge.icon" aria-hidden="true" />{{ detail.badge.label }}
          </Tag>
          <KnowledgeStats :items="detail.stat_items || []" />
          <span
            v-if="detail.auto_summary || detail.auto_description"
            ref="summaryAnchor"
            class="kx-summary"
          >
            <Button
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
          <Button v-if="allows(detail, WRITE)" type="button" severity="secondary" outlined label="Edit" @click="openEdit(detail)">
            <template #icon="{ class: iconClass }"><Icon icon="tabler:pencil" :class="iconClass" aria-hidden="true" /></template>
          </Button>
          <Button v-if="allows(detail, ADMIN)" type="button" severity="secondary" outlined label="Share" @click="openShare(detail)">
            <template #icon="{ class: iconClass }"><Icon icon="tabler:share" :class="iconClass" aria-hidden="true" /></template>
          </Button>
          <Button v-if="allows(detail, DELETE)" type="button" severity="danger" outlined label="Delete" @click="askRemove(detail)">
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

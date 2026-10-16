<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import Paginator from 'primevue/paginator'
import Select from 'primevue/select'
import { api, host, loadByTagName } from '@wippy-fe/proxy'
import { subscribeComponentMeta } from '@widgets/app/componentRealtime'
import { formatDateTime } from '@widgets/app/datetime'
import UploadPreviewDrawer from './UploadPreviewDrawer.vue'
import type { Upload, UploadsMeta } from './uploads.types.ts'
import {
  canPreview, formatError, formatSize, isFailed, isWorking, normStatus,
  statusLabel, statusSeverity, typeIcon, typeLabel, uploadLabel,
} from './uploads.format.ts'
import { useUploadArtifacts } from './useUploadArtifacts.ts'

const TERMINAL = new Set(['completed', 'error'])
const PAGE_SIZE = 30

// Status filter choices, declared as an options array for the PrimeVue Select.
const STATUS_OPTIONS = [
  { label: 'All status', value: 'all' },
  { label: 'Uploaded', value: 'uploaded' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Error', value: 'error' },
]

// The list is server-paginated/-searched (the user can have far more than one
// page of files), so `uploads` holds only the current page and `total` is the
// full filtered count from the server.
const uploads = ref<Upload[]>([])
const total = ref(0)
const loading = ref(false)
const error = ref('')
const dragOver = ref(false)
const uploadingCount = ref(0)
const query = ref('')
const statusFilter = ref('all')
const page = ref(1)
const deleting = ref(false)

const {
  preview, artifactView, partsExpanded, busyAction,
  activePreviewSource,
  openPreview, closePreview, viewOriginal, viewPrimary, viewArtifact,
  currentArtifacts, partsTotal, partsPage, partsPages, partsRangeStart, partsRangeEnd,
  hasPrimary, artifactsLoading, gotoPartsPage, downloadActive, openActive,
} = useUploadArtifacts(error)

const componentId = ref('')
const meta = ref<UploadsMeta>({})
let componentUnsub: (() => void) | null = null
let connectedComponentId = ''

// In-flight count from the component's public meta (counts every queued/processing
// upload, across pages), falling back to the current page's non-terminal rows when
// meta has not arrived yet.
const pendingCount = computed(() => {
  if (typeof meta.value.pending_count === 'number') return meta.value.pending_count
  return uploads.value.filter(u => !TERMINAL.has(normStatus(u.status))).length
})

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

// ── Server-driven list ────────────────────────────────────────────────────────
async function fetchUploads() {
  loading.value = true
  error.value = ''
  try {
    const params: Record<string, unknown> = { limit: PAGE_SIZE, offset: (page.value - 1) * PAGE_SIZE }
    const q = query.value.trim()
    if (q) params.q = q
    if (statusFilter.value !== 'all') params.status = statusFilter.value
    const { data } = await api.get('/api/v1/uploads/list', { params })
    if (data.success) {
      uploads.value = data.uploads || []
      total.value = Number(data.meta?.total ?? uploads.value.length)
      if (typeof data.component_id === 'string') componentId.value = data.component_id
    } else {
      uploads.value = []; total.value = 0
    }
  } catch (e) {
    uploads.value = []; total.value = 0
    error.value = e instanceof Error ? e.message : 'failed to load uploads'
  } finally {
    loading.value = false
  }
}

function goto(p: number) {
  const next = Math.max(1, Math.min(totalPages.value, p))
  if (next === page.value) return
  page.value = next
  void fetchUploads()
}

// Debounced search; a filter/search change resets to the first page.
let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(query, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; void fetchUploads() }, 300)
})
watch(statusFilter, () => { page.value = 1; void fetchUploads() })

// Stay live off the uploads component's canonical public-meta topic. Every upload
// lifecycle milestone (queued/completed/failed/deleted) advances the read-model and
// fans out as component.meta.changed; the paginated/searched list cannot ride a
// summary payload, so meta.changed is the invalidation signal to refetch this page.
// Realtime only -- no polling.
function connectRealtime() {
  const id = componentId.value
  if (!id || connectedComponentId === id) return
  if (componentUnsub) componentUnsub()
  componentUnsub = null
  connectedComponentId = ''
  componentUnsub = subscribeComponentMeta(id, (event) => {
    meta.value = { ...meta.value, ...(event.meta as UploadsMeta) }
    void fetchUploads()
  })
  if (componentUnsub) connectedComponentId = id
}
watch(componentId, () => { connectRealtime() })

async function uploadOne(file: File) {
  const form = new FormData()
  form.append('file', file)
  // File the upload into the workspace (root) as a `file` component via the pipeline's
  // universal stage -- the same path the workspace surface uses. Empty target = root.
  form.append('metadata', JSON.stringify({ target_parent_id: '', filename: file.name }))
  try {
    const { data } = await api.post('/api/v1/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    if (!data.success) error.value = data.error || `failed to upload "${file.name}"`
  } catch (e) {
    error.value = e instanceof Error ? e.message : `failed to upload "${file.name}"`
  }
}

async function uploadFiles(files: FileList | File[]) {
  const list = Array.from(files)
  if (!list.length) return
  error.value = ''
  uploadingCount.value += list.length
  try {
    for (const f of list) await uploadOne(f)
  } finally {
    uploadingCount.value = Math.max(0, uploadingCount.value - list.length)
    // Show the freshly-uploaded files (newest first) on page one.
    page.value = 1
    await fetchUploads()
  }
}

function pickFiles() {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.onchange = () => { if (input.files?.length) void uploadFiles(input.files) }
  input.click()
}
function onDrop(e: DragEvent) {
  e.preventDefault()
  dragOver.value = false
  if (e.dataTransfer?.files?.length) void uploadFiles(e.dataTransfer.files)
}

// Delete confirmation runs through the host confirm dialog (the facade iframe is
// sandboxed without allow-modals, so window.confirm is unavailable). The host
// resolves true/false; only an accept proceeds to the delete.
async function askRemove(u: Upload) {
  const ok = await host.confirm({
    header: 'Delete upload',
    message: 'Deletes the file everywhere; workspace links are removed.',
    icon: 'tabler:trash',
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
  })
  if (!ok) return
  await doRemove(u)
}

async function doRemove(u: Upload) {
  deleting.value = true
  error.value = ''
  try {
    const { data } = await api.delete(`/api/v1/uploads/${u.uuid}`)
    if (data.success) {
      if (preview.value?.uuid === u.uuid) closePreview()
      // The page may now be short a row; clamp if we deleted the last item on it.
      if (uploads.value.length === 1 && page.value > 1) page.value -= 1
      await fetchUploads()
    } else error.value = data.error || 'failed to delete upload'
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'failed to delete upload'
  } finally {
    deleting.value = false
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && preview.value) closePreview()
}

async function refreshUploads() {
  try {
    await fetchUploads()
    connectRealtime()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'host API unavailable'
  }
}

useHostVisibilityRefresh(refreshUploads)

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  loadByTagName('wc-resource-view', { timeoutMs: 10000 }).catch(() => {})
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (searchTimer) clearTimeout(searchTimer)
  if (componentUnsub) componentUnsub()
  componentUnsub = null
  connectedComponentId = ''
})
</script>

<template>
  <div class="kx">
    <header class="kx-head">
      <div class="kx-head-icon"><Icon icon="tabler:files" aria-hidden="true" /></div>
      <div class="kx-head-text">
        <h1 class="kx-title">Uploads</h1>
        <p class="kx-head-sub">Files your agents can read and process.</p>
      </div>
      <div class="kx-head-actions">
        <span class="kx-count">{{ total }} file{{ total !== 1 ? 's' : '' }}</span>
        <span v-if="pendingCount" class="kx-count kx-pending"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> {{ pendingCount }} processing</span>
        <InputGroup class="kx-search">
          <InputGroupAddon>
            <Icon icon="tabler:search" aria-hidden="true" />
          </InputGroupAddon>
          <InputText
            v-model="query"
            placeholder="Search files…"
            aria-label="Search files"
            data-testid="uploads-search-input"
          />
          <InputGroupAddon v-if="query">
            <Button
              type="button"
              text
              severity="secondary"
              size="small"
              aria-label="Clear search"
              data-testid="uploads-search-clear"
              @click="query = ''"
            >
              <template #icon="{ class: iconClass }">
                <Icon icon="tabler:x" :class="iconClass" aria-hidden="true" />
              </template>
            </Button>
          </InputGroupAddon>
        </InputGroup>
        <Select
          v-model="statusFilter"
          class="kx-select"
          :options="STATUS_OPTIONS"
          option-label="label"
          option-value="value"
          aria-label="Filter by status"
        />
        <Button
          type="button"
          data-testid="uploads-header-upload"
          :label="uploadingCount > 0 ? 'Uploading…' : 'Upload'"
          :loading="uploadingCount > 0"
          :disabled="uploadingCount > 0"
          @click="pickFiles">
          <template #icon="{ class: iconClass }">
            <Icon icon="tabler:upload" :class="iconClass" aria-hidden="true" />
          </template>
        </Button>
      </div>
    </header>

    <div v-if="error" class="kx-err">{{ error }}</div>

    <div class="kx-body">
      <div class="kx-main">
        <div
          class="kx-drop"
          :class="{ dragover: dragOver, busy: uploadingCount > 0 }"
          role="button"
          tabindex="0"
          aria-label="Upload files"
          @click="uploadingCount === 0 && pickFiles()"
          @keydown.enter="uploadingCount === 0 && pickFiles()"
          @keydown.space.prevent="uploadingCount === 0 && pickFiles()"
          @dragover.prevent="dragOver = true"
          @dragleave="dragOver = false"
          @drop="onDrop"
        >
          <Icon :icon="uploadingCount > 0 ? 'tabler:loader-2' : 'tabler:cloud-upload'" :class="['kx-drop-ico', uploadingCount > 0 && 'spin']" aria-hidden="true" />
          <p class="kx-drop-title">{{ uploadingCount > 0 ? 'Uploading…' : 'Drop files or click to browse' }}</p>
          <p class="kx-drop-sub">Documents convert to markdown; images and text are stored for agents.</p>
        </div>

        <div v-if="loading && !uploads.length" class="kx-loading"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading…</div>

        <div v-else-if="!total && !query && statusFilter === 'all'" class="kx-empty">
          <div class="kx-empty-ico"><Icon icon="tabler:cloud-upload" aria-hidden="true" /></div>
          <div class="kx-empty-title">No uploads yet</div>
          <div class="kx-empty-sub">Upload a document, image, or text file to make it available to your agents.</div>
          <Button
            type="button"
            class="kx-empty-cta"
            data-testid="uploads-empty-upload"
            label="Upload files"
            @click="pickFiles">
            <template #icon="{ class: iconClass }">
              <Icon icon="tabler:upload" :class="iconClass" aria-hidden="true" />
            </template>
          </Button>
        </div>

        <div v-else-if="!uploads.length" class="kx-empty">
          <div class="kx-empty-title">No matches</div>
          <div class="kx-empty-sub">No files match the current search or filter.</div>
        </div>

        <template v-else>
          <div class="kx-list">
            <div
              v-for="u in uploads"
              :key="u.uuid"
              class="kx-row"
            >
              <span class="kx-ficon"><Icon :icon="typeIcon(u.mime_type)" aria-hidden="true" /></span>
              <div class="kx-id">
                <div class="kx-name" :title="uploadLabel(u)">{{ uploadLabel(u) }}<span v-if="!u.filename?.trim()" class="kx-uuid"> {{ u.uuid }}</span></div>
                <div class="kx-sub"><span class="kx-type">{{ typeLabel(u) }}</span> · {{ formatSize(u.size) }}</div>
                <div v-if="isFailed(u) && u.error" class="kx-err-reason" :title="formatError(u.error)">{{ formatError(u.error) }}</div>
              </div>
              <Tag :severity="statusSeverity(u.status)" class="kx-badge kx-tag-sm">
                <Icon v-if="!TERMINAL.has(u.status)" icon="tabler:loader-2" class="spin" aria-hidden="true" />
                {{ statusLabel(u.status) }}
              </Tag>
              <span class="kx-date">{{ formatDateTime(u.created_at) }}</span>
              <div class="kx-actions">
                <Button
                  v-if="canPreview(u)"
                  type="button"
                  text
                  rounded
                  size="small"
                  data-testid="uploads-row-preview"
                  :data-upload-id="u.uuid"
                  :aria-label="`Preview ${uploadLabel(u)}`"
                  @click="openPreview(u)"
                >
                  <template #icon="{ class: iconClass }">
                    <Icon icon="tabler:eye" :class="iconClass" aria-hidden="true" />
                  </template>
                </Button>
                <Button
                  type="button"
                  text
                  rounded
                  size="small"
                  severity="danger"
                  data-testid="uploads-row-delete"
                  :data-upload-id="u.uuid"
                  :aria-label="`Delete ${uploadLabel(u)}`"
                  @click="askRemove(u)"
                >
                  <template #icon="{ class: iconClass }">
                    <Icon icon="tabler:trash" :class="iconClass" aria-hidden="true" />
                  </template>
                </Button>
              </div>
              <span v-if="isWorking(u)" class="kx-progress" aria-hidden="true"></span>
            </div>
          </div>

          <Paginator
            v-if="totalPages > 1"
            :first="(page - 1) * PAGE_SIZE"
            :rows="PAGE_SIZE"
            :total-records="total"
            :page-link-size="5"
            template="CurrentPageReport PrevPageLink PageLinks NextPageLink"
            current-page-report-template="{first}–{last} of {totalRecords}"
            data-testid="uploads-pager"
            aria-label="Pagination"
            :pt="{
              prev: { 'data-testid': 'uploads-pager-previous' },
              next: { 'data-testid': 'uploads-pager-next' },
            }"
            @page="goto($event.page + 1)"
          />
        </template>
      </div>
    </div>

    <UploadPreviewDrawer
      v-model:parts-expanded="partsExpanded"
      :preview="preview"
      :artifact-view="artifactView"
      :busy-action="busyAction"
      :current-artifacts="currentArtifacts"
      :parts-total="partsTotal"
      :parts-page="partsPage"
      :parts-pages="partsPages"
      :parts-range-start="partsRangeStart"
      :parts-range-end="partsRangeEnd"
      :has-primary="hasPrimary"
      :artifacts-loading="artifactsLoading"
      :active-preview-source="activePreviewSource"
      :download-active="downloadActive"
      :open-active="openActive"
      :close-preview="closePreview"
      :view-original="viewOriginal"
      :view-primary="viewPrimary"
      :view-artifact="viewArtifact"
      :goto-parts-page="gotoPartsPage"
    />

  </div>
</template>

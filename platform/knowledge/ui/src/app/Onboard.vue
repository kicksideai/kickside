<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import { useComponentEvents } from '../constants.ts'
import { subscribeComponentMeta } from '@widgets/app/componentRealtime'

// kickside-onboard-knowledge — the workspace organize onboarding step. Drop files,
// they upload + extract, then one call hands every file reference to the organize
// orchestrator (POST /knowledge/organize): a fast model names the KB and
// assigns a title/category per file, the KB is created, and every file is ingested
// by reference (the KB owns content + embedding). Skippable; drives the wizard via
// done/back.
const emit = useComponentEvents()

type FileState = 'uploading' | 'processing' | 'ready' | 'error'
interface Item { name: string; size: number; upload_id?: string; status: FileState; error?: string }
const STATUS_READ_CONCURRENCY = 4

// Human labels for the per-file ingest state so the row never shows a raw enum.
const FILE_STATE_LABEL: Record<FileState, string> = {
  uploading: 'Uploading',
  processing: 'Processing',
  ready: 'Ready',
  error: 'Error',
}

const items = ref<Item[]>([])
const dragOver = ref(false)
const building = ref(false)
const error = ref('')
const result = ref<{ kb_id: string; kb_name: string; queued: number; total: number } | null>(null)
let uploadsComponentId = ''
let uploadsUnsub: (() => void) | null = null
let statusRead: Promise<void> | null = null
let statusRefreshQueued = false
let disposed = false

const ready = computed(() => items.value.filter(i => i.status === 'ready'))
const busy = computed(() => items.value.some(i => i.status === 'uploading' || i.status === 'processing'))

async function refreshUpload(item: Item) {
  if (disposed || !items.value.includes(item) || !item.upload_id || item.status !== 'processing') return
  try {
    const { data } = await api.get(`/api/v1/uploads/${encodeURIComponent(item.upload_id)}`)
    if (disposed || !items.value.includes(item)) return
    const s = String(data?.upload?.status || '')
    if (s === 'completed') {
      item.status = 'ready'
      return
    }
    if (s === 'error' || s === 'failed') {
      item.status = 'error'
      item.error = data?.upload?.error || 'extraction failed'
    }
  } catch (e) {
    if (disposed || !items.value.includes(item)) return
    item.status = 'error'
    item.error = e instanceof Error ? e.message : 'failed to read upload status'
  }
}

function refreshPendingUploads(): Promise<void> {
  if (disposed) return Promise.resolve()
  statusRefreshQueued = true
  if (statusRead) return statusRead
  // Events arriving during a pass request one more pass, not another read for
  // every file already being checked. New uploads join through this same queue.
  statusRead = Promise.resolve().then(async () => {
    try {
      while (statusRefreshQueued && !disposed) {
        statusRefreshQueued = false
        const pending = items.value.filter(item => item.status === 'processing')
        let next = 0
        const readNext = async () => {
          while (!disposed && next < pending.length) await refreshUpload(pending[next++])
        }
        await Promise.all(Array.from({ length: Math.min(STATUS_READ_CONCURRENCY, pending.length) }, readNext))
      }
    } finally {
      statusRead = null
    }
  })
  return statusRead
}

function ensureUploadsRealtime(componentId?: string) {
  if (!componentId || uploadsComponentId === componentId) return
  if (uploadsUnsub) uploadsUnsub()
  uploadsUnsub = null
  uploadsComponentId = ''
  uploadsUnsub = subscribeComponentMeta(componentId, () => { void refreshPendingUploads() })
  if (uploadsUnsub) uploadsComponentId = componentId
}

async function uploadOne(file: File) {
  // reactive() so per-file status mutations (uploading→processing→ready) trigger
  // re-render; a plain pushed object would update data but not the view.
  const item = reactive<Item>({ name: file.name, size: file.size, status: 'uploading' })
  items.value.push(item)
  try {
    const fd = new FormData()
    fd.append('file', file)
    const { data } = await api.post('/api/v1/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    if (disposed || !items.value.includes(item)) return
    if (!data?.success || !data.uuid) { item.status = 'error'; item.error = data?.error || 'upload failed'; return }
    item.upload_id = data.uuid
    ensureUploadsRealtime(typeof data.component_id === 'string' ? data.component_id : undefined)
    item.status = 'processing'
    await refreshPendingUploads()
  } catch (e) {
    if (disposed || !items.value.includes(item)) return
    item.status = 'error'
    item.error = e instanceof Error ? e.message : 'upload failed'
  }
}

function addFiles(list: FileList | File[]) {
  error.value = ''
  result.value = null
  for (const f of Array.from(list)) void uploadOne(f)
}
function onDrop(e: DragEvent) {
  e.preventDefault(); dragOver.value = false
  if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files)
}
function pick() {
  const input = document.createElement('input')
  input.type = 'file'; input.multiple = true
  input.onchange = () => { if (input.files?.length) addFiles(input.files) }
  input.click()
}
function removeItem(i: Item) { items.value = items.value.filter(x => x !== i) }

async function build() {
  const ids = ready.value.map(i => i.upload_id!).filter(Boolean)
  if (!ids.length || building.value) return
  building.value = true
  error.value = ''
  try {
    const { data } = await api.post('/api/v1/knowledge/organize', { upload_ids: ids })
    if (!data?.success || !data.kb_id) { error.value = data?.error || 'could not build the knowledge base'; return }
    result.value = { kb_id: data.kb_id, kb_name: data.kb_name, queued: data.queued, total: data.total }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'could not build the knowledge base'
  } finally {
    building.value = false
  }
}

function fmtSize(n: number): string {
  if (n >= 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + ' MB'
  if (n >= 1024) return Math.round(n / 1024) + ' KB'
  return n + ' B'
}

onUnmounted(() => {
  disposed = true
  statusRefreshQueued = false
  if (uploadsUnsub) uploadsUnsub()
  uploadsUnsub = null
  uploadsComponentId = ''
})
</script>

<template>
  <div class="kn-ob">
    <div v-if="error" class="kn-ob-err"><Icon icon="tabler:alert-triangle" /><span>{{ error }}</span></div>

    <!-- Success summary -->
    <div v-if="result" class="kn-ob-done">
      <span class="kn-ob-done-ico"><Icon icon="tabler:circle-check" aria-hidden="true" /></span>
      <div class="kn-ob-done-text">
        <div class="kn-ob-done-title">“{{ result.kb_name }}” is building</div>
        <div class="kn-ob-done-sub">{{ result.queued }} of {{ result.total }} files queued — they’ll finish embedding in the background.</div>
      </div>
    </div>

    <template v-else>
      <!-- Dropzone -->
      <button
        type="button"
        class="kn-drop"
        :class="{ over: dragOver }"
        @click="pick"
        @dragover.prevent="dragOver = true"
        @dragleave.prevent="dragOver = false"
        @drop="onDrop"
      >
        <Icon icon="tabler:cloud-upload" class="kn-drop-ico" aria-hidden="true" />
        <span class="kn-drop-title">Drop files here, or click to choose</span>
        <span class="kn-drop-sub">PDFs, Word docs, spreadsheets, text. A fast model organizes them into a knowledge base.</span>
      </button>

      <!-- File list -->
      <div v-if="items.length" class="kn-files">
        <div v-for="(it, idx) in items" :key="idx" class="kn-file" :class="it.status">
          <span class="kn-file-ico">
            <Icon v-if="it.status === 'ready'" icon="tabler:circle-check" aria-hidden="true" />
            <Icon v-else-if="it.status === 'error'" icon="tabler:circle-x" aria-hidden="true" />
            <Icon v-else icon="tabler:loader-2" class="spin" aria-hidden="true" />
          </span>
          <span class="kn-file-name">{{ it.name }}</span>
          <span class="kn-file-meta">{{ it.status === 'error' ? (it.error || FILE_STATE_LABEL.error) : (it.status === 'ready' ? fmtSize(it.size) : FILE_STATE_LABEL[it.status]) }}</span>
          <button class="kn-file-x" aria-label="Remove" @click="removeItem(it)"><Icon icon="tabler:x" aria-hidden="true" /></button>
        </div>
      </div>
    </template>

    <div class="kn-ob-foot">
      <button type="button" class="kn-btn kn-ghost" @click="emit('back', undefined)">‹ Back</button>
      <span class="kn-foot-sp" />
      <button v-if="result" type="button" class="kn-btn kn-primary" @click="emit('done', undefined)">Continue ›</button>
      <template v-else>
        <button type="button" class="kn-btn kn-ghost" @click="emit('done', undefined)">Skip for now</button>
        <button class="kn-btn kn-primary" :disabled="!ready.length || busy || building" @click="build">
          {{ building ? 'Building…' : (busy ? 'Processing…' : `Build knowledge base${ready.length ? ' (' + ready.length + ')' : ''}`) }}
        </button>
      </template>
    </div>
  </div>
</template>

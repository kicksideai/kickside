<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { api } from '@wippy-fe/proxy'
import Dialog from 'primevue/dialog'
import { useComponentEvents } from '../constants.ts'

// Exportable-component picker, opened from the profile dropdown. Lists the
// actor's own components whose impl binding is exportable (declares
// portable_schema or implements kickside.contract:portable), lets the user
// search and multi-select across them, then exports the selection as a single
// archive. Owns its own modal chrome and emits `close` for the host to dismiss;
// talks to the kickside/transfer API through the host's authenticated client.

interface Exportable {
  component_id: string
  impl_id: string
  title: string
  class?: string
  icon?: string
  has_data?: boolean
}

const emit = useComponentEvents()

const items = ref<Exportable[]>([])
const loading = ref(true)
const error = ref('')
const query = ref('')
const selected = ref<Set<string>>(new Set())
const exporting = ref(false)
const importing = ref(false)
const notice = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

// The modal shell is PrimeVue's Dialog; `dialogOpen` drives its visibility, and any
// dismissal (mask click, header X, or the Escape handler below) flips it false →
// emitClose, preserving the `close` event contract the host relies on.
const dialogOpen = ref(true)
function emitClose() { emit('close', undefined) }
function onDialogVisible(v: boolean) { if (!v) emitClose() }
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') dialogOpen.value = false }

// Friendly label for the impl class, e.g. "knowledge_base" -> "Knowledge base".
function classLabel(c?: string): string {
  if (!c) return 'Component'
  const s = c.replace(/[._-]+/g, ' ').trim()
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const filtered = computed<Exportable[]>(() => {
  const q = query.value.trim().toLowerCase()
  const base = !q
    ? items.value
    : items.value.filter((c) =>
        c.title.toLowerCase().includes(q) || (c.class || '').toLowerCase().includes(q))
  // Group by class without breaking the flat row list: sort by class, then title.
  return [...base].sort((a, b) => {
    const ca = classLabel(a.class), cb = classLabel(b.class)
    return ca === cb ? a.title.localeCompare(b.title) : ca.localeCompare(cb)
  })
})

const selectedCount = computed(() => selected.value.size)
const allFilteredSelected = computed(() =>
  filtered.value.length > 0 && filtered.value.every((c) => selected.value.has(c.component_id)))

function toggle(id: string) {
  const next = new Set(selected.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selected.value = next
}

function toggleAllFiltered() {
  const next = new Set(selected.value)
  if (allFilteredSelected.value) {
    for (const c of filtered.value) next.delete(c.component_id)
  } else {
    for (const c of filtered.value) next.add(c.component_id)
  }
  selected.value = next
}

watch(selected, (s) => emit('selection-change', { component_ids: [...s] }))

async function load() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/api/v1/transfer/exportable')
    if (!data?.success) throw new Error(data?.error || 'failed to load exportable components')
    items.value = (data.components || []) as Exportable[]
    // Drop selections that no longer exist in the refreshed list.
    const live = new Set(items.value.map((c) => c.component_id))
    selected.value = new Set([...selected.value].filter((id) => live.has(id)))
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

async function exportSelected() {
  if (selectedCount.value === 0 || exporting.value) return
  exporting.value = true
  error.value = ''
  const ids = [...selected.value]
  try {
    const resp = await api.post(
      '/api/v1/transfer/export',
      { component_ids: ids },
      { responseType: 'blob' },
    )
    const blob: Blob = resp?.data
    // A JSON body (not a zip) means the server reported an error, not an archive.
    if (!blob || blob.type.includes('application/json')) {
      const text = blob ? await blob.text() : ''
      let msg = 'export failed'
      try { msg = JSON.parse(text)?.error || msg } catch { /* keep default */ }
      throw new Error(msg)
    }
    const filename = filenameFromResponse(resp) || 'components.zip'
    triggerDownload(blob, filename)
    emit('exported', { filename, count: ids.length })
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    exporting.value = false
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filenameFromResponse(resp: any): string {
  const cd = resp?.headers?.['content-disposition'] || resp?.headers?.get?.('content-disposition')
  if (typeof cd !== 'string') return ''
  const m = cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)
  return m ? decodeURIComponent(m[1]) : ''
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function pickImportFile() {
  notice.value = ''
  fileInput.value?.click()
}

async function onImportFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // allow re-selecting the same file later
  if (!file || importing.value) return
  importing.value = true
  error.value = ''
  notice.value = ''
  try {
    const fd = new FormData()
    fd.append('file', file)
    // The host axios instance defaults to application/json; FormData needs the
    // multipart content-type so axios computes the boundary.
    const { data } = await api.post('/api/v1/transfer/import', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    if (!data?.success) throw new Error(data?.error || 'import failed')
    notice.value = `Imported ${data.count} component${data.count === 1 ? '' : 's'}.`
    selected.value = new Set()
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    importing.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  load()
})
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Dialog
    v-model:visible="dialogOpen"
    modal
    :dismissable-mask="true"
    :close-on-escape="false"
    :style="{ width: '560px', maxWidth: 'calc(100vw - 48px)' }"
    aria-label="Export / Import components"
    class="ks-dialog"
    @update:visible="onDialogVisible"
  >
    <template #header>
      <span class="ks-title">Export / Import</span>
    </template>

    <div class="ks-panel">
      <div class="ks-tools">
        <input
          v-model="query"
          class="ks-search"
          type="search"
          placeholder="Search your components…"
          aria-label="Search components"
        />
        <button
          v-if="filtered.length > 0"
          class="ks-link"
          type="button"
          @click="toggleAllFiltered"
        >{{ allFilteredSelected ? 'Clear' : 'Select all' }}</button>
      </div>

      <div class="ks-body">
        <p v-if="loading" class="ks-empty">Loading…</p>
        <p v-else-if="items.length === 0" class="ks-empty">You have no exportable components yet.</p>
        <p v-else-if="filtered.length === 0" class="ks-empty">No components match “{{ query }}”.</p>

        <div v-else class="ks-list" role="list">
          <label
            v-for="c in filtered"
            :key="c.component_id"
            class="ks-row"
            :class="{ 'is-selected': selected.has(c.component_id) }"
            role="listitem"
          >
            <input
              type="checkbox"
              class="ks-check"
              :checked="selected.has(c.component_id)"
              @change="toggle(c.component_id)"
            />
            <span class="ks-row-name">{{ c.title }}</span>
            <span class="ks-row-meta">
              <span class="ks-tag">{{ classLabel(c.class) }}</span>
              <span v-if="c.has_data" class="ks-tag ks-tag--data">data</span>
            </span>
          </label>
        </div>

        <p v-if="error" class="ks-error">{{ error }}</p>
        <p v-else-if="notice" class="ks-notice">{{ notice }}</p>
      </div>

      <footer class="ks-foot">
        <input
          ref="fileInput"
          type="file"
          accept=".kxb"
          class="ks-file"
          @change="onImportFile"
        />
        <button
          class="ks-btn ks-btn--ghost"
          type="button"
          :disabled="importing"
          @click="pickImportFile"
        >{{ importing ? 'Importing…' : 'Import…' }}</button>
        <span class="ks-count">{{ selectedCount }} selected</span>
        <div class="ks-spacer"></div>
        <button class="ks-btn ks-btn--ghost" type="button" @click="dialogOpen = false">Cancel</button>
        <button
          class="ks-btn"
          type="button"
          :disabled="selectedCount === 0 || exporting"
          @click="exportSelected"
        >{{ exporting ? 'Exporting…' : 'Export selected' }}</button>
      </footer>
    </div>
  </Dialog>
</template>

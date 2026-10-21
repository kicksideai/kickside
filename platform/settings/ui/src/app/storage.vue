<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import InputText from 'primevue/inputtext'
import { api } from '@wippy-fe/proxy'

// Files & Uploads — a small, purpose-built settings panel (a miniature of the
// Appearance editor) that consolidates the upload, document-conversion, and
// page-rasterization settings into one card surface. It presents each setting
// with a control fit to its meaning (MB for byte limits, seconds for the run
// budget, DPI, a real toggle, a format select) instead of a generic list, and
// writes every dirty field through the settings API on one Save.

// One editable field, bound to a settings (namespace,key). The raw stored value
// is always the setting's declared type; the control may present it in a friendly
// unit (bytes shown as MB) and convert back on save.
interface Row {
  ns: string
  key: string
  value: unknown       // stored value
  is_default: boolean
}

const NS_STORAGE = 'kickside.uploads.storage'
const NAMESPACES = [NS_STORAGE, 'kickside.uploads', 'kickside.uploads.documents', 'kickside.uploads.rasterize'] as const
const NS_UPLOADS = 'kickside.uploads'
const NS_DOCS = 'kickside.uploads.documents'
const NS_RAST = 'kickside.uploads.rasterize'

interface StoragePolicy {
  mode: 'local' | 's3'
  resource_id: string
  prefix: string
}
interface StorageResource { id: string; title: string }
interface SettingsRow { namespace: string; key: string; value: unknown; is_default: boolean }
interface SettingsResponse { success: boolean; settings?: SettingsRow[]; error?: string }
interface StorageResponse { success: boolean; resources?: StorageResource[]; error?: string }
const storagePolicy = ref<StoragePolicy>({ mode: 'local', resource_id: '', prefix: 'uploads' })
const storageResources = ref<StorageResource[]>([])
const testingStorage = ref(false)
const storageTest = ref('')
const storageTestError = ref(false)
const STORAGE_MODES = [{ label: 'Keep locally', value: 'local' }, { label: 'Move to S3 after processing', value: 's3' }]
let storageBaseline = ''
watch(storagePolicy, () => { storageTest.value = '' }, { deep: true })
const storageValid = computed(() => storagePolicy.value.mode === 'local' ||
  (!!storagePolicy.value.resource_id && !!storagePolicy.value.prefix &&
   storageResources.value.some(resource => resource.id === storagePolicy.value.resource_id)))

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const rows = ref<Record<string, Row>>({})
// The live edit buffer, keyed "ns|key". Byte/ms fields hold their friendly unit.
const draft = ref<Record<string, string | number | boolean>>({})
let baseline = ''

const id = (ns: string, key: string) => `${ns}|${key}`
const has = (ns: string, key: string) => !!rows.value[id(ns, key)]
const isDefault = (ns: string, key: string) => rows.value[id(ns, key)]?.is_default !== false

// ── unit helpers ────────────────────────────────────────────────────────────
const bytesToMb = (b: unknown) => Math.round((Number(b) / (1024 * 1024)) * 100) / 100
const mbToBytes = (mb: unknown) => Math.round(Number(mb) * 1024 * 1024)
const msToSec = (ms: unknown) => Math.round((Number(ms) / 1000) * 10) / 10
const secToMs = (s: unknown) => Math.round(Number(s) * 1000)

function seedAll() {
  const d: Record<string, string | number | boolean> = {}
  for (const r of Object.values(rows.value)) {
    const k = id(r.ns, r.key)
    if (k === id(NS_STORAGE, 'policy')) continue
    if (k === id(NS_DOCS, 'max_upload_bytes')) d[k] = bytesToMb(r.value)
    else if (k === id(NS_UPLOADS, 'process_max_execution_ms')) d[k] = msToSec(r.value)
    else if (typeof r.value === 'boolean') d[k] = r.value
    else d[k] = r.value as never
  }
  const value = rows.value[id(NS_STORAGE, 'policy')]?.value as StoragePolicy | undefined
  storagePolicy.value = value ? { ...value } : { mode: 'local', resource_id: '', prefix: 'uploads' }
  storageBaseline = JSON.stringify(storagePolicy.value)
  draft.value = d
  baseline = JSON.stringify(d)
}

const dirty = computed(() => JSON.stringify(draft.value) !== baseline || JSON.stringify(storagePolicy.value) !== storageBaseline)

// The stored value a draft maps back to, applying the inverse unit conversion.
function storedFor(k: string): unknown {
  if (k === id(NS_STORAGE, 'policy')) return { ...storagePolicy.value }
  const v = draft.value[k]
  if (k === id(NS_DOCS, 'max_upload_bytes')) return mbToBytes(v)
  if (k === id(NS_UPLOADS, 'process_max_execution_ms')) return secToMs(v)
  const r = rows.value[k]
  if (r && typeof r.value === 'number') return Math.trunc(Number(v))
  if (r && typeof r.value === 'boolean') return Boolean(v)
  return v
}
function fieldDirty(k: string): boolean {
  const r = rows.value[k]
  if (!r) return false
  return JSON.stringify(storedFor(k)) !== JSON.stringify(r.value)
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const results = await Promise.all(NAMESPACES.map(async ns => {
      const { data } = await api.get<SettingsResponse>(`/api/v1/settings?namespace=${encodeURIComponent(ns)}`)
      if (!data?.success) throw new Error(data?.error || 'Could not load file settings')
      return data.settings || []
    }))
    const { data: discovered } = await api.get<StorageResponse>('/api/v1/uploads/storage')
    if (!discovered?.success) throw new Error(discovered?.error || 'Could not load storage destinations')
    storageResources.value = discovered.resources || []
    const map: Record<string, Row> = {}
    for (const s of results.flat()) {
      map[id(s.namespace, s.key)] = { ns: s.namespace, key: s.key, value: s.value, is_default: s.is_default !== false }
    }
    rows.value = map
    seedAll()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  error.value = ''
  try {
    for (const k of Object.keys(rows.value)) {
      if (!fieldDirty(k)) continue
      const r = rows.value[k]
      const { data } = k === id(NS_STORAGE, 'policy')
        ? await api.post('/api/v1/uploads/storage', storedFor(k))
        : await api.put('/api/v1/settings', { namespace: r.ns, key: r.key, value: storedFor(k) })
      if (!data?.success) throw new Error(data?.error || `could not save ${r.key}`)
    }
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    saving.value = false
  }
}

// Reset a single field to its declared default (null override), then reload.
async function resetField(ns: string, key: string) {
  saving.value = true
  try {
    const { data } = ns === NS_STORAGE && key === 'policy'
      ? await api.delete('/api/v1/uploads/storage')
      : await api.put('/api/v1/settings', { namespace: ns, key, value: null })
    if (!data?.success) throw new Error(data?.error || 'Could not reset setting')
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    saving.value = false
  }
}

async function testStorage() {
  testingStorage.value = true
  storageTest.value = ''
  const tested = JSON.stringify(storagePolicy.value)
  try {
    const { data } = await api.post<StorageResponse>('/api/v1/uploads/storage/test', { ...storagePolicy.value })
    if (!data?.success) throw new Error(data?.error || 'Storage check failed')
    if (JSON.stringify(storagePolicy.value) === tested) {
      storageTestError.value = false
      storageTest.value = 'Upload, read, and cleanup succeeded.'
    }
  } catch (e) {
    if (JSON.stringify(storagePolicy.value) === tested) {
      storageTestError.value = true
      storageTest.value = e instanceof Error ? e.message : String(e)
    }
  } finally {
    testingStorage.value = false
  }
}

// The rasterize format select options.
const FORMATS = ['jpeg', 'png', 'webp']

onMounted(load)
</script>

<template>
  <div class="ap">
    <div class="ap-body">
      <header class="ap-bar">
        <span v-if="dirty" class="ap-dirty">Unsaved changes</span>
        <Button
          type="button"
          label="Discard"
          severity="secondary"
          outlined
          :disabled="!dirty || saving"
          @click="load" />
        <Button
          type="button"
          :label="saving ? 'Saving…' : 'Save'"
          :loading="saving"
          :disabled="!dirty || saving || loading || testingStorage || !storageValid"
          @click="save">
          <template #icon>
            <Icon v-if="!saving" icon="tabler:device-floppy" aria-hidden="true" />
          </template>
        </Button>
      </header>

      <div v-if="error" class="ap-msg ap-err" role="alert">{{ error }}</div>
      <div v-if="loading" class="ap-loading"><Icon icon="tabler:loader-2" class="spin" /> Loading…</div>

      <div v-else class="ap-cards">
        <section v-if="has(NS_STORAGE, 'policy')" class="ap-card" aria-labelledby="file-storage-heading">
          <header id="file-storage-heading" class="ap-h"><Icon icon="tabler:cloud-upload" aria-hidden="true" /> Processed file storage</header>
          <p class="ap-sub">Choose where newly processed files are kept. Originals, extracted text, images, and previews remain available to sessions and knowledge bases.</p>
          <div class="ap-fg">
            <label id="file-storage-mode-label" for="file-storage-mode" class="ap-blabel">After processing</label>
            <Select input-id="file-storage-mode" v-model="storagePolicy.mode" :options="STORAGE_MODES"
              option-label="label" option-value="value" :disabled="saving || testingStorage"
              aria-labelledby="file-storage-mode-label" />
          </div>
          <template v-if="storagePolicy.mode === 's3'">
            <div class="ap-fg">
              <label id="file-storage-resource-label" for="file-storage-resource" class="ap-blabel">Private S3 destination</label>
              <Select input-id="file-storage-resource" v-model="storagePolicy.resource_id" :options="storageResources"
                option-label="title" option-value="id" placeholder="Select storage" :disabled="saving || testingStorage"
                aria-labelledby="file-storage-resource-label" aria-describedby="file-storage-resource-help" />
              <p id="file-storage-resource-help" class="ap-hint">{{ storageResources.length ? 'Uses the S3 storage configured for this application.' : 'An administrator must configure native S3 upload storage before enabling this option.' }}</p>
            </div>
            <div class="ap-fg">
              <label for="file-storage-prefix" class="ap-blabel">Folder prefix</label>
              <InputText id="file-storage-prefix" v-model="storagePolicy.prefix" :maxlength="256"
                :disabled="saving || testingStorage" aria-describedby="file-storage-prefix-help" />
              <p id="file-storage-prefix-help" class="ap-hint">For example, uploads or workspace/files. Content stays private; this does not publish files to a CDN.</p>
            </div>
            <Button type="button" label="Test storage" severity="secondary" outlined :loading="testingStorage"
              :disabled="!storageValid || saving || testingStorage" @click="testStorage" />
            <p v-if="storageTest" :class="['ap-hint', { 'ap-err': storageTestError }]" role="status">{{ storageTest }}</p>
            <p class="ap-hint">Local bytes are reclaimed only after the S3 copy has been verified. Failed transfers retry in the background.</p>
          </template>
          <p class="ap-hint">Changes apply to future uploads. Files already in S3 continue to use that storage when this option is turned off.</p>
          <Button v-if="!isDefault(NS_STORAGE, 'policy')" type="button" label="Reset storage policy"
            severity="secondary" text :disabled="saving || testingStorage" @click="resetField(NS_STORAGE, 'policy')" />
        </section>

        <!-- Limits -->
        <section class="ap-card">
          <header class="ap-h"><Icon icon="tabler:ruler-2" aria-hidden="true" /> Limits</header>
          <p class="ap-sub">Ceilings on what a single upload may cost.</p>

          <template v-if="has(NS_DOCS, 'max_upload_bytes')">
            <label class="ap-blabel">Maximum document size</label>
            <div class="ap-unit">
              <input class="ap-binput" type="number" min="1" step="1"
                :value="draft[id(NS_DOCS, 'max_upload_bytes')]"
                @input="draft[id(NS_DOCS, 'max_upload_bytes')] = Number(($event.target as HTMLInputElement).value)" />
              <span class="ap-unit-suffix">MB</span>
              <Button
                v-if="!isDefault(NS_DOCS, 'max_upload_bytes')"
                type="button"
                severity="secondary"
                text
                rounded
                title="Reset to default"
                aria-label="Reset to default"
                @click="resetField(NS_DOCS, 'max_upload_bytes')">
                <template #icon>
                  <Icon icon="tabler:rotate" aria-hidden="true" />
                </template>
              </Button>
            </div>
            <p class="ap-hint">Larger documents are rejected at upload; clamped to the converter's hard ceiling.</p>
          </template>

          <template v-if="has(NS_UPLOADS, 'process_max_execution_ms')">
            <label class="ap-blabel">Processing time limit</label>
            <div class="ap-unit">
              <input class="ap-binput" type="number" min="1" step="1"
                :value="draft[id(NS_UPLOADS, 'process_max_execution_ms')]"
                @input="draft[id(NS_UPLOADS, 'process_max_execution_ms')] = Number(($event.target as HTMLInputElement).value)" />
              <span class="ap-unit-suffix">sec</span>
              <Button
                v-if="!isDefault(NS_UPLOADS, 'process_max_execution_ms')"
                type="button"
                severity="secondary"
                text
                rounded
                title="Reset to default"
                aria-label="Reset to default"
                @click="resetField(NS_UPLOADS, 'process_max_execution_ms')">
                <template #icon>
                  <Icon icon="tabler:rotate" aria-hidden="true" />
                </template>
              </Button>
            </div>
            <p class="ap-hint">A conversion/OCR run exceeding this is terminated by the job worker and retried.</p>
          </template>
        </section>

        <!-- Page rasterization -->
        <section v-if="has(NS_RAST, 'rasterize_empty_enabled')" class="ap-card">
          <header class="ap-h"><Icon icon="tabler:photo" aria-hidden="true" /> Page rasterization</header>
          <p class="ap-sub">Render empty or low-text documents to page images so vision captioning can embed them.</p>

          <div class="ap-toggle-row">
            <div class="ap-toggle-text">
              <span class="ap-toggle-name">Rasterize empty documents</span>
              <span class="ap-toggle-desc">Render pages when little or no text can be extracted.</span>
            </div>
            <ToggleSwitch
              :model-value="!!draft[id(NS_RAST, 'rasterize_empty_enabled')]"
              aria-label="Rasterize empty documents"
              @update:model-value="draft[id(NS_RAST, 'rasterize_empty_enabled')] = $event" />
          </div>

          <div class="ap-field-grid">
            <div v-if="has(NS_RAST, 'rasterize_format')" class="ap-fg">
              <label class="ap-blabel">Image format</label>
              <Select class="ap-select"
                :model-value="draft[id(NS_RAST, 'rasterize_format')]"
                :options="FORMATS"
                @update:model-value="draft[id(NS_RAST, 'rasterize_format')] = $event" />
            </div>
            <div v-if="has(NS_RAST, 'rasterize_dpi')" class="ap-fg">
              <label class="ap-blabel">Resolution</label>
              <div class="ap-unit">
                <input class="ap-binput" type="number" min="36" max="600" step="1"
                  :value="draft[id(NS_RAST, 'rasterize_dpi')]"
                  @input="draft[id(NS_RAST, 'rasterize_dpi')] = Number(($event.target as HTMLInputElement).value)" />
                <span class="ap-unit-suffix">DPI</span>
              </div>
            </div>
            <div v-if="has(NS_RAST, 'rasterize_quality')" class="ap-fg">
              <label class="ap-blabel">JPEG/WEBP quality</label>
              <div class="ap-unit">
                <input class="ap-binput" type="number" min="1" max="100" step="1"
                  :value="draft[id(NS_RAST, 'rasterize_quality')]"
                  @input="draft[id(NS_RAST, 'rasterize_quality')] = Number(($event.target as HTMLInputElement).value)" />
                <span class="ap-unit-suffix">%</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Thresholds -->
        <section v-if="has(NS_RAST, 'rasterize_max_text_bytes')" class="ap-card">
          <header class="ap-h"><Icon icon="tabler:adjustments-alt" aria-hidden="true" /> Rasterization thresholds</header>
          <p class="ap-sub">When a document is treated as sparse and how rendering is bounded.</p>

          <div class="ap-field-grid">
            <div v-if="has(NS_RAST, 'rasterize_max_text_bytes')" class="ap-fg">
              <label class="ap-blabel">Sparse-text threshold</label>
              <div class="ap-unit">
                <input class="ap-binput" type="number" min="0" step="1"
                  :value="draft[id(NS_RAST, 'rasterize_max_text_bytes')]"
                  @input="draft[id(NS_RAST, 'rasterize_max_text_bytes')] = Number(($event.target as HTMLInputElement).value)" />
                <span class="ap-unit-suffix">B/page</span>
              </div>
            </div>
            <div v-if="has(NS_RAST, 'rasterize_min_source_bytes')" class="ap-fg">
              <label class="ap-blabel">Minimum source size</label>
              <div class="ap-unit">
                <input class="ap-binput" type="number" min="0" step="1"
                  :value="draft[id(NS_RAST, 'rasterize_min_source_bytes')]"
                  @input="draft[id(NS_RAST, 'rasterize_min_source_bytes')] = Number(($event.target as HTMLInputElement).value)" />
                <span class="ap-unit-suffix">bytes</span>
              </div>
            </div>
            <div v-if="has(NS_RAST, 'rasterize_min_page_bytes')" class="ap-fg">
              <label class="ap-blabel">Full-page image threshold</label>
              <div class="ap-unit">
                <input class="ap-binput" type="number" min="0" step="1"
                  :value="draft[id(NS_RAST, 'rasterize_min_page_bytes')]"
                  @input="draft[id(NS_RAST, 'rasterize_min_page_bytes')] = Number(($event.target as HTMLInputElement).value)" />
                <span class="ap-unit-suffix">bytes</span>
              </div>
            </div>
            <div v-if="has(NS_RAST, 'rasterize_batch_pages')" class="ap-fg">
              <label class="ap-blabel">Pages per render batch</label>
              <div class="ap-unit">
                <input class="ap-binput" type="number" min="1" max="256" step="1"
                  :value="draft[id(NS_RAST, 'rasterize_batch_pages')]"
                  @input="draft[id(NS_RAST, 'rasterize_batch_pages')] = Number(($event.target as HTMLInputElement).value)" />
                <span class="ap-unit-suffix">pages</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

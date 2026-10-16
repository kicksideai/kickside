<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
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

const NAMESPACES = ['kickside.uploads', 'kickside.uploads.documents', 'kickside.uploads.rasterize'] as const
const NS_UPLOADS = 'kickside.uploads'
const NS_DOCS = 'kickside.uploads.documents'
const NS_RAST = 'kickside.uploads.rasterize'

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
    if (k === id(NS_DOCS, 'max_upload_bytes')) d[k] = bytesToMb(r.value)
    else if (k === id(NS_UPLOADS, 'process_max_execution_ms')) d[k] = msToSec(r.value)
    else if (typeof r.value === 'boolean') d[k] = r.value
    else d[k] = r.value as never
  }
  draft.value = d
  baseline = JSON.stringify(d)
}

const dirty = computed(() => JSON.stringify(draft.value) !== baseline)

// The stored value a draft maps back to, applying the inverse unit conversion.
function storedFor(k: string): unknown {
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
    const results = await Promise.all(
      NAMESPACES.map(ns => api.get(`/api/v1/settings?namespace=${encodeURIComponent(ns)}`)
        .then((r: any) => (r.data?.success ? (r.data.settings as any[]) : []))
        .catch(() => [] as any[])))
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
    for (const k of Object.keys(draft.value)) {
      if (!fieldDirty(k)) continue
      const r = rows.value[k]
      const { data } = await api.put('/api/v1/settings', { namespace: r.ns, key: r.key, value: storedFor(k) })
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
    await api.put('/api/v1/settings', { namespace: ns, key, value: null })
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    saving.value = false
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
          :disabled="!dirty || saving"
          @click="save">
          <template #icon>
            <Icon v-if="!saving" icon="tabler:device-floppy" aria-hidden="true" />
          </template>
        </Button>
      </header>

      <div v-if="error" class="ap-msg ap-err">{{ error }}</div>
      <div v-if="loading" class="ap-loading"><Icon icon="tabler:loader-2" class="spin" /> Loading…</div>

      <div v-else class="ap-cards">
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

<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import { api as proxyApi, loadByTagName } from '@wippy-fe/proxy'
import IconField from '@widgets/app/IconField.vue'
import { errMsg } from '@widgets/app/errMsg'
import type { ConfigValue, ConfigOption, EngineConfigField, EngineConfigSchema, Engine, EmbeddingModel } from './kbDialogTypes'

const dialogPt = {
  header: { class: 'kx-modal-head' },
  content: { class: 'kx-dialog-content' },
  footer: { class: 'kx-modal-foot' },
}

// Two-pane create/edit dialog for a knowledge base.
//   Left pane  — identity: the engine catalog (searchable), name, description,
//                icon. On edit the type is fixed.
//   Right pane — configuration: the selected engine's create_ui_id web component
//                (which owns the embedding model and all type-specific config),
//                or a minimal generic fallback (config_schema form + a basic
//                model select) when the engine ships no create UI.
// The shell holds no per-type knowledge — engines are registry-discovered and
// the type's own element supplies its config.

// The KB being edited (null on create). icon/config seed the form on open.
interface EditTarget {
  id: string
  name?: string
  description?: string
  icon?: string
  kb_type?: string
  embedding_model?: string
  config?: Record<string, unknown>
}

const props = defineProps<{
  open: boolean
  api: typeof proxyApi
  engines: Engine[]
  models: EmbeddingModel[]
  target: EditTarget | null
  // Workspace folder to place a newly created KB under; empty/absent = root.
  // Only used on create (the knowledge page leaves it empty, so KBs land at root).
  parentId?: string
  // Set by the caller when the engine/model catalog fetch failed. Distinguishes an
  // outage (directed error + retry) from an installed-but-empty catalog.
  loadError?: string
}>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void; (e: 'retry'): void }>()

const ENGINE_NOTICE = 'No knowledge engine installed. Install a KB engine to create and browse knowledge bases.'

const saving = ref(false)
const formError = ref('')
const search = ref('')
const form = ref({ name: '', description: '', icon: '', kb_type: '' })

// Config payload captured from the engine's create UI (or built by the generic
// fallback): the full { embedding_model, config } the create endpoint needs.
const payload = ref<{ embedding_model: string; config: Record<string, unknown> }>({ embedding_model: '', config: {} })

const isEdit = computed(() => !!props.target)

function engineFor(kbType: string): Engine | undefined {
  return props.engines.find(e => e.kb_type === kbType)
}
const selectedEngine = computed(() => engineFor(form.value.kb_type))
const hasCustomUi = computed(() => !!selectedEngine.value?.create_ui_id)

const filteredEngines = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.engines
  return props.engines.filter(e =>
    (e.label || '').toLowerCase().includes(q)
    || (e.description || '').toLowerCase().includes(q)
    || (e.kb_type || '').toLowerCase().includes(q))
})
const showSearch = computed(() => !isEdit.value && props.engines.length > 6)

// ── generic fallback config form (engines with no create_ui_id) ──
const genericConfig = ref<Record<string, unknown>>({})
const genericModel = ref('')

const engineConfigFields = computed(() => {
  const p = selectedEngine.value?.config_schema?.properties || {}
  return Object.entries(p)
    .map(([key, field]) => ({ key, ...field }))
    .sort((a, b) => (a.order ?? 100) - (b.order ?? 100) || a.key.localeCompare(b.key))
})

function engineDefaults(eng?: Engine): Record<string, unknown> {
  const config: Record<string, unknown> = { ...(eng?.default_config || {}) }
  const p = eng?.config_schema?.properties || {}
  for (const [key, field] of Object.entries(p)) {
    if (config[key] === undefined && field.default !== undefined) config[key] = field.default
  }
  return config
}

function titleize(key: string): string {
  return key.replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
function eventValue(e: Event): string { return (e.target as HTMLInputElement | HTMLSelectElement | null)?.value ?? '' }
function eventChecked(e: Event): boolean { return (e.target as HTMLInputElement | null)?.checked === true }
function configValue(key: string): string {
  const v = genericConfig.value[key]
  return v === undefined || v === null ? '' : String(v)
}
function configBool(key: string): boolean { return genericConfig.value[key] === true }
function setConfigValue(field: EngineConfigField & { key: string }, raw: string | boolean) {
  if (field.type === 'boolean') { genericConfig.value[field.key] = raw === true }
  else if (field.type === 'integer') { const n = Number.parseInt(String(raw), 10); genericConfig.value[field.key] = Number.isNaN(n) ? undefined : n }
  else if (field.type === 'number') { const n = Number.parseFloat(String(raw)); genericConfig.value[field.key] = Number.isNaN(n) ? undefined : n }
  else { genericConfig.value[field.key] = String(raw) }
  syncGenericPayload()
}
function configOptions(field: EngineConfigField): Array<{ label: string; value: string }> {
  const raw = field.options || field.enum || []
  return raw.map((item) => {
    if (item && typeof item === 'object') { const value = String(item.value); return { label: item.label || value, value } }
    return { label: String(item), value: String(item) }
  })
}
function syncGenericPayload() {
  payload.value = { embedding_model: genericModel.value, config: { ...genericConfig.value } }
}
function onGenericModel(e: Event) {
  genericModel.value = (e as CustomEvent).detail || ''
  syncGenericPayload()
}

// ── engine custom config UI (web component) ──
const customHost = ref<HTMLElement | null>(null)
let customEl: HTMLElement | null = null
// Guards against the two mount triggers (open seed + kb_type watch) racing through
// the async loadByTagName and both appending — which would orphan an element.
let mountGen = 0

function onCustomConfigChanged(ev: Event) {
  const d = (ev as CustomEvent).detail
  if (d && typeof d === 'object') {
    payload.value = {
      embedding_model: typeof d.embedding_model === 'string' ? d.embedding_model : payload.value.embedding_model,
      config: (d.config && typeof d.config === 'object') ? { ...d.config } : payload.value.config,
    }
  }
}
function unmountCustomUi() {
  if (customEl) {
    customEl.removeEventListener('config-changed', onCustomConfigChanged)
    customEl.remove()
    customEl = null
  }
}
async function mountCustomUi() {
  const gen = ++mountGen
  unmountCustomUi()
  const eng = selectedEngine.value
  const tag = eng?.create_ui_id
  const host = customHost.value
  if (!tag || !host) return
  try { await loadByTagName(tag, { timeoutMs: 8000 }) } catch { /* inert if undefined */ }
  // A newer mount started during the await — let it win, don't append a stale one.
  if (gen !== mountGen) return
  // Clear any stray child a prior race may have left before appending the single host element.
  host.replaceChildren()
  const el = document.createElement(tag)
  // The create context the type's element needs: its kb_type, any seed embedding
  // model + config (pre-fills on edit), the engine's config_schema (so the
  // element can render its own fields), and the edit flag.
  const ctxConfig: Record<string, unknown> = { ...(isEdit.value ? (props.target?.config || {}) : engineDefaults(eng)) }
  if (eng?.config_schema) ctxConfig.config_schema = eng.config_schema
  try {
    el.setAttribute('config', JSON.stringify({
      id: isEdit.value ? props.target?.id : undefined,
      kb_type: form.value.kb_type,
      embedding_model: isEdit.value ? (props.target?.embedding_model || '') : '',
      config: ctxConfig,
      edit: isEdit.value,
    }))
  } catch { /* non-serializable */ }
  el.addEventListener('config-changed', onCustomConfigChanged)
  host.appendChild(el)
  customEl = el
}

// Reseed config + (re)mount the custom UI whenever the selected engine changes.
async function onEngineChanged() {
  if (hasCustomUi.value) {
    await nextTick()
    mountCustomUi()
  } else {
    unmountCustomUi()
    genericConfig.value = isEdit.value && props.target?.config ? { ...props.target.config } : engineDefaults(selectedEngine.value)
    genericModel.value = isEdit.value ? '' : (props.models[0]?.name || '')
    syncGenericPayload()
  }
}
watch(() => form.value.kb_type, onEngineChanged)

function seed() {
  formError.value = ''
  search.value = ''
  if (props.target) {
    const t = props.target
    form.value = { name: t.name || '', description: t.description || '', icon: t.icon || '', kb_type: t.kb_type || '' }
  } else {
    const first = props.engines[0]?.kb_type || ''
    form.value = { name: '', description: '', icon: '', kb_type: first }
  }
  payload.value = { embedding_model: '', config: {} }
  nextTick(() => { onEngineChanged() })
}

watch(() => props.open, (open) => {
  if (open) seed()
  else unmountCustomUi()
})
onBeforeUnmount(unmountCustomUi)

onMounted(() => {
  loadByTagName('wc-model-picker', { timeoutMs: 8000 }).catch(() => {})
})

function close() {
  unmountCustomUi()
  emit('close')
}

// The PrimeVue Dialog surface is driven by the `open` prop; any dismissal
// (Escape, click-outside, the header X) flows through close() so the parent's
// open state and the custom-element teardown stay in sync.
const dialogVisible = computed({
  get: () => props.open,
  set: (v: boolean) => { if (!v) close() },
})

const canSave = computed(() => {
  if (!form.value.name.trim() || !form.value.kb_type) return false
  if (isEdit.value) return true
  return !!payload.value.embedding_model
})

async function save() {
  if (!form.value.name.trim()) { formError.value = 'Name is required.'; return }
  if (!isEdit.value && !payload.value.embedding_model) {
    formError.value = 'An embedding model is required. None are available — install a model provider first.'
    return
  }
  saving.value = true
  formError.value = ''
  try {
    if (isEdit.value && props.target) {
      const { data } = await props.api.put(`/api/v1/knowledge/${props.target.id}`, {
        name: form.value.name,
        description: form.value.description,
        icon: form.value.icon,
        config: payload.value.config,
      })
      if (!data?.success) { formError.value = data?.error || 'save failed'; return }
    } else {
      const { data } = await props.api.post('/api/v1/knowledge/create', {
        name: form.value.name,
        description: form.value.description,
        icon: form.value.icon,
        kb_type: form.value.kb_type,
        embedding_model: payload.value.embedding_model,
        config: payload.value.config,
        parent_id: props.parentId || '',
      })
      if (!data?.success) {
        const msg = data?.error || 'create failed'
        formError.value = isEngineMissing(msg) ? ENGINE_NOTICE : msg
        return
      }
    }
    unmountCustomUi()
    emit('saved')
  } catch (e) {
    const msg = errMsg(e, isEdit.value ? 'save failed' : 'create failed')
    formError.value = isEngineMissing(msg) ? ENGINE_NOTICE : msg
  } finally {
    saving.value = false
  }
}

function isEngineMissing(msg: string): boolean {
  const m = msg.toLowerCase()
  return m.includes('no implementation') || m.includes('no engine') || m.includes('contract unavailable')
    || (m.includes('not found') && m.includes('binding'))
}
</script>

<template>
  <!-- The outer surface is a PrimeVue Dialog (modal); the theme's PrimeVuePlugin
       keeps its overlay in this shadow root by default, and the two-pane wizard body
       below is the module's own custom chrome. -->
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :dismissable-mask="true"
    class="kx-dialog"
    :pt="dialogPt"
    :aria-label="isEdit ? 'Edit knowledge base' : 'New knowledge base'"
  >
      <template #header>
        <span class="kx-modal-head-icon"><Icon :icon="form.icon || selectedEngine?.icon || 'tabler:books'" aria-hidden="true" /></span>
        <span class="kx-modal-head-text">
          <span class="kx-modal-head-title">{{ isEdit ? 'Edit knowledge base' : 'New knowledge base' }}</span>
          <span class="kx-modal-head-sub">{{ form.description.trim() || 'A collection your agents search and reason over.' }}</span>
        </span>
      </template>

      <div class="kx-2p">
        <!-- Left: identity / catalog -->
        <div class="kx-2p-l">
          <div class="kx-form">
            <div class="kx-field">
              <span class="kx-field-lbl">Name</span>
              <div class="kx-name-row">
                <IconField class="kx-name-icon" v-model="form.icon" :fallback="selectedEngine?.icon || 'tabler:books'" />
                <input v-model="form.name" class="kx-input" type="text" placeholder="e.g. Product docs" />
              </div>
            </div>

            <label class="kx-field">
              <span class="kx-field-lbl">Description <span class="kx-field-hint-inline">— optional</span></span>
              <textarea v-model="form.description" class="kx-input kx-textarea" rows="3" placeholder="What this knowledge base holds." />
            </label>

            <!-- Type catalog on create; fixed on edit. -->
            <div v-if="isEdit && selectedEngine" class="kx-field">
              <span class="kx-field-lbl">Type</span>
              <div class="kx-type sel kx-type-fixed">
                <span class="kx-type-name"><Icon :icon="selectedEngine.icon || 'tabler:database'" aria-hidden="true" />{{ selectedEngine.label }}</span>
                <span class="kx-type-desc">{{ selectedEngine.description }}</span>
              </div>
            </div>

            <div v-else class="kx-field">
              <span class="kx-field-lbl">Type</span>
              <div v-if="showSearch" class="kx-cat-search">
                <Icon icon="tabler:search" aria-hidden="true" />
                <input v-model="search" type="text" placeholder="Search types…" aria-label="Search knowledge base types" />
              </div>
              <div class="kx-cat">
                <button
                  v-for="t in filteredEngines"
                  :key="t.kb_type"
                  type="button"
                  class="kx-cat-card"
                  :class="{ sel: form.kb_type === t.kb_type }"
                  @click="form.kb_type = t.kb_type"
                >
                  <span class="kx-cat-ico"><Icon :icon="t.icon || 'tabler:database'" aria-hidden="true" /></span>
                  <span class="kx-cat-text">
                    <span class="kx-cat-name">{{ t.label }}</span>
                    <span class="kx-cat-desc">{{ t.description }}</span>
                  </span>
                  <Icon icon="tabler:check" class="kx-cat-check" aria-hidden="true" />
                </button>
                <template v-if="loadError">
                  <div class="kx-notice kx-notice-error" style="margin: 0;">
                    <Icon icon="tabler:alert-triangle" aria-hidden="true" />
                    <span>Couldn't load knowledge engines. {{ loadError }}</span>
                  </div>
                  <Button type="button" size="small" severity="secondary" outlined class="kx-cat-retry" label="Try again" @click="emit('retry')">
                    <template #icon="{ class: iconClass }"><Icon icon="tabler:refresh" :class="iconClass" aria-hidden="true" /></template>
                  </Button>
                </template>
                <div v-else-if="!engines.length" class="kx-notice" style="margin: 0;">
                  <Icon icon="tabler:info-circle" aria-hidden="true" />
                  <span>No knowledge engine installed. Install a KB engine to create knowledge bases.</span>
                </div>
                <div v-else-if="!filteredEngines.length" class="kx-cat-empty">No types match “{{ search }}”.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: configuration -->
        <div class="kx-2p-r">
          <div class="kx-2p-r-head">Configuration</div>
          <div class="kx-2p-r-body">
            <!-- Engine-supplied config element -->
            <div v-show="hasCustomUi" ref="customHost" class="kx-engine-host"></div>

            <!-- Generic fallback: config_schema form + basic model select -->
            <div v-if="!hasCustomUi" class="kx-form">
              <div v-if="!isEdit" class="kx-field">
                <span class="kx-field-lbl">Embedding model</span>
                <wc-model-picker :value="genericModel" capability="embed" @select="onGenericModel"></wc-model-picker>
              </div>

              <div v-if="engineConfigFields.length" class="kx-field">
                <span class="kx-field-lbl">Options</span>
                <div class="kx-options">
                  <label v-for="f in engineConfigFields" :key="f.key" class="kx-option">
                    <span class="kx-field-lbl">
                      {{ f.label || titleize(f.key) }}
                      <span v-if="f.description" class="kx-field-hint-inline">— {{ f.description }}</span>
                    </span>
                    <Select
                      v-if="(f.enum && f.enum.length) || (f.options && f.options.length)"
                      class="kx-select"
                      :model-value="configValue(f.key)"
                      :options="configOptions(f)"
                      option-label="label"
                      option-value="value"
                      @update:model-value="setConfigValue(f, $event)"
                    />
                    <label v-else-if="f.type === 'boolean'" class="kx-check">
                      <input type="checkbox" :checked="configBool(f.key)" @change="setConfigValue(f, eventChecked($event))" />
                      <span>{{ configBool(f.key) ? 'Enabled' : 'Disabled' }}</span>
                    </label>
                    <input
                      v-else
                      class="kx-input"
                      :type="f.type === 'integer' || f.type === 'number' ? 'number' : 'text'"
                      :min="f.minimum"
                      :max="f.maximum"
                      :step="f.type === 'integer' ? 1 : undefined"
                      :value="configValue(f.key)"
                      @input="setConfigValue(f, eventValue($event))"
                    />
                  </label>
                </div>
              </div>

              <p v-if="isEdit && !engineConfigFields.length" class="kx-2p-r-note">This knowledge base type has no editable configuration.</p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div v-if="formError" class="kx-err inline kx-foot-err">{{ formError }}</div>
        <Button type="button" label="Cancel" severity="secondary" outlined :disabled="saving" @click="close" />
        <Button
          type="button"
          :label="saving ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save changes' : 'Create')"
          :loading="saving"
          :disabled="saving || !canSave"
          @click="save">
          <template #icon="{ class: iconClass }"><Icon :icon="isEdit ? 'tabler:device-floppy' : 'tabler:check'" :class="iconClass" aria-hidden="true" /></template>
        </Button>
      </template>
  </Dialog>
</template>

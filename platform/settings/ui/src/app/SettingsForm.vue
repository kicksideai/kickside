<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import { relativeTime } from '@widgets/app/datetime'
import WcMount from '@widgets/app/WcMount.vue'
import { api } from '@wippy-fe/proxy'

// Generic per-namespace settings form. Fetches the declared settings for one
// namespace and writes overrides back. Each setting renders a control chosen by
// its value_type and schema (toggle for bool, select for an enum, textarea for
// json, masked field for a secret), or a bespoke web component when the
// declaration carries a `ui` tag. Settings group under their declared `category`
// heading and order by (order, title). A per-setting JSON-schema drives inline
// validation before a save. This is the content of a namespace-kind block.

const props = withDefaults(defineProps<{
  namespace: string
  all?: boolean
  blocks?: { title: string; namespace?: string; namespaces?: string[] }[]
}>(), { all: false, blocks: () => [] })

// A minimal JSON-schema subset the field renderer + validator understand.
interface FieldSchema {
  type?: string
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  enum?: unknown[]
  format?: string
  title?: string
  description?: string
}

interface Setting {
  namespace: string
  key: string
  value: unknown
  value_type: 'string' | 'int' | 'bool' | 'duration' | 'json' | 'secret'
  default: unknown
  is_default: boolean
  is_secret?: boolean
  has_value?: boolean
  description?: string
  editable?: boolean
  schema?: FieldSchema | null
  updated_by?: string | null
  updated_at?: string | null
  // Presentation hints (all optional).
  title?: string | null
  category?: string | null
  order?: number | null
  owner?: string | null
  ui?: string | null
}

const settings = ref<Setting[]>([])
const loading = ref(true)
const error = ref('')
const savingKey = ref('')
const savedKey = ref('')
const drafts = ref<Record<string, string | number | boolean>>({})
// Per-field inline validation messages, keyed by idOf(setting).
const fieldErrors = ref<Record<string, string>>({})

const idOf = (s: Setting) => `${s.namespace} ${s.key}`

// A readable label for a setting: its declared title, else a humanized key
// (split on separators, capitalize the first word, lower-case acronyms kept).
function humanize(key: string): string {
  const words = key.split(/[._\-\s]+/).filter(Boolean)
  if (!words.length) return key
  return words
    .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ')
}
const titleOf = (s: Setting) => (s.title && s.title.length ? s.title : humanize(s.key))

const DEFAULT_CATEGORY = 'General'
const query = ref('')
const ownerOf = (setting: Setting): string => {
  if (setting.owner) return setting.owner
  const block = props.blocks.find(candidate => candidate.namespace === setting.namespace || candidate.namespaces?.includes(setting.namespace))
  return block?.title || setting.namespace
}

// Group by category, order groups by the smallest member order then name, and
// order settings within a group by (order, title). A declaration without a
// category falls under a single default group; a form with only the default
// group renders without a heading (the block title already names the section).
interface Group { name: string, items: Setting[] }
const groups = computed<Group[]>(() => {
  if (props.all) {
    const needle = query.value.trim().toLowerCase()
    const items = settings.value.filter(setting => !needle || [titleOf(setting), setting.key,
      setting.namespace, ownerOf(setting), setting.description || ''].some(value => value.toLowerCase().includes(needle)))
    items.sort((a, b) => ownerOf(a).localeCompare(ownerOf(b)) || (a.order ?? 100) - (b.order ?? 100) || titleOf(a).localeCompare(titleOf(b)))
    return [{ name: DEFAULT_CATEGORY, items }]
  }
  const buckets = new Map<string, Setting[]>()
  for (const s of settings.value) {
    const c = s.category && s.category.length ? s.category : DEFAULT_CATEGORY
    if (!buckets.has(c)) buckets.set(c, [])
    buckets.get(c)!.push(s)
  }
  const ord = (s: Setting) => (typeof s.order === 'number' ? s.order : 100)
  const out: Group[] = []
  for (const [name, items] of buckets) {
    items.sort((a, b) => ord(a) - ord(b) || titleOf(a).localeCompare(titleOf(b)))
    out.push({ name, items })
  }
  out.sort((a, b) => {
    const oa = Math.min(...a.items.map(ord))
    const ob = Math.min(...b.items.map(ord))
    return oa - ob || a.name.localeCompare(b.name)
  })
  return out
})
const singleDefaultGroup = computed(() =>
  groups.value.length === 1 && groups.value[0].name === DEFAULT_CATEGORY)

// Enum options come from a schema.enum, rendered as a PrimeVue Select.
const enumOptions = (s: Setting): unknown[] | null =>
  Array.isArray(s.schema?.enum) ? (s.schema!.enum as unknown[]) : null

// The config slice handed to a per-setting bespoke web component.
function uiConfig(s: Setting) {
  return {
    namespace: s.namespace, key: s.key, value: s.value, value_type: s.value_type,
    default: s.default, has_value: s.has_value, is_secret: s.is_secret,
    description: s.description, title: titleOf(s), schema: s.schema ?? null,
  }
}

// Validate a draft value against a declared JSON-schema (the subset the UI
// renders). Returns an error message, or '' when valid / no schema. This is the
// UI-level gate; the backend validate_func remains the authority on save.
function validateAgainstSchema(s: Setting, value: unknown): string {
  const sc = s.schema
  if (!sc) return ''
  if (sc.type === 'integer' || sc.type === 'number') {
    const n = Number(value)
    if (Number.isNaN(n)) return 'Must be a number'
    if (sc.type === 'integer' && !Number.isInteger(n)) return 'Must be a whole number'
    if (typeof sc.minimum === 'number' && n < sc.minimum) return `Must be ≥ ${sc.minimum}`
    if (typeof sc.maximum === 'number' && n > sc.maximum) return `Must be ≤ ${sc.maximum}`
  }
  if (sc.type === 'string') {
    const str = String(value)
    if (typeof sc.minLength === 'number' && str.length < sc.minLength) return `Must be at least ${sc.minLength} characters`
    if (typeof sc.maxLength === 'number' && str.length > sc.maxLength) return `Must be at most ${sc.maxLength} characters`
    if (sc.pattern && !new RegExp(sc.pattern).test(str)) return 'Does not match the required format'
  }
  if (Array.isArray(sc.enum) && !sc.enum.includes(value)) {
    return `Must be one of: ${sc.enum.join(', ')}`
  }
  return ''
}

// A short, human-readable hint describing the schema's constraints, shown under
// the field so the operator knows the accepted range before typing.
function schemaHint(s: Setting): string {
  const sc = s.schema
  if (!sc) return ''
  const parts: string[] = []
  if (typeof sc.minimum === 'number' || typeof sc.maximum === 'number') {
    const lo = typeof sc.minimum === 'number' ? sc.minimum : '−∞'
    const hi = typeof sc.maximum === 'number' ? sc.maximum : '∞'
    parts.push(`range ${lo}–${hi}`)
  }
  if (typeof sc.minLength === 'number' || typeof sc.maxLength === 'number') {
    parts.push(`length ${sc.minLength ?? 0}–${sc.maxLength ?? '∞'}`)
  }
  if (Array.isArray(sc.enum)) parts.push(`one of ${sc.enum.join(', ')}`)
  return parts.join(' · ')
}

// Re-run schema validation for a setting as its draft changes, updating the
// inline error map. Returns the live draft error (or '').
function revalidate(s: Setting): string {
  const id = idOf(s)
  // Secret fields validate the typed replacement; an empty draft means "keep".
  if (s.value_type === 'secret' && !String(drafts.value[id] ?? '').length) {
    delete fieldErrors.value[id]
    return ''
  }
  let value: unknown = drafts.value[id]
  if (s.value_type === 'int') value = Number(value)
  const msg = validateAgainstSchema(s, value)
  if (msg) fieldErrors.value[id] = msg
  else delete fieldErrors.value[id]
  return msg
}

function seedDraft(s: Setting) {
  if (s.value_type === 'secret') { drafts.value[idOf(s)] = ''; return }
  drafts.value[idOf(s)] = s.value_type === 'json' ? JSON.stringify(s.value, null, 2) : (s.value as never)
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const endpoint = props.all ? '/api/v1/settings' : `/api/v1/settings?namespace=${encodeURIComponent(props.namespace)}`
    const { data } = await api.get(endpoint)
    if (!data?.success) throw new Error(data?.error || 'failed to load settings')
    settings.value = Array.isArray(data.settings) ? (data.settings as Setting[]) : []
    for (const s of settings.value) seedDraft(s)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

function coerce(s: Setting, raw: string | number | boolean): unknown {
  switch (s.value_type) {
    case 'int': return Math.trunc(Number(raw))
    case 'bool': return Boolean(raw)
    case 'json': return JSON.parse(String(raw))
    default: return String(raw)
  }
}

const dirty = (s: Setting) => {
  const buf = drafts.value[idOf(s)]
  if (s.value_type === 'secret') return String(buf ?? '').length > 0
  if (s.value_type === 'json') return buf !== JSON.stringify(s.value, null, 2)
  return buf !== s.value
}

async function save(s: Setting) {
  const id = idOf(s)
  // UI-level schema gate: block the save and show the inline error.
  if (revalidate(s)) return
  savingKey.value = id
  error.value = ''
  try {
    const value = coerce(s, drafts.value[id])
    const { data } = await api.put('/api/v1/settings', { namespace: s.namespace, key: s.key, value })
    // The backend validate_func error (if any) surfaces inline on the field.
    if (!data?.success) { fieldErrors.value[id] = data?.error || 'save failed'; return }
    delete fieldErrors.value[id]
    savedKey.value = id
    setTimeout(() => { if (savedKey.value === id) savedKey.value = '' }, 2000)
    await load()
  } catch (e) {
    fieldErrors.value[id] = e instanceof Error ? e.message : String(e)
  } finally {
    savingKey.value = ''
  }
}

async function reset(s: Setting) {
  const id = idOf(s)
  savingKey.value = id
  error.value = ''
  try {
    const { data } = await api.put('/api/v1/settings', { namespace: s.namespace, key: s.key, value: null })
    if (!data?.success) throw new Error(data?.error || 'reset failed')
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    savingKey.value = ''
  }
}

// A bespoke per-setting editor saved itself; refresh the namespace so provenance
// and the default/override chips reflect the new stored state.
async function onUiChange() { await load() }

watch(() => [props.namespace, props.all], load)

onMounted(load)
</script>

<template>
  <div class="ks-form">
    <div v-if="error" class="ks-err">{{ error }}</div>
    <div v-if="loading" class="ks-loading">Loading…</div>
    <div v-else-if="!settings.length" class="ks-empty">No settings declared.</div>

    <template v-else>
      <input v-if="all" v-model="query" type="search" class="ks-input ks-all-search" aria-label="Search settings" placeholder="Search settings" />
      <section v-for="g in groups" :key="g.name" class="ks-group">
        <div v-if="!singleDefaultGroup" class="ks-group-head">
          <h2 class="ks-group-title">{{ g.name }}</h2>
          <span class="ks-group-count">{{ g.items.length }}</span>
        </div>

        <component :is="all ? 'table' : 'div'" class="ks-list" :class="{ 'ks-all-table': all }">
          <thead v-if="all"><tr><th scope="col">Owner</th><th scope="col">Setting</th><th scope="col">Value</th></tr></thead>
          <component :is="all ? 'tbody' : 'div'">
          <component :is="all ? 'tr' : 'div'" v-for="s in g.items" :key="idOf(s)" class="ks-row"
            :class="{ 'ks-row-invalid': fieldErrors[idOf(s)], 'ks-row-wc': s.ui }">
            <td v-if="all" class="ks-owner">{{ ownerOf(s) }}</td>
            <component :is="all ? 'td' : 'div'" class="ks-row-main">
              <div class="ks-row-head">
                <span class="ks-title">{{ titleOf(s) }}</span>
                <code class="ks-key">{{ s.key }}</code>
                <span v-if="s.is_secret && s.has_value" class="ks-tag kx-tag-caps ks-tag-on">set</span>
                <span v-else-if="!s.is_default && !s.is_secret" class="ks-tag kx-tag-caps ks-tag-on">overridden</span>
              </div>
              <p v-if="s.description" class="ks-desc">{{ s.description }}</p>
              <p v-if="schemaHint(s)" class="ks-hint">{{ schemaHint(s) }}</p>
              <p v-if="!s.is_default && s.updated_by" class="ks-prov">by {{ s.updated_by }}<span v-if="s.updated_at"> · {{ relativeTime(s.updated_at) }}</span></p>
            </component>

            <!-- Bespoke per-setting editor: it owns its own control + save. -->
            <component :is="all ? 'td' : 'div'" v-if="s.ui" class="ks-wc-slot">
              <WcMount :key="idOf(s)" :tag="s.ui" :config="uiConfig(s)" @change="onUiChange" />
            </component>

            <component :is="all ? 'td' : 'div'" v-else class="ks-control">
              <div class="ks-field">
                <span v-if="s.editable === false" class="ks-static">{{ s.value }}</span>
                <template v-else>
                  <ToggleSwitch v-if="s.value_type === 'bool'"
                    :model-value="!!drafts[idOf(s)]"
                    :aria-label="titleOf(s)"
                    @update:model-value="drafts[idOf(s)] = $event" />

                  <!-- enum: a select -->
                  <Select v-else-if="enumOptions(s)" class="ks-select"
                    :class="{ 'ks-select-invalid': fieldErrors[idOf(s)] }"
                    :model-value="drafts[idOf(s)]"
                    :options="enumOptions(s) as unknown[]"
                    @update:model-value="drafts[idOf(s)] = $event; revalidate(s)" />

                  <input v-else-if="s.value_type === 'int'" type="number" class="ks-input"
                    :class="{ 'ks-input-invalid': fieldErrors[idOf(s)] }"
                    :min="s.schema?.minimum" :max="s.schema?.maximum"
                    :value="drafts[idOf(s)]"
                    @input="drafts[idOf(s)] = Number(($event.target as HTMLInputElement).value); revalidate(s)" />
                  <textarea v-else-if="s.value_type === 'json'" rows="4" class="ks-input"
                    :class="{ 'ks-input-invalid': fieldErrors[idOf(s)] }"
                    :value="drafts[idOf(s)] as string"
                    @input="drafts[idOf(s)] = ($event.target as HTMLTextAreaElement).value; revalidate(s)"></textarea>
                  <input v-else-if="s.value_type === 'secret'" type="password" autocomplete="off" class="ks-input"
                    :class="{ 'ks-input-invalid': fieldErrors[idOf(s)] }"
                    :placeholder="s.has_value ? '•••••••• set — type to replace' : 'Not set'"
                    :value="drafts[idOf(s)]"
                    @input="drafts[idOf(s)] = ($event.target as HTMLInputElement).value; revalidate(s)" />
                  <input v-else type="text" class="ks-input"
                    :class="{ 'ks-input-invalid': fieldErrors[idOf(s)] }"
                    :minlength="s.schema?.minLength" :maxlength="s.schema?.maxLength"
                    :value="drafts[idOf(s)]"
                    @input="drafts[idOf(s)] = ($event.target as HTMLInputElement).value; revalidate(s)" />

                  <span v-if="savedKey === idOf(s)" class="ks-saved"><span class="ks-saved-tick">✓</span> Saved</span>
                  <Button
                    type="button"
                    :label="savingKey === idOf(s) ? 'Saving…' : 'Save'"
                    :loading="savingKey === idOf(s)"
                    :disabled="savingKey === idOf(s) || !!fieldErrors[idOf(s)] || (s.value_type !== 'bool' && !dirty(s))"
                    @click="save(s)" />
                  <Button
                    v-if="!s.is_default"
                    type="button"
                    severity="secondary"
                    text
                    rounded
                    :disabled="savingKey === idOf(s)"
                    title="Reset to default"
                    aria-label="Reset to default"
                    @click="reset(s)">
                    <template #icon>
                      <Icon icon="tabler:rotate" aria-hidden="true" />
                    </template>
                  </Button>
                </template>
              </div>
              <p v-if="fieldErrors[idOf(s)]" class="ks-field-err">{{ fieldErrors[idOf(s)] }}</p>
            </component>
          </component>
          </component>
        </component>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import { useProps } from '@wippy-fe/webcomponent-vue'
import { api } from '@wippy-fe/proxy'
import WcMount from '@widgets/app/WcMount.vue'
import SettingsToolbar from './SettingsToolbar.vue'

// A shared, config-driven provider settings card. One element, reused by every
// connection/tool provider block: it is handed a `config = { namespace, title?,
// icon?, help? }` and renders that namespace's declared settings as a tidy,
// purpose-built card — a header, settings grouped by their declared category,
// each with a control fit to its value_type, dirty tracking, a sticky Save /
// Discard toolbar, and per-field reset. It carries no provider-specific
// knowledge; the provider's identity lives in the block config, not here.

interface ProviderConfig {
  namespace: string
  title?: string
  icon?: string
  help?: string
}

interface FieldSchema {
  type?: string
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  enum?: unknown[]
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
  title?: string | null
  category?: string | null
  order?: number | null
  control?: { tag: string; props?: Record<string, unknown> } | null
}

const props = useProps<{ config?: ProviderConfig | null }>()
const cfg = computed<ProviderConfig | null>(() => props.value?.config || null)
const namespace = computed(() => cfg.value?.namespace || '')
const title = computed(() => cfg.value?.title || 'Provider')
const icon = computed(() => cfg.value?.icon || 'tabler:plug-connected')
const help = computed(() => cfg.value?.help || '')

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const settings = ref<Setting[]>([])
// Live edit buffer keyed by setting key. Secrets hold the typed replacement
// ('' = keep the stored value).
const draft = ref<Record<string, string | number | boolean>>({})

const DEFAULT_CATEGORY = 'General'

function humanize(key: string): string {
  const words = key.split(/[._\-\s]+/).filter(Boolean)
  if (!words.length) return key
  return words.map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join(' ')
}
const titleOf = (s: Setting) => (s.title && s.title.length ? s.title : humanize(s.key))
const enumOptions = (s: Setting): unknown[] | null =>
  Array.isArray(s.schema?.enum) ? (s.schema!.enum as unknown[]) : null

// Group settings by their declared category, ordered by the smallest member
// order then name; a single default group renders without a subheading.
interface Group { name: string, items: Setting[] }
const groups = computed<Group[]>(() => {
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

function seed(s: Setting, value: unknown) {
  draft.value[s.key] = s.value_type === 'json' ? JSON.stringify(value, null, 2) : (value as string | number | boolean)
}

// A field is dirty when its draft differs from the stored value. A secret is
// dirty only when a replacement has been typed (empty = keep).
function dirtyField(s: Setting): boolean {
  const buf = draft.value[s.key]
  if (s.value_type === 'secret') return String(buf ?? '').length > 0
  if (s.value_type === 'json') return buf !== JSON.stringify(s.value, null, 2)
  return buf !== s.value
}
const dirty = computed(() => settings.value.some(dirtyField))

function coerce(s: Setting, raw: string | number | boolean): unknown {
  switch (s.value_type) {
    case 'int': return Math.trunc(Number(raw))
    case 'bool': return Boolean(raw)
    case 'json': return JSON.parse(String(raw))
    default: return String(raw)
  }
}

async function load() {
  if (!namespace.value) { loading.value = false; return }
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get(`/api/v1/settings?namespace=${encodeURIComponent(namespace.value)}`)
    if (!data?.success) throw new Error(data?.error || 'failed to load settings')
    settings.value = Array.isArray(data.settings) ? (data.settings as Setting[]) : []
    draft.value = {}
    for (const s of settings.value) seed(s, s.value_type === 'secret' ? '' : s.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

// Save every dirty field via PUT /api/v1/settings, then reload.
async function save() {
  saving.value = true
  error.value = ''
  try {
    for (const s of settings.value) {
      if (!dirtyField(s)) continue
      const value = coerce(s, draft.value[s.key])
      const { data } = await api.put('/api/v1/settings', { namespace: s.namespace, key: s.key, value })
      if (!data?.success) throw new Error(data?.error || `could not save ${titleOf(s)}`)
    }
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    saving.value = false
  }
}

// Reset one field to its declared default (null override), then reload.
async function resetField(s: Setting) {
  saving.value = true
  error.value = ''
  try {
    const { data } = await api.put('/api/v1/settings', { namespace: s.namespace, key: s.key, value: null })
    if (!data?.success) throw new Error(data?.error || 'reset failed')
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="ap">
    <div class="ap-body">
      <SettingsToolbar :dirty="dirty" :saving="saving" @discard="load" @save="save" />

      <div v-if="error" class="ap-msg ap-err">{{ error }}</div>
      <div v-if="loading" class="ap-loading"><Icon icon="tabler:loader-2" class="spin" /> Loading…</div>

      <div v-else class="ap-cards">
        <section class="ap-card">
          <header class="ap-h"><Icon :icon="icon" aria-hidden="true" /> {{ title }}</header>
          <p v-if="help" class="ap-sub">{{ help }}</p>

          <div v-if="!settings.length" class="ks-empty">No settings declared.</div>

          <template v-else>
            <div v-for="g in groups" :key="g.name" class="pv-group">
              <h3 v-if="!singleDefaultGroup" class="pv-group-title">{{ g.name }}</h3>

              <div v-for="s in g.items" :key="s.key" class="pv-field">
                <div class="pv-field-head">
                  <label class="ap-blabel">{{ titleOf(s) }}</label>
                  <span v-if="s.is_secret && s.has_value" class="ks-tag kx-tag-caps ks-tag-on">set</span>
                  <span v-else-if="!s.is_default && !s.is_secret" class="ks-tag kx-tag-caps ks-tag-on">overridden</span>
                  <Button
                    v-if="!s.is_default"
                    class="pv-reset"
                    type="button"
                    severity="secondary"
                    text
                    rounded
                    title="Reset to default"
                    aria-label="Reset to default"
                    :disabled="saving"
                    @click="resetField(s)">
                    <template #icon>
                      <Icon icon="tabler:rotate" aria-hidden="true" />
                    </template>
                  </Button>
                </div>

                <template v-if="s.control">
                  <span v-if="s.editable === false">{{ s.value }}</span>
                  <WcMount v-else :tag="s.control.tag"
                    :attrs="{ ...s.control.props, value: coerce(s, draft[s.key]) }"
                    @select="seed(s, $event)" />
                  <p v-if="s.description" class="ap-hint">{{ s.description }}</p>
                </template>

                <!-- bool: a real toggle switch -->
                <div v-else-if="s.value_type === 'bool'" class="ap-toggle-row pv-toggle">
                  <div class="ap-toggle-text">
                    <span v-if="s.description" class="ap-toggle-desc">{{ s.description }}</span>
                  </div>
                  <ToggleSwitch
                    :model-value="!!draft[s.key]"
                    :aria-label="titleOf(s)"
                    @update:model-value="draft[s.key] = $event" />
                </div>

                <template v-else>
                  <Select v-if="enumOptions(s)" class="ap-select"
                    :model-value="draft[s.key]"
                    :options="enumOptions(s) as unknown[]"
                    @update:model-value="draft[s.key] = $event" />

                  <input v-else-if="s.value_type === 'int'" class="ap-binput" type="number"
                    :min="s.schema?.minimum" :max="s.schema?.maximum"
                    :value="draft[s.key]"
                    @input="draft[s.key] = Number(($event.target as HTMLInputElement).value)" />

                  <input v-else-if="s.value_type === 'secret'" class="ap-binput" type="password" autocomplete="off"
                    :placeholder="s.has_value ? '•••••••• set — type to replace' : 'Not set'"
                    :value="draft[s.key]"
                    @input="draft[s.key] = ($event.target as HTMLInputElement).value" />

                  <textarea v-else-if="s.value_type === 'json'" class="ap-binput pv-textarea" rows="4"
                    :value="draft[s.key] as string"
                    @input="draft[s.key] = ($event.target as HTMLTextAreaElement).value"></textarea>

                  <input v-else class="ap-binput" type="text"
                    :minlength="s.schema?.minLength" :maxlength="s.schema?.maxLength"
                    :value="draft[s.key]"
                    @input="draft[s.key] = ($event.target as HTMLInputElement).value" />

                  <p v-if="s.description" class="ap-hint">{{ s.description }}</p>
                </template>
              </div>
            </div>
          </template>
        </section>
      </div>
    </div>
  </div>
</template>

<!-- Card styles (.pv-*) live in styles.css, which each entry imports `?inline`
     and injects into the shadow DOM; scoped SFC styles are not injected by this
     web-component build, so they must not live here. -->

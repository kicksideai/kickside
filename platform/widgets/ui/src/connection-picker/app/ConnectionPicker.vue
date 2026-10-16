<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Select from 'primevue/select'
import { api } from '@wippy-fe/proxy'
import { useComponentProps, useComponentEvents } from '../constants.ts'
import { parseSelectedId } from '../../app/pickerValue'

// Single-connection picker over the connections API (GET source), built on PrimeVue's
// Select. The poller channel sink mounts this for its connection_id field, and agent
// connection traits mount it too; both read the chosen component_id back as
// {connection_id}. The list is filtered to channel-capable connections
// (reply_provider) by default so a post sink only offers connections that can host a
// responder; reply-only="false" lifts that to list every connection. The theme's
// PrimeVuePlugin renders the panel inside this element's shadow root.
const props = useComponentProps()
const emit = useComponentEvents()

interface Row { [k: string]: unknown }
interface Item { id: string; label: string; icon: string; provider: string }

const source = computed(() => props.value?.source || '/api/v1/connections')
// `providers` is the CSV filter; `provider` is a single field-declared provider
// (e.g. a HubSpot source's connection field) — merged so a caller only needs to
// set the one it has.
const providers = computed(() => {
  const list = (props.value?.providers || '').split(',').map(s => s.trim()).filter(Boolean)
  const single = (props.value?.provider || '').trim()
  if (single && !list.includes(single)) list.push(single)
  return list
})
const replyOnly = computed(() => (props.value?.replyOnly ?? 'true') !== 'false')
const noun = computed(() => (props.value?.label || '').trim() || 'connection')
const placeholder = computed(() => props.value?.placeholder || `Select a ${noun.value}…`)

const items = ref<Item[]>([])
const loaded = ref(false)
const loading = ref(false)
const open = ref(false)
const selectedId = ref('')

function str(v: unknown): string { return typeof v === 'string' ? v : (v == null ? '' : String(v)) }

// The connections endpoint returns the canonical picker envelope: data.items,
// each a flat { id, label, icon, provider, reply_provider }. The picker reads
// those fields directly; reply_provider gates the channel-capable subset.
async function load() {
  if (loading.value) return
  loading.value = true
  try {
    const lists = providers.value.length ? providers.value : ['']
    const seen = new Set<string>()
    const out: Item[] = []
    for (const p of lists) {
      const url = p ? `${source.value}?provider=${encodeURIComponent(p)}&limit=100` : `${source.value}?limit=100`
      const { data } = await api.get(url)
      const rows: Row[] = Array.isArray(data?.items) ? (data.items as Row[]) : []
      for (const r of rows) {
        if (replyOnly.value && (r as { reply_provider?: unknown }).reply_provider !== true) continue
        const id = str(r.id)
        if (!id || seen.has(id)) continue
        seen.add(id)
        out.push({ id, label: str(r.label) || `Untitled ${noun.value}`, icon: str(r.icon) || 'tabler:plug-connected', provider: str(r.provider) })
      }
    }
    items.value = out
    loaded.value = true
    emit('load', undefined)
  } catch (e) {
    emit('error', { message: 'failed to list connections', error: e })
  } finally {
    loading.value = false
  }
}

const selectedItem = computed(() => items.value.find(i => i.id === selectedId.value) || null)
// A row not yet fetched (a seeded value ahead of the first load) is "hydrating";
// a row fetched and still absent (deleted, or filtered out) is "unresolved". The
// raw id is never the primary label in either state.
const hydrating = computed(() => !!selectedId.value && !selectedItem.value && (loading.value || !loaded.value))

function onPick(v: unknown) {
  const id = (v as string) ?? ''
  selectedId.value = id
  emit('change', { connection_id: id })
  emit('config-changed', { connection_id: id })
}

// The list loads on first open too — same catalog, same call — for the case a
// panel opens before any seeded id triggered a fetch of its own.
function onShow() {
  open.value = true
  if (!loaded.value) load()
}

// A seeded id has no open panel to trigger a fetch on, so it must resolve its
// own label eagerly the same way the interactive open does: through `load()`,
// against the same catalog. Skipped once the row is already known or a fetch is
// already in flight.
function hydrateSelectedLabel() {
  if (!selectedId.value || selectedItem.value || loading.value) return
  load()
}

// Read the selection out of either `value` or its `config` alias (the poller
// config form sets `config`), tolerating an object string or a bare id.
watch(() => [props.value?.value, props.value?.config], () => {
  selectedId.value = parseSelectedId(props.value?.config, 'connection_id') || parseSelectedId(props.value?.value, 'connection_id')
  hydrateSelectedLabel()
}, { immediate: true })

watch(() => [props.value?.source, props.value?.providers, props.value?.provider, props.value?.replyOnly], () => {
  loaded.value = false
  items.value = []
  if (open.value) load()
  else hydrateSelectedLabel()
})
</script>

<template>
  <Select
    class="cn-select"
    :model-value="selectedId"
    :options="items"
    option-label="label"
    option-value="id"
    :filter-fields="['label', 'provider']"
    filter
    checkmark
    :placeholder="placeholder"
    :loading="loading"
    @before-show="onShow"
    @hide="open = false"
    @update:model-value="onPick"
  >
    <template #value>
      <span v-if="selectedId" class="cn-val">
        <Icon :icon="selectedItem?.icon || 'tabler:plug-connected'" class="cn-val-ico" aria-hidden="true" />
        <span v-if="selectedItem" class="cn-val-label">{{ selectedItem.label }}</span>
        <span v-else-if="hydrating" class="cn-val-label cn-val-muted">Resolving…</span>
        <span v-else class="cn-val-label cn-val-muted">Unknown {{ noun }}<span class="cn-val-id"> {{ selectedId }}</span></span>
      </span>
      <span v-else class="cn-ph">{{ placeholder }}</span>
    </template>
    <template #option="{ option }">
      <Icon :icon="option.icon" class="cn-opt-ico" aria-hidden="true" />
      <span class="cn-opt-label">{{ option.label }}</span>
      <span v-if="option.provider" class="cn-opt-meta">{{ option.provider }}</span>
    </template>
    <template #empty>
      <span class="cn-empty">
        <template v-if="loading"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading connections…</template>
        <template v-else>No connections.</template>
      </span>
    </template>
  </Select>
</template>

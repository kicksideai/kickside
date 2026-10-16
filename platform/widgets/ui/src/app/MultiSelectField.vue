<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { loadByTagName } from '@wippy-fe/proxy'

// Canonical declarative wrapper around the shared <wc-multiselect> custom element,
// owned by the widgets module and reused by every async multi-select picker
// (knowledge bases, skills, agents, traits, tools). It mounts the element by tag,
// feeds the source endpoint + key mappings as attributes, keeps its `selected`
// attribute in sync with the bound id array, and re-emits its `change` event as a
// plain string[] of ids. The widget never loads the full list — it resolves the
// selected chips via GET {source}?ids=, searches via ?q=, and pages by cursor (or
// lists a connection's discovery when connectionId is set), so it scales to
// large catalogs. multi defaults to true: Vue coerces an absent Boolean prop to
// false, so without an explicit default every picker that omits `multi` would go
// single-select.
const props = withDefaults(defineProps<{
  source?: string
  connectionId?: string
  discoverPath?: string
  search?: 'server' | 'local'
  pageSize?: number
  drillKey?: string
  unselectableHint?: string
  selected: string[]
  idKey?: string
  labelKey?: string
  descKey?: string
  iconKey?: string
  metaKey?: string
  responseKey?: string
  multi?: boolean
  placeholder?: string
  tag?: string
}>(), { multi: true })
const emit = defineEmits<{ (e: 'change', ids: string[], labels?: string[]): void }>()

const TAG = props.tag || 'wc-multiselect'
const host = ref<HTMLElement | null>(null)
const failed = ref(false)
let el: HTMLElement | null = null

function onChange(e: Event) {
  const detail = (e as CustomEvent).detail
  const ids: string[] = (detail && Array.isArray(detail.selected)) ? detail.selected.map(String) : []
  const labels: string[] | undefined = (detail && Array.isArray(detail.labels)) ? detail.labels.map(String) : undefined
  emit('change', ids, labels)
}

async function ensure() {
  if (customElements.get(TAG)) return
  try { await loadByTagName(TAG, { timeoutMs: 8000 }) } catch { /* inert if undefined */ }
}

function setAttr(name: string, v: string | undefined) {
  if (el && v != null && v !== '') el.setAttribute(name, v)
}

async function mount() {
  failed.value = false
  if (!host.value) return
  if (el) { el.removeEventListener('change', onChange); el = null }
  host.value.innerHTML = ''
  try {
    await ensure()
    el = document.createElement(TAG)
    setAttr('source', props.source)
    setAttr('connection-id', props.connectionId)
    setAttr('discover-path', props.discoverPath)
    setAttr('search', props.search)
    setAttr('page-size', props.pageSize == null ? undefined : String(props.pageSize))
    setAttr('drill-key', props.drillKey)
    setAttr('unselectable-hint', props.unselectableHint)
    setAttr('id-key', props.idKey)
    setAttr('label-key', props.labelKey)
    setAttr('desc-key', props.descKey)
    setAttr('icon-key', props.iconKey)
    setAttr('meta-key', props.metaKey)
    setAttr('response-key', props.responseKey)
    setAttr('placeholder', props.placeholder)
    el.setAttribute('multi', props.multi === false ? 'false' : 'true')
    el.setAttribute('selected', JSON.stringify(props.selected || []))
    el.addEventListener('change', onChange)
    el.style.display = 'block'
    host.value.appendChild(el)
    failed.value = !customElements.get(TAG)
  } catch {
    failed.value = true
  }
}

async function retry() {
  failed.value = false
  await nextTick()
  await mount()
}

watch(() => props.selected, ids => {
  if (!el) return
  el.setAttribute('selected', JSON.stringify(ids || []))
}, { deep: true })

watch(() => [props.source, props.connectionId], mount)

onMounted(mount)
onBeforeUnmount(() => { if (el) el.removeEventListener('change', onChange) })
</script>

<template>
  <div class="kx-msfield">
    <div v-if="failed" class="kx-msfield-fail" role="alert">
      <span>This picker couldn’t load.</span>
      <button type="button" @click="retry">Try again</button>
    </div>
    <div v-else ref="host"></div>
  </div>
</template>

<style scoped>
.kx-msfield-fail {
  display: flex; align-items: center; flex-wrap: wrap; gap: 8px;
  padding: 9px 10px; border: 1px solid color-mix(in srgb, var(--p-danger-500) 32%, transparent);
  border-radius: 10px; background: color-mix(in srgb, var(--p-danger-500) 7%, transparent);
  color: var(--p-danger-600, var(--p-danger-500)); font-size: 12px;
}
.kx-msfield-fail > span { min-width: 0; flex: 1; }
.kx-msfield-fail button {
  border: 1px solid currentColor; border-radius: 8px; padding: 5px 9px;
  background: transparent; color: inherit; font: inherit; font-weight: 600; cursor: pointer;
}
</style>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import { Icon } from '@iconify/vue'
import AnchoredPanel from '@widgets/app/AnchoredPanel.vue'
import { parseSelectedId } from '@widgets/app/pickerValue'
import { PRINCIPAL_TYPE_LABEL, resolvePrincipal, searchPrincipals, type Principal, type PrincipalType } from '../principals'

const props = withDefaults(defineProps<{ value?: string; config?: string; schema?: string; placeholder?: string; kinds?: string }>(), {
  value: '', config: '', schema: '', placeholder: 'Select a person or group…', kinds: 'user,group',
})
const emit = defineEmits<{
  (e: 'change', value: { id: string; principal_id: string; type: PrincipalType; label: string; [key: string]: unknown }): void
  (e: 'load'): void
  (e: 'error', value: { message: string; error: unknown }): void
}>()
const anchor = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const open = ref(false), query = ref(''), loading = ref(false), resolving = ref(false), searched = ref(false)
const options = ref<Principal[]>([]), selected = ref<Principal | null>(null), selectedId = ref(''), error = ref('')
const active = ref(-1)
const listboxId = `principal-options-${useId()}`
let timer: ReturnType<typeof setTimeout> | null = null
let hydrateSeq = 0
let searchSeq = 0

function object(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === 'object') return raw as Record<string, unknown>
  if (typeof raw === 'string' && raw.trim().startsWith('{')) { try { return JSON.parse(raw) as Record<string, unknown> } catch {} }
  return {}
}
const schemaProperties = computed(() => object(object(props.schema).properties))
const fieldKey = computed(() => Object.keys(schemaProperties.value)[0] || 'principal_id')
const fieldDeclaration = computed(() => object(schemaProperties.value[fieldKey.value]))
const allowedKinds = computed<PrincipalType[]>(() => {
  const kinds = String(fieldDeclaration.value.kinds || props.kinds).split(',').map((v) => v.trim()).filter((v): v is PrincipalType => v === 'user' || v === 'group')
  return kinds.length ? kinds : ['user', 'group']
})
const clearLabel = computed(() => String(fieldDeclaration.value.empty_label || 'Clear selection'))
const display = computed(() => selected.value?.label || (resolving.value ? 'Finding selection…' : selectedId.value ? 'Unknown principal' : props.placeholder))
function readId(): string {
  for (const raw of [props.config, props.value]) for (const key of [fieldKey.value, 'principal_id', 'id', 'thread_id']) {
    const id = parseSelectedId(raw, key); if (id) return id
  }
  return ''
}
async function hydrate(id: string) {
  const seq = ++hydrateSeq; selected.value = null
  if (!id) return
  resolving.value = true; error.value = ''
  try {
    const row = await resolvePrincipal(id, allowedKinds.value)
    if (seq !== hydrateSeq) return
    selected.value = row
    if (!row) error.value = 'This person or group is no longer available.'
    emit('load')
  } catch (cause) {
    if (seq !== hydrateSeq) return
    error.value = 'Could not resolve this selection.'; emit('error', { message: error.value, error: cause })
  } finally { if (seq === hydrateSeq) resolving.value = false }
}
watch(() => [props.config, props.value, props.schema, props.kinds], () => {
  const id = readId(); if (id === selectedId.value && (selected.value || resolving.value)) return
  selectedId.value = id; void hydrate(id)
}, { immediate: true })

async function search(seq: number, requestedQuery: string, requestedKinds: PrincipalType[]) {
  try {
    const found = await searchPrincipals(requestedQuery, 12, requestedKinds)
    if (seq !== searchSeq) return
    options.value = found; active.value = found.length ? 0 : -1
  } catch (cause) {
    if (seq !== searchSeq) return
    options.value = []; error.value = 'Could not search people and groups.'; emit('error', { message: error.value, error: cause })
  } finally { if (seq === searchSeq) loading.value = false }
}
function scheduleSearch() {
  if (timer) clearTimeout(timer)
  // Invalidate an in-flight request as soon as the visible query changes, not when the
  // next debounce eventually fires. Old-query rows must never remain selectable under a
  // new query in an assignee control.
  const seq = ++searchSeq
  const requestedQuery = query.value.trim()
  const requestedKinds = [...allowedKinds.value]
  options.value = []; active.value = -1; error.value = ''
  if (!requestedQuery) { loading.value = false; searched.value = false; timer = null; return }
  loading.value = true; searched.value = true
  timer = setTimeout(() => { timer = null; void search(seq, requestedQuery, requestedKinds) }, 180)
}
function show() { open.value = true; query.value = ''; options.value = []; searched.value = false; error.value = ''; active.value = -1; void nextTick(() => input.value?.focus()) }
function toggle() {
  if (open.value) { open.value = false; return }
  show()
}
function restoreFocus() { void nextTick(() => anchor.value?.focus()) }
function pick(row: Principal) {
  selectedId.value = row.id; selected.value = row; open.value = false
  emit('change', { id: row.id, principal_id: row.id, type: row.type, label: row.label, [fieldKey.value]: row.id })
  restoreFocus()
}
function clearSelection() {
  const type = allowedKinds.value[0] || 'user'
  selectedId.value = ''; selected.value = null; open.value = false
  emit('change', { id: '', principal_id: '', type, label: '', [fieldKey.value]: '' })
  restoreFocus()
}
function onKey(e: KeyboardEvent) {
  e.stopPropagation()
  if (e.key === 'ArrowDown') { e.preventDefault(); active.value = options.value.length ? (active.value + 1) % options.value.length : -1 }
  else if (e.key === 'ArrowUp') { e.preventDefault(); active.value = options.value.length ? (active.value - 1 + options.value.length) % options.value.length : -1 }
  else if (e.key === 'Enter' && active.value >= 0) { e.preventDefault(); pick(options.value[active.value]) }
  else if (e.key === 'Escape') { e.preventDefault(); open.value = false; nextTick(() => anchor.value?.focus()) }
}
watch(open, (isOpen) => {
  if (isOpen) return
  if (timer) { clearTimeout(timer); timer = null }
  searchSeq += 1; loading.value = false
})
onBeforeUnmount(() => { hydrateSeq += 1; searchSeq += 1; if (timer) clearTimeout(timer) })
</script>

<template>
  <button ref="anchor" type="button" class="kpp-control" :class="open && 'is-open'" :aria-expanded="open" :aria-controls="open ? listboxId : undefined" aria-haspopup="listbox" @click="toggle">
    <Icon :icon="selected?.type === 'group' ? 'tabler:users-group' : 'tabler:user'" aria-hidden="true" />
    <span :class="!selectedId && 'is-placeholder'">{{ display }}</span><Icon icon="tabler:chevron-down" aria-hidden="true" />
  </button>
  <AnchoredPanel v-model:open="open" :anchor="anchor" :min-width="260" :max-height="320">
    <div class="kpp-panel" @keydown="onKey">
      <label class="kpp-search"><Icon :icon="loading ? 'tabler:loader-2' : 'tabler:search'" :class="loading && 'spin'" aria-hidden="true" /><input ref="input" v-model="query" type="search" role="combobox" autocomplete="off" aria-autocomplete="list" :aria-expanded="open" :aria-controls="listboxId" :aria-activedescendant="active >= 0 ? `${listboxId}-${active}` : undefined" placeholder="Search people or groups…" aria-label="Search people or groups" @input="scheduleSearch" /></label>
      <div v-if="error" class="kpp-state is-error" role="alert">{{ error }}</div>
      <div v-else-if="loading" class="kpp-state">Searching…</div>
      <div v-else-if="searched && !options.length" class="kpp-state">No people or groups found.</div>
      <div v-else-if="!searched" class="kpp-state">Type a name or email.</div>
      <div v-else :id="listboxId" class="kpp-list" role="listbox" aria-label="People and groups">
        <button v-for="(row, index) in options" :id="`${listboxId}-${index}`" :key="`${row.type}:${row.id}`" type="button" role="option" class="kpp-row" :class="[index === active && 'is-active', row.id === selectedId && 'is-selected']" :aria-selected="row.id === selectedId" @mousemove="active = index" @click="pick(row)">
          <Icon :icon="row.type === 'group' ? 'tabler:users-group' : 'tabler:user'" aria-hidden="true" /><span class="kpp-copy"><strong>{{ row.label }}</strong><small v-if="row.sublabel">{{ row.sublabel }}</small></span><small class="kpp-kind">{{ PRINCIPAL_TYPE_LABEL[row.type] }}</small>
        </button>
      </div>
      <button v-if="selectedId" type="button" class="kpp-clear" @click="clearSelection"><Icon icon="tabler:arrow-back-up" aria-hidden="true" />{{ clearLabel }}</button>
    </div>
  </AnchoredPanel>
</template>

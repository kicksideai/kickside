<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { api } from '@wippy-fe/proxy'
import PickerSelect from '@widgets/app/PickerSelect.vue'
import type { PickerItem } from '@widgets/app/ports'

interface Candidate { kind: 'user'; id: string; label: string }
interface Page { success: boolean; me: Candidate; candidates: Candidate[]; next_cursor?: string; error?: string }
const props = withDefaults(defineProps<{ value?: string; componentId?: string; disabled?: boolean }>(), {
  value: '', componentId: '', disabled: false,
})
const emit = defineEmits<{
  (e: 'change', selection: { principal: { kind: 'user'; id: string }; label: string }): void
  (e: 'load'): void
  (e: 'error', error: { message: string; error: unknown }): void
}>()
const me = ref<Candidate | null>(null), candidates = ref<Candidate[]>([])
const cursor = ref(''), query = ref(''), loading = ref(false), error = ref('')
let sequence = 0
const items = computed<PickerItem[]>(() => [
  ...(me.value ? [{ id: me.value.id, title: 'Me', icon: 'tabler:user', group: 'Accounts' }] : []),
  ...candidates.value.map(row => ({ id: row.id, title: row.label, subtitle: 'Bot account', icon: 'tabler:robot', group: 'Accounts' })),
])
const selectedId = computed(() => props.value || me.value?.id || '')

async function read(requestedQuery: string, append = false) {
  const version = ++sequence
  const requestedCursor = append ? cursor.value : ''
  query.value = requestedQuery
  loading.value = true; error.value = ''
  if (!append) { candidates.value = []; me.value = null; cursor.value = '' }
  try {
    const params = { ...(props.componentId ? { component_id: props.componentId } : {}), q: requestedQuery, limit: 100,
      ...(requestedCursor ? { cursor: requestedCursor } : {}) }
    const { data } = await api.get<Page>('/api/v1/users/run-as-candidates', { params })
    if (version !== sequence) return
    if (!data.success || !data.me || !Array.isArray(data.candidates)) throw new Error(data.error || 'Could not load run-as accounts')
    if (requestedCursor && data.next_cursor === requestedCursor) throw new Error('Candidate page repeats its cursor')
    me.value = data.me
    candidates.value = [...new Map([...(append ? candidates.value : []), ...data.candidates].map(row => [row.id, row])).values()]
    cursor.value = data.next_cursor || ''
    emit('load')
  } catch (cause) {
    if (version !== sequence) return
    me.value = null; candidates.value = []; cursor.value = ''
    error.value = cause instanceof Error ? cause.message : 'Could not load run-as accounts'
    emit('error', { message: error.value, error: cause })
  } finally { if (version === sequence) loading.value = false }
}
function choose(id: string) {
  const row = id === me.value?.id ? me.value : candidates.value.find(candidate => candidate.id === id)
  if (!row || props.disabled || loading.value) return
  emit('change', { principal: { kind: 'user', id: row.id }, label: row.label })
}
watch(() => props.componentId, () => { void read('') }, { immediate: true })
onBeforeUnmount(() => { sequence += 1 })
</script>

<template>
  <PickerSelect :items="items" :model-value="selectedId" :placeholder="value ? 'Selection unavailable' : 'Me'"
    aria-label="Run as" :disabled="disabled" remote :loading="loading" :error="error" :more="!!cursor"
    @update:model-value="choose" @search="read" @more="read(query, true)" />
</template>

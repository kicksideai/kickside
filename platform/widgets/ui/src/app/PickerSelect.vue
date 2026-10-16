<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import { Icon } from '@iconify/vue'
import AnchoredPanel from './AnchoredPanel.vue'
import type { PickerItem } from './ports'

const props = defineProps<{ items: PickerItem[]; modelValue: string; placeholder?: string; ariaLabel?: string; disabled?: boolean;
  remote?: boolean; loading?: boolean; more?: boolean; error?: string }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'search', query: string): void
  (e: 'more'): void
}>()
const anchor = ref<HTMLElement | null>(null)
const search = ref<HTMLInputElement | null>(null)
const open = ref(false)
const query = ref('')
const active = ref(0)
const listId = useId()
const groups = computed(() => {
  const term = query.value.trim().toLowerCase()
  const grouped = new Map<string, PickerItem[]>()
  for (const item of props.items) {
    if (!props.remote && term && ![item.title, item.subtitle, item.id, item.group].some(v => v?.toLowerCase().includes(term))) continue
    const group = item.group || 'Other'
    const rows = grouped.get(group)
    if (rows) rows.push(item)
    else grouped.set(group, [item])
  }
  let index = 0
  return [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    .map(([group, items]) => ({ group, items: items.map(item => ({ item, index: index++ })) }))
})
const options = computed(() => groups.value.flatMap(group => group.items))
const selected = computed(() => props.items.find(item => item.id === props.modelValue))
const activeId = computed(() => options.value[active.value] ? `${listId}-${active.value}` : undefined)
watch(query, () => { active.value = 0 })
watch([open, query], ([isOpen, value]) => { if (isOpen && props.remote) emit('search', value) })
watch(() => props.disabled, disabled => { if (disabled) open.value = false })
watch(open, async value => {
  if (!value) { anchor.value?.focus(); return }
  query.value = ''
  active.value = Math.max(0, options.value.findIndex(({ item }) => item.id === props.modelValue))
  await nextTick()
  search.value?.focus()
})
function choose(item: PickerItem) {
  if (props.disabled || props.loading) return
  emit('update:modelValue', item.id)
  open.value = false
}
async function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    event.stopPropagation()
    open.value = false
    return
  }
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter'].includes(event.key)) return
  event.preventDefault()
  if (!open.value) { open.value = true; return }
  if (event.key === 'Enter') {
    const option = options.value[active.value]
    if (option) choose(option.item)
    return
  }
  const last = options.value.length - 1
  active.value = event.key === 'Home' ? 0 : event.key === 'End' ? last
    : Math.max(0, Math.min(last, active.value + (event.key === 'ArrowDown' ? 1 : -1)))
  await nextTick()
  const root = anchor.value?.getRootNode() as Document | ShadowRoot | undefined
  root?.querySelector(`[id="${activeId.value}"]`)?.scrollIntoView({ block: 'nearest' })
}
</script>

<template>
  <button ref="anchor" type="button" class="kx-ps p-select" role="combobox" aria-haspopup="listbox"
    :aria-expanded="open" :aria-controls="listId" :aria-label="ariaLabel" :disabled="disabled"
    @click="open = !open" @keydown="onKey">
    <span class="p-select-label">
      <span v-if="selected" class="kx-ps-val">
        <Icon :icon="selected.icon || 'tabler:point'" class="kx-ps-val-ico" aria-hidden="true" />
        <span class="kx-ps-val-label">{{ selected.title }}</span>
      </span>
      <span v-else class="kx-ps-ph">{{ placeholder || 'Select…' }}</span>
    </span>
    <span class="p-select-dropdown"><Icon icon="tabler:chevron-down" aria-hidden="true" /></span>
  </button>
  <AnchoredPanel v-model:open="open" :anchor="anchor">
    <div class="p-select-overlay kx-ps-panel">
      <div class="p-select-header">
        <input ref="search" v-model="query" type="search" class="p-inputtext p-select-filter"
          :aria-label="`Search ${ariaLabel || placeholder || 'options'}`" :aria-controls="listId"
          :aria-activedescendant="activeId" @keydown="onKey" />
      </div>
      <ul :id="listId" class="p-select-list kx-ps-options" role="listbox" :aria-label="ariaLabel || placeholder || 'Options'">
        <template v-for="group in groups" :key="group.group">
          <li class="p-select-option-group" role="presentation">{{ group.group }}</li>
          <li v-for="{ item, index } in group.items" :id="`${listId}-${index}`" :key="item.id"
            class="p-select-option kx-ps-option" :class="{ 'p-select-option-selected': item.id === modelValue, 'p-focus': index === active }"
            role="option" :aria-selected="item.id === modelValue" @click="choose(item)" @mousemove="active = index">
            <Icon :icon="item.icon || 'tabler:point'" class="kx-ps-opt-ico" aria-hidden="true" />
            <span class="kx-ps-opt-body">
              <span class="kx-ps-opt-title">{{ item.title }}</span>
              <span v-if="item.subtitle" class="kx-ps-opt-sub">{{ item.subtitle }}</span>
            </span>
          </li>
        </template>
        <li v-if="loading" class="p-select-empty-message" role="status">Loading…</li>
        <li v-else-if="!options.length && !error" class="p-select-empty-message" role="presentation">No matches</li>
      </ul>
      <div v-if="error" class="p-select-empty-message" role="alert">{{ error }}</div>
      <button v-if="more" type="button" class="p-button p-button-secondary" data-testid="picker-more"
        :disabled="loading || disabled" @click="emit('more')">Load more</button>
    </div>
  </AnchoredPanel>
</template>

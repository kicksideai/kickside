<script setup lang="ts">
// The wire-drop picker: a connection drag released on empty canvas opens this
// searchable step list at the drop point; picking a step creates it there,
// already wired to the drag source. Add, place, and connect in one gesture —
// the pattern every serious workflow tool converges on. Schema mismatches stay
// permitted (they connect as mappable warnings), so the list is search-driven,
// not type-gated.
import { computed, nextTick, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import type { CatalogItem } from '../catalog/catalog'

const props = defineProps<{ items: CatalogItem[]; x: number; y: number }>()
const emit = defineEmits<{ pick: [item: CatalogItem]; close: [] }>()

const query = ref('')
const cursor = ref(0)
const inputEl = ref<HTMLInputElement | null>(null)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  const base = q
    ? props.items.filter(i => `${i.title} ${i.subtitle} ${i.category}`.toLowerCase().includes(q))
    : props.items
  return base.slice(0, 12)
})

function move(delta: number) {
  const n = filtered.value.length
  if (!n) return
  cursor.value = (cursor.value + delta + n) % n
}
function pickCurrent() {
  const item = filtered.value[cursor.value]
  if (item) emit('pick', item)
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') { e.preventDefault(); move(1) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1) }
  else if (e.key === 'Enter') { e.preventDefault(); pickCurrent() }
  else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); emit('close') }
  else { cursor.value = 0 }
}

onMounted(() => { void nextTick(() => inputEl.value?.focus()) })
</script>

<template>
  <div class="wf-ctx-backdrop" @click="emit('close')" @contextmenu.prevent="emit('close')" />
  <div class="wf-drop-picker" role="dialog" aria-label="Add a connected step" :style="{ left: x + 'px', top: y + 'px' }">
    <div class="wf-drop-search">
      <Icon icon="tabler:search" aria-hidden="true" />
      <input ref="inputEl" v-model="query" placeholder="Add a step…" @keydown="onKeydown" />
    </div>
    <ul class="wf-drop-list" role="listbox">
      <li v-for="(item, i) in filtered" :key="item.paletteId">
        <button
          class="wf-drop-item"
          role="option"
          :aria-selected="i === cursor"
          :class="{ on: i === cursor }"
          @mouseenter="cursor = i"
          @click="emit('pick', item)"
        >
          <Icon :icon="item.icon" aria-hidden="true" />
          <span class="wf-drop-title">{{ item.title }}</span>
          <span class="wf-drop-cat">{{ item.category }}</span>
        </button>
      </li>
      <li v-if="!filtered.length" class="wf-drop-empty">No steps match.</li>
    </ul>
  </div>
</template>

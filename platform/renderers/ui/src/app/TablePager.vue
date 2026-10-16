<script setup lang="ts">
import { computed } from 'vue'
import { COLUMNS_PER_PAGE, ROWS_PER_PAGE, pageNumber, type TablePage, type TableSize } from '../preview/protocol'
const props = defineProps<{ size: TableSize; page: TablePage; busy?: boolean }>()
const emit = defineEmits<{ change: [page: TablePage] }>()
const rowPages = computed(() => Math.max(1, Math.ceil(props.size.rows / ROWS_PER_PAGE)))
const columnPages = computed(() => Math.max(1, Math.ceil(props.size.columns / COLUMNS_PER_PAGE)))
function change(axis: keyof TablePage, value: number) {
  const total = axis === 'row' ? props.size.rows : props.size.columns
  const size = axis === 'row' ? ROWS_PER_PAGE : COLUMNS_PER_PAGE
  emit('change', { ...props.page, [axis]: pageNumber(value, total, size) })
}
function input(axis: keyof TablePage, event: Event) {
  change(axis, Number((event.target as HTMLInputElement).value) - 1)
}
</script>
<template>
  <nav class="preview-pager" :aria-label="`${size.name} pages`">
    <strong>{{ size.name }}</strong>
    <div class="preview-axis">
      <span>Rows {{ size.rows ? page.row * ROWS_PER_PAGE + 1 : 0 }}–{{ Math.min((page.row + 1) * ROWS_PER_PAGE, size.rows) }} of {{ size.rows.toLocaleString() }}</span>
      <button :disabled="busy || page.row === 0" :aria-label="`${size.name} previous rows`" @click="change('row', page.row - 1)">Previous</button>
      <label>Page <input type="number" min="1" :max="rowPages" :value="page.row + 1" :disabled="busy" :aria-label="`${size.name} row page`" @change="input('row', $event)" /> of {{ rowPages }}</label>
      <button :disabled="busy || page.row + 1 >= rowPages" :aria-label="`${size.name} next rows`" @click="change('row', page.row + 1)">Next</button>
    </div>
    <div class="preview-axis">
      <span>Columns {{ size.columns ? page.column * COLUMNS_PER_PAGE + 1 : 0 }}–{{ Math.min((page.column + 1) * COLUMNS_PER_PAGE, size.columns) }} of {{ size.columns.toLocaleString() }}</span>
      <button :disabled="busy || page.column === 0" :aria-label="`${size.name} previous columns`" @click="change('column', page.column - 1)">Previous</button>
      <label>Page <input type="number" min="1" :max="columnPages" :value="page.column + 1" :disabled="busy" :aria-label="`${size.name} column page`" @change="input('column', $event)" /> of {{ columnPages }}</label>
      <button :disabled="busy || page.column + 1 >= columnPages" :aria-label="`${size.name} next columns`" @click="change('column', page.column + 1)">Next</button>
    </div>
  </nav>
</template>

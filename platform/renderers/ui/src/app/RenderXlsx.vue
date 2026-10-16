<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import { useProps } from '@wippy-fe/webcomponent-vue'
import { usePreview } from '../preview/usePreview'
import TablePager from './TablePager.vue'

const props = useProps<{ sourceUrl?: string }>()
const preview = usePreview()
const { result, loading, error } = preview
const fetching = ref(false)
let loadSequence = 0
onBeforeUnmount(() => { loadSequence++ })
async function load() {
  const sequence = ++loadSequence
  preview.clear()
  fetching.value = false
  const url = props.value?.sourceUrl
  if (!url) return
  fetching.value = true
  try {
    const { data } = await api.get(url, { responseType: 'arraybuffer' })
    if (sequence !== loadSequence) return
    if (!(data instanceof ArrayBuffer)) throw new Error('Spreadsheet response must contain workbook bytes')
    preview.workbook(data)
  } catch (cause: unknown) {
    if (sequence !== loadSequence) return
    error.value = cause instanceof Error ? cause.message : 'Could not read spreadsheet'
  } finally {
    if (sequence === loadSequence) fetching.value = false
  }
}
watch(() => props.value?.sourceUrl, load, { immediate: true })
</script>
<template>
  <div class="xlsxv">
    <div v-if="fetching || (loading && !result)" class="rv-state"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /><span>Reading spreadsheet…</span></div>
    <div v-if="error" class="rv-state err"><Icon icon="tabler:alert-circle" aria-hidden="true" /><span>{{ error }}</span></div>
    <template v-if="result?.kind === 'workbook' && result.tables.length">
      <div v-if="result.tables.length > 1" class="xlsxv-tabs" role="tablist">
        <button v-for="(sheet, i) in result.tables" :key="sheet.name" class="xlsxv-tab" :class="{ on: i === result.active }" role="tab" :aria-selected="i === result.active" :disabled="loading" @click="preview.page(i, result.pages[i])">{{ sheet.name }}</button>
      </div>
      <TablePager :size="result.tables[result.active]" :page="result.pages[result.active]" :busy="loading" @change="preview.page(result.active, $event)" />
      <div class="xlsxv-sheet" :aria-busy="loading">
        <table :aria-label="result.tables[result.active].name"><tbody>
          <tr v-for="(row, rowIndex) in result.cells" :key="rowIndex">
            <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
          </tr>
        </tbody></table>
      </div>
    </template>
  </div>
</template>

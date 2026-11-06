<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import { api, loadByTagName } from '@wippy-fe/proxy'
import { typeIcon, formatSize } from '@widgets/app/fileMetadata'
import { errMsg } from '@widgets/app/errMsg'
import { isItem } from './item'
import type { ItemFile } from './item'

const props = defineProps<{ itemId: string; files?: ItemFile[]; count?: number; version?: string }>()
const resolvedFiles = ref<ItemFile[]>([])
const filesLoading = ref(false)
const filesError = ref('')
let request = 0
const expanded = ref<number | null>(null)
const loading = ref(false)
const previewError = ref('')

async function loadFiles() {
  const current = ++request
  expanded.value = null
  resolvedFiles.value = props.files || []
  filesError.value = ''
  filesLoading.value = false
  if (props.files !== undefined) return
  filesLoading.value = true
  try {
    const { data } = await api.get<{ success?: boolean; items?: unknown[] }>(
      `/api/v1/inbox?id=${encodeURIComponent(props.itemId)}&status=all&limit=1`,
    )
    if (current !== request) return
    const item = data?.items?.[0]
    if (!data?.success || !isItem(item) || item.id !== props.itemId) throw new Error('Attached files are unavailable')
    resolvedFiles.value = item.files || []
  } catch (err) {
    if (current === request) filesError.value = errMsg(err, 'Attached files are unavailable')
  } finally {
    if (current === request) filesLoading.value = false
  }
}

watch(() => [props.itemId, props.files, props.count, props.version], () => { void loadFiles() }, { immediate: true })
onUnmounted(() => { request += 1 })

function openUrl(value?: string): string | undefined {
  if (!value) return undefined
  return /^(https?:\/\/|\/(?!\/))/i.test(value) ? value : undefined
}

async function preview(index: number) {
  if (expanded.value === index) { expanded.value = null; return }
  expanded.value = index
  loading.value = true
  previewError.value = ''
  try {
    await loadByTagName('wc-resource-view', { timeoutMs: 8000 })
  } catch (err) {
    previewError.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="kx-files" aria-label="Attached files">
    <h3>Files</h3>
    <p v-if="filesLoading" role="status">Loading attached files…</p>
    <div v-else-if="filesError">
      <p role="alert">{{ filesError }}</p>
      <Button type="button" size="small" text severity="secondary" label="Retry files" @click="loadFiles" />
    </div>
    <ul class="kx-file-list">
      <li v-for="(file, index) in resolvedFiles" :key="index">
        <div v-if="file.locked" class="kx-file-row kx-file-locked" data-testid="inbox-file-locked">
          <Icon icon="tabler:lock" aria-hidden="true" />
          <span>Locked file</span>
        </div>
        <template v-else>
          <div class="kx-file-row">
            <Icon :icon="typeIcon(file.content_type || '')" aria-hidden="true" />
            <div class="kx-file-label">
              <span class="kx-file-name">{{ file.filename || 'File' }}</span>
              <span v-if="file.size !== undefined" class="kx-file-size">{{ formatSize(file.size) }}</span>
            </div>
            <Button type="button" size="small" text severity="secondary" data-testid="inbox-file-preview"
              :label="expanded === index ? 'Close preview' : 'Preview'" :aria-expanded="expanded === index"
              @click="preview(index)" />
            <a v-if="openUrl(file.view_url)" :href="openUrl(file.view_url)" target="_blank" rel="noopener noreferrer" data-testid="inbox-file-open">Open<span class="kx-sr-only"> {{ file.filename || 'file' }}</span></a>
          </div>
          <div v-if="expanded === index" class="kx-file-preview">
            <p v-if="loading" role="status">Loading preview…</p>
            <p v-else-if="previewError" role="alert">{{ previewError }}</p>
            <wc-resource-view v-else :content-type="file.content_type || ''" :filename="file.filename || ''"
              :source-url="`/api/v1/inbox/${encodeURIComponent(props.itemId)}/files/${index + 1}`"></wc-resource-view>
          </div>
        </template>
      </li>
    </ul>
  </section>
</template>

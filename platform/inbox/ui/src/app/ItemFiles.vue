<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import { loadByTagName } from '@wippy-fe/proxy'
import { typeIcon, formatSize } from '@widgets/app/fileMetadata'
import type { ItemFile } from './item'

const props = defineProps<{ itemId: string; files: ItemFile[] }>()
const expanded = ref<number | null>(null)
const loading = ref(false)
const previewError = ref('')

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
    <ul class="kx-file-list">
      <li v-for="(file, index) in files" :key="index">
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

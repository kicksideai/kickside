<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'
import Message from 'primevue/message'
import type { PreviewSource, Upload, UploadArtifact } from './uploads.types.ts'
import {
  artifactLabel,
  artifactMeta,
  formatSize,
  isPrimaryMarkdown,
  isTextualContent,
  typeIcon,
  typeLabel,
  uploadLabel,
} from './uploads.format.ts'

interface Props {
  preview: Upload | null
  artifactView: UploadArtifact | null
  busyAction: boolean
  partsExpanded: boolean
  currentArtifacts: UploadArtifact[]
  partsTotal: number
  partsPage: number
  partsPages: number
  partsRangeStart: number
  partsRangeEnd: number
  hasPrimary: boolean
  artifactsLoading: boolean
  activePreviewSource: (upload: Upload) => PreviewSource
  downloadActive: () => Promise<void>
  openActive: () => Promise<void>
  closePreview: () => void
  viewOriginal: () => void
  viewPrimary: () => void
  viewArtifact: (artifact: UploadArtifact) => void
  gotoPartsPage: (page: number) => void
}

defineProps<Props>()
const emit = defineEmits<{ (event: 'update:partsExpanded', value: boolean): void }>()
</script>

<template>
  <!-- Preview side panel: a right-docked overlay Drawer. It floats over the list
       (never an inline split), so the list keeps full width and the viewer gets
       maximum, full-bleed space. The theme's PrimeVuePlugin keeps the Drawer's
       portal inline in this component's shadow root by default, so the
       shadow-scoped kx-* body styles reach the panel. The width rides on the
       drawer root as an inline style: the portal mounts outside the .kx
       wrapper, so an ancestor-scoped width selector never matches it. -->
  <Drawer
    :visible="!!preview"
    position="right"
    :modal="true"
    :dismissable="true"
    :close-on-escape="true"
    :show-close-icon="false"
    class="kx-side-drawer"
    :pt="{ root: { style: 'width: min(1400px, 82vw)' }, content: { class: 'kx-side-drawer-content' } }"
    aria-label="File preview"
    @update:visible="(visible) => { if (!visible) closePreview() }"
  >
    <div v-if="preview" class="kx-side">
      <header class="kx-pv-head">
        <span class="kx-ficon"><Icon :icon="typeIcon(preview.mime_type)" aria-hidden="true" /></span>
        <div class="kx-pv-id">
          <div class="kx-pv-name" :title="uploadLabel(preview)">{{ uploadLabel(preview) }}<span v-if="!preview.filename?.trim()" class="kx-uuid"> {{ preview.uuid }}</span></div>
          <div class="kx-pv-sub">{{ typeLabel(preview) }} · {{ formatSize(preview.size) }}</div>
        </div>
        <Button
          type="button"
          text
          rounded
          size="small"
          data-testid="uploads-preview-download"
          :disabled="busyAction"
          aria-label="Download"
          @click="downloadActive"
        >
          <template #icon="{ class: iconClass }">
            <Icon
              :icon="busyAction ? 'tabler:loader-2' : 'tabler:download'"
              :class="[iconClass, busyAction && 'spin']"
              aria-hidden="true"
            />
          </template>
        </Button>
        <Button
          type="button"
          text
          rounded
          size="small"
          data-testid="uploads-preview-open"
          :disabled="busyAction"
          aria-label="Open in new tab"
          @click="openActive"
        >
          <template #icon="{ class: iconClass }">
            <Icon icon="tabler:external-link" :class="iconClass" aria-hidden="true" />
          </template>
        </Button>
        <Button
          type="button"
          text
          rounded
          size="small"
          data-testid="uploads-preview-close"
          aria-label="Close preview"
          @click="closePreview"
        >
          <template #icon="{ class: iconClass }">
            <Icon icon="tabler:x" :class="iconClass" aria-hidden="true" />
          </template>
        </Button>
      </header>

      <Message v-if="typeof preview.meta?.ocr_error === 'string' && preview.meta.ocr_error"
        severity="warn" :closable="false" role="alert">
        Transcription: {{ preview.meta.ocr_error }}
      </Message>

      <!-- Default views: the original file, plus the converted markdown when the
           upload was converted. Clicking swaps the always-visible viewer below. -->
      <div class="kx-views">
        <Button
          type="button"
          class="kx-part"
          size="small"
          rounded
          :outlined="!!artifactView"
          label="File"
          data-testid="uploads-view-file"
          :aria-pressed="!artifactView"
          :pt="{ label: { class: 'kx-part-label' } }"
          @click="viewOriginal"
        >
          <template #icon="{ class: iconClass }">
            <Icon icon="tabler:file" :class="iconClass" aria-hidden="true" />
          </template>
        </Button>
        <Button
          v-if="hasPrimary"
          type="button"
          class="kx-part"
          size="small"
          rounded
          :outlined="!(artifactView && isPrimaryMarkdown(artifactView))"
          label="Markdown"
          data-testid="uploads-view-markdown"
          :aria-pressed="!!artifactView && isPrimaryMarkdown(artifactView)"
          :pt="{ label: { class: 'kx-part-label' } }"
          @click="viewPrimary"
        >
          <template #icon="{ class: iconClass }">
            <Icon icon="tabler:markdown" :class="iconClass" aria-hidden="true" />
          </template>
        </Button>
      </div>

      <div class="kx-pv-view" :class="{ 'kx-pv-padded': isTextualContent(activePreviewSource(preview).contentType) }">
        <wc-resource-view
          :key="artifactView ? `${preview.uuid}:${artifactView.artifact_id}` : preview.uuid"
          class="kx-pv-rv"
          :content-type="activePreviewSource(preview).contentType"
          :source-url="activePreviewSource(preview).sourceUrl"
          :filename="activePreviewSource(preview).filename"
          :alt="activePreviewSource(preview).filename"
        />
      </div>

      <!-- Extracted parts (page images, etc.), paginated since a file can have
           hundreds. Collapsed by default so the viewer keeps the full height. -->
      <div v-if="partsTotal || artifactsLoading" class="kx-parts-panel" :class="{ open: partsExpanded }">
        <div class="kx-parts-head">
          <Button
            type="button"
            text
            size="small"
            label="Parts"
            :badge="String(partsTotal)"
            badge-severity="secondary"
            data-testid="uploads-parts-toggle"
            :aria-expanded="partsExpanded"
            aria-controls="uploads-extracted-parts"
            @click="emit('update:partsExpanded', !partsExpanded)"
          >
            <template #icon="{ class: iconClass }">
              <Icon
                :icon="partsExpanded ? 'tabler:chevron-down' : 'tabler:chevron-right'"
                :class="iconClass"
                aria-hidden="true"
              />
            </template>
          </Button>
          <template v-if="partsExpanded && partsPages > 1">
            <span class="kx-parts-range">{{ partsRangeStart }}–{{ partsRangeEnd }}</span>
            <div class="kx-parts-pager">
              <Button
                type="button"
                text
                rounded
                size="small"
                data-testid="uploads-parts-previous"
                :disabled="partsPage <= 1"
                aria-label="Previous parts"
                @click="gotoPartsPage(partsPage - 1)"
              >
                <template #icon="{ class: iconClass }">
                  <Icon icon="tabler:chevron-left" :class="iconClass" aria-hidden="true" />
                </template>
              </Button>
              <span class="kx-parts-pageno">{{ partsPage }} / {{ partsPages }}</span>
              <Button
                type="button"
                text
                rounded
                size="small"
                data-testid="uploads-parts-next"
                :disabled="partsPage >= partsPages"
                aria-label="Next parts"
                @click="gotoPartsPage(partsPage + 1)"
              >
                <template #icon="{ class: iconClass }">
                  <Icon icon="tabler:chevron-right" :class="iconClass" aria-hidden="true" />
                </template>
              </Button>
            </div>
          </template>
        </div>
        <div
          v-show="partsExpanded"
          id="uploads-extracted-parts"
          class="kx-parts-list"
          role="region"
          aria-label="Extracted parts"
        >
          <Button
            v-for="artifact in currentArtifacts"
            :key="artifact.artifact_id"
            type="button"
            class="kx-part"
            size="small"
            rounded
            :outlined="artifactView?.artifact_id !== artifact.artifact_id"
            :label="artifactLabel(artifact)"
            :disabled="!artifact.raw_url"
            :title="artifactMeta(artifact)"
            data-testid="uploads-view-artifact"
            :data-artifact-id="artifact.artifact_id"
            :aria-pressed="artifactView?.artifact_id === artifact.artifact_id"
            :pt="{ label: { class: 'kx-part-label' } }"
            @click="viewArtifact(artifact)"
          >
            <template #icon="{ class: iconClass }">
              <Icon :icon="typeIcon(artifact.mime_type)" :class="iconClass" aria-hidden="true" />
            </template>
          </Button>
          <span v-if="artifactsLoading" class="kx-part-loading"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /></span>
        </div>
      </div>
    </div>
  </Drawer>
</template>

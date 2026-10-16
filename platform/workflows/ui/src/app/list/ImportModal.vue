<script setup lang="ts">
import FileUpload, { type FileUploadSelectEvent } from 'primevue/fileupload'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Dialog from 'primevue/dialog'
import { humanError, importWorkflow } from '../api/api'

// Import a portable definition: a file pick or pasted JSON, creating a new draft. The parent
// owns whether the dialog is open; opening resets the draft, a successful import emits the
// new workflow id. PrimeVue owns the modal mask, focus trap and close button; the local
// Header/body/footer reuse the module's kx-modal-* classes via passthrough so the chrome
// matches the sibling modals.
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'open', id: string): void
}>()

const importText = ref('')
const importBusy = ref(false)
const importError = ref('')
const importUploadRef = ref<{ clear(): void } | null>(null)
const importFileChooseProps = { severity: 'secondary', outlined: true }
const dialogPt = {
  header: { class: 'kx-modal-head' },
  content: { style: 'padding: 0' },
  footer: { class: 'kx-modal-foot' },
}

watch(() => props.open, (open) => {
  if (!open) return
  importText.value = ''
  importError.value = ''
  importUploadRef.value?.clear()
})

function onVisibleChange(visible: boolean) {
  if (!visible) emit('close')
}
async function onImportFile(event: FileUploadSelectEvent) {
  const file = Array.isArray(event.files) ? event.files[0] as File | undefined : undefined
  if (!file) return
  importError.value = ''
  try {
    importText.value = await file.text()
  } catch {
    importError.value = 'Couldn’t read that file.'
  } finally {
    importUploadRef.value?.clear()
  }
}
async function submitImport() {
  if (importBusy.value) return
  const raw = importText.value.trim()
  if (!raw) { importError.value = 'Paste a Workflow export, or choose a file.'; return }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    importError.value = 'That isn’t valid JSON — paste a Workflow export.'
    return
  }
  importBusy.value = true
  importError.value = ''
  try {
    const { flowId } = await importWorkflow(parsed)
    emit('open', flowId)
  } catch (e) {
    importError.value = humanError(e, 'Couldn’t import this Workflow.')
  } finally {
    importBusy.value = false
  }
}
</script>

<template>
  <Dialog
    :visible="open"
    :modal="true"
    :dismissable-mask="true"
    class="kx-modal"
    :pt="dialogPt"
    aria-label="Import Workflow"
    @update:visible="onVisibleChange"
  >
    <template #header>
      <span class="kx-modal-head-icon"><Icon icon="tabler:file-import" aria-hidden="true" /></span>
      <div class="kx-modal-head-text" style="flex: 1">
        <div class="kx-modal-head-title">Import a Workflow</div>
        <div class="kx-modal-head-sub">Paste an exported Workflow or choose a file. We’ll create a draft copy.</div>
      </div>
    </template>

    <div class="kx-modal-body">
      <div class="kx-field">
        <FileUpload
          ref="importUploadRef"
          mode="basic"
          name="workflow"
          accept="application/json,.json"
          choose-label="Choose file…"
          class="wf-import-upload"
          :multiple="false"
          :auto="false"
          :choose-button-props="importFileChooseProps"
          @select="onImportFile"
        >
          <template #chooseicon>
            <Icon icon="tabler:upload" aria-hidden="true" />
          </template>
        </FileUpload>
      </div>
      <div class="kx-field">
        <label class="kx-field-lbl">Exported Workflow JSON</label>
        <Textarea
          v-model="importText"
          class="kx-input wf-import-text wf-mono"
          rows="9"
          placeholder='{ "title": "My Workflow", "spec": { … } }'
          aria-label="Exported Workflow JSON"
        ></Textarea>
      </div>
      <Message v-if="importError" class="wf-setup-error" severity="error" :closable="false">{{ importError }}</Message>
    </div>

    <template #footer>
      <Button severity="secondary" text @click="emit('close')">Cancel</Button>
      <Button :disabled="importBusy" :loading="importBusy" @click="submitImport">
        <Icon v-if="!importBusy" icon="tabler:file-import" aria-hidden="true" />
        <span>Import</span>
      </Button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import { Icon } from '@iconify/vue'
import SchemaEditor from '../panels/SchemaEditor.vue'

// The Run-with-input popover, extracted from WorkflowCanvas. Edits the Start input against
// the declared Start schema (form or raw JSON) and launches a draft simulate. Purely
// presentational: the run state and launch live in the canvas-run composable.
defineProps<{
  schema: unknown
  modelValue: Record<string, unknown>
  resetKey: number
  hasFields: boolean
  valid: boolean
  errorMessage: string
  canRun: boolean
}>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'run'): void
  (e: 'update:modelValue', value: Record<string, unknown>): void
  (e: 'valid', ok: boolean): void
}>()

function onVisibleChange(visible: boolean) {
  if (!visible) emit('close')
}
</script>

<template>
  <Dialog
    :visible="true"
    modal
    dismissable-mask
    header="Run with input"
    class="wf-sim-pop"
    @update:visible="onVisibleChange"
  >
    <p class="wf-sim-hint">Try this Workflow with the input below. It checks the expected input and does not publish your changes.</p>

    <div v-if="hasFields" class="wf-sim-field">
      <span class="wf-sim-label">Input</span>
      <SchemaEditor
        mode="value"
        :schema="schema"
        :model-value="modelValue"
        :reset-key="resetKey"
        :rows="7"
        placeholder='{ "key": "value" }'
        @update:model-value="(v: Record<string, unknown>) => emit('update:modelValue', v)"
        @valid="(ok: boolean) => emit('valid', ok)"
      />
    </div>
    <p v-else class="wf-sim-note">This Workflow needs no input.</p>

    <Message v-if="!valid" class="wf-sim-err" severity="error" :closable="false">Fix the JSON above before running.</Message>
    <Message v-if="errorMessage" class="wf-sim-err" severity="error" :closable="false">{{ errorMessage }}</Message>

    <template #footer>
      <Button label="Cancel" severity="secondary" text @click="emit('close')" />
      <Button :disabled="!canRun" @click="emit('run')">
        <Icon icon="tabler:player-play" aria-hidden="true" /><span>Run</span>
      </Button>
    </template>
  </Dialog>
</template>

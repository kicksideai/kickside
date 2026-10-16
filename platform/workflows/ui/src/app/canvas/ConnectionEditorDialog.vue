<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import Select from 'primevue/select'
import { computed, ref, watch } from 'vue'
import type {
  ConnectionEdgeOption,
  ConnectionRequest,
  ConnectionSourceOption,
  ConnectionTargetOption,
} from './connection-editor'

const props = defineProps<{
  sources: ConnectionSourceOption[]
  targets: ConnectionTargetOption[]
  edges: ConnectionEdgeOption[]
  targetHandle: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  close: []
  create: [request: ConnectionRequest]
  remove: [edgeId: string]
}>()

// PrimeVue owns the mask, focus trap and Escape; the head/body/foot reuse the
// module's kx-modal-* layout so this dialog matches the rest of the app.
const dialogPt = {
  header: { class: 'kx-modal-head' },
  content: { style: 'padding: 0' },
  footer: { class: 'kx-modal-foot' },
}

const sourceKey = ref<string | null>(null)
const targetId = ref<string | null>(null)
const submitted = ref(false)

const selectedSource = computed(() => props.sources.find((option) => option.key === sourceKey.value))
const targetOptions = computed(() => props.targets.filter((option) => option.nodeId !== selectedSource.value?.nodeId))
const sourceInvalid = computed(() => submitted.value && !selectedSource.value)
const targetInvalid = computed(() => submitted.value && !targetId.value)

watch(sourceKey, () => {
  if (!targetOptions.value.some((option) => option.nodeId === targetId.value)) targetId.value = null
})

function onVisibleChange(visible: boolean) {
  if (!visible) emit('close')
}

// A focused PrimeVue Select consumes Escape even when its listbox is closed.
// Preserve nested-overlay behavior: close an open listbox first; otherwise
// close the parent Dialog.
function onDialogEscape(event: KeyboardEvent) {
  const combobox = event.composedPath().find((target) => (
    target instanceof HTMLElement && target.getAttribute('role') === 'combobox'
  )) as HTMLElement | undefined
  if (combobox?.getAttribute('aria-expanded') === 'true') return
  emit('close')
}

function createConnection() {
  submitted.value = true
  const source = selectedSource.value
  if (!source || !targetId.value) return
  emit('create', {
    source: source.nodeId,
    sourceHandle: source.handle,
    target: targetId.value,
    targetHandle: props.targetHandle,
  })
  emit('close')
}
</script>

<template>
  <Dialog
    :visible="true"
    modal
    dismissable-mask
    class="kx-modal wf-connections-modal"
    :pt="dialogPt"
    aria-label="Edit connections"
    :aria-labelledby="null"
    @update:visible="onVisibleChange"
    @keydown.capture.esc="onDialogEscape"
  >
    <!-- The house dialog block: an icon tile + title/subtitle head with a rule
         under it, a scrolling body, and a footer rule above the actions. -->
    <template #header>
      <span class="kx-modal-head-icon"><Icon icon="tabler:arrows-join-2" aria-hidden="true" /></span>
      <div class="kx-modal-head-text">
        <div class="kx-modal-head-title">Edit connections</div>
        <div id="wf-connection-help" class="kx-modal-head-sub">
          Create a connection without dragging on the canvas, or remove an existing connection below.
        </div>
      </div>
    </template>

    <div class="kx-modal-body">
    <div class="wf-connections-form" aria-describedby="wf-connection-help">
      <div class="wf-connections-field">
        <label for="wf-connection-source">From <span aria-hidden="true">*</span></label>
        <Select
          v-model="sourceKey"
          input-id="wf-connection-source"
          :options="sources"
          option-label="label"
          option-value="key"
          placeholder="Choose a step and output"
          :invalid="sourceInvalid"
          aria-required="true"
          :aria-invalid="sourceInvalid"
          :aria-describedby="sourceInvalid ? 'wf-connection-source-error' : undefined"
          :pt="{ label: { autofocus: true } }"
        />
        <small v-if="sourceInvalid" id="wf-connection-source-error" role="alert">Choose a source step and output.</small>
      </div>

      <div class="wf-connections-field">
        <label for="wf-connection-target">To <span aria-hidden="true">*</span></label>
        <Select
          v-model="targetId"
          input-id="wf-connection-target"
          :options="targetOptions"
          option-label="label"
          option-value="nodeId"
          placeholder="Choose a destination step"
          :disabled="!selectedSource"
          :invalid="targetInvalid"
          aria-required="true"
          :aria-invalid="targetInvalid"
          :aria-describedby="targetInvalid ? 'wf-connection-target-error' : undefined"
        />
        <small v-if="targetInvalid" id="wf-connection-target-error" role="alert">Choose a destination step.</small>
      </div>
    </div>

    <section class="wf-connections-existing" aria-labelledby="wf-connections-existing-title">
      <h3 id="wf-connections-existing-title">Existing connections</h3>
      <Message v-if="!edges.length" severity="info" :closable="false">There are no connections yet.</Message>
      <ul v-else>
        <li v-for="edge in edges" :key="edge.id">
          <span>{{ edge.label }}</span>
          <Button
            text
            rounded
            severity="danger"
            :disabled="disabled"
            :aria-label="`Delete ${edge.label}`"
            title="Delete connection"
            @click="emit('remove', edge.id)"
          >
            <Icon icon="tabler:trash" aria-hidden="true" />
          </Button>
        </li>
      </ul>
    </section>
    </div>

    <template #footer>
      <Button severity="secondary" text @click="emit('close')">Close</Button>
      <Button :disabled="disabled" @click="createConnection">Create connection</Button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import { computed, onMounted, ref } from 'vue'
import { loadByTagName } from '@wippy-fe/proxy'
import { ADD_TRIGGER_BODY, ADD_TRIGGER_TITLE, automationManagerMount } from './add-trigger'

const props = defineProps<{ workflowId: string; publishedVersion: number }>()
const emit = defineEmits<{ (e: 'close'): void }>()
const mount = computed(() => automationManagerMount(props.workflowId, props.publishedVersion))
const automationReady = ref(false)
const automationLoadError = ref('')

// The builder is a different bundle from Automations. A bare foreign custom-element tag
// is inert here, which looks like an empty modal body. Load the registered Automation
// bundle before rendering its tag so its authenticated proxy client and its list request
// run in the element's own, supported host context.
onMounted(async () => {
  try {
    await loadByTagName(mount.value.tag, { timeoutMs: 8000 })
    automationReady.value = true
  } catch {
    automationLoadError.value = 'Couldn’t load the triggers. Try again from Automations.'
  }
})

function onVisibleChange(visible: boolean) {
  if (!visible) emit('close')
}
</script>

<template>
  <Dialog
    :visible="true"
    modal
    dismissable-mask
    :header="ADD_TRIGGER_TITLE"
    class="wf-trigger-modal"
    @update:visible="onVisibleChange"
  >
    <p class="wf-trigger-description">{{ ADD_TRIGGER_BODY }}</p>
    <div class="wf-trigger-body">
      <component v-if="automationReady" :is="mount.tag" v-bind="mount.attrs" @close="emit('close')" />
      <Message v-else-if="automationLoadError" class="wf-setup-error" severity="error" :closable="false">{{ automationLoadError }}</Message>
      <div v-else class="wf-trigger-loading">
        <ProgressSpinner class="wf-status-spinner" stroke-width="4" aria-label="Loading triggers" />
        <span>Loading triggers…</span>
      </div>
    </div>
  </Dialog>
</template>

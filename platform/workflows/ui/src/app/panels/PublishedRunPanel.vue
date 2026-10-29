<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import WcMount from '@widgets/app/WcMount.vue'
import { errMsg } from '@widgets/app/errMsg'
import SchemaEditor from './SchemaEditor.vue'
import { getWorkflowVersion } from '../api/versions'
const props = defineProps<{ workflowId: string; publishedVersion: number }>()
const emit = defineEmits<{ close: [] }>()
const schema = ref<unknown>(null), input = ref<Record<string, unknown>>({}), valid = ref(true), ready = ref(false), error = ref('')
let sequence = 0
const target = computed(() => JSON.stringify({ kind: 'workflow', flow_ref: { kind: 'flow', id: props.workflowId, version: props.publishedVersion }, input: input.value }))
async function read() {
  const version = ++sequence
  ready.value = false; error.value = ''; input.value = {}; valid.value = true
  try {
    if (!props.workflowId || !Number.isInteger(props.publishedVersion) || props.publishedVersion < 1) throw new Error('Publish this Workflow before running a published version')
    const detail = await getWorkflowVersion(props.workflowId, props.publishedVersion)
    if (version !== sequence) return
    if (detail.version !== props.publishedVersion) throw new Error('Published version does not match the request')
    schema.value = detail.input_schema; ready.value = true
  } catch (cause) { if (version === sequence) error.value = errMsg(cause, 'Could not read the published Workflow') }
}
watch(() => [props.workflowId, props.publishedVersion], () => { void read() }, { immediate: true })
onBeforeUnmount(() => { sequence += 1 })
</script>
<template>
  <section aria-label="Run published Workflow" class="wf-published-run">
    <header><h2>Run published Workflow</h2><button type="button" class="p-button p-button-secondary" @click="emit('close')">Close published run</button></header>
    <p>Run published version {{ publishedVersion }} with the selected account. Follow its progress in Past runs.</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <p v-else-if="!ready" role="status">Loading published input…</p>
    <template v-else>
      <SchemaEditor mode="value" :schema="schema" :model-value="input" :reset-key="sequence" :rows="5"
        @update:model-value="input = $event" @valid="valid = $event" />
      <p v-if="!valid" role="alert">Fix the input before queuing a run.</p>
      <WcMount v-if="valid" tag="wc-manual-task-launcher" :attrs="{ target, parent: workflowId, title: 'Published Workflow run' }" />
    </template>
  </section>
</template>

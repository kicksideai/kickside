<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import { on } from '@wippy-fe/proxy'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import { parseSchema } from '@widgets/app/ports'
import WcMount from '@widgets/app/WcMount.vue'
import { assistWorkflowBinding, getWorkflowVersion, humanError } from '../api/api'
import EmbedWorkflowPicker from './EmbedWorkflowPicker.vue'
import type { FlowCandidate } from '../nodes/flow-candidate'

type FlowRef = { kind: 'flow'; id: string; version: number }
const props = useProps<{ config?: string; schema?: string; sourceContext?: string; sourceSchema?: string; returnRoute?: string }>()
const emit = useEvents<{ change: Record<string, FlowRef>; navigate: {route: string}; select: {input_schema: unknown; transform: {kind: 'none'} | {kind: 'expr'; expr: string}} }>()
const creating = ref(false)
const submitNonce = ref(0)
const error = ref('')
let stop = () => {}
onUnmounted(() => stop())
const key = computed(() => Object.keys(parseSchema(props.value.schema)?.properties || {})[0] || 'flow_ref')
const selected = computed(() => {
  const config = parseSchema(props.value.config) as Record<string, unknown> | null
  return config?.[key.value] as FlowRef | undefined
})
async function select(flow: FlowCandidate) {
  if (!flow.published_version) return
  stop()
  await selectReference({kind: 'flow', id: flow.id, version: flow.published_version})
}
function schemaKey(value: unknown): string | undefined {
  return JSON.stringify(value, (_key, part) => part && typeof part === 'object' && !Array.isArray(part)
    ? Object.fromEntries(Object.entries(part).sort(([a], [b]) => a.localeCompare(b))) : part)
}
async function selectReference(reference: FlowRef) {
  error.value = ''
  try {
    if (props.value.sourceContext) {
      if (!props.value.sourceSchema) throw new Error('The source item schema is unavailable.')
      const sourceSchema: unknown = JSON.parse(props.value.sourceSchema)
      const frozen = await getWorkflowVersion(reference.id, reference.version)
      if (frozen.version !== reference.version) throw new Error('The published Workflow version is unavailable.')
      const transform = schemaKey(sourceSchema) === schemaKey(frozen.input_schema)
        ? {kind: 'none' as const}
        : {kind: 'expr' as const, expr: await assistWorkflowBinding(reference.id, sourceSchema, frozen.input_schema)}
      emit('select', {input_schema: frozen.input_schema, transform})
    }
    emit('change', {[key.value]: reference})
  } catch (cause) {
    error.value = humanError(cause, 'Could not select the published Workflow.')
  }
}
function created(value: unknown) {
  const id = (value as {id?: string})?.id
  if (!id) return
  creating.value = false
  stop()
  stop = on(`workflow.${id}`, async (message: unknown) => {
    const envelope = message as {data?: unknown}
    const payload = (envelope?.data || message) as {events?: {type: string; body?: {version?: number}}[]}
    const events = payload?.events || []
    const published = events.find(event => event.type === 'kickside.workflows.events:version.published')
    const version = published?.body?.version
    if (!version) return
    await selectReference({kind: 'flow', id, version})
    stop()
  })
  emit('navigate', {route: `/workflows/${encodeURIComponent(id)}/return/${encodeURIComponent(props.value.returnRoute || '')}`})
}
</script>

<template>
  <EmbedWorkflowPicker :selected="selected" @select="select" />
  <Button v-if="props.sourceContext && props.returnRoute" type="button" data-test="new-workflow" severity="secondary" outlined @click="creating = true">New workflow</Button>
  <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
  <Dialog v-model:visible="creating" modal header="New workflow">
    <WcMount v-if="creating" tag="kickside-workflow-setup" :attrs="{'source-context': props.sourceContext, 'submit-nonce': submitNonce || undefined}" @created="created" />
    <template #footer>
      <Button type="button" severity="secondary" outlined @click="creating = false">Cancel</Button>
      <Button type="button" @click="submitNonce += 1">Create</Button>
    </template>
  </Dialog>
</template>

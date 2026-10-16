<script setup lang="ts">
import Button from 'primevue/button'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import FieldMapper from '@widgets/app/FieldMapper.vue'
import type { WfEdge } from '../types'
import { getRunNodeData, listRuns } from '../api/api'
import { extractOutputSample } from '../runs/run-samples'
import { assistEdgeMapping, isAssistTransform } from './assist'

// The edge (connection) face of the inspector: one schema-aware field mapper and its
// per-connection AI assist. Conditional topology belongs to the visible Condition step.
const props = defineProps<{
  workflowId: string
  edge: WfEdge
  edgeUpstreamSchema?: unknown
  edgeDownstreamSchema?: unknown
  sourceTitle?: string
  targetTitle?: string
}>()
const emit = defineEmits<{
  (e: 'update-edge', patch: Partial<WfEdge>): void
  (e: 'remove-edge'): void
}>()

// The mapping surface is the shared FieldMapper — two schema columns generating the one
// expr-lang grammar. Its AI action drafts the whole transform through the same edge-assist
// pipeline; that call needs enough time to complete the backend attempts,
// so its pending state is honest and long-lived, and a failure degrades to manual mapping.
type AssistState = { kind: 'loading' } | { kind: 'error'; message: string } | null
const transformModel = ref('')
const assistState = ref<AssistState>(null)
// Bumped so the mapper reseeds its rows from the transform after an AI draft replaces it.
const mapperReseed = ref(0)
let assistController: AbortController | null = null

function invalidateAssist() {
  assistController?.abort()
  assistController = null
  assistState.value = null
}

watch(() => props.edge?.id, () => {
  invalidateAssist()
  transformModel.value = props.edge?.transform || ''
  assistState.value = null
}, { immediate: true })
const edgeMapperKey = computed(() => `${props.edge?.id || ''}:${mapperReseed.value}`)

function onTransform(expr: string) {
  transformModel.value = expr
  emit('update-edge', { transform: expr })
}

// The upstream node's real output from the most recent run, so assist maps from concrete
// data rather than an absent schema (the common case for agent output). A read miss is a
// quiet null — the backend then falls back to schemas or returns its own run-once guidance.
async function latestUpstreamSample(sourceId: string): Promise<unknown | null> {
  try {
    const runs = await listRuns(props.workflowId, 5)
    for (const r of runs) {
      const rows = await getRunNodeData(props.workflowId, r.run_id, sourceId)
      const sample = extractOutputSample(rows)
      if (sample != null) return sample
    }
  } catch { /* no run data available */ }
  return null
}

async function runAssist() {
  if (!props.edge) return
  invalidateAssist()
  const controller = new AbortController()
  const edgeId = props.edge.id
  assistController = controller
  assistState.value = { kind: 'loading' }
  const upstreamSample = await latestUpstreamSample(props.edge.source_id)
  if (controller.signal.aborted || assistController !== controller || props.edge.id !== edgeId) return
  const res = await assistEdgeMapping(
    props.workflowId,
    { id: props.edge.id, source_id: props.edge.source_id, target_id: props.edge.target_id, transform: transformModel.value },
    props.edgeUpstreamSchema,
    props.edgeDownstreamSchema,
    upstreamSample != null ? { upstreamSample } : {},
    controller.signal,
  )
  if (controller.signal.aborted || assistController !== controller || props.edge.id !== edgeId) return
  assistController = null
  if (isAssistTransform(res)) {
    transformModel.value = res.transform
    emit('update-edge', { transform: res.transform })
    assistState.value = null
    mapperReseed.value++
  } else {
    assistState.value = { kind: 'error', message: res.error }
  }
}
function cancelAssist() {
  invalidateAssist()
}
onBeforeUnmount(invalidateAssist)
</script>

<template>
  <div class="wf-panel-hdr wf-panel-hdr--edge">
    <span class="wf-panel-hdr-kind">Connection</span>
  </div>
  <h3 class="wf-edge-route"><span class="wf-edge-route-name" :title="sourceTitle || 'Previous step'">{{ sourceTitle || 'Previous step' }}</span><Icon icon="tabler:arrow-right" aria-hidden="true" /><span class="wf-edge-route-name" :title="targetTitle || 'Next step'">{{ targetTitle || 'Next step' }}</span></h3>
  <p class="wf-panel-how">Choose what the next step receives. Matching fields are connected automatically.</p>

  <div class="wf-panel-label">Data</div>
  <FieldMapper
    :source-schema="edgeUpstreamSchema"
    :target-schema="edgeDownstreamSchema"
    source-root="output"
    :source-title="sourceTitle ? `From ${sourceTitle}` : 'From previous step'"
    :target-title="targetTitle ? `Into ${targetTitle}` : 'Into next step'"
    :model-value="transformModel"
    :reset-key="edgeMapperKey"
    show-assist
    simple
    :assist-pending="assistState?.kind === 'loading'"
    :assist-error="assistState?.kind === 'error' ? assistState.message : ''"
    @update:model-value="onTransform"
    @assist="runAssist"
    @cancel-assist="cancelAssist"
  />
  <p class="wf-panel-hint">Select a field on the left, then the field it should fill on the right. Matching names need no setup.</p>

  <div class="wf-panel-foot">
    <Button severity="danger" @click="emit('remove-edge')"><Icon icon="tabler:trash" aria-hidden="true" /><span>Delete connection</span></Button>
  </div>
</template>

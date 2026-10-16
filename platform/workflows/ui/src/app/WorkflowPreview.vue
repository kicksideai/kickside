<script setup lang="ts">
// The workspace preview for one workflow: the real graph, frozen. Same state
// fold, projection, and node renderers as the canvas — with every editing
// affordance off. Pan and zoom stay; the editor opens through the workspace's
// own Open action.
import { markRaw, ref, shallowRef, watch } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import type { EdgeTypesObject, NodeTypesObject } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Icon } from '@iconify/vue'
import { getState } from './api/defs'
import { docFromState } from './mapping/sync'
import { buildFlowData } from './canvas/graph-projection'
import { readableFitOptions } from './canvas/canvas-fit'
import WorkflowNode from './nodes/WorkflowNode.vue'
import NoteNode from './nodes/NoteNode.vue'
import FrameNode from './nodes/FrameNode.vue'
import ContainerNode from './nodes/ContainerNode.vue'
import MappingCompletenessEdge from './canvas/MappingCompletenessEdge.vue'

const props = defineProps<{ workflowId: string }>()

const nodeTypes = { wfNode: markRaw(WorkflowNode), wfNote: markRaw(NoteNode), wfFrame: markRaw(FrameNode), wfContainer: markRaw(ContainerNode) } as unknown as NodeTypesObject
const edgeTypes = { 'mapping-completeness': markRaw(MappingCompletenessEdge) } as unknown as EdgeTypesObject

const flowId = `wf-preview-${props.workflowId}`
const { fitView, onNodesInitialized } = useVueFlow(flowId)
onNodesInitialized(() => { void fitView(readableFitOptions(0)) })

const flowNodes = shallowRef<ReturnType<typeof buildFlowData>['flowNodes']>([])
const flowEdges = shallowRef<ReturnType<typeof buildFlowData>['flowEdges']>([])
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const doc = docFromState(await getState(props.workflowId))
    const built = buildFlowData(doc)
    flowNodes.value = built.flowNodes
    flowEdges.value = built.flowEdges
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'The workflow could not load.'
  } finally {
    loading.value = false
  }
}
watch(() => props.workflowId, load, { immediate: true })
</script>

<template>
  <div class="wfp">
    <div v-if="loading" class="wfp-state"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading workflow…</div>
    <div v-else-if="error" class="wfp-state wfp-error" role="alert">{{ error }}</div>
    <VueFlow
      v-else
      :id="flowId"
      :nodes="flowNodes"
      :edges="flowEdges"
      :node-types="nodeTypes"
      :edge-types="edgeTypes"
      :nodes-draggable="false"
      :nodes-connectable="false"
      :edges-updatable="false"
      :elements-selectable="false"
      :zoom-on-double-click="false"
      :delete-key-code="null"
      :min-zoom="0.1"
      :max-zoom="2"
      fit-view-on-init
      aria-label="Workflow graph preview"
      class="wfp-flow"
    >
      <Background pattern-color="var(--wf-dot)" :gap="20" :size="1.2" />
    </VueFlow>
  </div>
</template>

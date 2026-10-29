<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import WcMount from '@widgets/app/WcMount.vue'
import { primaryPicker, schemaFormFields } from '@widgets/app/ports'
import type { CatalogItem } from '../catalog/catalog'
import type { WfEdge, WfNode, WfNote } from '../types'
import FlowPicker from './FlowPicker.vue'
import RetryPolicyPanel from './RetryPolicyPanel.vue'
import SchemaEditor from './SchemaEditor.vue'
import { blockDefs, blockConfigSchema, blockConfigWc, hueClass, kindDef, isBoundaryKind, isToolBlock as isToolBlockRef, BOUNDARY_KINDS } from '../domain/node-policy'
import type { FlowCandidate } from '../nodes/flow-candidate'
import { isCombineKind } from '../nodes/combine-node'
import { isForEachKind } from '../nodes/for-each-node'
import { isFlowKind } from '../domain/node-policy'
import { FLOW_HINT } from '../nodes/logic-copy'
import LogicNodePanel from './LogicNodePanel.vue'
import EdgePanel from './EdgePanel.vue'
import NotePanel from './NotePanel.vue'
import ConfigAssist from './ConfigAssist.vue'
import { humanTitle } from '../domain/labels'
import { configRowFromSchema } from './ext-config'

// The right inspector — a thin dispatcher. Each surface opens with one plain "how this
// works" sentence.
//
//  * A node shows a hue-accented kind header, an editable title, a read-only identity
//    row and a per-kind body: boundary nodes edit their interface schema, Blocks render
//    their declaration-owned config schema, and structural nodes expose owned controls.
//  * An edge shows its when-condition + transform mapping and a per-connection assist
//    chip (EdgePanel).
//  * A note shows its text (NotePanel).
const props = defineProps<{
  workflowId: string
  node: WfNode | null
  edge: WfEdge | null
  note: WfNote | null
  catalog: CatalogItem[]
  edgeUpstreamSchema?: unknown
  edgeDownstreamSchema?: unknown
  edgeSourceTitle?: string
  edgeTargetTitle?: string
  nodeUpstreamSchema?: unknown
  // The Branch title whose exclusive true/false arms are this combine's only inputs,
  // or null. Computed on the canvas (it needs the whole graph); drives the wait-all
  // guard-rail hint.
  combineBranchConflict?: string | null
}>()
const emit = defineEmits<{
  (e: 'update-node', patch: Partial<WfNode>): void
  (e: 'remove-node'): void
  (e: 'update-edge', patch: Partial<WfEdge>): void
  (e: 'remove-edge'): void
  (e: 'update-note', patch: Partial<WfNote>): void
  (e: 'remove-note'): void
  (e: 'close'): void
}>()

const SCHEMA_FORM_TAG = 'wc-schema-form'

const def = computed(() => (props.node ? kindDef(props.node.kind, props.node.ref) : null))
const nodeConfig = ref<Record<string, unknown>>({})
watch(() => [props.node?.id, props.node?.config], () => {
  nodeConfig.value = { ...props.node?.config }
}, { immediate: true, flush: 'sync' })
function commitConfig(config: Record<string, unknown>) {
  nodeConfig.value = config
  emit('update-node', { config })
}

const isBlock = computed(() => props.node?.kind === 'block' && !!props.node.ref)
const execution = computed(() => props.node?.ref ? blockDefs[props.node.ref]?.execution : undefined)
const supportsRetries = computed(() => isBlock.value && ['function', 'tool'].includes(execution.value?.kind || ''))
const isToolBlock = computed(() => isBlock.value && isToolBlockRef(props.node?.ref))

const extConfigRow = computed(() => {
  if (!props.node || !isBlock.value) return null
  return configRowFromSchema(blockConfigSchema(props.node.ref))
})
const blockWc = computed(() => props.node && isBlock.value ? blockConfigWc(props.node.ref) : undefined)
const extPicker = computed(() => primaryPicker(extConfigRow.value, 'workflow-extension-node'))
const extFormSchema = computed(() => schemaFormFields(extConfigRow.value, 'workflow-extension-node'))
const extFormKeys = computed(() => {
  const properties = extFormSchema.value && typeof extFormSchema.value === 'object'
    ? (extFormSchema.value as Record<string, unknown>).properties
    : null
  return properties && typeof properties === 'object' && !Array.isArray(properties)
    ? Object.keys(properties as Record<string, unknown>)
    : []
})
const extAssistConfig = computed<Record<string, unknown>>(() => Object.fromEntries(
  extFormKeys.value
    .filter((key) => nodeConfig.value[key] !== undefined)
    .map((key) => [key, nodeConfig.value[key]]),
))

// ── Boundary node (Start / Finish / Error): the workflow interface contract ──
// Each edits exactly one schema, stored on the node's config under its schema key
// (input_schema / output_schema / error_schema). This inspector is the ONE place a
// workflow's interface is declared — there is no separate schema-metadata editor.
const isBoundary = computed(() => !!props.node && isBoundaryKind(props.node.kind))
const isPinned = computed(() => !!props.node && (isBoundary.value || props.node.pinned === true || !!props.node.boundary))
const boundarySchemaKey = computed(() => (props.node && isBoundary.value ? BOUNDARY_KINDS[props.node.kind] : ''))
const boundarySchema = computed<Record<string, unknown>>(() => {
  const cur = nodeConfig.value[boundarySchemaKey.value]
  return cur && typeof cur === 'object' && !Array.isArray(cur)
    ? cur as Record<string, unknown>
    : { type: 'object', properties: {} }
})
// The label per boundary face — shared by the editable schema editor and the locked
// field-list presentation.
const boundaryLabel = computed(() =>
  props.node?.kind === 'start' ? 'Expected input' : props.node?.kind === 'finish' ? 'Result' : 'Error details')
function commitBoundarySchema(value: Record<string, unknown>) {
  // Only the editable editor commits; a locked boundary presents its contract read-only
  if (!boundarySchemaKey.value) return
  commitConfig({ ...nodeConfig.value, [boundarySchemaKey.value]: value })
}

function onConfigChange(detail: unknown) {
  if (!props.node || !detail || typeof detail !== 'object' || Array.isArray(detail)) return
  commitConfig({ ...nodeConfig.value, ...(detail as Record<string, unknown>) })
}

function onPickerChange(detail: unknown) {
  if (!extPicker.value || !detail || typeof detail !== 'object' || Array.isArray(detail)) return
  const key = extPicker.value.key
  if (key in detail) commitConfig({ ...nodeConfig.value, [key]: (detail as Record<string, unknown>)[key] })
}

function replaceExtFormConfig(config: Record<string, unknown>) {
  if (!props.node) return
  const next = { ...nodeConfig.value }
  for (const key of extFormKeys.value) delete next[key]
  Object.assign(next, config)
  commitConfig(next)
}

const selectedFlowId = computed(() => {
  const ref = nodeConfig.value.flow_ref
  return ref && typeof ref === 'object' && !Array.isArray(ref)
    ? String((ref as Record<string, unknown>).id || props.node?.ref || '')
    : String(props.node?.ref || '')
})

function onFlowSelect(candidate: FlowCandidate) {
  if (!props.node) return
  emit('update-node', {
    title: candidate.title,
    config: {
      flow_ref: {
        kind: 'flow',
        id: candidate.id,
        version: candidate.published_version,
      },
    },
  })
}

// The logic blocks (Branch / Loop / Wait for / For-each / Combine) share one body,
// LogicNodePanel; this guards which node kinds dispatch to it.
const isLogicKind = computed(() => {
  const k = props.node?.kind
  return k === 'branch' || k === 'cycle' || isForEachKind(k) || isCombineKind(k)
})

// ── Inline title editing (title is a label, not identity) ──
const titleDraft = ref('')
watch(() => props.node?.id, () => { titleDraft.value = humanTitle(props.node?.title, props.node?.ref) }, { immediate: true })
function commitTitle() {
  const t = titleDraft.value.trim()
  if (props.node && t && t !== props.node.title) emit('update-node', { title: t })
}
</script>

<template>
  <aside class="wf-panel">
    <Button class="wf-panel-close" text rounded severity="secondary" title="Close" aria-label="Close inspector" @click="emit('close')"><Icon icon="tabler:x" aria-hidden="true" /></Button>

    <!-- Node -->
    <template v-if="node && def">
      <div class="wf-panel-hdr" :class="hueClass(def.hueVar)">
        <span class="wf-panel-hdr-dot"></span>
        <span class="wf-panel-hdr-kind">{{ def.label }}</span>
      </div>
      <InputText v-model="titleDraft" class="wf-panel-title-input" aria-label="Step title" @change="commitTitle" @keydown.enter="commitTitle" />
      <p class="wf-panel-how">{{ def.blurb }}</p>

      <!-- Boundary node: edit the one schema that forms this face of the workflow's
           interface. This is the sole place an interface is declared. -->
      <template v-if="isBoundary">
        <div class="wf-boundary-tag"><Icon icon="tabler:lock" aria-hidden="true" /><span>Workflow boundary · can’t be removed</span></div>
        <SchemaEditor
          mode="schema"
          :model-value="boundarySchema"
          :reset-key="node.id"
          :surface="`workflow.boundary.${node.kind}`"
          :label="boundaryLabel"
          @change="commitBoundarySchema"
        />
        <p class="wf-panel-hint">
          {{ node.kind === 'start'
              ? 'Describe what someone provides when this Workflow starts.'
              : node.kind === 'finish'
                ? 'Describe what a successful run returns.'
                : 'Describe what a failed run returns.' }}
        </p>
      </template>

      <!-- Block configuration comes from the canonical Block descriptor. -->
      <template v-if="isBlock">
        <template v-if="blockWc">
          <div class="wf-panel-label">Configuration</div>
          <WcMount :tag="blockWc" :schema="blockConfigSchema(node.ref)" :config="nodeConfig" @change="onConfigChange" />
        </template>
        <template v-else-if="extPicker">
          <div class="wf-panel-label">{{ isToolBlock ? 'Fixed input overrides' : (extPicker.title || 'Configuration') }}</div>
          <p v-if="isToolBlock" class="wf-panel-hint">
            Optional fixed values override matching inputs from the connection. Leave them empty to use incoming data.
          </p>
          <WcMount :tag="extPicker.tag" :schema="extPicker.schema" :config="nodeConfig" :attrs="{ value: nodeConfig }" @change="onPickerChange" />
        </template>
        <template v-if="!blockWc && extFormSchema">
          <div v-if="!extPicker" class="wf-panel-label">{{ isToolBlock ? 'Fixed input overrides' : 'Configuration' }}</div>
          <p v-if="isToolBlock && !extPicker" class="wf-panel-hint">
            Optional fixed values override matching inputs from the connection. Leave them empty to use incoming data.
          </p>
          <ConfigAssist
            :workflow-id="workflowId"
            :reset-key="node.id"
            :config-schema="extFormSchema as Record<string, unknown>"
            :current-config="extAssistConfig"
            :upstream-schema="nodeUpstreamSchema"
            @accept="replaceExtFormConfig"
            @undo="replaceExtFormConfig"
          />
          <WcMount :tag="SCHEMA_FORM_TAG" :schema="extFormSchema" :config="nodeConfig" @change="onConfigChange" />
        </template>
      </template>

      <RetryPolicyPanel v-if="node && supportsRetries && execution" :key="node.id" :node="node" :execution="execution" @update-node="(p) => emit('update-node', p)" />

      <!-- Workflow composition: a workflow-aware picker, not the generic component picker. -->
      <template v-if="isFlowKind(node.kind)">
        <div class="wf-panel-label">Workflow</div>
        <FlowPicker
          :workflow-id="props.workflowId"
          :selected-id="selectedFlowId"
          :upstream-schema="props.nodeUpstreamSchema"
          @select="onFlowSelect"
        />
        <p class="wf-panel-hint">{{ FLOW_HINT }}</p>
      </template>

      <!-- Logic blocks: engine-honest, plain-language controls. -->
      <LogicNodePanel
        v-if="isLogicKind"
        :workflow-id="workflowId"
        :node="node"
        :upstream-schema="nodeUpstreamSchema"
        :combine-branch-conflict="combineBranchConflict"
        @update-node="(p) => emit('update-node', p)"
      />

      <div v-if="isPinned" class="wf-panel-foot">
        <p class="wf-panel-hint wf-panel-pinned-note"><Icon icon="tabler:lock" aria-hidden="true" /><span>This step is required and can’t be deleted.</span></p>
      </div>
      <div v-else class="wf-panel-foot">
        <Button severity="danger" @click="emit('remove-node')"><Icon icon="tabler:trash" aria-hidden="true" /><span>Delete step</span></Button>
      </div>
    </template>

    <!-- Edge -->
    <EdgePanel
      v-else-if="edge"
      :workflow-id="props.workflowId"
      :edge="edge"
      :edge-upstream-schema="edgeUpstreamSchema"
      :edge-downstream-schema="edgeDownstreamSchema"
      :source-title="edgeSourceTitle"
      :target-title="edgeTargetTitle"
      @update-edge="(p) => emit('update-edge', p)"
      @remove-edge="emit('remove-edge')"
    />

    <!-- Note / frame -->
    <NotePanel
      v-else-if="note"
      :note="note"
      @update-note="(p) => emit('update-note', p)"
      @remove-note="emit('remove-note')"
    />
  </aside>
</template>

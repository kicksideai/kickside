<script setup lang="ts">
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import type { WfNode } from '../types'
import { branchConfigPatch, readBranchPredicate } from '../nodes/branch-node'
import { combineExclusiveWarning, combineNodePatch, isCombineKind, readCombineMode, readCombineOutputMode, type CombineMode, type CombineOutputMode } from '../nodes/combine-node'
import { forEachNodePatch, isForEachKind, readForEach } from '../nodes/for-each-node'
import { FOR_EACH_BATCH_HINT, FOR_EACH_CONTINUE_OFF_HINT, FOR_EACH_CONTINUE_ON_HINT, FOR_EACH_USE_HINT, LOOP_CONDITION_HINT, LOOP_MAX_ITER_HINT } from '../nodes/logic-copy'
import ConfigAssist from './ConfigAssist.vue'
import PredicateComposer from './PredicateComposer.vue'
import { predicateFields } from './predicate-authoring'

// The logic-block face of the inspector, extracted from NodeConfigPanel: the engine-honest
// single-purpose controls for Branch, Loop, For-each and Combine. Each opens with
// a "when to use it" cue on top of the kind's how-it-works blurb the parent renders above.
const props = defineProps<{
  workflowId: string
  node: WfNode
  upstreamSchema?: unknown
  // The Branch title whose exclusive true/false arms are this combine's only inputs,
  // or null. Computed on the canvas (it needs the whole graph); drives the wait-all
  // guard-rail hint.
  combineBranchConflict?: string | null
}>()
const emit = defineEmits<{
  (e: 'update-node', patch: Partial<WfNode>): void
}>()

const nodeConfig = computed(() => (props.node?.config as Record<string, unknown>) || {})
// ── Branch: the on-node predicate the compiler routes true/false from ──
const branchPredicate = ref('')
watch(() => props.node?.id, () => {
  if (props.node?.kind !== 'branch') return
  branchPredicate.value = readBranchPredicate(nodeConfig.value)
}, { immediate: true })
function commitBranch() {
  emit('update-node', { config: branchConfigPatch(nodeConfig.value, branchPredicate.value) })
}
function setBranchPredicate(value: string) {
  branchPredicate.value = value
  commitBranch()
}
function acceptBranchAssist(config: Record<string, unknown>) {
  setBranchPredicate(typeof config.predicate === 'string' ? config.predicate : '')
}

// ── Loop: engine-honest single-field config ──
const loopCondition = ref('')
const loopMaxIterations = ref(0)
watch(() => props.node?.id, () => {
  loopCondition.value = String(nodeConfig.value.continue_condition || '')
  const maxIter = Number(nodeConfig.value.max_iterations)
  loopMaxIterations.value = Number.isFinite(maxIter) && maxIter > 0 ? maxIter : 0
}, { immediate: true })
function commitLoop() {
  const config: Record<string, unknown> = { ...nodeConfig.value, continue_condition: loopCondition.value.trim() }
  if (loopMaxIterations.value > 0) config.max_iterations = Math.round(loopMaxIterations.value)
  else delete config.max_iterations
  emit('update-node', { config })
}
function setLoopMaxIterations(nextValue: number | null) {
  const value = Number(nextValue)
  loopMaxIterations.value = Number.isFinite(value) ? value : 0
  commitLoop()
}
function setLoopCondition(value: string) {
  loopCondition.value = value
  commitLoop()
}

// ── For-each: fan out over an array, engine-honest fields ──
// For-each commits its source, batch, and error policy as one canonical shape.
const forEachSourceKey = ref('')
const forEachBatchSize = ref(8)
const forEachContinueOnError = ref(false)
const upstreamArrayFields = computed(() => predicateFields(props.upstreamSchema, true))
const forEachFailureOptions = [
  { label: 'Stop — fail this step at the first failed item', value: false },
  { label: 'Continue — attempt every item, collect each result or error', value: true },
]
watch(() => props.node?.id, () => {
  if (!isForEachKind(props.node?.kind)) return
  const cfg = readForEach(props.node?.kind, nodeConfig.value)
  forEachSourceKey.value = cfg.sourceKey
  forEachBatchSize.value = cfg.batchSize
  forEachContinueOnError.value = cfg.continueOnError
}, { immediate: true })
function commitForEach() {
  emit('update-node', forEachNodePatch(nodeConfig.value, {
    sourceKey: forEachSourceKey.value,
    batchSize: forEachBatchSize.value,
    continueOnError: forEachContinueOnError.value,
  }))
}
function setForEachSourceKey(value: string | null) {
  forEachSourceKey.value = value || ''
  commitForEach()
}
function setForEachContinueOnError(value: boolean) {
  forEachContinueOnError.value = value
  commitForEach()
}
function setForEachBatchSize(nextValue: number | null) {
  const value = Number(nextValue)
  forEachBatchSize.value = Math.max(1, Math.round(Number.isFinite(value) ? value : 1))
  commitForEach()
}

// ── Combine: wait for every path (wait_all) or continue on the first (first_wins) ──
// Combine commits its convergence and output modes as one canonical shape.
const combineMode = ref<CombineMode>('wait_all')
const combineOutputMode = ref<CombineOutputMode>('object')
const combineModeOptions: Array<{ label: string; value: CombineMode }> = [
  { label: 'Wait for all — every incoming path must finish first', value: 'wait_all' },
  { label: 'First wins — continue as soon as one path arrives', value: 'first_wins' },
]
const combineOutputOptions: Array<{ label: string; value: CombineOutputMode }> = [
  { label: 'Object — merge each path’s output by key', value: 'object' },
  { label: 'Array — collect each path’s output as a list', value: 'array' },
]
watch(() => props.node?.id, () => {
  if (!isCombineKind(props.node?.kind)) return
  combineMode.value = readCombineMode(props.node?.kind, nodeConfig.value)
  combineOutputMode.value = readCombineOutputMode(nodeConfig.value)
}, { immediate: true })
const combineWaitAllConflict = computed(() =>
  combineMode.value === 'wait_all' && !!props.combineBranchConflict
    ? combineExclusiveWarning(props.combineBranchConflict as string)
    : '',
)
function commitCombine() {
  emit('update-node', combineNodePatch(nodeConfig.value, combineMode.value, combineOutputMode.value))
}
function setCombineMode(value: CombineMode | null) {
  if (!value) return
  combineMode.value = value
  commitCombine()
}
function setCombineOutputMode(value: CombineOutputMode | null) {
  if (!value) return
  combineOutputMode.value = value
  commitCombine()
}
</script>

<template>
  <template v-if="node.kind === 'branch'">
    <p class="wf-panel-hint">Set the condition, then connect <strong>True</strong> and <strong>False</strong> to the steps that should run. Exactly one path runs.</p>
    <div class="wf-panel-label">Condition</div>
    <PredicateComposer :model-value="branchPredicate" :schema="upstreamSchema" @update:model-value="setBranchPredicate" />
    <ConfigAssist
      :workflow-id="workflowId"
      :reset-key="node.id"
      :current-config="{ predicate: branchPredicate }"
      :upstream-schema="upstreamSchema"
      @accept="acceptBranchAssist"
      @undo="acceptBranchAssist"
    />
    <div class="wf-branch-outcomes" aria-label="Condition outcomes">
      <p><strong>True</strong><span>runs when the condition matches</span></p>
      <p><strong>False</strong><span>runs when it does not</span></p>
    </div>
  </template>
  <template v-else-if="node.kind === 'cycle'">
    <p class="wf-panel-hint">Use it when one step needs to run more than once — retrying a bounded operation or working through repeated passes — until the condition below stops holding. Wire the repeated steps from the <strong>each pass</strong> port; the <strong>when done</strong> port continues after the loop.</p>
    <div class="wf-panel-label">Repeat while</div>
    <PredicateComposer :model-value="loopCondition" :schema="upstreamSchema" root="input" label="Repeat while" @update:model-value="setLoopCondition" />
    <p class="wf-panel-hint">{{ LOOP_CONDITION_HINT }}</p>
    <div class="wf-panel-label">Max iterations</div>
    <InputNumber
      :model-value="loopMaxIterations"
      :min="0"
      :use-grouping="false"
      class="wf-input"
      placeholder="8"
      aria-label="Max iterations"
      @update:model-value="setLoopMaxIterations"
    />
    <p class="wf-panel-hint">{{ LOOP_MAX_ITER_HINT }}</p>
  </template>
  <template v-else-if="isForEachKind(node.kind)">
    <p class="wf-panel-hint">{{ FOR_EACH_USE_HINT }}</p>
    <div class="wf-panel-label">Items to iterate</div>
    <Select
      v-if="upstreamArrayFields.length"
      :model-value="forEachSourceKey || null"
      :options="upstreamArrayFields"
      option-label="label"
      option-value="path"
      class="wf-input"
      placeholder="Choose an array field…"
      aria-label="Items to iterate"
      @update:model-value="setForEachSourceKey"
    />
    <InputText v-else v-model="forEachSourceKey" class="wf-input wf-mono" placeholder="items" aria-label="Source array key" @change="commitForEach" />
    <p class="wf-panel-hint">The upstream field holding the array to fan out over — one run of the body per item.</p>
    <div class="wf-panel-label">Batch size</div>
    <InputNumber
      :model-value="forEachBatchSize"
      :min="1"
      :use-grouping="false"
      class="wf-input"
      aria-label="Batch size"
      @update:model-value="setForEachBatchSize"
    />
    <p class="wf-panel-hint">{{ FOR_EACH_BATCH_HINT }}</p>
    <div class="wf-panel-label">If an item fails</div>
    <Select
      :model-value="forEachContinueOnError"
      :options="forEachFailureOptions"
      option-label="label"
      option-value="value"
      class="wf-input"
      aria-label="If an item fails"
      @update:model-value="setForEachContinueOnError"
    />
    <p class="wf-panel-hint">{{ forEachContinueOnError ? FOR_EACH_CONTINUE_ON_HINT : FOR_EACH_CONTINUE_OFF_HINT }}</p>
  </template>
  <template v-else-if="isCombineKind(node.kind)">
    <p class="wf-panel-hint">Use it to bring several paths back into one. Choose below whether it waits for every path to finish or continues on the first to arrive.</p>
    <div class="wf-panel-label">When to continue</div>
    <Select
      :model-value="combineMode"
      :options="combineModeOptions"
      option-label="label"
      option-value="value"
      class="wf-input"
      aria-label="When to continue"
      @update:model-value="setCombineMode"
    />
    <p class="wf-panel-hint">{{ combineMode === 'wait_all'
      ? 'Waits for every incoming path to finish, then continues once. Use it when parallel work must all complete before the next step.'
      : 'Continues the moment the first path arrives, without waiting for the rest. Use it to bring Condition paths back together, where only one ever runs.' }}</p>
    <p v-if="combineWaitAllConflict" class="wf-panel-hint wf-panel-hint--warn"><Icon icon="tabler:alert-triangle" aria-hidden="true" /> {{ combineWaitAllConflict }}</p>
    <div class="wf-panel-label">Combine as</div>
    <Select
      :model-value="combineOutputMode"
      :options="combineOutputOptions"
      option-label="label"
      option-value="value"
      class="wf-input"
      aria-label="Combine as"
      @update:model-value="setCombineOutputMode"
    />
    <p class="wf-panel-hint">How the arriving outputs are shaped before they continue.</p>
  </template>
</template>

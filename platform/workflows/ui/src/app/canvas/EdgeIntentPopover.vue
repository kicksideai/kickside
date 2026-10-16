<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { parseObjectExpression } from '@widgets/app/field-mapper'
import { assistEdgeIntent, isEdgeIntentPreview, type AvailableStep, type EdgeIntentPreview } from '../panels/assist'
import type { PendingEdge } from './canvas-connect'
import { useOverlayMeasure, type OverlayMeasure } from './use-overlay-measure'
import {
  INTENT_PROMPT, INTENT_PLACEHOLDER, INTENT_HELP, INTENT_SUBMIT, INTENT_DRAFTING,
  PREVIEW_TITLE, PREVIEW_ACCEPT, PREVIEW_OPEN_MAPPER, PREVIEW_RETRY,
  INTENT_DISMISS, INTENT_DEGRADE, INTENT_DISMISS_HINT,
} from './intent-copy'

// The intent popover (W11.1): anchored at an ambiguous edge's midpoint, it asks in one line
// what should happen across the edge, previews one declared action, and only applies after
// acceptance. Mapping uses the one expr-lang grammar; topology lowers onto visible Condition
// and Failed-port vocabulary. Dismiss leaves the edge connected and loud. This remains
// custom because its anchor is a VueFlow edge midpoint expressed in live screen coordinates;
// PrimeVue overlay targets cannot represent that virtual point while the canvas pans or zooms.

const props = defineProps<{ workflowId: string; edge: PendingEdge; availableSteps: AvailableStep[] }>()
const emit = defineEmits<{
  (e: 'accept', preview: EdgeIntentPreview): void
  (e: 'suggest-node', kind: string): void
  (e: 'open-mapper'): void
  (e: 'dismiss'): void
  (e: 'measure', measure: OverlayMeasure): void
}>()
const { overlayEl } = useOverlayMeasure((measure) => emit('measure', measure))

type Phase = 'intent' | 'drafting' | 'preview' | 'error'
const phase = ref<Phase>('intent')
const intent = ref('')
const preview = ref<EdgeIntentPreview | null>(null)
const errorMsg = ref('')
const inputEl = ref<{ $el?: HTMLElement } | null>(null)
let assistController: AbortController | null = null

function focusIntentInput() {
  const element = inputEl.value?.$el
  if (element instanceof HTMLInputElement) element.focus()
}

onMounted(() => nextTick(focusIntentInput))

function resetForEdge() {
  assistController?.abort()
  assistController = null
  phase.value = 'intent'
  intent.value = ''
  preview.value = null
  errorMsg.value = ''
  nextTick(focusIntentInput)
}

watch(() => props.edge.id, resetForEdge)
onBeforeUnmount(() => assistController?.abort())

// The required fields this edge still can't fill on its own — named so the ask is concrete.
const needs = computed(() => props.edge.unresolved.map((u) => u.title).filter(Boolean))

// The drafted transform as compact preview rows. A flat object literal decomposes into
// key ← source pairs; anything more complex is shown verbatim as one expression.
const previewRows = computed(() => {
  const transform = preview.value?.kind === 'mapping' ? preview.value.transform : ''
  const pairs = parseObjectExpression(transform)
  return pairs && pairs.length ? pairs : null
})

const previewTitle = computed(() => {
  if (preview.value?.kind === 'condition') return 'Add a Condition?'
  if (preview.value?.kind === 'failure_route') return 'Use the Failed route?'
  if (preview.value?.kind === 'insert_node') return 'Suggested step'
  return PREVIEW_TITLE
})
const previewIcon = computed(() => {
  if (preview.value?.kind === 'condition') return 'tabler:arrows-split-2'
  if (preview.value?.kind === 'failure_route') return 'tabler:route-x-2'
  if (preview.value?.kind === 'insert_node') return 'tabler:box-padding'
  return 'tabler:sparkles'
})
const acceptLabel = computed(() => {
  if (preview.value?.kind === 'condition') return 'Add Condition'
  if (preview.value?.kind === 'failure_route') return 'Use Failed route'
  if (preview.value?.kind === 'insert_node') return 'Show in palette'
  return PREVIEW_ACCEPT
})

async function runDraft() {
  const text = intent.value.trim()
  if (!text || phase.value === 'drafting') return
  assistController?.abort()
  const controller = new AbortController()
  const edgeId = props.edge.id
  assistController = controller
  phase.value = 'drafting'
  errorMsg.value = ''
  const res = await assistEdgeIntent(
    props.workflowId,
    { id: props.edge.id, source_id: props.edge.sourceId, target_id: props.edge.targetId },
    props.edge.sourceSchema,
    props.edge.targetSchema,
    text,
    props.edge.sourceFailureAvailable,
    props.availableSteps,
    {},
    controller.signal,
  )
  if (controller.signal.aborted || assistController !== controller || props.edge.id !== edgeId) return
  assistController = null
  if (isEdgeIntentPreview(res)) {
    preview.value = res
    phase.value = 'preview'
  } else {
    errorMsg.value = res.error || INTENT_DEGRADE
    phase.value = 'error'
  }
}
function accept() {
  const value = preview.value
  if (!value) return
  if (value.kind === 'insert_node') emit('suggest-node', value.block_id)
  else if (value.kind !== 'failure_route' || value.available) emit('accept', value)
}
function backToIntent() {
  phase.value = 'intent'
  nextTick(focusIntentInput)
}
</script>

<template>
  <div ref="overlayEl" class="wf-intent" role="region" aria-label="Describe this connection" @keydown.esc.stop.prevent="emit('dismiss')" @pointerdown.stop>
    <Button class="wf-intent-x" text rounded severity="secondary" aria-label="Dismiss" :title="INTENT_DISMISS" @click="emit('dismiss')"><Icon icon="tabler:x" aria-hidden="true" /></Button>

    <!-- Ask -->
    <template v-if="phase === 'intent' || phase === 'drafting'">
      <div class="wf-intent-hd"><Icon icon="tabler:wand" aria-hidden="true" /><span>{{ INTENT_PROMPT }}</span></div>
      <p v-if="needs.length" class="wf-intent-needs">Needs <strong>{{ needs.join(', ') }}</strong>.</p>
      <InputText
        ref="inputEl"
        v-model="intent"
        class="wf-intent-input"
        :placeholder="INTENT_PLACEHOLDER"
        :disabled="phase === 'drafting'"
        aria-label="What should flow across this connection"
        @keydown.enter.prevent="runDraft"
      />
      <p v-if="phase === 'drafting'" class="wf-intent-note"><ProgressSpinner class="wf-status-spinner" stroke-width="4" aria-label="Drafting connection" /> {{ INTENT_DRAFTING }}</p>
      <p v-else class="wf-intent-help">{{ INTENT_HELP }}</p>
      <div class="wf-intent-foot">
        <Button severity="secondary" outlined @click="emit('dismiss')">{{ INTENT_DISMISS }}</Button>
        <Button class="wf-intent-submit" :disabled="!intent.trim() || phase === 'drafting'" :loading="phase === 'drafting'" @click="runDraft">
          <Icon v-if="phase !== 'drafting'" icon="tabler:sparkles" aria-hidden="true" />
          <span>{{ INTENT_SUBMIT }}</span>
        </Button>
      </div>
    </template>

    <!-- Preview -->
    <template v-else-if="phase === 'preview'">
      <div class="wf-intent-hd"><Icon :icon="previewIcon" aria-hidden="true" /><span>{{ previewTitle }}</span></div>
      <p v-if="preview?.summary" class="wf-intent-summary">{{ preview.summary }}</p>
      <div v-if="preview?.kind === 'mapping'" class="wf-intent-rows">
        <template v-if="previewRows && previewRows.length">
          <div v-for="p in previewRows" :key="p.key" class="wf-intent-row">
            <code class="wf-intent-src">{{ p.rhs }}</code>
            <Icon icon="tabler:arrow-right" aria-hidden="true" />
            <code class="wf-intent-tgt">{{ p.key }}</code>
          </div>
        </template>
        <code v-else class="wf-intent-raw">{{ preview.transform }}</code>
      </div>
      <div v-else-if="preview?.kind === 'condition'" class="wf-intent-topology">
        <span class="wf-intent-step"><Icon icon="tabler:arrows-split-2" aria-hidden="true" />Condition</span>
        <code class="wf-intent-raw">{{ preview.predicate }}</code>
        <p class="wf-intent-help">The current connection becomes the True path. The False path stays visible for you to connect.</p>
      </div>
      <div v-else-if="preview?.kind === 'failure_route'" class="wf-intent-topology">
        <span class="wf-intent-step" :class="!preview.available && 'is-unavailable'"><Icon icon="tabler:route-x-2" aria-hidden="true" />Failed</span>
        <Message v-if="!preview.available" class="wf-intent-err" severity="warn" :closable="false">This step has no Failed output to connect.</Message>
      </div>
      <div v-else-if="preview?.kind === 'insert_node'" class="wf-intent-topology">
        <span class="wf-intent-step"><Icon icon="tabler:box-padding" aria-hidden="true" />{{ preview.block_title }}</span>
        <p class="wf-intent-help">This is an existing Workflow step. Choose it from the palette before the graph changes.</p>
      </div>
      <div class="wf-intent-foot">
        <Button severity="secondary" outlined @click="backToIntent">{{ PREVIEW_RETRY }}</Button>
        <Button v-if="preview?.kind === 'mapping'" severity="secondary" outlined @click="emit('open-mapper')">{{ PREVIEW_OPEN_MAPPER }}</Button>
        <Button class="wf-intent-submit" :disabled="preview?.kind === 'failure_route' && !preview.available" @click="accept"><Icon icon="tabler:check" aria-hidden="true" /><span>{{ acceptLabel }}</span></Button>
      </div>
    </template>

    <!-- Honest degrade -->
    <template v-else>
      <div class="wf-intent-hd wf-intent-hd--err"><Icon icon="tabler:alert-triangle" aria-hidden="true" /><span>Couldn’t draft that</span></div>
      <Message class="wf-intent-err" severity="error" :closable="false">{{ errorMsg || INTENT_DEGRADE }}</Message>
      <InputText
        ref="inputEl"
        v-model="intent"
        class="wf-intent-input"
        :placeholder="INTENT_PLACEHOLDER"
        aria-label="What should flow across this connection"
        @keydown.enter.prevent="runDraft"
      />
      <p class="wf-intent-help">{{ INTENT_DISMISS_HINT }}</p>
      <div class="wf-intent-foot">
        <Button severity="secondary" outlined @click="emit('open-mapper')">{{ PREVIEW_OPEN_MAPPER }}</Button>
        <Button class="wf-intent-submit" :disabled="!intent.trim()" @click="runDraft">
          <Icon icon="tabler:refresh" aria-hidden="true" /><span>{{ PREVIEW_RETRY }}</span>
        </Button>
      </div>
    </template>
  </div>
</template>

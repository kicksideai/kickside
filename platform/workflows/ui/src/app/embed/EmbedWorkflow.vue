<script setup lang="ts">
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Tag from 'primevue/tag'
import { computed, defineAsyncComponent, onBeforeUnmount, ref, watch } from 'vue'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import { on } from '@wippy-fe/proxy'
import { Icon } from '@iconify/vue'
import { schemaHasProps } from '@widgets/app/ports'
import RunPayload from '../runs/RunPayload.vue'

// The Start-schema input editor (and the schema-form widget it mounts) load only when a form
// is actually shown — the picker, dispatch, and result paths never pull that machinery.
const SchemaEditor = defineAsyncComponent(() => import('../panels/SchemaEditor.vue'))
import EmbedWorkflowPicker from './EmbedWorkflowPicker.vue'
import { getRun, humanError, launchRun, listWorkflows, type RunRow } from '../api/api'
import { analyzeFlowCandidate, type FlowCandidate } from '../nodes/flow-candidate'
import { httpStatus } from '../api/http-error'
import { readEmbedProps } from './embed-props'
import { inputGate, runView, type RunView } from './embed-run'
import { isWorkflowRunUpdate } from '../runs/run-overlay'

// <kickside-workflow-embed> — the workflows-owned Face-4 artifact any module mounts by tag
// to run a PUBLISHED workflow in place, instead of hand-rolling runner calls. It resolves
// the workflow's Start schema, validates the payload client-side, launches through the one
// run door the builder uses, and follows its canonical thread lifecycle relay to render the
// Finish output or an honest failure reason. Never lists or runs drafts.

interface RawProps { [key: string]: unknown }
const props = useProps<RawProps>()
const emit = useEvents<{ navigate: { route: string } }>()
const config = computed(() => readEmbedProps(props.value))

// ── State ───────────────────────────────────────────────────────────────────
type Phase = 'ready' | 'running' | 'dispatched' | 'completed' | 'failed'
const selected = ref<FlowCandidate | null>(null)
const resolving = ref(false)
const resolveError = ref('')
const inputValue = ref<Record<string, unknown>>({})
const inputResetKey = ref(0)
const jsonValid = ref(true)
const phase = ref<Phase>('ready')
const launching = ref(false)
const runId = ref('')
const runError = ref('')
const view = ref<RunView | null>(null)

let runEventsOff: (() => void) | null = null
let visibilityOff: (() => void) | null = null
let refreshInFlight = false

// ── Derived ─────────────────────────────────────────────────────────────────
const editorHref = computed(() => (selected.value ? `/workflows/${selected.value.id}` : ''))
// A bare anchor to /workflows/<id> leaves the app shell (views serve under
// /c/<view>/…) and renders blank. Keep the href for accessibility, but route the
// click through the shell's navigate channel so it resolves the canonical route in place.
function openEditor() {
  if (selected.value) emit('navigate', { route: `/workflows/${selected.value.id}` })
}
const inputSchema = computed(() => selected.value?.input_schema)
const startHasFields = computed(() => schemaHasProps(inputSchema.value))
// A host-supplied `input` prop is honored as pre-mapped: the form is replaced by a read-only
// preview so the embed runs exactly what the host mapped, still gated against the schema.
const hasPinnedInput = computed(() => config.value.input !== null)
const gate = computed(() => inputGate(inputValue.value, inputSchema.value))
const canRun = computed(() => phase.value === 'ready' && !launching.value && !config.value.inputError && jsonValid.value && gate.value.ok)
const shortRun = computed(() => (runId.value.length > 8 ? runId.value.slice(0, 8) : runId.value))
const canChange = computed(() => !config.value.workflowId)

// ── Interaction ──────────────────────────────────────────────────────────────
// A 403 is a directed access moment, not a raw error; every other failure keeps the
// server's own message where it is human.
function accessMessage(e: unknown, fallback: string): string {
  if (httpStatus(e) === 403) return 'You don’t have access to this Workflow.'
  return humanError(e, fallback)
}

function stopRunEvents() {
  runEventsOff?.()
  runEventsOff = null
}

async function refreshRun() {
  const workflowId = selected.value?.id || ''
  const currentRunId = runId.value
  if (!workflowId || !currentRunId || refreshInFlight) return
  refreshInFlight = true
  try {
    const { run }: { run: RunRow } = await getRun(workflowId, currentRunId)
    if (selected.value?.id !== workflowId || runId.value !== currentRunId) return
    const v = runView(run)
    view.value = v
    phase.value = v.phase
  } catch (e) {
    runError.value = accessMessage(e, 'Lost track of this run.')
    phase.value = 'failed'
  } finally {
    refreshInFlight = false
  }
}

function followRunEvents(workflowId: string) {
  stopRunEvents()
  try {
    const off = on(`kickside.thread.${workflowId}`, (message: unknown) => {
      if (isWorkflowRunUpdate(message, workflowId)) void refreshRun()
    })
    runEventsOff = typeof off === 'function' ? off : null
  } catch { /* inert outside the host */ }
}

async function run() {
  if (!selected.value || !canRun.value) return
  runError.value = ''
  launching.value = true
  try {
    const version = Number(selected.value.published_version)
    const rid = await launchRun(selected.value.id, version, inputValue.value || {})
    runId.value = rid
    if (config.value.mode === 'dispatch') {
      phase.value = 'dispatched'
    } else {
      view.value = null
      phase.value = 'running'
      followRunEvents(selected.value.id)
      await refreshRun()
    }
  } catch (e) {
    runError.value = accessMessage(e, 'Could not start the run.')
  } finally {
    launching.value = false
  }
}

function selectWorkflow(cand: FlowCandidate) {
  stopRunEvents()
  selected.value = cand
  resolveError.value = ''
  phase.value = 'ready'
  runId.value = ''
  view.value = null
  runError.value = ''
  inputValue.value = config.value.input ? { ...config.value.input } : {}
  jsonValid.value = true
}

async function resolvePinned(id: string) {
  resolving.value = true
  resolveError.value = ''
  try {
    const summaries = await listWorkflows({ filter: 'published' })
    const cand = summaries
      .map((s) => analyzeFlowCandidate(s, {}, [], ''))
      .find((c) => c.id === id && !!c.published_version)
    if (!cand) {
      selected.value = null
      resolveError.value = 'This Workflow isn’t published, or you don’t have access to it.'
    } else {
      selectWorkflow(cand)
    }
  } catch (e) {
    selected.value = null
    resolveError.value = accessMessage(e, 'Could not load this Workflow.')
  } finally {
    resolving.value = false
  }
}

function reset() {
  stopRunEvents()
  phase.value = 'ready'
  runId.value = ''
  view.value = null
  runError.value = ''
  inputResetKey.value += 1
}

function changeWorkflow() {
  stopRunEvents()
  selected.value = null
  resolveError.value = ''
}

function onInput(value: Record<string, unknown>) { inputValue.value = value || {} }
function onValid(ok: boolean) { jsonValid.value = ok }

try {
  const off = on('@visibility', (visible: unknown) => {
    if (visible === true) void refreshRun()
  })
  visibilityOff = typeof off === 'function' ? off : null
} catch { /* inert outside the host */ }
onBeforeUnmount(() => { stopRunEvents(); visibilityOff?.() })

// Pinned vs pickable: a flow-id prop resolves one Flow; without it the embed shows
// the published-workflow picker. Re-resolve when the pin changes. Declared last so its
// immediate run — synchronous during setup — sees every ref and helper above.
watch(
  () => config.value.workflowId,
  (id) => {
    stopRunEvents()
    if (id) {
      void resolvePinned(id)
    } else {
      selected.value = null
      resolveError.value = ''
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="wf-embed">
    <div v-if="resolving" class="wf-embed-note">
      <ProgressSpinner class="wf-status-spinner" stroke-width="4" aria-label="Loading Workflow" /><span>Loading Workflow…</span>
    </div>

    <Message v-else-if="resolveError" class="wf-embed-directed" severity="error" :closable="false">{{ resolveError }}</Message>

    <EmbedWorkflowPicker v-else-if="!selected" @select="selectWorkflow" />

    <div v-else class="wf-embed-run">
      <header class="wf-embed-hd">
        <span class="wf-embed-hd-ico"><Icon icon="tabler:route" aria-hidden="true" /></span>
        <span class="wf-embed-hd-main">
          <span class="wf-embed-hd-title">{{ selected.title }}</span>
          <Tag class="wf-embed-hd-sub" severity="success" :value="`Published v${selected.published_version}`" />
        </span>
        <Button as="a" class="wf-embed-open" :href="editorHref" severity="secondary" text title="Open this Workflow in the editor" @click.prevent="openEditor">
          <Icon icon="tabler:external-link" aria-hidden="true" /><span>Open in editor</span>
        </Button>
        <Button v-if="canChange" type="button" class="wf-embed-change" severity="secondary" text @click="changeWorkflow">Change</Button>
      </header>

      <!-- Ready: input + action -->
      <template v-if="phase === 'ready'">
        <div class="wf-embed-input">
          <Message v-if="config.inputError" class="wf-field-err" severity="error" :closable="false">{{ config.inputError }}</Message>
          <template v-else-if="hasPinnedInput">
            <RunPayload :value="inputValue" label="Input" icon="tabler:arrow-right-circle" :open="true" />
          </template>
          <template v-else-if="startHasFields">
            <SchemaEditor
              mode="value"
              :schema="inputSchema"
              :model-value="inputValue"
              :reset-key="inputResetKey"
              :rows="6"
              label="Input"
              placeholder='{ "key": "value" }'
              @update:model-value="onInput"
              @valid="onValid"
            />
          </template>
          <p v-else class="wf-embed-subtle">This Workflow needs no input.</p>
          <Message v-if="!config.inputError && !gate.ok" class="wf-embed-gate" severity="warn" :closable="false">{{ gate.message }}</Message>
        </div>

        <div class="wf-embed-actions">
          <Button type="button" class="wf-embed-action" :disabled="!canRun" :loading="launching" @click="run">
            <Icon v-if="!launching" :icon="config.mode === 'dispatch' ? 'tabler:send' : 'tabler:player-play'" aria-hidden="true" />
            <span>{{ config.label }}</span>
          </Button>
        </div>
        <Message v-if="runError" class="wf-embed-err" severity="error" :closable="false">{{ runError }}</Message>
      </template>

      <!-- Running (run mode): live status -->
      <div v-else-if="phase === 'running'" class="wf-embed-status is-running">
        <ProgressSpinner class="wf-status-spinner" stroke-width="4" aria-label="Workflow running" />
        <span>Running…<span v-if="shortRun" class="wf-embed-runid"> · {{ shortRun }}</span></span>
      </div>

      <!-- Dispatched (dispatch mode): fire-and-forget confirmation -->
      <div v-else-if="phase === 'dispatched'" class="wf-embed-result">
        <Message class="wf-embed-status is-ok" severity="success" :closable="false">
          <span>Dispatched<span v-if="shortRun" class="wf-embed-runid"> · run {{ shortRun }}</span></span>
        </Message>
        <div class="wf-embed-actions">
          <Button type="button" class="wf-embed-action" @click="reset"><Icon icon="tabler:refresh" aria-hidden="true" /><span>Dispatch again</span></Button>
        </div>
      </div>

      <!-- Completed (run mode): Finish output -->
      <div v-else-if="phase === 'completed'" class="wf-embed-result">
        <Message class="wf-embed-status is-ok" severity="success" :closable="false">Completed</Message>
        <RunPayload v-if="view && view.hasOutput" :value="view.output" label="Result" icon="tabler:file-check" :open="true" />
        <p v-else class="wf-embed-subtle">Completed — no result was returned.</p>
        <div class="wf-embed-actions">
          <Button type="button" class="wf-embed-action" @click="reset"><Icon icon="tabler:refresh" aria-hidden="true" /><span>Run again</span></Button>
        </div>
      </div>

      <!-- Failed (run mode): honest reason -->
      <div v-else-if="phase === 'failed'" class="wf-embed-result">
        <Message class="wf-embed-status is-error" severity="error" :closable="false">Failed</Message>
        <Message v-if="runError" class="wf-embed-err" severity="error" :closable="false">{{ runError }}</Message>
        <Message v-else-if="view && view.hasReason" class="wf-embed-reason" severity="error" :closable="false">{{ view.reason }}</Message>
        <Message v-else class="wf-embed-subtle" severity="error" :closable="false">This run failed, and no further detail was reported.</Message>
        <div class="wf-embed-actions">
          <Button type="button" class="wf-embed-action" @click="reset"><Icon icon="tabler:refresh" aria-hidden="true" /><span>Run again</span></Button>
        </div>
      </div>
    </div>
  </div>
</template>

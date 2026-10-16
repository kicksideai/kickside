<script setup lang="ts">
import Button from 'primevue/button'
import Message from 'primevue/message'
import Panel from 'primevue/panel'
import ProgressSpinner from 'primevue/progressspinner'
import Tag from 'primevue/tag'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import Tabs from 'primevue/tabs'
import { computed, onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { api, loadByTagName } from '@wippy-fe/proxy'
import type { RunExecution, RunNodeHeader, RunRow } from '../api/api'
import { exportRun, getRunNodeData } from '../api/api'
import { buildNodeInspection, formatDuration, type NodeInspection } from './run-detail'
import { relativeTime, runStatus, runStatusLabel, runStatusTone, runVersionBadge, shortRunId } from './run-history'
import type { NodeRunStatus } from './run-overlay'
import type { WfNode } from '../types'
import { humanTitle } from '../domain/labels'
import RunPayload from './RunPayload.vue'
import RunTimeline from './RunTimeline.vue'
import { downloadJson } from '../mapping/portable'
import { keeperDataflowHref, processIdentity, runExportFilename } from './run-debug'

// The right panel while viewing a past run: replaces the editable NodeConfigPanel
// entirely, so "viewing history" vs "editing" is a different panel, not a subtler
// mode flag a user could miss. With no node selected it shows the run's own summary and
// a re-run affordance; clicking a step folds that node's real data rows (getRunNodeData)
// into one inspection — why it failed, what it received, what it produced, its agent
// trace and its timing — all read-only.
const props = defineProps<{
  workflowId: string
  run: RunRow
  node: WfNode | null
  nodeStatus?: NodeRunStatus
  nodeHeader?: RunNodeHeader | null
  execution?: RunExecution | null
}>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'exit-run'): void; (e: 'rerun'): void }>()

const loading = ref(false)
const inspection = ref<NodeInspection | null>(null)
const loadError = ref('')
const toolTitles = ref<Record<string, string>>({})
let loadGeneration = 0

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function toolId(call: unknown): string {
  return text(record(call).registry_id)
}

function toolCallTitle(call: unknown): string {
  const raw = record(call)
  return toolTitles.value[toolId(call)] || text(raw.title) || text(raw.name) || 'Tool'
}

function toolCallAlias(call: unknown): string {
  return text(record(call).name)
}

async function loadToolTitles(actions: NodeInspection['agentActions'], generation: number) {
  const ids = [...new Set(actions.flatMap((action) => action.toolCalls.map(toolId).filter(Boolean)))]
  if (!ids.length) return
  try {
    const { data } = await api.get(`/api/v1/agents/tools?ids=${encodeURIComponent(ids.join(','))}`)
    if (generation !== loadGeneration) return
    const titles: Record<string, string> = {}
    const rows = Array.isArray(data?.tools) ? data.tools : []
    for (const row of rows) {
      const id = text(row?.id)
      const title = text(row?.title)
      if (id && title) titles[id] = title
    }
    toolTitles.value = titles
  } catch {
    // The trace remains useful with the recorded alias if title enrichment is unavailable.
  }
}

async function load() {
  const generation = ++loadGeneration
  inspection.value = null
  toolTitles.value = {}
  loadError.value = ''
  const node = props.node
  if (!node) return
  loading.value = true
  try {
    const rows = await getRunNodeData(props.workflowId, props.run.run_id, node.id)
    const next = buildNodeInspection(rows, {
      failed: props.nodeStatus === 'failed',
      runError: props.run.error,
    })
    if (generation !== loadGeneration) return
    inspection.value = next
    void loadToolTitles(next.agentActions, generation)
  } catch {
    loadError.value = 'Couldn’t load this step’s data.'
  } finally {
    loading.value = false
  }
}
watch(() => [props.run.run_id, props.node?.id, props.nodeStatus], load, { immediate: true })
// The shared markdown element renders agent prose (a step's text output) formatted.
onMounted(() => { void loadByTagName('wc-render-markdown', { timeoutMs: 8000 }).catch(() => { /* no-op */ }) })

const stepTitle = computed(() => humanTitle(props.node?.title, props.node?.ref) || 'Step')
const timingLabel = computed(() => {
  const ms = inspection.value?.timing.durationMs
  return ms != null ? formatDuration(ms) : ''
})
const hasData = computed(() => {
  const i = inspection.value
  return !!i && (i.input != null || i.output != null || i.error != null || i.agentActions.length > 0)
})
const showOutput = computed(() => inspection.value?.output != null)
const versionBadge = computed(() => runVersionBadge(props.run.flow_ref?.version ?? 0))
const section = ref<'overview' | 'timeline'>('overview')
const exportBusy = ref(false)
const exportError = ref('')
const dataflowId = computed(() => props.run.dataflow_id || props.execution?.dataflow_id || '')
const keeperHref = computed(() => keeperDataflowHref(dataflowId.value))
const processMeta = computed(() => processIdentity(props.execution))

function runSeverity(status: string): 'success' | 'danger' | 'info' {
  const tone = runStatusTone(status)
  if (tone === 'ok') return 'success'
  if (tone === 'error') return 'danger'
  return 'info'
}
const nodeMeta = computed(() => {
  const header = props.nodeHeader
  if (!header) return ''
  return [header.engine_node_id && `engine ${header.engine_node_id}`, header.parent_engine_node_id && `parent ${header.parent_engine_node_id}`].filter(Boolean).join(' · ')
})

async function downloadExport() {
  if (exportBusy.value) return
  exportBusy.value = true
  exportError.value = ''
  try {
    downloadJson(runExportFilename(props.run.run_id), await exportRun(props.workflowId, props.run.run_id))
  } catch {
    exportError.value = 'Couldn’t download the run details. Try again.'
  } finally {
    exportBusy.value = false
  }
}
</script>

<template>
  <aside class="wf-panel wf-panel--run">
    <Button class="wf-panel-close" text rounded severity="secondary" title="Close inspector" aria-label="Close inspector" @click="emit('close')"><Icon icon="tabler:x" aria-hidden="true" /></Button>

    <div class="wf-panel-hdr wf-panel-hdr--run">
      <Icon icon="tabler:history" aria-hidden="true" />
      <span class="wf-panel-hdr-kind">Viewing run</span>
    </div>
    <p class="wf-panel-how">
      <Tag class="wf-run-status-tag" :severity="runSeverity(runStatus(run))" :value="runStatusLabel(runStatus(run))" />
      <Tag class="wf-run-version-tag" :severity="versionBadge.kind === 'published' ? 'secondary' : 'warn'" :value="versionBadge.label" :title="versionBadge.title" />
      <span> Run {{ shortRunId(run.run_id) }} · started {{ relativeTime(run.started_at) }}<span v-if="run.finished_at"> · finished {{ relativeTime(run.finished_at) }}</span>. Read-only — nothing here can be edited.</span>
    </p>
    <div class="wf-run-actions">
      <Button severity="secondary" outlined @click="emit('rerun')"><Icon icon="tabler:refresh" aria-hidden="true" /><span>Re-run with same input</span></Button>
      <Button severity="secondary" outlined @click="emit('exit-run')"><Icon icon="tabler:pencil" aria-hidden="true" /><span>Back to editing</span></Button>
    </div>
    <div class="wf-run-actions">
      <Button severity="secondary" outlined :disabled="exportBusy" :loading="exportBusy" @click="downloadExport"><Icon v-if="!exportBusy" icon="tabler:download" aria-hidden="true" /><span>Download run details</span></Button>
      <Button v-if="keeperHref" as="a" severity="secondary" outlined :href="keeperHref" target="_blank" rel="noopener"><Icon icon="tabler:external-link" aria-hidden="true" /><span>View in Keeper</span></Button>
    </div>
    <Message v-if="exportError" severity="error" :closable="false">{{ exportError }}</Message>
    <Tabs v-model:value="section" class="wf-run-tabs">
      <TabList aria-label="Run inspector sections">
        <Tab value="overview">Overview</Tab>
        <Tab value="timeline">Timeline</Tab>
      </TabList>
    </Tabs>

    <RunTimeline v-if="section === 'timeline'" :workflow-id="workflowId" :run-id="run.run_id" />
    <template v-else-if="!node">
      <p class="wf-panel-hint wf-run-select-hint">Click a step on the canvas to see what it received and produced in this run.</p>
    </template>
    <template v-else>
      <div class="wf-panel-label">{{ stepTitle }}</div>
      <Panel v-if="nodeMeta || processMeta" header="Technical details" toggleable collapsed class="wf-run-tech">
        <p class="wf-run-engine-meta"><span v-if="nodeMeta">{{ nodeMeta }}</span><span v-if="nodeMeta && processMeta"> · </span><span v-if="processMeta">process {{ processMeta }}</span></p>
      </Panel>
      <p v-if="nodeStatus" class="wf-run-status">
        <Tag class="wf-run-status-tag" :severity="runSeverity(nodeStatus)" :value="runStatusLabel(nodeStatus)" />
        <span v-if="timingLabel" class="wf-run-timing"><Icon icon="tabler:clock" aria-hidden="true" />{{ timingLabel }}</span>
      </p>

      <div v-if="loading" class="wf-panel-note"><ProgressSpinner class="wf-status-spinner" stroke-width="4" aria-label="Loading step data" /><span>Loading this step’s data…</span></div>
      <Message v-else-if="loadError" severity="error" :closable="false">{{ loadError }}</Message>
      <template v-else-if="inspection">
        <!-- Error first: a directed moment — what happened, then what to do next. -->
        <div v-if="inspection.error" class="wf-run-fail">
          <div class="wf-run-fail-h">
            <Icon icon="tabler:alert-triangle" aria-hidden="true" />
            <span>{{ inspection.error.message }}</span>
          </div>
          <span v-if="inspection.error.code" class="wf-run-fail-code">{{ inspection.error.code }}</span>
          <p v-if="!inspection.error.hasDetail" class="wf-run-fail-note">No further detail was recorded for this failure. Re-run with the same input to try again, or open the step to adjust it.</p>
          <RunPayload
            v-else-if="inspection.error.detail != null"
            :value="inspection.error.detail"
            label="Error detail"
            icon="tabler:alert-triangle"
            :open="false"
          />
        </div>

        <RunPayload v-if="inspection.input != null" :value="inspection.input" label="Input" icon="tabler:login-2" />
        <RunPayload v-if="showOutput" :value="inspection.output" label="Output" icon="tabler:logout-2" />

        <section v-if="inspection.agentActions.length" class="wf-run-trace">
          <div class="wf-run-section-h"><Icon icon="tabler:robot" aria-hidden="true" /><span>Agent trace</span></div>
          <div v-for="(a, i) in inspection.agentActions" :key="i" class="wf-run-trace-item">
            <p class="wf-panel-hint">{{ a.toolCalls.length ? `Called ${a.toolCalls.length} tool${a.toolCalls.length === 1 ? '' : 's'}` : 'No tools were called — the model answered directly.' }}</p>
            <template v-if="a.toolCalls.length">
              <ul class="wf-run-tool-list" aria-label="Tools called">
                <li v-for="(call, callIndex) in a.toolCalls" :key="callIndex">
                  <strong>{{ toolCallTitle(call) }}</strong>
                  <span v-if="toolCallAlias(call) && toolCallAlias(call) !== toolCallTitle(call)"> · {{ toolCallAlias(call) }}</span>
                  <code v-if="toolId(call)" class="wf-run-tool-id">{{ toolId(call) }}</code>
                </li>
              </ul>
              <RunPayload :value="a.toolCalls" label="Tool call details" icon="tabler:tool" :open="false" />
            </template>
            <RunPayload :value="a.raw" label="Generation" icon="tabler:sparkles" :open="false" />
          </div>
        </section>

        <p v-if="!hasData" class="wf-panel-hint">This step recorded no input or output in this run.</p>
      </template>
    </template>
  </aside>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import { useConfirm } from 'primevue/useconfirm'
import { computed, onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { getWorkflowVersion, getWorkflowVersionDiff, humanError, listWorkflowVersions, restoreWorkflowVersion, type WorkflowVersionDetail, type WorkflowVersionDiff, type WorkflowVersionSummary } from '../api/api'
import { relativeTime } from './run-history'
import { fieldSummary, hasUnpublishedEdits, restoreDraftMessage, restoredDraftRoute, summarizeInterface } from './version-history'
import { diffHasChanges, graphDeltaItems, interfaceChangeLabel } from './version-diff'

// The Publish button's history popover: the immutable published versions of this workflow,
// newest first, each with when + who. Selecting a version shows the interface it froze,
// read-only. This surface never mutates anything and never offers to edit or restore an old
// version — published history is immutable, and time-travel/restore is out of scope. It only
// lists, and fetches one version's interface summary. definitionEditSeq is the canvas's current
// marker-excluded edit head, used only to tell whether the draft carries edits beyond the latest version.
const props = defineProps<{ workflowId: string; definitionEditSeq: number }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'restore', id: string): void }>()

const loading = ref(false)
const error = ref('')
const versions = ref<WorkflowVersionSummary[]>([])

const selected = ref<number | null>(null)
const detail = ref<WorkflowVersionDetail | null>(null)
const detailLoading = ref(false)
const detailError = ref('')
const compareVersion = ref<number | null>(null)
const diff = ref<WorkflowVersionDiff | null>(null)
const diffLoading = ref(false)
const diffError = ref('')
const restoring = ref(false)
const restoreError = ref('')
const confirm = useConfirm()

async function load() {
  loading.value = true
  error.value = ''
  try {
    versions.value = await listWorkflowVersions(props.workflowId)
    if (versions.value.length) void selectVersion(versions.value[0].version)
  } catch (e) {
    error.value = humanError(e, 'Couldn’t load version history.')
  } finally {
    loading.value = false
  }
}

async function selectVersion(n: number) {
  selected.value = n
  detail.value = null
  detailError.value = ''
  diff.value = null
  diffError.value = ''
  detailLoading.value = true
  try {
    const d = await getWorkflowVersion(props.workflowId, n)
    // The user may have picked another version while this was in flight.
    if (selected.value !== n) return
    detail.value = d
  } catch (e) {
    detailError.value = humanError(e, 'Couldn’t load this version.')
  } finally {
    if (selected.value === n) detailLoading.value = false
  }
}

onMounted(load)
watch(() => props.workflowId, () => { selected.value = null; detail.value = null; void load() })

const latestVersion = computed(() => versions.value[0] ?? null)
const draftPending = computed(() => hasUnpublishedEdits(props.definitionEditSeq, latestVersion.value?.def_seq))
const summary = computed(() => (detail.value ? summarizeInterface(detail.value.interface) : null))
const previousVersion = computed(() => {
  const index = versions.value.findIndex((version) => version.version === selected.value)
  return index >= 0 ? versions.value[index + 1]?.version ?? null : null
})
const diffTarget = computed(() => compareVersion.value || previousVersion.value)
const diffChoices = computed(() => versions.value.filter((version) => version.version !== selected.value))
const diffOptions = computed(() => [
  { label: 'previous version', value: null },
  ...diffChoices.value.map((candidate) => ({ label: `v${candidate.version}`, value: candidate.version })),
])

async function loadDiff() {
  if (selected.value == null || diffTarget.value == null || diffLoading.value) return
  diffLoading.value = true
  diffError.value = ''
  diff.value = null
  try {
    const from = Math.min(selected.value, diffTarget.value)
    const to = Math.max(selected.value, diffTarget.value)
    diff.value = await getWorkflowVersionDiff(props.workflowId, from, to)
  } catch (e) {
    diffError.value = humanError(e, 'Couldn’t load this version diff.')
  } finally {
    diffLoading.value = false
  }
}

async function restoreAsDraft() {
  if (selected.value == null || restoring.value) return
  restoring.value = true
  restoreError.value = ''
  try {
    emit('restore', restoredDraftRoute(await restoreWorkflowVersion(props.workflowId, selected.value)))
  } catch (e) {
    restoreError.value = humanError(e, 'Couldn’t restore this version as a new draft.')
  } finally {
    restoring.value = false
  }
}

function confirmRestore() {
  if (selected.value == null || restoring.value) return
  const confirmation = {
    group: 'version-restore',
    header: 'Restore as new draft',
    message: restoreDraftMessage(selected.value),
    rejectLabel: 'Cancel',
    acceptLabel: 'Create new draft',
    accept: () => { void restoreAsDraft() },
  }
  confirm.require(confirmation)
}

function onVisibleChange(visible: boolean) {
  if (!visible) emit('close')
}
</script>

<template>
  <ConfirmDialog group="version-restore" />
  <Dialog
    :visible="true"
    modal
    dismissable-mask
    header="Version history"
    class="wf-sim-pop wf-vers-pop"
    @update:visible="onVisibleChange"
  >
    <div v-if="loading" class="wf-runs-loading">
      <ProgressSpinner class="wf-status-spinner" stroke-width="4" aria-label="Loading versions" />
      <span>Loading versions…</span>
    </div>
    <Message v-else-if="error" severity="error" :closable="false">{{ error }}</Message>
    <template v-else>
      <p v-if="!versions.length" class="wf-sim-note">
        No versions published yet. Publish to save the current Workflow as v1; you can keep editing it as a draft.
      </p>
      <template v-else>
        <p class="wf-vers-draft" :class="draftPending ? 'is-pending' : 'is-clean'" role="status">
          <Icon :icon="draftPending ? 'tabler:pencil' : 'tabler:circle-check'" aria-hidden="true" />
          <span v-if="draftPending">Draft has unpublished edits since v{{ latestVersion?.version }}.</span>
          <span v-else>Draft matches v{{ latestVersion?.version }} — nothing to publish.</span>
        </p>

        <div class="wf-vers-list">
          <Button
            v-for="(v, i) in versions"
            :key="v.version"
            class="wf-vers-row"
            text
            severity="secondary"
            :class="v.version === selected && 'is-selected'"
            @click="selectVersion(v.version)"
          >
            <Tag class="wf-version-tag" severity="secondary" :value="`v${v.version}`" />
            <span class="wf-vers-meta">
              <span class="wf-vers-when">{{ relativeTime(v.created_at) }}<span v-if="i === 0" class="wf-vers-current">Current</span></span>
              <span class="wf-vers-who">{{ v.created_by || 'Unknown' }}</span>
            </span>
            <Icon icon="tabler:chevron-right" class="wf-runs-go" aria-hidden="true" />
          </Button>
        </div>

        <section v-if="selected != null" class="wf-vers-detail">
          <div v-if="detailLoading" class="wf-runs-loading">
            <ProgressSpinner class="wf-status-spinner" stroke-width="4" :aria-label="`Loading version ${selected}`" />
            <span>Loading v{{ selected }}…</span>
          </div>
          <Message v-else-if="detailError" severity="error" :closable="false">{{ detailError }}</Message>
          <template v-else-if="detail && summary">
            <div class="wf-vers-detail-h">
              <span class="wf-vers-detail-title">v{{ detail.version }} inputs and results</span>
              <span class="wf-vers-detail-note">Read-only</span>
            </div>
            <p v-if="summary.empty" class="wf-sim-note">This version does not define expected input, a result, or error details.</p>
            <dl v-else class="wf-vers-io">
              <div class="wf-vers-io-row">
                <dt>In</dt>
                <dd>{{ fieldSummary(summary.input, summary.inputCount) }}</dd>
              </div>
              <div class="wf-vers-io-row">
                <dt>Out</dt>
                <dd>{{ fieldSummary(summary.output, summary.outputCount) }}</dd>
              </div>
              <div class="wf-vers-io-row">
                <dt>Error</dt>
                <dd>{{ fieldSummary(summary.error, summary.errorCount) }}</dd>
              </div>
            </dl>
            <div class="wf-vers-actions">
              <label v-if="diffChoices.length" class="wf-vers-compare">Compare with
                <Select
                  v-model="compareVersion"
                  :options="diffOptions"
                  option-label="label"
                  option-value="value"
                  aria-label="Compare with version"
                />
              </label>
              <Button severity="secondary" outlined :disabled="!diffTarget || diffLoading" :loading="diffLoading" @click="loadDiff"><Icon v-if="!diffLoading" icon="tabler:git-compare" aria-hidden="true" /><span>Compare</span></Button>
              <Button :disabled="restoring" :loading="restoring" @click="confirmRestore"><Icon v-if="!restoring" icon="tabler:history-up" aria-hidden="true" /><span>Restore as new draft</span></Button>
            </div>
            <Message v-if="restoreError" severity="error" :closable="false">{{ restoreError }}</Message>
            <section v-if="diff" class="wf-vers-diff" aria-label="Changes between versions">
              <div class="wf-vers-detail-h"><span class="wf-vers-detail-title">Changes from v{{ diff.from_version }} to v{{ diff.to_version }}</span><span class="wf-vers-detail-note">Read-only</span></div>
              <p v-if="!diffHasChanges(diff)" class="wf-panel-hint">No input, result, step, or connection changes were recorded.</p>
              <template v-else>
                <Message v-if="diff.interface.changes.length" class="wf-vers-compat" severity="warn" :closable="false"><Icon icon="tabler:alert-triangle" aria-hidden="true" /><div><strong>Expected input or result changed</strong><span v-for="(change, i) in diff.interface.changes" :key="i">{{ interfaceChangeLabel(change) }}</span></div></Message>
                <div v-for="group in [{ label: 'Steps added', rows: diff.graph.nodes.added }, { label: 'Steps removed', rows: diff.graph.nodes.removed }, { label: 'Steps changed', rows: diff.graph.nodes.changed }, { label: 'Connections added', rows: diff.graph.edges.added }, { label: 'Connections removed', rows: diff.graph.edges.removed }, { label: 'Connections changed', rows: diff.graph.edges.changed }]" :key="group.label" v-show="group.rows.length" class="wf-vers-diff-group">
                  <strong>{{ group.label }}</strong>
                  <span v-for="row in graphDeltaItems(group.rows)" :key="row.id">{{ row.name }}</span>
                </div>
              </template>
            </section>
          </template>
        </section>
      </template>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Tag from 'primevue/tag'
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { RunRow } from '../api/api'
import { relativeTime, runFailureCause, runStatus, runStatusLabel, runStatusTone, runVersionBadge, shortRunId, sortRunsNewestFirst } from './run-history'

// The toolbar's "Runs" popover: past runs for this workflow, newest first, each a
// status badge + relative time. Picking a row loads that run's state onto the canvas
// as a read-only overlay (see WorkflowCanvas's viewRun) — this component only lists
// and emits the choice, it never fetches or mutates anything itself.
const props = defineProps<{ rows: RunRow[]; loading: boolean; error: string }>()
const emit = defineEmits<{ (e: 'select', row: RunRow): void; (e: 'close'): void }>()

const sorted = computed(() => sortRunsNewestFirst(props.rows).map((row) => ({
  row, ver: runVersionBadge(row.flow_ref?.version ?? 0), cause: runFailureCause(row),
})))

function runSeverity(status: string): 'success' | 'danger' | 'info' {
  const tone = runStatusTone(status)
  if (tone === 'ok') return 'success'
  if (tone === 'error') return 'danger'
  return 'info'
}

function onVisibleChange(visible: boolean) {
  if (!visible) emit('close')
}
</script>

<template>
  <Dialog
    :visible="true"
    modal
    dismissable-mask
    header="Runs"
    class="wf-sim-pop wf-runs-pop"
    @update:visible="onVisibleChange"
  >
    <div v-if="loading" class="wf-runs-loading">
      <ProgressSpinner class="wf-status-spinner" stroke-width="4" aria-label="Loading runs" />
      <span>Loading runs…</span>
    </div>
    <Message v-else-if="error" severity="error" :closable="false">{{ error }}</Message>
    <p v-else-if="!sorted.length" class="wf-sim-note">No runs yet — Simulate, or publish and trigger this Workflow, to see runs here.</p>
    <div v-else class="wf-runs-list">
      <Button v-for="{ row: r, ver, cause } in sorted" :key="r.run_id" class="wf-runs-row" text severity="secondary" @click="emit('select', r)">
        <Tag class="wf-run-status-tag" :severity="runSeverity(runStatus(r))" :value="runStatusLabel(runStatus(r))" />
        <span class="wf-runs-meta">
          <span class="wf-runs-id">{{ shortRunId(r.run_id) }}</span>
          <span class="wf-runs-time">{{ relativeTime(r.started_at || r.finished_at) }}</span>
          <span v-if="cause" class="wf-runs-cause" :title="cause">{{ cause }}</span>
        </span>
        <Tag class="wf-run-version-tag" :severity="ver.kind === 'published' ? 'secondary' : 'warn'" :value="ver.label" :title="ver.title" />
        <Icon icon="tabler:chevron-right" class="wf-runs-go" aria-hidden="true" />
      </Button>
    </div>
  </Dialog>
</template>

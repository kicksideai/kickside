<script setup lang="ts">
import Tag from 'primevue/tag'
import { computed, onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { listWorkflows } from '../api/api'
import { validateConnection } from '../domain/connection-policy'
import { analyzeFlowCandidate, type FlowCandidate } from '../nodes/flow-candidate'
import WorkflowSearchList from '../nodes/WorkflowSearchList.vue'

const props = defineProps<{
  workflowId: string
  selectedId?: string
  upstreamSchema?: unknown
}>()
const emit = defineEmits<{ (e: 'select', candidate: FlowCandidate): void }>()

const loading = ref(false)
const error = ref('')
const rows = ref<FlowCandidate[]>([])

async function load() {
  loading.value = true
  error.value = ''
  try {
    const summaries = await listWorkflows({ filter: 'published' })
    rows.value = summaries
      .map((summary) => analyzeFlowCandidate(summary, {}, [], props.workflowId))
      .filter((candidate) => candidate.callable && !!candidate.published_version)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not load Workflows.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => props.workflowId, load)

function matches(item: FlowCandidate, q: string): boolean {
  return item.title.toLowerCase().includes(q) || item.trigger_label.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)
}

const selected = computed(() => rows.value.find((r) => r.id === props.selectedId) || null)

function compat(c: FlowCandidate) {
  return validateConnection(props.upstreamSchema, c.input_schema)
}

function compatIcon(c: FlowCandidate): string {
  const s = compat(c).status
  if (s === 'error') return 'tabler:alert-triangle'
  if (s === 'ok') return 'tabler:circle-check'
  return 'tabler:circle-dashed'
}

function compatLabel(c: FlowCandidate): string {
  const v = compat(c)
  if (v.status === 'error') return v.message || 'Needs mapping'
  if (v.status === 'ok') return 'Input matches'
  return 'Input unknown'
}

function rowExtraClass(item: FlowCandidate) {
  return [item.id === props.selectedId && 'is-selected', item.is_current && 'is-current']
}
function rowDisabled(item: FlowCandidate): boolean {
  return item.is_current
}
function rowSelected(item: FlowCandidate): boolean {
  return item.id === props.selectedId
}
</script>

<template>
  <WorkflowSearchList
    :rows="rows"
    :loading="loading"
    :error="error"
    :matches="matches"
    placeholder="Search published Workflows"
    empty-message="No published Workflows available."
    root-class="wf-callpick"
    search-class="wf-callpick-search"
    note-class="wf-panel-note"
    error-class="wf-field-err"
    list-class="wf-callpick-list"
    row-class="wf-callpick-row"
    :row-extra-class="rowExtraClass"
    :is-disabled="rowDisabled"
    :is-emphasized="rowSelected"
    empty-class="wf-palette-empty"
    @select="(item) => emit('select', item)"
  >
    <template #before-list>
      <div v-if="selected" class="wf-callpick-selected">
        <div class="wf-callpick-selected-top">
          <Icon icon="tabler:route" aria-hidden="true" />
          <span>{{ selected.title }}</span>
        </div>
        <div class="wf-callpick-badges">
          <Tag class="wf-callpick-badge" severity="success" :value="`Published v${selected.published_version}`" />
          <Tag v-if="selected.has_draft_changes" class="wf-callpick-badge" severity="warn" value="Draft changes" />
        </div>
        <div class="wf-callpick-io">
          <span><strong>In</strong>{{ selected.input_summary }}</span>
          <span><strong>Child out</strong>{{ selected.output_summary }}</span>
          <span><strong>Step out</strong>Run details</span>
        </div>
      </div>
    </template>
    <template #row="{ item }">
      <span class="wf-callpick-ico"><Icon icon="tabler:route" aria-hidden="true" /></span>
      <span class="wf-callpick-main">
        <span class="wf-callpick-title">{{ item.title }}</span>
        <span class="wf-callpick-meta">
          <span v-if="item.is_current">Current</span>
          <span>v{{ item.published_version }}</span>
          <span v-if="item.has_draft_changes">Draft</span>
        </span>
        <span class="wf-callpick-schema">
          <span><strong>In</strong>{{ item.input_summary }}</span>
          <span><strong>Out</strong>{{ item.output_summary }}</span>
        </span>
      </span>
      <span class="wf-callpick-compat" :class="`is-${compat(item).status}`" :title="compatLabel(item)">
        <Icon :icon="compatIcon(item)" aria-hidden="true" />
      </span>
    </template>
  </WorkflowSearchList>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { listWorkflows } from '../api/api'
import { analyzeFlowCandidate, type FlowCandidate } from '../nodes/flow-candidate'
import WorkflowSearchList from '../nodes/WorkflowSearchList.vue'

// The embed's workflow picker: every PUBLISHED workflow, no schema-compat filtering (unlike
// the Call node's picker, which narrows callable workflows against an upstream schema).

const props = defineProps<{ selected?: { id: string; version: number } }>()
const emit = defineEmits<{ (e: 'select', candidate: FlowCandidate): void }>()

const loading = ref(false)
const error = ref('')
const rows = ref<FlowCandidate[]>([])
const selectedTitle = computed(() => rows.value.find(row => row.id === props.selected?.id)?.title || 'Selected workflow')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const summaries = await listWorkflows({ filter: 'published' })
    rows.value = summaries
      .map((summary) => analyzeFlowCandidate(summary, {}, [], ''))
      .filter((candidate) => !!candidate.published_version)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not load Workflows.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => props.selected?.id, id => {
  if (id && !rows.value.some(row => row.id === id)) void load()
})

function matches(item: FlowCandidate, q: string): boolean {
  return item.title.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)
}
</script>

<template>
  <p v-if="selected" class="wf-embed-note">{{ selectedTitle }} · Published v{{ selected.version }}</p>
  <WorkflowSearchList
    :rows="rows"
    :loading="loading"
    :error="error"
    :matches="matches"
    placeholder="Search published Workflows"
    empty-message="No published Workflows available."
    root-class="wf-embed-pick"
    search-class="wf-embed-search"
    note-class="wf-embed-note"
    error-class="wf-embed-err"
    list-class="wf-embed-list"
    row-class="wf-embed-row"
    quiet-rows
    empty-class="wf-embed-empty"
    @select="(item) => emit('select', item)"
  >
    <template #row="{ item }">
      <span class="wf-embed-ico"><Icon icon="tabler:route" aria-hidden="true" /></span>
      <span class="wf-embed-main">
        <span class="wf-embed-title">{{ item.title }}</span>
        <span class="wf-embed-meta">
          <span>v{{ item.published_version }}</span>
          <span class="wf-embed-io"><strong>In</strong>{{ item.input_summary }}</span>
        </span>
      </span>
      <Icon icon="tabler:chevron-right" class="wf-embed-go" aria-hidden="true" />
    </template>
  </WorkflowSearchList>
</template>

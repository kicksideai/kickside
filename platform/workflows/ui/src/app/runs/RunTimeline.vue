<script setup lang="ts">
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import { onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { getRunTimeline, humanError, type RunTimeline, type RunNodeHeader } from '../api/api'
import { relativeTime } from './run-history'
import { timelineEventViews } from './run-debug'

const props = defineProps<{ workflowId: string; runId: string; nodeHeaders?: RunNodeHeader[] }>()

const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const timeline = ref<RunTimeline | null>(null)

async function load(reset = true) {
  if (reset) { loading.value = true; error.value = ''; timeline.value = null } else loadingMore.value = true
  try {
    const offset = reset ? 0 : (timeline.value?.next_offset ?? 0)
    const next = await getRunTimeline(props.workflowId, props.runId, 100, offset)
    if (!reset && timeline.value) next.events = [...timeline.value.events, ...next.events]
    timeline.value = next
  } catch (e) {
    error.value = humanError(e, 'Couldn’t load this run’s timeline. Try again.')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

watch(() => [props.workflowId, props.runId], () => { void load() })
onMounted(() => { void load() })
</script>

<template>
  <section class="wf-run-timeline" aria-label="Run timeline">
    <div class="wf-run-section-h"><Icon icon="tabler:timeline-event" aria-hidden="true" /><span>Timeline</span></div>
    <p class="wf-panel-hint">Steps and outcomes recorded for this run.</p>
    <div v-if="loading" class="wf-panel-note"><ProgressSpinner class="wf-status-spinner" stroke-width="4" aria-label="Loading timeline" /><span>Loading timeline…</span></div>
    <Message v-else-if="error" severity="error" :closable="false">
      {{ error }}
      <Button label="Try again" link size="small" @click="load()" />
    </Message>
    <p v-else-if="!timeline?.events.length" class="wf-panel-hint">No activity was recorded for this run.</p>
    <ol v-else class="wf-timeline-list">
      <li v-for="event in timelineEventViews(timeline.events, nodeHeaders)" :key="event.key" class="wf-timeline-event">
        <div class="wf-timeline-head">
          <span class="wf-timeline-type">{{ event.title }}</span>
        </div>
        <span class="wf-timeline-when">{{ relativeTime(event.occurredAt) }}</span>
        <p class="wf-timeline-outcome">{{ event.outcome }}</p>
      </li>
    </ol>
    <Button v-if="timeline?.next_offset != null" severity="secondary" outlined :disabled="loadingMore" :loading="loadingMore" @click="load(false)">
      <Icon v-if="!loadingMore" icon="tabler:plus" aria-hidden="true" />
      <span>Load more activity</span>
    </Button>
  </section>
</template>

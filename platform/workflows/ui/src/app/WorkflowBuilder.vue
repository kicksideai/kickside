<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import WorkflowList from './list/WorkflowList.vue'
import WorkflowCanvas from './canvas/WorkflowCanvas.vue'
import WorkflowPreview from './WorkflowPreview.vue'

// The single mount for kickside/workflows. Route in a prop, navigation out an event:
//   ''  or '/'   → the workflow list
//   '/{id}'      → that workflow's canvas
// The host owns the URL; we emit `navigate` so the shell round-trips the route back
// as a prop. A local override keeps clicks responsive even before that round-trip.
// Creation is a separate surface (kickside-workflow-setup / WorkflowSetup.vue); this
// mount is the list plus the per-workflow manage view.

interface Props {
  route?: string
  // 'preview' renders the compact glance card the workspace preview panel
  // expects from every renderer; anything else is the full builder.
  mode?: string
}

const props = useProps<Props>()
const emit = useEvents<{
  navigate: { route: string }
}>()

// ─── Builder view ────────────────────────────────────────────────────────
const localRoute = ref<string | null>(null)
watch(
  () => props.value?.route,
  () => {
    localRoute.value = null
  },
)

const route = computed(() => localRoute.value ?? props.value?.route ?? '')
const parts = computed(() => route.value.replace(/^\//, '').split('/'))
const returnRoute = computed(() => parts.value[1] === 'return' ? decodeURIComponent(parts.value[2] || '') : '')

const workflowId = computed(() => {
  const m = /^\/?([^/]+)(?:\/return\/[^/]+)?\/?$/.exec(route.value.trim())
  const id = m ? m[1] : ''
  return id && id !== '/' ? id : ''
})

function navigate(to: string) {
  localRoute.value = to
  emit('navigate', { route: to })
}
function back() {
  if (returnRoute.value) emit('navigate', {route: returnRoute.value})
  else navigate('')
}
function published() {
  if (returnRoute.value) emit('navigate', {route: returnRoute.value})
}

const rootEl = ref<HTMLElement | null>(null)

const isPreview = computed(() => props.value?.mode === 'preview')
</script>

<template>
  <div ref="rootEl" class="wf">
    <WorkflowPreview v-if="isPreview && workflowId" :workflow-id="workflowId" />
    <WorkflowCanvas v-else-if="workflowId" :workflow-id="workflowId" @back="back" @open-workflow="navigate" @published="published" />
    <WorkflowList v-else @open="(id: string) => navigate(id)" />
  </div>
</template>

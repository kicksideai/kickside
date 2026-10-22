<script setup lang="ts">
import { computed } from 'vue'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import { parseSchema } from '@widgets/app/ports'
import EmbedWorkflowPicker from './EmbedWorkflowPicker.vue'
import type { FlowCandidate } from '../nodes/flow-candidate'

type FlowRef = { kind: 'flow'; id: string; version: number }
const props = useProps<{ config?: string; schema?: string }>()
const emit = useEvents<{ change: Record<string, FlowRef> }>()
const key = computed(() => Object.keys(parseSchema(props.value.schema)?.properties || {})[0] || 'flow_ref')
const selected = computed(() => {
  const config = parseSchema(props.value.config) as Record<string, unknown> | null
  return config?.[key.value] as FlowRef | undefined
})
function select(flow: FlowCandidate) {
  if (!flow.published_version) return
  emit('change', { [key.value]: { kind: 'flow', id: flow.id, version: flow.published_version } })
}
</script>

<template>
  <EmbedWorkflowPicker :selected="selected" @select="select" />
</template>

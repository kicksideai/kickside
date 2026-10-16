<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { WfContainerData } from '../domain/graph-data'

// The boxed region behind a loop/parallel body, so a user sees exactly which steps
// are repeated / run in parallel. Header strip names the container; the body area is
// click-through (pointer-events none) so the steps inside stay interactive.
defineProps<{ data: WfContainerData }>()
</script>

<template>
  <div class="wf-container" :class="`wf-container--${data.kind}`">
    <div class="wf-container-head">
      <Icon :icon="data.icon" aria-hidden="true" />
      <span class="wf-container-kind">{{ data.kind === 'cycle' ? 'Loop' : 'For each' }}</span>
      <span v-if="data.label" class="wf-container-label">{{ data.label }}</span>
    </div>
  </div>
</template>

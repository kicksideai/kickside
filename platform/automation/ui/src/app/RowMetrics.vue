<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { Metric } from './row-status'

// The card face carries counts and readable status; anything that identifies one
// offending item, or reads as a technical reason, sits behind the disclosure. A row
// whose type declares no status fields renders neither.
withDefaults(defineProps<{ face?: Metric[]; detail?: Metric[] }>(), {
  face: () => [],
  detail: () => [],
})
</script>

<template>
  <div v-if="face.length" class="kx-metrics">
    <span v-for="m in face" :key="m.label" class="kx-metric">
      <Icon v-if="m.icon" :icon="m.icon" class="kx-metric-i" aria-hidden="true" />
      <span class="kx-metric-k">{{ m.label }}</span>
      <span class="kx-metric-v" :title="m.title">{{ m.value }}</span>
    </span>
  </div>
  <details v-if="detail.length" class="kx-metric-details">
    <summary class="kx-metric-more">Details</summary>
    <div class="kx-metrics kx-metrics-detail">
      <span v-for="m in detail" :key="m.label" class="kx-metric">
        <Icon v-if="m.icon" :icon="m.icon" class="kx-metric-i" aria-hidden="true" />
        <span class="kx-metric-k">{{ m.label }}</span>
        <span class="kx-metric-v" :title="m.title">{{ m.value }}</span>
      </span>
    </div>
  </details>
</template>

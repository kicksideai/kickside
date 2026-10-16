<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner'

defineProps<{ label?: string }>()
</script>

<template>
  <div class="km-loading">
    <ProgressSpinner
      style="width: 2rem; height: 2rem; margin: 0"
      :aria-label="label || 'Loading'"
    />
    <span v-if="label">{{ label }}</span>
  </div>
</template>

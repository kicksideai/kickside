<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Tag from 'primevue/tag'

// Compact status chip. `severity` is PrimeVue's, so the theme paints it - there
// is no KickSide colour class in between. An optional dot or icon leads the
// label; omit severity for the accent (primary) look.
withDefaults(defineProps<{
  severity?: '' | 'secondary' | 'success' | 'danger' | 'warn' | 'info'
  dot?: boolean
  icon?: string
}>(), { severity: 'secondary' })
</script>

<template>
  <Tag :severity="severity || undefined" class="km-pill kx-tag-sm">
    <span v-if="dot" class="km-pill-dot" aria-hidden="true" />
    <Icon v-else-if="icon" :icon="icon" aria-hidden="true" />
    <slot />
  </Tag>
</template>

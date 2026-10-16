<script setup lang="ts">
import { Icon } from '@iconify/vue'

// Inline banner for errors, success, and informational messages, with a dismiss control.
// `severity` is PrimeVue's vocabulary; the banner is not a PrimeVue component,
// so it keeps a class named for the state and reads the theme's ramp in CSS.
withDefaults(defineProps<{ severity?: 'info' | 'danger' | 'success' }>(), { severity: 'info' })
const emit = defineEmits<{ (e: 'dismiss'): void }>()

const icon = (s: string) =>
  s === 'danger' ? 'tabler:alert-triangle' : s === 'success' ? 'tabler:circle-check' : 'tabler:info-circle'
</script>

<template>
  <div class="km-notice" :class="`is-${severity}`" role="status">
    <Icon :icon="icon(severity)" aria-hidden="true" />
    <span class="km-notice-text"><slot /></span>
    <button class="km-notice-x" aria-label="Dismiss" @click="emit('dismiss')">
      <Icon icon="tabler:x" aria-hidden="true" />
    </button>
  </div>
</template>

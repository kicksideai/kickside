<script setup lang="ts">
import { Icon } from '@iconify/vue'

// Inline banner for errors and informational messages, with a dismiss control.
// `severity` is PrimeVue's vocabulary; the banner is not a PrimeVue component,
// so it keeps a class named for the state and reads the theme's ramp in CSS.
withDefaults(defineProps<{ severity?: 'info' | 'danger' }>(), { severity: 'info' })
const emit = defineEmits<{ (e: 'dismiss'): void }>()
</script>

<template>
  <div class="km-notice" :class="`is-${severity}`" role="status">
    <Icon :icon="severity === 'danger' ? 'tabler:alert-triangle' : 'tabler:info-circle'" aria-hidden="true" />
    <span class="km-notice-text"><slot /></span>
    <button class="km-notice-x" aria-label="Dismiss" @click="emit('dismiss')">
      <Icon icon="tabler:x" aria-hidden="true" />
    </button>
  </div>
</template>

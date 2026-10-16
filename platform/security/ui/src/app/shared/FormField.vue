<script setup lang="ts">
// Labeled form field: a label above the control (default slot) and optional help
// text below. The control fills the field width.
defineProps<{ label: string; help?: string }>()
</script>

<template>
  <label class="km-field">
    <span class="km-field-label">{{ label }}</span>
    <slot />
    <small v-if="help" class="km-field-help">{{ help }}</small>
  </label>
</template>

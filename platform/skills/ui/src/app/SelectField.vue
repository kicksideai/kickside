<script setup lang="ts">
import Select from 'primevue/select'

// Thin wrapper over PrimeVue's Select. Options are passed as an array of
// { label, value } so callers describe their choices declaratively; the theme's
// PrimeVuePlugin keeps the panel inside the component's own shadow root by default.
export interface SelectOption { label: string; value: string }

defineProps<{
  modelValue: string
  options: SelectOption[]
  ariaLabel?: string
  placeholder?: string
}>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()
</script>

<template>
  <Select
    class="kx-select"
    :model-value="modelValue"
    :options="options"
    option-label="label"
    option-value="value"
    :aria-label="ariaLabel"
    :placeholder="placeholder"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

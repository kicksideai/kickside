<script setup lang="ts">
import { computed } from 'vue'
import ToggleSwitch from 'primevue/toggleswitch'

// Switch control with an optional trailing label — a thin wrapper over PrimeVue
// <ToggleSwitch> that keeps the module's `modelValue`/`label`/`disabled` API so
// call sites don't change.
const props = defineProps<{ modelValue: boolean; label?: string; disabled?: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()
const model = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})
</script>

<template>
  <label class="km-switch" :class="{ disabled }">
    <ToggleSwitch v-model="model" :disabled="disabled" />
    <span v-if="label" class="km-switch-label">{{ label }}</span>
  </label>
</template>

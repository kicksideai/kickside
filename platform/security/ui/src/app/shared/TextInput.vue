<script setup lang="ts">
// Bare text/number/password input bound with v-model. Visual treatment matches
// the select and search controls.
withDefaults(defineProps<{
  modelValue: string | number
  type?: 'text' | 'number' | 'password'
  placeholder?: string
  readonly?: boolean
  disabled?: boolean
  autocomplete?: string
  min?: number
  max?: number
  step?: number
  mono?: boolean
}>(), { type: 'text' })
const emit = defineEmits<{ (e: 'update:modelValue', value: string | number): void }>()

function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  emit('update:modelValue', el.value)
}
</script>

<template>
  <input
    class="km-input"
    :class="mono && 'mono'"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :readonly="readonly"
    :disabled="disabled"
    :autocomplete="autocomplete"
    :min="min"
    :max="max"
    :step="step"
    @input="onInput"
  />
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

// Text input with a leading search glyph and a trailing clear button.
defineProps<{ modelValue: string; placeholder?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()
</script>

<template>
  <div class="km-search">
    <Icon icon="tabler:search" class="km-search-ico" aria-hidden="true" />
    <input
      class="km-search-input"
      :value="modelValue"
      :placeholder="placeholder || 'Search'"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button v-if="modelValue" class="km-search-clear" aria-label="Clear search" @click="emit('update:modelValue', '')">
      <Icon icon="tabler:x" aria-hidden="true" />
    </button>
  </div>
</template>

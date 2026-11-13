<script setup lang="ts">
import { Icon } from '@iconify/vue'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Button from 'primevue/button'

// Text input with a leading search glyph and a trailing clear button.
defineProps<{ modelValue: string; placeholder?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()
</script>

<template>
  <IconField class="km-search">
    <InputIcon><Icon icon="tabler:search" aria-hidden="true" /></InputIcon>
    <InputText
      class="km-search-input"
      :aria-label="placeholder || 'Search'"
      :model-value="modelValue"
      :placeholder="placeholder || 'Search'"
      @update:model-value="emit('update:modelValue', $event ?? '')"
    />
    <Button v-if="modelValue" text severity="secondary" class="km-search-clear" aria-label="Clear search" @click="emit('update:modelValue', '')">
      <template #icon><Icon icon="tabler:x" aria-hidden="true" /></template>
    </Button>
  </IconField>
</template>

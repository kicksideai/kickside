<script setup lang="ts">
import { ref } from 'vue'

// A list of short text values edited as removable chips with one entry input.
const props = defineProps<{ value: string[]; label: string; placeholder?: string }>()
const emit = defineEmits<{ change: [value: string[]] }>()
const draft = ref('')

function add() {
  const entry = draft.value.trim()
  draft.value = ''
  if (!entry) return
  emit('change', [...props.value, entry])
}

function remove(index: number) {
  emit('change', props.value.filter((_, position) => position !== index))
}

function key(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    add()
  } else if (event.key === 'Backspace' && !draft.value && props.value.length) {
    remove(props.value.length - 1)
  }
}
</script>

<template>
  <div class="sf-list">
    <span v-for="(entry, index) in value" :key="index + ':' + entry" class="sf-list-chip">
      <span class="sf-list-chip-label">{{ entry }}</span>
      <button type="button" class="sf-list-chip-x" :aria-label="'Remove ' + entry" @click="remove(index)">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
      </button>
    </span>
    <input v-bind="$attrs" v-model="draft" class="sf-list-input" type="text" :placeholder="value.length ? '' : placeholder ?? 'Type a value and press Enter'"
      :aria-roledescription="'list of ' + label.toLocaleLowerCase()" @keydown="key" @blur="add" />
  </div>
</template>

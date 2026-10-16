<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'

// Removable-chip token input. Selected values are chips with an x; remaining
// suggestions are shown as clickable chips below the field (always visible, so the
// full vocabulary is pickable without typing). Free-form entry is allowed too:
// Enter / comma commits the typed term, Backspace on an empty field removes the
// last chip. Typing filters the suggestion chips.
const props = withDefaults(defineProps<{
  modelValue: string[]
  suggestions?: string[]
  placeholder?: string
  disabled?: boolean
}>(), { suggestions: () => [] })
const emit = defineEmits<{ (e: 'update:modelValue', value: string[]): void }>()

const query = ref('')
const inputEl = ref<HTMLInputElement | null>(null)

const available = computed(() => {
  const q = query.value.trim().toLowerCase()
  return props.suggestions
    .filter(s => !props.modelValue.includes(s))
    .filter(s => !q || s.toLowerCase().includes(q))
})

function add(raw: string) {
  const value = raw.trim()
  if (!value || props.modelValue.includes(value)) { query.value = ''; return }
  emit('update:modelValue', [...props.modelValue, value])
  query.value = ''
  inputEl.value?.focus()
}

function remove(value: string) {
  emit('update:modelValue', props.modelValue.filter(v => v !== value))
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    add(query.value || available.value[0] || '')
  } else if (e.key === 'Backspace' && !query.value && props.modelValue.length) {
    remove(props.modelValue[props.modelValue.length - 1])
  }
}
</script>

<template>
  <div class="km-taginput-wrap">
    <div class="km-taginput" :class="{ disabled }" @click="inputEl?.focus()">
      <span v-for="tag in modelValue" :key="tag" class="km-tag">
        <span class="km-tag-label">{{ tag }}</span>
        <button type="button" class="km-tag-x" :title="`Remove ${tag}`" :aria-label="`Remove ${tag}`" :disabled="disabled" @click.stop="remove(tag)">
          <Icon icon="tabler:x" aria-hidden="true" />
        </button>
      </span>
      <input
        ref="inputEl"
        v-model="query"
        class="km-tag-field"
        type="text"
        :placeholder="modelValue.length ? '' : (placeholder || 'Add…')"
        :disabled="disabled"
        spellcheck="false"
        autocomplete="off"
        @keydown="onKey"
      />
    </div>

    <div v-if="available.length" class="km-tag-sug">
      <button
        v-for="s in available"
        :key="s"
        type="button"
        class="km-tag-sug-item"
        :disabled="disabled"
        @click="add(s)"
      >
        <Icon icon="tabler:plus" aria-hidden="true" /> {{ s }}
      </button>
    </div>
  </div>
</template>

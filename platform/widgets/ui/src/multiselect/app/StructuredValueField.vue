<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import { jsonEqual } from '../../app/json-equal'

const props = withDefaults(defineProps<{
  value?: unknown
  fallback?: unknown
  kind: 'object' | 'array'
  rows?: number
  placeholder?: string
}>(), { rows: 7, placeholder: '' })

const emit = defineEmits<{ change: [value: Record<string, unknown> | unknown[]] }>()

function emptyValue(): Record<string, unknown> | unknown[] {
  return props.kind === 'array' ? [] : {}
}

function accepts(value: unknown): value is Record<string, unknown> | unknown[] {
  return props.kind === 'array'
    ? Array.isArray(value)
    : !!value && typeof value === 'object' && !Array.isArray(value)
}

function initialValue(): Record<string, unknown> | unknown[] {
  if (accepts(props.value)) return props.value
  if (accepts(props.fallback)) return props.fallback
  return emptyValue()
}

function format(value: unknown): string {
  try { return JSON.stringify(value, null, 2) }
  catch { return JSON.stringify(emptyValue(), null, 2) }
}

const text = ref(format(initialValue()))
const error = ref('')
const errorId = useId()
let currentValue = initialValue()

// A valid local edit is echoed back by the host as a new config object. Do not
// replace the user's caret/formatting in that round-trip; genuine external
// changes (undo, another editor, workflow reload) still refresh the field.
watch(() => [props.value, props.fallback, props.kind], () => {
  const value = initialValue()
  if (jsonEqual(value, currentValue)) return
  currentValue = value
  text.value = format(value)
  error.value = ''
})

function update(raw: string) {
  text.value = raw
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    error.value = 'That isn’t valid JSON. Check commas, quotes, and brackets.'
    return
  }
  if (!accepts(parsed)) {
    error.value = `Enter a JSON ${props.kind}.`
    return
  }
  error.value = ''
  if (jsonEqual(parsed, currentValue)) return
  currentValue = parsed
  emit('change', parsed)
}
</script>

<template>
  <textarea
    class="sf-input sf-textarea sf-structured"
    :class="error && 'is-invalid'"
    :rows="rows"
    :value="text"
    :placeholder="placeholder"
    :aria-invalid="error ? 'true' : undefined"
    :aria-describedby="error ? errorId : undefined"
    spellcheck="false"
    @input="update(($event.target as HTMLTextAreaElement).value)"
  />
  <span v-if="error" :id="errorId" class="sf-error" role="alert">{{ error }}</span>
</template>

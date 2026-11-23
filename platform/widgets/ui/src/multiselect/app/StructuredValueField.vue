<script setup lang="ts">
import { ref, watch } from 'vue'
import { jsonEqual } from '../../app/json-equal'

const props = withDefaults(defineProps<{
  value?: unknown
  fallback?: unknown
  kind: 'object' | 'array'
  rows?: number
}>(), { rows: 7 })

const emit = defineEmits<{ change: [value: Record<string, unknown> | unknown[]]; error: [message: string] }>()

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
let currentValue = initialValue()

// A valid local edit is echoed back by the host as a new config object. Do not
// replace the user's caret/formatting in that round-trip; genuine external
// changes (undo, another editor, workflow reload) still refresh the field.
watch(() => [props.value, props.fallback, props.kind], () => {
  const value = initialValue()
  if (jsonEqual(value, currentValue)) return
  currentValue = value
  text.value = format(value)
  emit('error', '')
})

function update(raw: string) {
  text.value = raw
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    emit('error', 'That isn’t valid JSON. Check commas, quotes, and brackets.')
    return
  }
  if (!accepts(parsed)) {
    emit('error', `Enter a JSON ${props.kind}.`)
    return
  }
  emit('error', '')
  if (jsonEqual(parsed, currentValue)) return
  currentValue = parsed
  emit('change', parsed)
}
</script>

<template>
  <textarea
    class="sf-input sf-textarea sf-structured"
    :rows="rows"
    :value="text"
    spellcheck="false"
    @input="update(($event.target as HTMLTextAreaElement).value)"
  />
</template>

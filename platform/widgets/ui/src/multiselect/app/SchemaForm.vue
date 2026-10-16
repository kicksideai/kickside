<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import WcMount from '../../app/WcMount.vue'
import StructuredValueField from './StructuredValueField.vue'
import { jsonEqual } from '../../app/json-equal'

// Generic JSON-schema -> form widget. The shared, decoupled default for any
// config surface: pass a `schema` (a JSON Schema, as object or string) and the
// current `config`; edits are reported through `config-changed`. Used wherever a
// participant declares a config_schema but no richer web component of its own.
interface SchemaField {
  type?: string
  title?: string
  description?: string
  enum?: string[]
  default?: unknown
  format?: string
  rows?: number
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  group?: string
  // Picker declarations are part of the shared config-schema grammar.  The
  // picker owns selection while this form owns the scalar config value.
  picker?: string
  provider?: string
  class?: string
  source?: string
  value_field?: string
  // Per-field required flag (meta.io port schemas carry required on the field,
  // not in a top-level required array); honored alongside the array below.
  required?: boolean
}
interface JsonSchema { properties?: Record<string, SchemaField>; required?: string[] }
interface P { schema?: JsonSchema | string | null; config?: Record<string, unknown> | null }
interface E { 'config-changed': Record<string, unknown> }

const props = useProps<P>()
const emit = useEvents<E>()

const parsed = computed<JsonSchema>(() => {
  const s = props.value.schema
  if (typeof s === 'string') { try { return JSON.parse(s) } catch { return {} } }
  return s || {}
})
const fields = computed<Array<[string, SchemaField]>>(() => Object.entries(parsed.value.properties || {}))
const primaryFields = computed(() => fields.value.filter(([, f]) => f.group !== 'advanced'))
const advancedFields = computed(() => fields.value.filter(([, f]) => f.group === 'advanced'))
const required = computed(() => new Set(parsed.value.required || []))
const values = ref<Record<string, unknown>>({})
watch(() => props.value.config, config => {
  values.value = { ...config }
}, { immediate: true, flush: 'sync' })

function set(key: string, value: unknown) {
  if (jsonEqual(values.value[key], value)) return
  values.value = { ...values.value, [key]: value }
  emit('config-changed', values.value)
}
function controlType(f: SchemaField): string {
  if (f.format === 'password') return 'password'
  if (f.format === 'date') return 'date'
  return 'text'
}
function isRequired(key: string, f: SchemaField): boolean {
  return required.value.has(key) || f.required === true
}
function textRows(f: SchemaField): number {
  const n = Number(f.rows)
  if (Number.isFinite(n) && n >= 1) return Math.floor(n)
  return 4
}
// picker: wc-schema-form means "the generic form renders me" (the same
// convention ports.ts isSelectorPicker applies): it is this form, not a
// mountable picker — nesting it here would recurse without bound.
function pickerTag(f: SchemaField): string {
  const tag = typeof f.picker === 'string' ? f.picker.trim() : ''
  return tag === 'wc-schema-form' ? '' : tag
}
function pickerSchema(key: string, f: SchemaField): JsonSchema {
  return { properties: { [key]: f } }
}
function pickerMeta(f: SchemaField): Record<string, unknown> {
  return {
    ...(f.class ? { thread_class: f.class } : {}),
    ...(f.title ? { title: f.title } : {}),
  }
}
function pickerProvider(f: SchemaField): string {
  return typeof f.provider === 'string' ? f.provider.trim() : ''
}
// The label is the field's own title; a connection picker with neither falls back
// to the provider's registered name.
function pickerLabel(f: SchemaField): string {
  return typeof f.title === 'string' ? f.title.trim() : ''
}
function pickerConfig(key: string): Record<string, unknown> {
  // wc-component-picker's stable value convention is {thread_id}; adapting it
  // here keeps schemas free to name their own config field (flow_ref,
  // voice_kb_ref, and so on).
  const field = parsed.value.properties?.[key]
  return field?.value_field ? { [key]: values.value[key] } : { thread_id: values.value[key] ?? '' }
}
function pickerValue(key: string, detail: unknown): unknown {
  if (detail && typeof detail === 'object') {
    const selection = detail as Record<string, unknown>
    return selection[key] ?? selection.thread_id ?? selection.id ?? selection.value ?? ''
  }
  return detail ?? ''
}
</script>

<template>
  <div class="sf">
    <label v-for="[key, f] in primaryFields" :key="key" class="sf-field">
      <span class="sf-lbl">{{ f.title || key }}<span v-if="isRequired(key, f)" class="sf-req"> *</span></span>
      <WcMount v-if="pickerTag(f)" :tag="pickerTag(f)" :schema="pickerSchema(key, f)" :config="pickerConfig(key)" :meta="pickerMeta(f)" :provider="pickerProvider(f)" :label="pickerLabel(f)" @change="set(key, pickerValue(key, $event))" />
      <select v-else-if="f.enum" class="sf-input" :required="isRequired(key, f)" :value="(values[key] as string) ?? f.default ?? ''" @change="set(key, ($event.target as HTMLSelectElement).value)">
        <option v-for="opt in f.enum" :key="opt" :value="opt">{{ opt }}</option>
      </select>
      <textarea v-else-if="f.format === 'textarea'" class="sf-input sf-textarea" :required="isRequired(key, f)" :minlength="f.minLength" :maxlength="f.maxLength" :rows="textRows(f)" :value="(values[key] as string) ?? f.default ?? ''" :placeholder="f.description || ''" @input="set(key, ($event.target as HTMLTextAreaElement).value)" />
      <StructuredValueField v-else-if="f.type === 'object' || f.type === 'array'" :value="values[key]" :fallback="f.default" :kind="f.type" :rows="textRows(f)" :placeholder="f.description || ''" @change="set(key, $event)" />
      <input v-else-if="f.type === 'boolean'" class="sf-check" type="checkbox" :checked="!!(values[key] ?? f.default)" @change="set(key, ($event.target as HTMLInputElement).checked)" />
      <input v-else-if="f.type === 'number' || f.type === 'integer'" class="sf-input" type="number" :required="isRequired(key, f)" :min="f.minimum" :max="f.maximum" :step="f.type === 'integer' ? 1 : 'any'" :value="(values[key] as number) ?? f.default ?? ''" @input="set(key, ($event.target as HTMLInputElement).value === '' ? undefined : Number(($event.target as HTMLInputElement).value))" />
      <input v-else class="sf-input" :type="controlType(f)" :required="isRequired(key, f)" :minlength="f.minLength" :maxlength="f.maxLength" :value="(values[key] as string) ?? f.default ?? ''" :placeholder="f.description || ''" @input="set(key, ($event.target as HTMLInputElement).value)" />
      <span v-if="f.description" class="sf-hint">{{ f.description }}</span>
    </label>
    <details v-if="advancedFields.length" class="sf-advanced">
      <summary class="sf-advanced-summary">Advanced</summary>
      <div class="sf-advanced-body">
        <label v-for="[key, f] in advancedFields" :key="key" class="sf-field">
          <span class="sf-lbl">{{ f.title || key }}<span v-if="isRequired(key, f)" class="sf-req"> *</span></span>
          <WcMount v-if="pickerTag(f)" :tag="pickerTag(f)" :schema="pickerSchema(key, f)" :config="pickerConfig(key)" :meta="pickerMeta(f)" :provider="pickerProvider(f)" :label="pickerLabel(f)" @change="set(key, pickerValue(key, $event))" />
          <select v-else-if="f.enum" class="sf-input" :required="isRequired(key, f)" :value="(values[key] as string) ?? f.default ?? ''" @change="set(key, ($event.target as HTMLSelectElement).value)">
            <option v-for="opt in f.enum" :key="opt" :value="opt">{{ opt }}</option>
          </select>
          <textarea v-else-if="f.format === 'textarea'" class="sf-input sf-textarea" :required="isRequired(key, f)" :minlength="f.minLength" :maxlength="f.maxLength" :rows="textRows(f)" :value="(values[key] as string) ?? f.default ?? ''" :placeholder="f.description || ''" @input="set(key, ($event.target as HTMLTextAreaElement).value)" />
          <StructuredValueField v-else-if="f.type === 'object' || f.type === 'array'" :value="values[key]" :fallback="f.default" :kind="f.type" :rows="textRows(f)" :placeholder="f.description || ''" @change="set(key, $event)" />
          <input v-else-if="f.type === 'boolean'" class="sf-check" type="checkbox" :checked="!!(values[key] ?? f.default)" @change="set(key, ($event.target as HTMLInputElement).checked)" />
          <input v-else-if="f.type === 'number' || f.type === 'integer'" class="sf-input" type="number" :required="isRequired(key, f)" :min="f.minimum" :max="f.maximum" :step="f.type === 'integer' ? 1 : 'any'" :value="(values[key] as number) ?? f.default ?? ''" @input="set(key, ($event.target as HTMLInputElement).value === '' ? undefined : Number(($event.target as HTMLInputElement).value))" />
          <input v-else class="sf-input" :type="controlType(f)" :required="isRequired(key, f)" :minlength="f.minLength" :maxlength="f.maxLength" :value="(values[key] as string) ?? f.default ?? ''" :placeholder="f.description || ''" @input="set(key, ($event.target as HTMLInputElement).value)" />
          <span v-if="f.description" class="sf-hint">{{ f.description }}</span>
        </label>
      </div>
    </details>
  </div>
</template>

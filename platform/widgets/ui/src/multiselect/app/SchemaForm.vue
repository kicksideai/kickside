<script setup lang="ts">
import { computed, onMounted, ref, useId, watch } from 'vue'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import WcMount from '../../app/WcMount.vue'
import StructuredValueField from './StructuredValueField.vue'
import StringListField from './StringListField.vue'
import { jsonEqual } from '../../app/json-equal'
import { fieldError, type SchemaField, type SchemaFormValidity } from '../schema-form-validation'

// Generic JSON-schema -> form widget. The shared, decoupled default for any
// config surface: pass a `schema` (a JSON Schema, as object or string) and the
// current `config`; edits are reported through `config-changed`. Used wherever a
// participant declares a config_schema but no richer web component of its own.
interface JsonSchema { properties?: Record<string, SchemaField>; required?: string[] }
interface P {
  schema?: JsonSchema | string | null
  config?: Record<string, unknown> | null
  fieldErrors?: Record<string, string>
  allowUnset?: boolean
}
interface E {
  'config-changed': Record<string, unknown>
  'validity-changed': SchemaFormValidity
}

const props = useProps<P>()
const emit = useEvents<E>()

const parsed = computed<JsonSchema>(() => {
  const s = props.value.schema
  if (typeof s === 'string') { try { return JSON.parse(s) } catch { return {} } }
  return s || {}
})
const fields = computed<Array<[string, SchemaField]>>(() => Object.entries(parsed.value.properties || {}))
// Fields keep their declared order inside named groups; ungrouped fields lead
// and the advanced group stays folded at the end.
const groups = computed(() => {
  const named = new Map<string, Array<[string, SchemaField]>>()
  for (const entry of fields.value) {
    if (entry[1].group === 'advanced') continue
    const name = typeof entry[1].group === 'string' ? entry[1].group.trim() : ''
    if (!named.has(name)) named.set(name, [])
    named.get(name)!.push(entry)
  }
  const ungrouped = named.get('') ?? []
  named.delete('')
  return [
    { advanced: false, title: '', fields: ungrouped },
    ...[...named].map(([title, entries]) => ({ advanced: false, title, fields: entries })),
    { advanced: true, title: '', fields: fields.value.filter(([, f]) => f.group === 'advanced') },
  ].filter(group => group.fields.length)
})

const id = useId()
const fieldIndices = computed(() => new Map(fields.value.map(([key], index) => [key, index])))
const form = ref<HTMLFormElement>()
const values = ref<Record<string, unknown>>({})
const draftErrors = ref(new Map<string, string>())
const required = computed(() => new Set(parsed.value.required || []))

watch(() => props.value.config, config => {
  const next = { ...config }
  for (const key of draftErrors.value.keys()) {
    if (!jsonEqual(next[key], values.value[key])) draftErrors.value.delete(key)
  }
  values.value = next
}, { immediate: true, flush: 'sync' })
watch(() => props.value.schema, (schema, previous) => {
  if (!jsonEqual(schema, previous)) draftErrors.value.clear()
})

function effectiveValue(key: string, field: SchemaField): unknown {
  return (Object.hasOwn(values.value, key) ? values.value[key] : undefined) ?? field.default
}

const errors = computed(() => {
  const messages = new Map<string, string>()
  const supplied = props.value.fieldErrors ?? {}
  for (const { fields } of groups.value) {
    for (const [key, field] of fields) {
      const unset = props.value.allowUnset && (!Object.hasOwn(values.value, key) || values.value[key] == null)
      const message = draftErrors.value.get(key) || (Object.hasOwn(supplied, key) && supplied[key]) ||
        (unset ? '' : fieldError(field, effectiveValue(key, field), isRequired(key, field)))
      if (message) messages.set(key, message)
    }
  }
  return messages
})

onMounted(() => {
  watch(() => Object.fromEntries(errors.value), (current, previous) => {
    if (!jsonEqual(current, previous)) {
      emit('validity-changed', { valid: !errors.value.size, errors: current })
    }
  }, { immediate: true, flush: 'post' })
})

function set(key: string, value: unknown) {
  if (props.value.allowUnset && value === '') value = undefined
  if (jsonEqual(values.value[key], value)) return
  const next = { ...values.value, [key]: value }
  if (value === undefined && props.value.allowUnset) delete next[key]
  values.value = next
  emit('config-changed', next)
}

function updateInput(key: string, control: HTMLInputElement | HTMLTextAreaElement, numeric = false) {
  if (control.validity.badInput) {
    draftErrors.value.set(key, numeric ? 'Enter a number.' : 'Enter a valid date.')
    return
  }
  draftErrors.value.delete(key)
  set(key, numeric ? (control.value === '' ? undefined : Number(control.value)) : control.value)
}

function controlId(key: string) {
  return id + '-field-' + fieldIndices.value.get(key)
}

function controlAttrs(key: string, field: SchemaField) {
  const target = controlId(key)
  const describedBy = [field.description ? target + '-help' : '', defaultHint(key, field) ? target + '-default' : '', errors.value.has(key) ? target + '-error' : ''].filter(Boolean)
  return {
    id: target,
    'aria-describedby': describedBy.join(' ') || undefined,
    'aria-invalid': errors.value.has(key) ? true : undefined,
    'aria-required': !props.value.allowUnset && isRequired(key, field) ? true : undefined,
  }
}

function reportValidity(event?: Event) {
  const first = errors.value.keys().next().value
  if (first === undefined) return
  event?.preventDefault()
  const root = form.value?.getRootNode() as Document | ShadowRoot | undefined
  const control = root?.getElementById(controlId(first))
  const advanced = control?.closest('details')
  if (advanced) advanced.open = true
  if (!control) return
  const picker = control.shadowRoot
  const target = picker?.querySelector<HTMLElement>('[role="combobox"], input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled)')
    ?? picker?.querySelector<HTMLElement>('button:not(:disabled), [tabindex="0"]')
  const focusable = target ?? control
  focusable.focus()
  if (!target && root?.activeElement !== control && !control.hasAttribute('tabindex')) {
    control.tabIndex = -1
    control.focus()
    control.removeAttribute('tabindex')
  }
}

function controlType(f: SchemaField): string {
  if (f.format === 'password') return 'password'
  if (f.format === 'date') return 'date'
  return 'text'
}
function isRequired(key: string, f: SchemaField): boolean {
  return required.value.has(key) || f.required === true
}
function stringList(f: SchemaField): boolean {
  return f.type === 'array' && f.items?.type === 'string' && !f.items.enum
}
function optionList(f: SchemaField): boolean {
  return f.type === 'array' && Array.isArray(f.items?.enum)
}
function strings(key: string, f: SchemaField): string[] {
  const value = effectiveValue(key, f)
  return Array.isArray(value) ? value.map(String) : []
}
function toggleOption(key: string, f: SchemaField, option: unknown, on: boolean) {
  const current = Array.isArray(effectiveValue(key, f)) ? effectiveValue(key, f) as unknown[] : []
  const next = (f.items?.enum ?? []).filter(entry => entry === option ? on : current.includes(entry))
  set(key, next)
}
function display(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'On' : 'Off'
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'None'
  if (value && typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
// Explains what an unset field resolves to, so defaults are visible without a value.
function defaultHint(key: string, f: SchemaField): string {
  if (Object.hasOwn(values.value, key) && values.value[key] != null) return ''
  if (f.default !== undefined) return 'Default: ' + display(f.default)
  return props.value.allowUnset ? 'Uses the application setting.' : ''
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
  <form ref="form" class="sf" novalidate @submit.prevent="reportValidity()" @schema-form-report="reportValidity">
    <component :is="group.advanced ? 'details' : group.title ? 'fieldset' : 'div'" v-for="group in groups" :key="group.advanced + group.title"
      :class="group.advanced ? 'sf-advanced' : group.title ? 'sf-group' : 'sf-primary'">
      <summary v-if="group.advanced" class="sf-advanced-summary">Advanced</summary>
      <legend v-else-if="group.title" class="sf-group-title">{{ group.title }}</legend>
      <div :class="group.advanced ? 'sf-advanced-body' : group.title ? 'sf-group-body' : 'sf-primary'">
        <div v-for="[key, f] in group.fields" :key="key" class="sf-field">
          <component :is="pickerTag(f) || optionList(f) ? 'span' : 'label'" :id="controlId(key) + '-label'" :for="pickerTag(f) || optionList(f) ? undefined : controlId(key)" class="sf-lbl">
            {{ f.title || key }}<span v-if="!props.allowUnset && isRequired(key, f)" class="sf-req" aria-hidden="true"> *</span>
          </component>
          <WcMount v-if="pickerTag(f)" :tag="pickerTag(f)" :schema="pickerSchema(key, f)" :config="pickerConfig(key)" :meta="pickerMeta(f)" :provider="pickerProvider(f)" :label="pickerLabel(f)"
            :attrs="{ ...controlAttrs(key, f), 'aria-labelledby': controlId(key) + '-label', role: 'group' }"
            @change="set(key, pickerValue(key, $event))" />
          <select v-else-if="f.enum" v-bind="controlAttrs(key, f)" class="sf-input"
            :value="effectiveValue(key, f) ?? ''" @change="set(key, f.enum[($event.target as HTMLSelectElement).selectedIndex - (f.enum.includes('') ? 0 : 1)])">
            <option v-if="!f.enum.includes('')" value="">Choose a value</option>
            <option v-for="(opt, index) in f.enum" :key="index" :value="opt">{{ opt }}</option>
          </select>
          <textarea v-else-if="f.format === 'textarea'" v-bind="controlAttrs(key, f)" class="sf-input sf-textarea"
            :minlength="f.minLength" :maxlength="f.maxLength" :rows="textRows(f)" :value="String(effectiveValue(key, f) ?? '')"
            @input="updateInput(key, $event.target as HTMLTextAreaElement)" />
          <StringListField v-else-if="stringList(f)" v-bind="controlAttrs(key, f)" :label="f.title || key"
            :value="strings(key, f)" @change="set(key, $event)" />
          <div v-else-if="optionList(f)" v-bind="{ ...controlAttrs(key, f), 'aria-labelledby': controlId(key) + '-label' }" role="group" class="sf-options">
            <label v-for="(option, index) in f.items!.enum" :key="index" class="sf-option">
              <input type="checkbox" class="sf-check" :checked="strings(key, f).includes(String(option))"
                @change="toggleOption(key, f, option, ($event.target as HTMLInputElement).checked)" />
              <span>{{ option }}</span>
            </label>
          </div>
          <StructuredValueField v-else-if="f.type === 'object' || f.type === 'array'" v-bind="controlAttrs(key, f)"
            :value="values[key]" :fallback="f.default" :kind="f.type" :rows="textRows(f)"
            @change="set(key, $event)" @error="draftErrors.set(key, $event)" />
          <input v-else-if="f.type === 'boolean'" v-bind="controlAttrs(key, f)" class="sf-switch" type="checkbox" role="switch"
            :checked="!!effectiveValue(key, f)" @change="set(key, ($event.target as HTMLInputElement).checked)" />
          <input v-else-if="f.type === 'number' || f.type === 'integer'" v-bind="controlAttrs(key, f)" class="sf-input" type="number"
            :min="f.minimum" :max="f.maximum" :step="f.type === 'integer' ? 1 : 'any'" :value="effectiveValue(key, f) ?? ''"
            @input="updateInput(key, $event.target as HTMLInputElement, true)" />
          <input v-else v-bind="controlAttrs(key, f)" class="sf-input" :type="controlType(f)"
            :minlength="f.minLength" :maxlength="f.maxLength" :value="effectiveValue(key, f) ?? ''"
            @input="updateInput(key, $event.target as HTMLInputElement)" />
          <span v-if="f.description" :id="controlId(key) + '-help'" class="sf-hint">{{ f.description }}</span>
          <span v-if="defaultHint(key, f)" :id="controlId(key) + '-default'" class="sf-hint">{{ defaultHint(key, f) }}</span>
          <span v-if="errors.get(key)" :id="controlId(key) + '-error'" class="sf-error" role="alert">{{ errors.get(key) }}</span>
        </div>
      </div>
    </component>
  </form>
</template>

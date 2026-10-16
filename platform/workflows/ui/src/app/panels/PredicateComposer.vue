<script setup lang="ts">
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Panel from 'primevue/panel'
import Select from 'primevue/select'
import { computed, ref, watch } from 'vue'
import { operatorsFor, parseSimplePredicate, predicateFields, serializePredicate, type PredicateDraft, type PredicateOperator } from './predicate-authoring'

const props = withDefaults(defineProps<{
  modelValue: string
  schema?: unknown
  root?: 'output' | 'state' | 'input'
  label?: string
  compact?: boolean
}>(), { root: 'output', label: 'Condition', compact: false })
const emit = defineEmits<{ (event: 'update:modelValue', value: string): void }>()

const fields = computed(() => predicateFields(props.schema))
const draft = ref<PredicateDraft>({ field: '', operator: 'eq', value: '' })
const advancedCollapsed = ref(true)
const raw = ref('')
let internal = false

const selectedField = computed(() => fields.value.find((field) => field.path === draft.value.field))
const operators = computed(() => operatorsFor(selectedField.value?.type || 'unknown'))
const needsValue = computed(() => draft.value.operator !== 'truthy' && draft.value.operator !== 'falsy')
const valueType = computed(() => selectedField.value?.type === 'number' ? 'number' : 'text')
const numericValue = computed<number | null>(() => {
  const value = Number(draft.value.value)
  return draft.value.value.trim() !== '' && Number.isFinite(value) ? value : null
})

function seed(value: string) {
  raw.value = value || ''
  const parsed = parseSimplePredicate(value || '', props.root)
  if (parsed && fields.value.some((field) => field.path === parsed.field)) {
    draft.value = parsed
    advancedCollapsed.value = true
  } else {
    draft.value = { field: '', operator: 'eq', value: '' }
    advancedCollapsed.value = !value
  }
}
watch(() => [props.modelValue, props.root, props.schema], () => {
  if (internal) { internal = false; return }
  seed(props.modelValue)
}, { immediate: true, deep: true })

function publish(value: string) {
  internal = true
  raw.value = value
  emit('update:modelValue', value)
}
function publishDraft() {
  const next = serializePredicate(draft.value, selectedField.value?.type || 'unknown', props.root)
  publish(next)
}
function setNumericValue(value: number | null) {
  draft.value.value = value == null ? '' : String(value)
  publishDraft()
}
function selectField(field: string | null) {
  draft.value.field = field || ''
  const allowed = operatorsFor(selectedField.value?.type || 'unknown').map((operator) => operator.value)
  if (!allowed.includes(draft.value.operator)) draft.value.operator = allowed[0] || 'eq'
  draft.value.value = ''
  publishDraft()
}
function selectOperator(operator: PredicateOperator | null) {
  if (!operator) return
  draft.value.operator = operator
  publishDraft()
}
</script>

<template>
  <section class="wf-predicate" :class="{ 'is-compact': compact }" :aria-label="label">
    <div v-if="fields.length" class="wf-predicate-row">
      <label>
        <span>Field</span>
        <Select
          :model-value="draft.field || null"
          :options="fields"
          option-label="label"
          option-value="path"
          placeholder="Choose a field…"
          aria-label="Condition field"
          @update:model-value="selectField"
        />
      </label>
      <label>
        <span>Check</span>
        <Select
          :model-value="draft.operator"
          :options="operators"
          option-label="label"
          option-value="value"
          :disabled="!draft.field"
          aria-label="Condition operator"
          @update:model-value="selectOperator"
        />
      </label>
      <label v-if="needsValue">
        <span>Value</span>
        <InputNumber
          v-if="valueType === 'number'"
          :model-value="numericValue"
          :disabled="!draft.field"
          :use-grouping="false"
          aria-label="Condition value"
          placeholder="Enter a value"
          @update:model-value="setNumericValue"
        />
        <InputText v-else v-model="draft.value" :disabled="!draft.field" aria-label="Condition value" placeholder="Enter a value" @change="publishDraft" />
      </label>
    </div>
    <p v-else class="wf-panel-hint wf-panel-hint--warn">Connect a step with declared output fields to build this visually.</p>

    <Panel v-model:collapsed="advancedCollapsed" class="wf-predicate-disclosure" header="Advanced expression" toggleable>
      <div class="wf-predicate-advanced">
        <InputText v-model="raw" class="wf-input wf-mono" aria-label="Condition expression" placeholder="output.status == 'ready'" @change="publish(raw.trim())" />
        <p class="wf-panel-hint">Use expr-lang only when the visual controls cannot express the rule.</p>
      </div>
    </Panel>
  </section>
</template>

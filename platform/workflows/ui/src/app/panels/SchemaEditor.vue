<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import WcMount from '@widgets/app/WcMount.vue'
import { schemaHasProps } from '@widgets/app/ports'
import { parseJsonObject } from './json-field'
import { assistSchema, isSchemaAssistOk } from './assist-schema'

// The universal schema editor (W10.2). ONE component behind every JSON-schema / JSON
// entry point: boundary node config, the Run-with-input dialog, tool-exposure preview.
// A code view is always present; a simple form view is offered when a driving schema is
// known (value mode). In schema mode it carries the AI-assist affordance — the user
// states an intent in plain words and the assistant drafts or edits the schema in place,
// applied with an accept/undo step. When the assist endpoint isn't deployed the affordance
// degrades to a disabled button ("assist unavailable"); nothing is fabricated.
//
// Modes:
//  * 'schema' (default) — the edited object IS a JSON schema. Assist drafts it.
//  * 'value'            — the edited object is data. A `schema` prop drives an optional
//                         form view (via wc-schema-form). No schema-assist (data isn't
//                         schema-generated).
const SCHEMA_FORM_TAG = 'wc-schema-form'

const props = withDefaults(defineProps<{
  modelValue: Record<string, unknown> | null
  mode?: 'schema' | 'value'
  // value mode: the JSON schema that drives the optional form view.
  schema?: unknown
  // assist context passed to the endpoint.
  surface?: string
  sample?: unknown
  label?: string
  rows?: number
  placeholder?: string
  // reset key: when it changes, the editor re-seeds its text from modelValue (used when
  // the host swaps which node/field is being edited).
  resetKey?: string | number
  // When set, a blank editor stays blank and commits the field back to unset (emits
  // `clear`) instead of seeding a default object — for surfaces where "no JSON" is a
  // meaningful state, e.g. an agent with no declared exit schema.
  allowEmpty?: boolean
}>(), {
  mode: 'schema',
  rows: 10,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, unknown>): void
  (e: 'change', value: Record<string, unknown>): void
  (e: 'clear'): void
  // Live parse validity of the code view — false while the text is non-empty and
  // doesn't parse to a JSON object. Hosts gate submit on it (run-with-input dialog).
  (e: 'valid', ok: boolean): void
}>()

const isSchemaMode = computed(() => props.mode !== 'value')
const canForm = computed(() => props.mode === 'value' && schemaHasProps(props.schema))

const view = ref<'code' | 'form'>('code')
const viewOptions = [
  { label: 'Form', value: 'form' },
  { label: 'JSON', value: 'code' },
]
const text = ref('')
const parseError = ref('')

function seed() {
  const v = props.modelValue
  if (v && typeof v === 'object') {
    text.value = JSON.stringify(v, null, 2)
  } else if (props.allowEmpty) {
    text.value = ''
  } else {
    text.value = JSON.stringify(isSchemaMode.value ? { type: 'object', properties: {} } : {}, null, 2)
  }
  parseError.value = ''
  clearDraft()
  if (!canForm.value) view.value = 'code'
  emit('valid', true)
}

// Live sync on every keystroke/paste so the host's bound value tracks the text without
// waiting for a blur — the run-with-input dialog reads it directly when Run is clicked.
// This path never emits `change`: config surfaces persist on `change` (blur) and must
// not commit per-keystroke.
function onInput() {
  clearDraft()
  const blank = !text.value.trim()
  const { value, error } = parseJsonObject(text.value)
  parseError.value = error
  emit('valid', !error)
  if (blank || error || !value) return
  emit('update:modelValue', value)
}

function commitCode() {
  // Blank + allowEmpty commits the field back to unset rather than {}.
  if (props.allowEmpty && !text.value.trim()) {
    parseError.value = ''
    clearDraft()
    emit('valid', true)
    emit('clear')
    return
  }
  const { value, error } = parseJsonObject(text.value)
  parseError.value = error
  emit('valid', !error)
  if (error || !value) return
  clearDraft()
  emit('update:modelValue', value)
  emit('change', value)
}

// Form view (value mode): wc-schema-form edits the data object against the schema.
function onFormChange(detail: unknown) {
  if (!detail || typeof detail !== 'object') return
  const merged = { ...(props.modelValue || {}), ...(detail as Record<string, unknown>) }
  text.value = JSON.stringify(merged, null, 2)
  emit('update:modelValue', merged)
  emit('change', merged)
}

// ── AI assist (schema mode only) ──
const intent = ref('')
const assisting = ref(false)
const assistError = ref('')
const assistUnavailable = ref(false)
const assistNote = ref('')
// After a draft is applied, the pre-draft text is held so Undo can restore it.
const draftPrev = ref<string | null>(null)
const draftPending = computed(() => draftPrev.value !== null)
let assistController: AbortController | null = null
let assistGeneration = 0

function invalidateAssist() {
  assistGeneration++
  assistController?.abort()
  assistController = null
  assisting.value = false
}

function clearDraft() {
  draftPrev.value = null
  assistNote.value = ''
  assistError.value = ''
}

async function runAssist() {
  if (assisting.value) {
    invalidateAssist()
    return
  }
  const q = intent.value.trim()
  if (!q || assistUnavailable.value) return
  const controller = new AbortController()
  const generation = ++assistGeneration
  assistController = controller
  assisting.value = true
  assistError.value = ''
  const current = parseJsonObject(text.value).value
  const res = await assistSchema(q, current, { surface: props.surface, sample: props.sample }, controller.signal)
  if (controller.signal.aborted || assistController !== controller || generation !== assistGeneration) return
  assistController = null
  assisting.value = false
  if (isSchemaAssistOk(res)) {
    draftPrev.value = text.value
    text.value = JSON.stringify(res.schema, null, 2)
    assistNote.value = res.notes || 'Drafted from your description — accept it or undo.'
    parseError.value = ''
    intent.value = ''
  } else {
    if (res.unavailable) assistUnavailable.value = true
    assistError.value = res.error
  }
}

function acceptDraft() {
  const { value, error } = parseJsonObject(text.value)
  parseError.value = error
  emit('valid', !error)
  if (error || !value) return
  emit('update:modelValue', value)
  emit('change', value)
  draftPrev.value = null
  assistNote.value = ''
}
function undoDraft() {
  if (draftPrev.value === null) return
  text.value = draftPrev.value
  draftPrev.value = null
  assistNote.value = ''
  parseError.value = ''
  emit('valid', true)
}

// Seed from modelValue on mount and whenever the host swaps the edited field. Declared
// last so its immediate run — synchronous during setup — sees every ref and helper above.
watch(() => props.resetKey, () => {
  invalidateAssist()
  seed()
}, { immediate: true })
onBeforeUnmount(invalidateAssist)
</script>

<template>
  <div class="wf-sed">
    <div class="wf-sed-bar">
      <span v-if="label" class="wf-panel-label wf-sed-label">{{ label }}</span>
      <span class="wf-sed-spacer"></span>
      <SelectButton
        v-if="canForm"
        v-model="view"
        class="wf-sed-views"
        :options="viewOptions"
        option-label="label"
        option-value="value"
        aria-label="Editor view"
      />
    </div>

    <WcMount
      v-if="canForm && view === 'form'"
      :tag="SCHEMA_FORM_TAG"
      :schema="schema"
      :config="modelValue || {}"
      @change="onFormChange"
    />
    <template v-else>
      <Textarea
        v-model="text"
        class="wf-textarea wf-mono wf-sed-code"
        :rows="rows"
        spellcheck="false"
        :placeholder="placeholder"
        :aria-label="label || (isSchemaMode ? 'JSON schema' : 'JSON value')"
        @input="onInput"
        @change="commitCode"
      ></Textarea>
      <p v-if="parseError" class="wf-field-err">{{ parseError }}</p>
    </template>

    <!-- AI assist affordance — schema surfaces only. -->
    <template v-if="isSchemaMode">
      <div class="wf-sed-assist">
        <InputText
          v-model="intent"
          class="wf-input wf-sed-intent"
          type="text"
          placeholder="Describe the expected fields — e.g. a lead with email and company"
          aria-label="Describe the expected fields"
          :disabled="assistUnavailable"
          @keydown.enter.prevent="runAssist"
        />
        <Button
          type="button"
          class="wf-sed-go"
          :disabled="assistUnavailable || (!assisting && !intent.trim())"
          :title="assistUnavailable ? 'AI assist unavailable' : assisting ? 'Cancel this draft' : 'Draft the fields with AI'"
          @click="runAssist"
        >
          <Icon :icon="assisting ? 'tabler:x' : 'tabler:wand'" aria-hidden="true" />
          <span>{{ assisting ? 'Cancel' : 'Draft with AI' }}</span>
        </Button>
      </div>
      <div v-if="draftPending" class="wf-sed-draft" role="status" aria-label="Drafted fields ready to review">
        <div class="wf-sed-draft-copy">
          <Icon icon="tabler:sparkles" aria-hidden="true" />
          <span>{{ assistNote }}</span>
        </div>
        <div class="wf-sed-draft-actions">
          <Button type="button" class="wf-sed-undo" severity="secondary" outlined @click="undoDraft">Undo</Button>
          <Button type="button" class="wf-sed-accept" @click="acceptDraft">Accept</Button>
        </div>
      </div>
      <p v-if="assistUnavailable" class="wf-panel-hint wf-panel-hint--warn wf-sed-msg">AI assist isn’t available here yet.</p>
      <p v-else-if="assistError" class="wf-field-err wf-sed-msg">{{ assistError }}</p>
    </template>
  </div>
</template>

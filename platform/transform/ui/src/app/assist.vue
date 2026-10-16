<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import Select from 'primevue/select'
import { loadByTagName } from '@wippy-fe/proxy'
import { useComponentProps, useComponentEvents } from '../constants.ts'
import type { AssistResult, AssistStrategy, InputShape, Transform, TransformKind, ValidateResult } from '../types.ts'
import { assist as assistApi, validate as validateApi } from '../api.ts'

// A transform field, not a mini-app: one editor for the chosen strategy, one Generate
// action (the AI flow), and inline validation. It emits `transform-confirmed` with the
// live config on every change, so the host form owns install/cancel -- there are no
// Confirm/Cancel buttons here. GENERIC: every input arrives as a host attribute
// (source-schema / sink-schema / input-shape / samples / hint / value); it attaches to
// no sync itself.
const props = useComponentProps()
const emit = useComponentEvents()

const MODEL_TAG = 'wc-model-picker'
const DEFAULT_MODEL = 'class:fast'

// A host may pass a JSON string or a live object.
function asObject(v: unknown): unknown {
  if (typeof v === 'string') {
    const s = v.trim()
    if (!s) return undefined
    try { return JSON.parse(s) } catch { return s }
  }
  return v
}
function asArray(v: unknown): unknown[] {
  const o = asObject(v)
  return Array.isArray(o) ? o : []
}

const p = computed(() => props.value)
const sourceSchema = computed(() => asObject(p.value?.sourceSchema))
const sinkSchema = computed(() => asObject(p.value?.sinkSchema))
const inputShape = computed<InputShape | undefined>(() =>
  p.value?.inputShape === 'record' || p.value?.inputShape === 'content' ? p.value.inputShape : undefined)
const samples = computed(() => asArray(p.value?.samples))
const hint = computed(() => (typeof p.value?.hint === 'string' ? p.value.hint : undefined))
const disabled = computed(() => p.value?.disabled === true)
const hasSchemas = computed(() => sourceSchema.value != null && sinkSchema.value != null && inputShape.value != null)

// 'auto' lets the AI pick expr-or-llm; the concrete kinds pin the editor for hand-editing.
type Choice = 'auto' | TransformKind
const CHOICES: { value: Choice; label: string }[] = [
  { value: 'auto', label: 'Auto (AI picks)' },
  { value: 'expr', label: 'Expression' },
  { value: 'llm', label: 'LLM' },
  { value: 'code', label: 'Code (Lua)' },
  { value: 'none', label: 'Pass through' },
]
const choice = ref<Choice>('expr')

const exprText = ref('')
const llmPrompt = ref('')
const llmModel = ref(DEFAULT_MODEL)
const codeText = ref('')
const codeToolIds = ref<string[] | undefined>(undefined)

const generating = ref(false)
const error = ref('')
const rationale = ref('')
const validation = ref<ValidateResult | null>(null)

// Seed the editor from a host-provided value (edit-back on re-open).
function seedFromTransform(t: Transform | undefined): void {
  if (!t || typeof t.kind !== 'string') return
  choice.value = t.kind
  if (t.kind === 'expr') exprText.value = typeof t.expr === 'string' ? t.expr : ''
  else if (t.kind === 'llm') {
    llmPrompt.value = typeof t.prompt === 'string' ? t.prompt : ''
    if (typeof t.model === 'string' && t.model) llmModel.value = t.model
  } else if (t.kind === 'code') {
    codeText.value = typeof t.code === 'string' ? t.code : ''
    codeToolIds.value = Array.isArray(t.tool_ids) ? t.tool_ids : undefined
  }
}
seedFromTransform(asObject(p.value?.value) as Transform | undefined)

onMounted(() => { loadByTagName(MODEL_TAG, { timeoutMs: 8000 }).catch(cause => { error.value = cause instanceof Error ? cause.message : String(cause) }) })

// The live transform config for the current choice.
function buildTransform(): Transform {
  switch (choice.value) {
    case 'expr': return { kind: 'expr', expr: exprText.value.trim() }
    case 'llm': return { kind: 'llm', prompt: llmPrompt.value.trim(), ...(llmModel.value.trim() ? { model: llmModel.value.trim() } : {}) }
    case 'code': return { kind: 'code', code: codeText.value, ...(codeToolIds.value ? { tool_ids: codeToolIds.value } : {}) }
    default: return { kind: 'none' }
  }
}
const hasArtifact = computed(() => {
  switch (choice.value) {
    case 'expr': return exprText.value.trim().length > 0
    case 'llm': return llmPrompt.value.trim().length > 0
    case 'code': return codeText.value.trim().length > 0
    default: return true
  }
})

// Live-sync the config to the host on every change (the host form owns install), and
// auto-validate a hand-edit after a short debounce so a typo shows inline. `suppress`
// guards a programmatic seed (generate / value-prop) so it does not clear the status it
// just set or re-validate a draft the server already checked.
let validateTimer: ReturnType<typeof setTimeout> | undefined
let suppress = false
watch([choice, exprText, llmPrompt, llmModel, codeText], () => {
  const t = buildTransform()
  emit('transform-confirmed', { transform: t, strategy: t.kind })
  if (suppress) return
  validation.value = null
  if (validateTimer) clearTimeout(validateTimer)
  if (choice.value !== 'none' && choice.value !== 'auto' && hasArtifact.value && hasSchemas.value) {
    validateTimer = setTimeout(runValidate, 500)
  }
})

async function generate(): Promise<void> {
  if (disabled.value || generating.value || !hasSchemas.value || !samples.value.length || choice.value === 'none') return
  generating.value = true
  error.value = ''
  rationale.value = ''
  validation.value = null
  const ask: AssistStrategy = choice.value
  try {
    const r: AssistResult = await assistApi({
      source_schema: sourceSchema.value,
      sink_schema: sinkSchema.value,
      input_shape: inputShape.value!,
      samples: samples.value,
      hint: hint.value,
      strategy: ask,
    })
    rationale.value = typeof r.rationale === 'string' ? r.rationale : ''
    suppress = true
    if (r.transform && typeof r.transform.kind === 'string') seedFromTransform(r.transform)
    await nextTick()
    suppress = false
    if (Array.isArray(r.errors) && r.errors.length && !r.validated) error.value = r.errors.join('; ')
    else if (r.validated) validation.value = { ok: true, valid: true, errors: [] }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'could not generate a transform'
  } finally {
    generating.value = false
  }
}

async function runValidate(): Promise<void> {
  if (!hasArtifact.value || !hasSchemas.value || !samples.value.length) return
  try {
    validation.value = await validateApi({ transform: buildTransform(), sink_schema: sinkSchema.value,
      input_shape: inputShape.value!, samples: samples.value, source_schema: sourceSchema.value })
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause) }
}

function onModelSelect(e: Event): void {
  const v = (e as CustomEvent).detail
  if (typeof v === 'string' && v) llmModel.value = v
}

const outputPreview = computed(() => {
  const first = Array.isArray(validation.value?.outputs) ? validation.value!.outputs![0] : undefined
  if (first === undefined) return ''
  try { return JSON.stringify(first) } catch { return String(first) }
})
</script>

<template>
  <div class="kx">
    <!-- one row: strategy + generate + inline status -->
    <div class="kx-bar">
      <Select
        v-model="choice"
        class="kx-select"
        :options="CHOICES"
        option-label="label"
        option-value="value"
        :disabled="disabled"
        aria-label="Transform strategy"
        data-test="strategy"
      />
      <button
        v-if="choice !== 'none'"
        class="kx-gen"
        type="button"
        :disabled="disabled || generating || !hasSchemas || !samples.length"
        data-test="generate"
        @click="generate()"
      >
        <Icon :icon="generating ? 'tabler:loader-2' : 'tabler:wand'" :class="generating && 'spin'" aria-hidden="true" />
        {{ generating ? 'Generating…' : 'Generate' }}
      </button>
      <span v-if="validation" class="kx-status kx-tag-sm" :class="validation.valid ? 'kx-ok' : 'kx-bad'" data-test="status">
        <Icon :icon="validation.valid ? 'tabler:circle-check' : 'tabler:alert-triangle'" aria-hidden="true" />
        {{ validation.valid ? 'Validated' : 'Needs review' }}
      </span>
    </div>

    <p v-if="!samples.length" role="status">Provide real source samples to generate or validate a transform.</p>

    <!-- editor for the chosen strategy -->
    <textarea v-if="choice === 'expr'" v-model="exprText" class="kx-input kx-textarea" spellcheck="false"
      placeholder="{ content: payload.title }" data-test="expr-editor"></textarea>

    <template v-else-if="choice === 'llm'">
      <textarea v-model="llmPrompt" class="kx-input kx-textarea" spellcheck="false"
        placeholder="Summarize the item as concise plain text." data-test="llm-editor"></textarea>
      <component :is="MODEL_TAG" :value="llmModel" capability="generate" @select="onModelSelect" />
    </template>

    <template v-else-if="choice === 'code'">
      <textarea v-model="codeText" class="kx-input kx-textarea kx-code" spellcheck="false"
        placeholder="return { content = __cx_args.payload.summary.overview }" data-test="code-editor"></textarea>
      <span class="kx-hint">Item is <code>__cx_args</code> ({ payload: … }); <code>return</code> a table for the destination. Sandboxed: json / string / table / math.</span>
    </template>

    <p v-else-if="choice === 'auto'" class="kx-hint" data-test="auto-hint">Generate and the AI picks the best mapping — switch the selector to hand-write one.</p>
    <p v-else class="kx-hint" data-test="passthrough">Items pass through to the destination unchanged.</p>

    <p v-if="rationale" class="kx-rationale" data-test="rationale">{{ rationale }}</p>
    <ul v-if="validation && !validation.valid && validation.errors && validation.errors.length" class="kx-errors" data-test="verrors">
      <li v-for="(e, i) in validation.errors" :key="i">{{ e }}</li>
    </ul>
    <pre v-if="outputPreview" class="kx-pre" data-test="output-preview">{{ outputPreview }}</pre>
    <div v-if="error" class="kx-err" data-test="error">{{ error }}</div>
    <span v-if="!hasSchemas" class="kx-hint">Pick a source and destination to generate.</span>
  </div>
</template>

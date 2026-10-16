<script setup lang="ts">
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { assistConfig, isConfigAssistOk } from './assist-config'

const props = defineProps<{
  workflowId: string
  resetKey: string
  // Registry-declared nodes may already have this projection from the catalog. Built-in
  // nodes omit it and use the server-returned authoritative projection, avoiding drift.
  configSchema?: Record<string, unknown>
  currentConfig: Record<string, unknown>
  upstreamSchema?: unknown
}>()

const emit = defineEmits<{
  (event: 'accept', config: Record<string, unknown>): void
  (event: 'undo', config: Record<string, unknown>): void
}>()

const intent = ref('')
const loading = ref(false)
const error = ref('')
const notes = ref('')
const draft = ref<Record<string, unknown> | null>(null)
const resolvedSchema = ref<Record<string, unknown> | null>(null)
const undoConfig = ref<Record<string, unknown> | null>(null)
const applied = ref(false)
let requestSeq = 0
let expectedConfigFingerprint = ''
const CHANGED_DURING_DRAFT = 'This step changed while the draft was being prepared. Review the current settings and draft again.'

function fingerprint(value: unknown): string {
  const seen = new WeakSet<object>()
  function canonical(current: unknown, depth: number): unknown {
    if (depth > 20) return '[max-depth]'
    if (!current || typeof current !== 'object') return current
    if (seen.has(current)) return '[cycle]'
    seen.add(current)
    if (Array.isArray(current)) {
      const result = current.map((item) => canonical(item, depth + 1))
      seen.delete(current)
      return result
    }
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(current as Record<string, unknown>).sort()) {
      result[key] = canonical((current as Record<string, unknown>)[key], depth + 1)
    }
    seen.delete(current)
    return result
  }
  try { return JSON.stringify(canonical(value, 0)) } catch { return '[unserializable]' }
}
const identityFingerprint = computed(() => fingerprint([
  props.workflowId, props.resetKey, props.configSchema || {},
]))
const reviewSchema = computed(() => resolvedSchema.value || props.configSchema || {})
const currentFingerprint = computed(() => fingerprint(props.currentConfig))
const requestFingerprint = computed(() => fingerprint([
  props.workflowId, props.resetKey, props.configSchema, props.currentConfig,
]))

function resetForIdentityChange() {
  const drafting = loading.value || draft.value !== null
  requestSeq += 1
  expectedConfigFingerprint = ''
  intent.value = ''
  loading.value = false
  error.value = drafting ? CHANGED_DURING_DRAFT : ''
  notes.value = ''
  draft.value = null
  resolvedSchema.value = null
  undoConfig.value = null
  applied.value = false
}
watch(identityFingerprint, resetForIdentityChange, { flush: 'sync' })
watch(currentFingerprint, (next) => {
  if (expectedConfigFingerprint && next === expectedConfigFingerprint) {
    expectedConfigFingerprint = ''
    return
  }
  const drafting = loading.value || draft.value !== null
  requestSeq += 1
  loading.value = false
  draft.value = null
  notes.value = ''
  undoConfig.value = null
  applied.value = false
  if (drafting) error.value = CHANGED_DURING_DRAFT
}, { flush: 'sync' })
onBeforeUnmount(() => { requestSeq += 1 })

function sameValue(left: unknown, right: unknown): boolean {
  return fingerprint(left) === fingerprint(right)
}

function fieldTitle(key: string): string {
  const properties = reviewSchema.value.properties
  if (properties && typeof properties === 'object' && !Array.isArray(properties)) {
    const field = (properties as Record<string, unknown>)[key]
    if (field && typeof field === 'object' && !Array.isArray(field)) {
      const title = (field as Record<string, unknown>).title
      if (typeof title === 'string' && title.trim()) return title.trim()
    }
  }
  return key.replace(/_/g, ' ').replace(/^./, (value) => value.toUpperCase())
}

function displayValue(value: unknown): string {
  if (value === undefined) return 'Not set'
  if (typeof value === 'string') return value || 'Empty'
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? '' : 's'}`
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    const properties = record.properties && typeof record.properties === 'object' && !Array.isArray(record.properties)
      ? Object.keys(record.properties as Record<string, unknown>)
      : []
    if (record.type === 'object' || properties.length) {
      const required = Array.isArray(record.required) ? record.required.length : 0
      return `${properties.length} field${properties.length === 1 ? '' : 's'}${required ? ` · ${required} required` : ''}`
    }
    try { return JSON.stringify(record, null, 2) } catch { return 'Settings' }
  }
  try { return JSON.stringify(value) } catch { return String(value) }
}

const changes = computed(() => Array.from(new Set([
  ...Object.keys(props.currentConfig),
  ...Object.keys(draft.value || {}),
])).sort().map((key) => ({
  key,
  label: fieldTitle(key),
  before: props.currentConfig[key],
  after: draft.value?.[key],
  changed: !sameValue(props.currentConfig[key], draft.value?.[key]),
})))

// The server excludes picker/class fields before prompting. Keep the same boundary in the
// client so an unexpected/stale response still cannot overwrite a human-selected identity.
function schemaContainsPicker(value: unknown, depth = 0): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value) || depth > 12) return depth > 12
  const schema = value as Record<string, unknown>
  if (schema.picker != null || schema.class != null) return true
  const properties = schema.properties
  if (properties && typeof properties === 'object' && !Array.isArray(properties)) {
    if (Object.values(properties).some((child) => schemaContainsPicker(child, depth + 1))) return true
  }
  if (schemaContainsPicker(schema.items, depth + 1)) return true
  return schemaContainsPicker(schema.additionalProperties, depth + 1)
}

function mergeValue(current: unknown, draft: unknown, declaration: unknown): unknown {
  const schema = declaration && typeof declaration === 'object' && !Array.isArray(declaration)
    ? declaration as Record<string, unknown>
    : {}
  const objectLike = schema.type === 'object'
    || (!!schema.properties && typeof schema.properties === 'object' && !Array.isArray(schema.properties))
  if (!objectLike || !current || typeof current !== 'object' || Array.isArray(current)
    || !draft || typeof draft !== 'object' || Array.isArray(draft)) return draft
  const properties = schema.properties && typeof schema.properties === 'object' && !Array.isArray(schema.properties)
    ? schema.properties as Record<string, unknown>
    : {}
  const merged = { ...(current as Record<string, unknown>) }
  for (const [key, value] of Object.entries(draft as Record<string, unknown>)) {
    const childSchema = properties[key]
      ?? (schema.additionalProperties && typeof schema.additionalProperties === 'object' ? schema.additionalProperties : undefined)
    merged[key] = mergeValue(merged[key], value, childSchema)
  }
  return merged
}

function mergeAssistableConfig(result: Record<string, unknown>): Record<string, unknown> {
  const properties = reviewSchema.value.properties
  const declared = properties && typeof properties === 'object' && !Array.isArray(properties)
    ? properties as Record<string, unknown>
    : {}
  // No client projection means this is a compiler-owned node. The response has already
  // been projected and validated by the server; merge omissions over current config so
  // picker-owned fields remain untouched.
  if (!Object.keys(declared).length) return { ...props.currentConfig, ...result }
  const accepted: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(result)) {
    const field = declared[key]
    const schema = field && typeof field === 'object' && !Array.isArray(field) ? field as Record<string, unknown> : {}
    if (schemaContainsPicker(schema)) continue
    accepted[key] = value
  }
  return mergeValue(props.currentConfig, accepted, reviewSchema.value) as Record<string, unknown>
}

async function runDraft() {
  const text = intent.value.trim()
  if (!text || loading.value) return
  loading.value = true
  const seq = ++requestSeq
  const context = requestFingerprint.value
  error.value = ''
  applied.value = false
  const result = await assistConfig({
    workflowId: props.workflowId,
    nodeId: props.resetKey,
    intent: text,
    ...(props.upstreamSchema ? { upstreamSchema: props.upstreamSchema } : {}),
  })
  if (seq !== requestSeq) return
  if (context !== requestFingerprint.value) {
    loading.value = false
    draft.value = null
    notes.value = ''
    error.value = CHANGED_DURING_DRAFT
    return
  }
  loading.value = false
  if (!isConfigAssistOk(result)) {
    error.value = result.error
    draft.value = null
    notes.value = ''
    return
  }
  if (result.configSchema) resolvedSchema.value = result.configSchema
  // Defense in depth: omission means preserve, never silently remove an optional
  // setting. Explicit null still appears as a reviewed change when the schema allows it.
  draft.value = mergeAssistableConfig(result.config)
  notes.value = result.notes || ''
}

function cancelDraft() {
  draft.value = null
  notes.value = ''
  error.value = ''
}

function acceptDraft() {
  if (!draft.value) return
  undoConfig.value = { ...props.currentConfig }
  const accepted = { ...draft.value }
  expectedConfigFingerprint = fingerprint(accepted)
  emit('accept', accepted)
  draft.value = null
  notes.value = ''
  applied.value = true
}

function undo() {
  if (!undoConfig.value) return
  const restored = { ...undoConfig.value }
  expectedConfigFingerprint = fingerprint(restored)
  emit('undo', restored)
  undoConfig.value = null
  applied.value = false
}
</script>

<template>
  <section class="wf-config-assist" aria-label="Describe this step">
    <label class="wf-config-assist__label" :for="`wf-config-intent-${resetKey}`">Describe this step</label>
    <div class="wf-config-assist__compose">
      <Textarea
        :id="`wf-config-intent-${resetKey}`"
        v-model="intent"
        class="wf-textarea"
        rows="2"
        placeholder="Explain how this step should behave…"
        @keydown.meta.enter.prevent="runDraft"
        @keydown.ctrl.enter.prevent="runDraft"
      />
      <Button class="wf-config-assist__draft" :disabled="!intent.trim() || loading" :loading="loading" @click="runDraft">
        <Icon v-if="!loading" icon="tabler:sparkles" aria-hidden="true" />
        <span>{{ loading ? 'Drafting…' : 'Draft with AI' }}</span>
      </Button>
    </div>
    <Message v-if="error" class="wf-config-assist__error" severity="error" :closable="false">{{ error }}</Message>

    <div v-if="draft" class="wf-config-assist__preview" role="region" aria-label="Drafted settings">
      <div class="wf-config-assist__preview-head">
        <strong>Review drafted settings</strong>
        <span>{{ changes.filter((change) => change.changed).length }} changed</span>
      </div>
      <p v-if="notes" class="wf-config-assist__notes">{{ notes }}</p>
      <dl class="wf-config-assist__changes">
        <template v-for="change in changes" :key="change.key">
          <div :class="{ 'is-unchanged': !change.changed }">
            <dt>{{ change.label }}</dt>
            <dd>
              <span v-if="change.changed" class="wf-config-assist__before">{{ displayValue(change.before) }}</span>
              <span class="wf-config-assist__after">{{ displayValue(change.after) }}</span>
            </dd>
          </div>
        </template>
      </dl>
      <div class="wf-config-assist__actions">
        <Button class="wf-config-assist__accept" @click="acceptDraft">Accept</Button>
        <Button severity="secondary" text @click="cancelDraft">Cancel</Button>
      </div>
    </div>

    <Message v-else-if="applied" class="wf-config-assist__applied" severity="success" :closable="false">
      <span>Draft applied. You can edit every field below.</span>
      <Button severity="secondary" outlined @click="undo">Undo</Button>
    </Message>
  </section>
</template>

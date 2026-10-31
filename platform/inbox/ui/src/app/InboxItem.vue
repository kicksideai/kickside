<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import { loadByTagName } from '@wippy-fe/proxy'
import { relativeTime } from '@widgets/app/datetime'
import type { Item } from './item'
import ItemFiles from './ItemFiles.vue'
import { statusLabel, humanizeItemType } from './labels'
import { humanizeKey, formatContext, decisionFields, defaultFormValues, missingRequired } from './decision'

// Full reading view for one item. The HOST owns the chrome — header (icon, title,
// priority, time) and the action footer — so every item type looks consistent. The
// COMPONENT (if declared) fills the body and may be rich (charts, API calls); types
// without a component fall back to a native body (content + metadata fields). A
// flow_decision item never declares a component, so it always renders through
// the native body's workflow review branch below.

const props = defineProps<{
  item: Item
  tag?: string
  icon?: string
  typeLabel?: string
  actions?: string[]
  actionOwner?: 'component'
  resolving?: boolean
  resolvingAction?: string
}>()
const emit = defineEmits<{
  (e: 'resolve', payload: { id: string; action: string; form?: Record<string, unknown> }): void
  (e: 'delete', id: string): void
}>()

const host = ref<HTMLElement | null>(null)
const wcFailed = ref(false)
let mountedEl: HTMLElement | null = null

const pending = computed(() => props.item.status === 'pending')
// Actions come from the item type declaration, preserving declaration order.
const ACTION_LABEL: Record<string, string> = { approve: 'Approve', reject: 'Reject', dismiss: 'Dismiss' }
const actions = computed(() => {
  const declared = Array.isArray(props.actions) ? props.actions : []
  return declared.filter((action): action is string => typeof action === 'string' && action.length > 0)
})
function actionLabel(a: string): string {
  const meta = props.item.metadata
  if (a === 'approve' && typeof meta?.approve_label === 'string' && meta.approve_label) return meta.approve_label
  if (a === 'reject' && typeof meta?.reject_label === 'string' && meta.reject_label) return meta.reject_label
  return ACTION_LABEL[a] || humanizeKey(a)
}
const metaFields = computed<Array<{ label: string; value: unknown }>>(() => {
  const f = (props.item.metadata as { fields?: unknown })?.fields
  if (!Array.isArray(f)) return []
  return f.map((x: Record<string, unknown>) => ({ label: String(x.label ?? x.key ?? ''), value: x.value }))
})

// flow_decision: metadata.context is the upstream
// step's real output, metadata.form an optional set of fields to collect on decision.
const isDecision = computed(() => props.item.item_type === 'flow_decision')
const decisionPrompt = computed(() => {
  const prompt = props.item.metadata?.prompt
  return typeof prompt === 'string' && prompt !== props.item.title ? prompt : ''
})
const decisionContextView = computed(() => (isDecision.value ? formatContext(props.item.metadata?.context) : { kind: 'empty' as const }))
const decisionFieldsList = computed(() => (isDecision.value ? decisionFields(props.item.metadata?.form) : []))
const submittedFormRows = computed(() => {
  const view = formatContext(props.item.form)
  if (view.kind !== 'rows') return []
  return view.rows.map(row => ({ ...row, label: decisionFieldsList.value.find(field => field.key === row.key)?.label || row.label }))
})
const formValues = ref<Record<string, unknown>>(defaultFormValues(decisionFieldsList.value))
const formValid = computed(() => !missingRequired(decisionFieldsList.value, formValues.value))
function canResolve(action: string): boolean {
  return pending.value && (action !== 'approve' || formValid.value)
}

function textValue(value: unknown): string | undefined { return typeof value === 'string' ? value : undefined }
function numberValue(value: unknown): number | undefined { return typeof value === 'number' ? value : undefined }

function onAction(action: string) {
  if (props.resolving || !canResolve(action)) return
  const payload: { id: string; action: string; form?: Record<string, unknown> } = { id: props.item.id, action }
  if (decisionFieldsList.value.length) payload.form = { ...formValues.value }
  emit('resolve', payload)
}

// The declared item-type title reaches the item as typeLabel; an item whose type is not
// a declared registry entry (e.g. a workflow-emitted type) has no title, so its raw
// item_type reads as de-snake-cased Title Case rather than a machine token.
const typeText = computed(() => props.typeLabel || humanizeItemType(props.item.item_type))
function when(unix?: number) { return unix ? new Date(unix * 1000).toLocaleString() : '' }
// The header shows a relative time ("2d ago") with the absolute form one hover away.
function relativeWhen(unix?: number) { return relativeTime(unix, { maxUnit: 'year' }) }
// The dot and the icon tile are not Tags, so they take a class named for the
// priority rather than for a colour; the colour itself still comes from the
// theme's severity ramp, in styles.css.
function priorityClass(p?: string): string {
  return `kx-priority-${p === 'urgent' || p === 'high' || p === 'low' ? p : 'normal'}`
}
// Tag carries severity rather than inheriting a colour, so the same priority
// scale is expressed as PrimeVue severities.
function prioritySeverity(p?: string): string {
  if (p === 'urgent') return 'danger'
  if (p === 'high') return 'warn'
  if (p === 'low') return 'secondary'
  return 'info'
}
function onResolve(ev: Event) {
  const d = (ev as CustomEvent).detail
  if (d?.id && d?.action) emit('resolve', d)
}

function unmountWc() {
  if (mountedEl) {
    mountedEl.removeEventListener('inbox-resolve', onResolve)
    mountedEl = null
  }
}

async function mountWc() {
  if (!props.tag || !host.value) return
  unmountWc()
  try {
    await loadByTagName(props.tag, { timeoutMs: 8000 })
    const el = document.createElement(props.tag)
    el.style.display = 'block'
    el.style.height = '100%'
    el.setAttribute('item-id', props.item.id)
    el.setAttribute('content', props.item.content || '')
    if (props.item.metadata) el.setAttribute('data-meta', JSON.stringify(props.item.metadata))
    el.addEventListener('inbox-resolve', onResolve)
    host.value.innerHTML = ''
    host.value.appendChild(el)
    mountedEl = el
  } catch { wcFailed.value = true }
}

// Ensure the shared markdown renderer element is defined before the decision
// body references it, so agent prose renders formatted rather than as raw text.
onMounted(() => { void loadByTagName('wc-render-markdown', { timeoutMs: 8000 }).catch(() => {}); void mountWc() })
onUnmounted(unmountWc)
watch(() => [props.tag, props.item.id], () => { wcFailed.value = false; void mountWc() })
</script>

<template>
  <div class="kx-detail">
    <header class="kx-detail-head">
      <div class="kx-detail-icon" :class="priorityClass(item.priority)">
        <Icon :icon="icon || 'tabler:inbox'" aria-hidden="true" />
      </div>
      <div class="kx-detail-title-block">
        <h2 class="kx-detail-title">{{ item.title }}</h2>
        <div class="kx-detail-meta">
          <Tag :severity="prioritySeverity(item.priority)" :value="item.priority" class="kx-pill kx-tag-sm" />
          <span>{{ typeText }}</span>
          <span :title="when(item.created_at)">{{ relativeWhen(item.created_at) }}</span>
          <Tag v-if="!pending" severity="secondary" :value="statusLabel(item.status)" class="kx-pill kx-tag-sm" />
        </div>
      </div>
    </header>

    <div class="kx-detail-body">
      <div v-if="tag && !wcFailed" ref="host" class="kx-wc-host" />
      <div v-else-if="isDecision" class="kx-native-body">
        <wc-render-markdown v-if="decisionPrompt" class="kx-md" :source="decisionPrompt"></wc-render-markdown>
        <wc-render-markdown v-if="decisionContextView.kind === 'text'" class="kx-md" :source="decisionContextView.text"></wc-render-markdown>
        <dl v-else-if="decisionContextView.kind === 'rows'" class="kx-fields">
          <div v-for="row in decisionContextView.rows" :key="row.key" class="kx-field-row">
            <dt>{{ row.label }}</dt>
            <dd :class="{ 'kx-field-long': row.long }">{{ row.value }}</dd>
          </div>
        </dl>
        <wc-render-markdown v-else-if="item.content" class="kx-md" :source="item.content"></wc-render-markdown>

        <div v-if="!pending">
          <p v-if="item.action" data-testid="decision-outcome">Outcome: {{ actionLabel(item.action) }}</p>
          <dl v-if="submittedFormRows.length" data-testid="decision-submitted-form" class="kx-fields">
            <div v-for="row in submittedFormRows" :key="row.key" class="kx-field-row">
              <dt>{{ row.label }}</dt>
              <dd :class="{ 'kx-field-long': row.long }">{{ row.value }}</dd>
            </div>
          </dl>
        </div>
        <div v-else-if="decisionFieldsList.length" class="kx-decision-form">
          <div v-for="f in decisionFieldsList" :key="f.key" class="kx-form-field">
            <div v-if="f.type === 'checkbox'" class="kx-checkbox-row">
              <Checkbox
                v-model="formValues[f.key]"
                binary
                :input-id="`kx-df-${f.key}`"
                :data-testid="`decision-${f.key}`"
              />
              <label :for="`kx-df-${f.key}`">{{ f.label }}<span v-if="f.required" class="kx-required">*</span></label>
            </div>
            <template v-else>
              <label class="kx-form-label" :for="`kx-df-${f.key}`">{{ f.label }}<span v-if="f.required" class="kx-required">*</span></label>
              <InputText
                v-if="f.type === 'text'"
                :id="`kx-df-${f.key}`"
                :model-value="textValue(formValues[f.key])"
                :data-testid="`decision-${f.key}`"
                @update:model-value="value => formValues[f.key] = value"
              />
              <Textarea
                v-else-if="f.type === 'textarea'"
                :id="`kx-df-${f.key}`"
                :model-value="textValue(formValues[f.key])"
                :data-testid="`decision-${f.key}`"
                rows="8"
                auto-resize
                @update:model-value="value => formValues[f.key] = value"
              />
              <InputNumber
                v-else-if="f.type === 'number'"
                :model-value="numberValue(formValues[f.key])"
                :input-id="`kx-df-${f.key}`"
                :data-testid="`decision-${f.key}`"
                @update:model-value="value => formValues[f.key] = value"
              />
              <Select
                v-else
                v-model="formValues[f.key]"
                :options="f.options"
                :input-id="`kx-df-${f.key}`"
                :data-testid="`decision-${f.key}`"
                placeholder="Choose…"
              />
            </template>
          </div>
          <p v-if="!formValid" class="kx-form-hint">Fill in the required fields to approve.</p>
        </div>
      </div>
      <div v-else class="kx-native-body">
        <wc-render-markdown v-if="item.content" class="kx-md" :source="item.content"></wc-render-markdown>
        <dl v-if="metaFields.length" class="kx-fields">
          <div v-for="(f, i) in metaFields" :key="i" class="kx-field-row">
            <dt>{{ f.label }}</dt>
            <dd>{{ f.value }}</dd>
          </div>
        </dl>
      </div>
      <ItemFiles v-if="item.file_count || item.files?.length" :key="item.id" :item-id="item.id" :files="item.files" :count="item.file_count" :version="item.file_version" />
    </div>

    <footer class="kx-detail-foot">
      <template v-if="pending && actionOwner !== 'component'">
        <Button
          v-for="(a, i) in actions"
          :key="a"
          type="button"
          class="kx-detail-action"
          data-testid="inbox-action"
          :severity="i === 0 ? undefined : 'secondary'"
          :outlined="i !== 0"
          :label="resolving && resolvingAction === a ? 'Resolving…' : actionLabel(a)"
          :loading="resolving && resolvingAction === a"
          :disabled="resolving || !canResolve(a)"
          @click="onAction(a)"
        />
      </template>
      <template v-else-if="!pending">
        <span class="kx-resolved">{{ statusLabel(item.status) }}<span v-if="item.resolved_at"> · {{ when(item.resolved_at) }}</span></span>
        <Button class="kx-detail-action" type="button" data-testid="inbox-delete" label="Delete" severity="secondary" outlined @click="emit('delete', item.id)">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:trash" :class="iconClass" /></template>
        </Button>
      </template>
    </footer>
  </div>
</template>

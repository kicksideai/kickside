<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { api, loadByTagName } from '@wippy-fe/proxy'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import { errMsg } from '@widgets/app/errMsg'
import PickerSelect from '@widgets/app/PickerSelect.vue'
import Select from 'primevue/select'
import { type PickerItem } from '@widgets/app/ports'
import ScheduleForm from './ScheduleForm.vue'
import SourceInstance from './SourceInstance.vue'
import { CANONICAL_PERIODIC_TYPE, TIMER_OUTPUT_SCHEMA } from '../schedule'
import { SCHEMA_FORM_TAG, instanceValue, primaryField } from '../source-instance'
import {
  groupSources, resolveSpec, stableStringify,
  type GroupedSource, type ScheduleType, type SourceRow, type TriggerDelivery, type TriggerPoll, type TriggerSchedule,
} from '../spec'

const TIMER_ID = '__schedule__'

const props = useProps<{
  value?: unknown
  allowed?: string
  sourceClasses?: string
  historyDefault?: unknown
  disabled?: unknown
  reconfigure?: unknown
}>()

const emit = useEvents<{
  change: { spec: Record<string, unknown>; valid: boolean; error?: string }
  load: undefined
  error: { message: string; error?: unknown }
}>()

// useProps exposes host attributes camelCased (source-classes -> sourceClasses);
// Host values use the camelCase keys.
function prop(camel: string): unknown {
  const v = props.value as Record<string, unknown> | undefined
  return v?.[camel]
}
function boolProp(camel: string): boolean {
  const v = prop(camel)
  return v === true || v === 'true' || v === ''
}
function csvProp(camel: string): string[] {
  const v = prop(camel)
  return typeof v === 'string' ? v.split(',').map(s => s.trim()).filter(Boolean) : []
}

const isDisabled = computed(() => boolProp('disabled'))
// Structural reconfiguration is rejected, so an editor mounted over an installed
// trigger keeps the structural choices visible but locked; only cadence-class
// fields stay editable.
const isReconfigure = computed(() => boolProp('reconfigure'))
const structuralLocked = computed(() => isDisabled.value || isReconfigure.value)
const allowedFamilies = computed(() => {
  const fams = csvProp('allowed')
  return fams.length ? fams : ['timer', 'source']
})
const timerAllowed = computed(() => allowedFamilies.value.includes('timer'))
const sourcesAllowed = computed(() => allowedFamilies.value.includes('source'))
const classFilter = computed(() => csvProp('sourceClasses'))

const rows = ref<SourceRow[]>([])
const loading = ref(true)
const loadError = ref('')

const when = ref('') // '' | TIMER_ID | source port id
const sourceConfig = ref<Record<string, unknown>>({})
// The cadence the spec carries. The form reads it and writes back only on a user
// edit, so a stored expression survives verbatim until someone changes it.
const schedule = ref<TriggerSchedule | null>(null)
const expr = ref('')
type HistoryKind = 'all' | 'none' | 'last_days' | 'since'
// History is an owner choice. A missing prop/value remains unready rather than
// becoming an implicit replay boundary.
const historyDefault = computed<HistoryKind | null>(() => {
  const value = prop('historyDefault')
  return value === 'none' || value === 'all' ? value : null
})
const historyKind = ref<HistoryKind | null>(null)
// A bounded-history choice is incomplete until the owner enters its window.
// Keep the input empty rather than manufacturing a product-specific day count.
const historyDays = ref<number | null>(null)
const historySince = ref('')
const advancedOpen = ref(false)

const offeredSources = computed(() => sourcesAllowed.value ? groupSources(rows.value, classFilter.value) : [])
const allSources = computed(() => groupSources(rows.value))
const selectedSource = computed<GroupedSource | null>(() =>
  (when.value && when.value !== TIMER_ID)
    ? allSources.value.find(g => g.id === when.value) || null
    : null)
const sourceMissing = computed(() => !!when.value && when.value !== TIMER_ID && !selectedSource.value && !loading.value && !loadError.value)

const pickerItems = computed<PickerItem[]>(() => {
  const items: PickerItem[] = []
  if (timerAllowed.value) {
    items.push({ id: TIMER_ID, title: 'On a schedule', icon: 'tabler:clock', group: 'Schedule', subtitle: 'Run at times you choose' })
  }
  for (const g of offeredSources.value) {
    items.push({ id: g.id, title: g.title, icon: g.icon || 'tabler:plug', group: g.group || 'Sources', subtitle: g.description || g.provider })
  }
  return items
})
const catalogEmpty = computed(() =>
  sourcesAllowed.value && !loading.value && !loadError.value && !when.value && !pickerItems.value.length)

const kind = computed<'none' | 'timer' | 'watch' | 'poll' | 'unsupported'>(() => {
  if (!when.value) return 'none'
  if (when.value === TIMER_ID) return 'timer'
  const s = selectedSource.value
  if (!s) return 'none'
  if (s.hasTrigger) return 'watch'
  if (s.hasPull) return 'poll'
  return 'unsupported'
})

const showSchedule = computed(() => kind.value === 'timer' || kind.value === 'poll')
const showHistory = computed(() => kind.value === 'poll' || kind.value === 'watch')
const historyBounded = computed(() => kind.value === 'watch')
const effectiveHistoryDefault = computed<HistoryKind | null>(() => historyDefault.value)
const showAdvanced = computed(() => !!selectedSource.value && kind.value !== 'unsupported')
const historyOptions = computed(() => {
  const opts: { label: string; value: HistoryKind }[] = [
    { label: 'All', value: 'all' },
    { label: 'Only new', value: 'none' },
  ]
  if (!historyBounded.value) {
    opts.push({ label: 'Last N days', value: 'last_days' })
    opts.push({ label: 'Since a date', value: 'since' })
  }
  return opts
})

// Locked selects render as plain values instead: a caret on a control that
// cannot be opened reads as broken, not as read-only.
const whenLabel = computed(() => {
  if (when.value === TIMER_ID) return 'On a schedule'
  return selectedSource.value?.title || when.value || 'Not set'
})
const historyLabel = computed(() =>
  historyOptions.value.find(o => o.value === historyKind.value)?.label || 'Not set')

// The gate needs to know whether the source's declared instance is chosen; the
// picker itself is the instance section's business.
const primary = computed(() => primaryField(selectedSource.value))
const instanceId = computed(() => instanceValue(primary.value, sourceConfig.value))

function buildBackfill(): unknown {
  if (!historyKind.value) return null
  if (historyKind.value === 'all') return 'all'
  if (historyKind.value === 'none') return 'none'
  if (historyKind.value === 'last_days') {
    const days = Math.floor(Number(historyDays.value))
    return Number.isInteger(days) && days > 0 ? { last_days: days } : null
  }
  if (historyKind.value === 'since' && historySince.value) return { since: new Date(historySince.value).toISOString() }
  return null
}

// The declared acquisition bounds and delivery retry delay ride through an edit.
const poll = ref<TriggerPoll | null>(null)
const delivery = ref<TriggerDelivery | null>(null)

function buildSpec(): Record<string, unknown> {
  const spec: Record<string, unknown> = { v: 2 }
  const sched = schedule.value
  if (when.value === TIMER_ID) {
    if (sched) spec.schedule = sched
    return spec
  }
  spec.source = when.value
  if (Object.keys(sourceConfig.value).length) spec.config = { ...sourceConfig.value }
  if (expr.value.trim()) spec.filter = { expr: expr.value.trim() }
  if (showSchedule.value && sched) spec.schedule = sched
  if (kind.value === 'poll' && poll.value) spec.poll = poll.value
  if (delivery.value) spec.delivery = delivery.value
  // Preserve an owner-provided history boundary even while the source catalog
  // is still settling; visibility is a UI concern, but the emitted spec must
  // never drop an explicit boundary during a reconfigure round-trip.
  const backfill = when.value !== TIMER_ID ? buildBackfill() : null
  if (backfill != null) spec.backfill = backfill
  return spec
}

function evaluate(): { spec: Record<string, unknown>; valid: boolean; error?: string } {
  const spec = buildSpec()
  if (!when.value) return { spec, valid: false, error: 'Pick when this runs.' }
  const res = resolveSpec(spec, rows.value)
  if (res.error) return { spec, valid: false, error: res.error.message }
  if (when.value !== TIMER_ID && primary.value && !instanceId.value) {
    return { spec, valid: false, error: `${primary.value.title || 'Instance'} is required.` }
  }
  return { spec, valid: true }
}

const gate = computed(() => loading.value ? null : evaluate())
const selectedOutputSchema = computed(() => when.value === TIMER_ID
  ? TIMER_OUTPUT_SCHEMA
  : selectedSource.value?.outputSchema)

let lastEmitted = ''
function emitChange() {
  const e = evaluate()
  if (selectedOutputSchema.value !== undefined) {
    ;(e as Record<string, unknown>).output_schema = selectedOutputSchema.value
  }
  lastEmitted = stableStringify(e.spec)
  emit('change', e)
}

function parseValue(raw: unknown): Record<string, unknown> | null {
  if (raw == null) return null
  if (typeof raw === 'string') {
    const t = raw.trim()
    if (!t) return null
    try { raw = JSON.parse(t) } catch { return null }
  }
  return (typeof raw === 'object' && raw && !Array.isArray(raw)) ? raw as Record<string, unknown> : null
}

function seed(parsed: Record<string, unknown>) {
  const source = typeof parsed.source === 'string' ? parsed.source.trim() : ''
  when.value = source || TIMER_ID
  sourceConfig.value = (typeof parsed.config === 'object' && parsed.config && !Array.isArray(parsed.config))
    ? { ...(parsed.config as Record<string, unknown>) }
    : {}
  const sched = parsed.schedule as Record<string, unknown> | undefined
  if (sched && typeof sched === 'object') {
    const t = String(sched.type || '')
    const type = (t === 'once' || t === 'interval' || t === 'ticker' || t === 'cron') ? t as ScheduleType : CANONICAL_PERIODIC_TYPE
    const expression = typeof sched.expression === 'string' ? sched.expression : ''
    schedule.value = { type, expression }
  } else {
    schedule.value = null
  }
  const pollValue = parsed.poll
  poll.value = pollValue && typeof pollValue === 'object' && !Array.isArray(pollValue)
    ? pollValue as TriggerPoll
    : null
  const deliveryValue = parsed.delivery
  delivery.value = deliveryValue && typeof deliveryValue === 'object' && !Array.isArray(deliveryValue)
    ? deliveryValue as TriggerDelivery
    : null
  const filter = parsed.filter as Record<string, unknown> | undefined
  expr.value = typeof filter?.expr === 'string' ? filter.expr : ''
  advancedOpen.value = !!expr.value
  const backfill = parsed.backfill
  if (backfill === 'none') historyKind.value = 'none'
  else if (backfill === 'all') historyKind.value = 'all'
  else if (backfill && typeof backfill === 'object' && !Array.isArray(backfill)) {
    const b = backfill as Record<string, unknown>
    if (typeof b.last_days === 'number') { historyKind.value = 'last_days'; historyDays.value = b.last_days }
    else if (typeof b.since === 'string') { historyKind.value = 'since'; historySince.value = b.since.slice(0, 10) }
    else historyKind.value = effectiveHistoryDefault.value
  } else historyKind.value = effectiveHistoryDefault.value
}

watch(() => (props.value as Record<string, unknown> | undefined)?.value, (raw) => {
  const parsed = parseValue(raw)
  if (!parsed) return
  if (stableStringify(parsed) === lastEmitted) return
  seed(parsed)
  lastEmitted = stableStringify(buildSpec())
})

function onWhenPick(id: string) {
  if (id === when.value) return
  when.value = id
  sourceConfig.value = {}
  expr.value = ''
  historyKind.value = effectiveHistoryDefault.value
  schedule.value = null
  emitChange()
}

function onScheduleChange(next: TriggerSchedule | null) {
  schedule.value = next
  emitChange()
}

function onInstanceChange(cfg: unknown) {
  if (cfg && typeof cfg === 'object') {
    sourceConfig.value = { ...sourceConfig.value, ...(cfg as Record<string, unknown>) }
    emitChange()
  }
}

function onHistoryKind(value: HistoryKind) {
  historyKind.value = value
  emitChange()
}

async function loadCatalog() {
  loading.value = true
  loadError.value = ''
  try {
    const { data } = await api.get<{ sources?: SourceRow[] }>('/api/v1/automations/sources')
    rows.value = data?.sources || []
  } catch (e) {
    if (sourcesAllowed.value) {
      loadError.value = errMsg(e, 'could not load sources')
      emit('error', { message: loadError.value, error: e })
    }
  } finally {
    loading.value = false
  }
}

function retryCatalog() { loadCatalog().then(() => emitChange()) }

onMounted(async () => {
  loadByTagName(SCHEMA_FORM_TAG, { timeoutMs: 8000 }).catch(() => {})
  if (sourcesAllowed.value) await loadCatalog()
  else loading.value = false
  const parsed = parseValue(prop('value'))
  if (parsed) {
    seed(parsed)
  } else if (timerAllowed.value && !sourcesAllowed.value) {
    when.value = TIMER_ID
    schedule.value = null
  }
  if (!loadError.value) emit('load', undefined)
  emitChange()
})
</script>

<template>
  <div class="kx-tc" :class="isDisabled && 'kx-tc-off'">
    <div v-if="loading" class="kx-tc-note" aria-live="polite">
      <Icon icon="tabler:loader-2" class="spin" aria-hidden="true" />
      <span>Loading sources…</span>
    </div>

    <div v-else-if="loadError" class="kx-tc-warn" role="alert" data-test="tc-load-error">
      <Icon icon="tabler:alert-triangle" aria-hidden="true" />
      <span>{{ loadError }}</span>
      <button type="button" class="kx-tc-retry" @click="retryCatalog">Retry</button>
    </div>

    <template v-else>
      <!-- When -->
      <div class="kx-tc-field" data-test="tc-when">
        <span class="kx-tc-lbl"><Icon icon="tabler:calendar-bolt" aria-hidden="true" /> When</span>
        <p v-if="structuralLocked" class="kx-tc-static" data-test="tc-when-locked">{{ whenLabel }}</p>
        <PickerSelect
          v-else
          :items="pickerItems"
          :model-value="when"
          placeholder="Pick when this runs…"
          aria-label="When this runs"
          @update:model-value="onWhenPick"
        />
        <p v-if="selectedSource?.description" class="kx-tc-desc">{{ selectedSource.description }}</p>
      </div>

      <div v-if="catalogEmpty" class="kx-tc-note" data-test="tc-catalog-empty">
        <Icon icon="tabler:plug-x" aria-hidden="true" />
        <span>No sources are available to trigger on yet.</span>
      </div>

      <div v-if="sourceMissing" class="kx-tc-warn" role="alert" data-test="tc-source-missing">
        <Icon icon="tabler:plug-x" aria-hidden="true" />
        <span>The source "{{ when }}" is not available. It may have been removed or you no longer have access to it.</span>
      </div>

      <div v-else-if="kind === 'unsupported'" class="kx-tc-warn" role="alert" data-test="tc-unsupported">
        <Icon icon="tabler:plug-x" aria-hidden="true" />
        <span>This source can't start anything yet — it announces no events and can't be checked for items.</span>
      </div>

      <template v-else>
        <SourceInstance
          v-if="selectedSource"
          :source="selectedSource"
          :config="sourceConfig"
          :locked="structuralLocked"
          @change="onInstanceChange"
        />

        <!-- Resolution note: a live-event source has no cadence to set. -->
        <div v-if="kind === 'watch'" class="kx-tc-note" data-test="tc-live-note">
          <Icon icon="tabler:bolt" aria-hidden="true" />
          <span>Runs on each incoming event — no schedule to set. Choose an explicit history boundary.</span>
        </div>

        <ScheduleForm
          v-if="showSchedule"
          :model-value="schedule"
          :disabled="isDisabled"
          @update:model-value="onScheduleChange"
        />

        <!-- History -->
        <div v-if="showHistory" class="kx-tc-field" data-test="tc-history" :class="structuralLocked && 'kx-tc-locked'">
          <span class="kx-tc-lbl"><Icon icon="tabler:history" aria-hidden="true" /> History</span>
          <p v-if="structuralLocked" class="kx-tc-static" data-test="tc-history-locked">{{ historyLabel }}</p>
          <Select
            v-else
            class="kx-tc-select"
            data-test="tc-history-kind"
            :model-value="historyKind"
            :options="historyOptions"
            option-label="label"
            option-value="value"
            @update:model-value="onHistoryKind"
          />
          <span class="kx-tc-hint" data-test="tc-history-hint">{{ historyBounded
            ? (historyKind === 'all'
                ? 'Replays this thread\'s history from the start, then continues live.'
                : 'How much of this thread\'s history to replay on the first run. "Only new" starts from now.')
            : 'How much of the source\'s existing items to bring in on the first run. "Only new" starts from now.' }}</span>
          <label v-if="historyKind === 'last_days'" class="kx-tc-sub">
            <span class="kx-tc-lbl">Days</span>
            <input v-model.number="historyDays" class="kx-tc-input" data-test="tc-history-days" type="number" :disabled="structuralLocked" @change="emitChange" />
          </label>
          <label v-if="historyKind === 'since'" class="kx-tc-sub">
            <span class="kx-tc-lbl">Since</span>
            <input v-model="historySince" class="kx-tc-input" data-test="tc-history-since" type="date" :disabled="structuralLocked" @change="emitChange" />
          </label>
        </div>

        <!-- Advanced: the raw filter expression -->
        <details v-if="showAdvanced" class="kx-tc-adv" :open="advancedOpen" @toggle="(e: Event) => advancedOpen = (e.target as HTMLDetailsElement).open">
          <summary>
            <Icon class="kx-tc-caret" icon="tabler:chevron-right" aria-hidden="true" />
            <span>Advanced</span>
          </summary>
          <div class="kx-tc-adv-body" :class="structuralLocked && 'kx-tc-locked'">
            <label class="kx-tc-sub">
              <span class="kx-tc-lbl">Only when this matches</span>
              <textarea
                v-model="expr"
                class="kx-tc-input kx-tc-textarea"
                data-test="tc-expr"
                rows="2"
                placeholder="item.status == 'active'"
                spellcheck="false"
                :disabled="structuralLocked"
                @change="emitChange"
              ></textarea>
              <span class="kx-tc-hint">An expression over each incoming item; items that don't match are skipped.</span>
            </label>
          </div>
        </details>
      </template>

      <!-- The current gate, mirrored into the change event's error field. -->
      <div v-if="gate && !gate.valid" class="kx-tc-gate" data-test="tc-gate" aria-live="polite">
        <Icon icon="tabler:info-circle" aria-hidden="true" />
        <span>{{ gate.error }}</span>
      </div>
    </template>
  </div>
</template>

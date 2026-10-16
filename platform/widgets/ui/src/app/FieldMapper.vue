<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import {
  buildSourceTree, rootSourceField, targetFields, unmappedRequired, completenessLine,
  buildObjectExpression, seedRows, pillCompat, decodeSchema, type SourceField, type TargetField,
  passThroughMapping, mappingExprText, type MappingField, type MappingMode, type PillCompat,
} from './field-mapper'

// The schema-aware field mapper (W2/W3 MAPPING primitive, W11 one grammar). Two columns:
// SOURCE — the upstream schema (a node's output, a trigger's context) as clickable pills;
// TARGET — the downstream schema (a step's input, a workflow's Start) as rows with a
// required marker. Clicking a pill then a target row (or dragging) writes the pill's path
// as the row's expression; every row also takes a fixed value or a raw expression. The
// mapper GENERATES the one expr-lang grammar (`{ key: <rhs> }`) — the pill UI is sugar
// over it, the expression stays visible and editable. v-model carries that expression.

const props = defineProps<{
  sourceSchema?: unknown
  targetSchema?: unknown
  // The source root the emitted expressions reference: an edge's `output`, a binding's
  // `input`. Pills render as `${root}.${path}`.
  sourceRoot?: string
  sourceTitle?: string
  targetTitle?: string
  // The current mapping as the one-grammar object expression (v-model).
  modelValue?: string
  // Reseed the rows from modelValue when this changes (a new edge/workflow, an AI draft).
  resetKey?: string | number
  showAssist?: boolean
  assistPending?: boolean
  assistError?: string
  // Product-facing mode: fields and their relationship stay primary; raw expr-lang and
  // per-row storage modes move behind an explicit Advanced mapping disclosure.
  simple?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', expr: string): void
  (e: 'update:missing', missing: string[]): void
  (e: 'assist'): void
  (e: 'cancel-assist'): void
}>()

const rows = ref<MappingField[]>([])
const rawMode = ref(false)
const rawExpr = ref('')
const selectedPill = ref<string | null>(null)
const expanded = ref<Record<string, boolean>>({})
const dragOverKey = ref<string | null>(null)
const advancedOpen = ref(false)
// True while rows merely visualize the runtime's unchanged pass-through. Editing any row
// materializes an explicit transform; until then the model remains the honest empty value.
const implicitPassThrough = ref(false)

const root = computed(() => props.sourceRoot || 'output')
const tree = computed(() => buildSourceTree(props.sourceSchema, root.value))
const rootPill = computed(() => rootSourceField(props.sourceSchema, root.value))
const sourceFields = computed<SourceField[]>(() =>
  tree.value.length ? tree.value : (rootPill.value ? [rootPill.value] : []))
const targets = computed<TargetField[]>(() => targetFields(props.targetSchema))
const hasTargetFields = computed(() => targets.value.length > 0)
const armed = computed(() => !!selectedPill.value)

// A flat lookup of pills by their full expression, for the per-row type-compat dot.
const pillByExpr = computed(() => {
  const m = new Map<string, SourceField>()
  const walk = (fs: SourceField[]) => fs.forEach((f) => { m.set(f.expr, f); if (f.children.length) walk(f.children) })
  walk(sourceFields.value)
  return m
})

// The source pills flattened for rendering, honoring which nested pills are expanded.
const visibleSource = computed<SourceField[]>(() => {
  const out: SourceField[] = []
  const walk = (fs: SourceField[]) => {
    for (const f of fs) {
      out.push(f)
      if (f.expandable && expanded.value[f.path]) walk(f.children)
    }
  }
  walk(sourceFields.value)
  return out
})
// Simple mode's target picker must work on its own: flatten every declared source so a
// user can choose it directly without first knowing to "arm" a pill in the other column.
const sourceOptions = computed<SourceField[]>(() => {
  const out: SourceField[] = []
  const walk = (fields: SourceField[]) => fields.forEach((field) => { out.push(field); walk(field.children) })
  walk(sourceFields.value)
  return out
})

const missing = computed<string[]>(() => {
  if (rawMode.value) {
    return rawExpr.value.trim() ? [] : targets.value.filter((t) => t.required).map((t) => t.title || t.key)
  }
  return unmappedRequired(targets.value, rows.value)
})
const completeness = computed(() => (rawMode.value ? '' : completenessLine(targets.value, rows.value)))
const targetContract = computed(() => decodeSchema(props.targetSchema))
const statusLine = computed(() => {
  if (!targetContract.value) return 'Input fields unavailable'
  if (!hasTargetFields.value && !rawMode.value) return 'No mapping needed'
  if (!hasTargetFields.value) return 'Custom mapping'
  return completeness.value
    || (implicitPassThrough.value ? 'Required fields pass through unchanged' : 'All required fields mapped')
})
const statusWarn = computed(() => !!completeness.value || !targetContract.value)
const compiled = computed(() => implicitPassThrough.value
  ? ''
  : (rawMode.value ? rawExpr.value.trim() : buildObjectExpression(rows.value)))

function reseed() {
  selectedPill.value = null
  implicitPassThrough.value = false
  if (!hasTargetFields.value) {
    rawExpr.value = mappingExprText(props.modelValue)
    rawMode.value = rawExpr.value !== ''
    rows.value = []
    return
  }
  const seeded = seedRows(props.targetSchema, props.modelValue)
  const passThrough = !(props.modelValue || '').trim()
    ? passThroughMapping(props.sourceSchema, props.targetSchema, root.value)
    : []
  const byKey = new Map(passThrough.map((row) => [row.key, row]))
  rows.value = seeded.rows.map((row) => byKey.get(row.key) || row)
  implicitPassThrough.value = passThrough.length > 0
  rawExpr.value = seeded.raw
  rawMode.value = seeded.raw !== ''
}
watch(() => props.resetKey, reseed, { immediate: true })
watch(compiled, (v) => emit('update:modelValue', v))
watch(missing, (m) => emit('update:missing', m), { immediate: true })

function rowOf(key: string): MappingField {
  return rows.value.find((r) => r.key === key) || { key, mode: 'skip', value: '' }
}
function isMapped(row: MappingField): boolean {
  return (row.mode === 'expr' || row.mode === 'static') && (row.value ?? '') !== ''
}
function rowCompat(t: TargetField): PillCompat {
  const r = rowOf(t.key)
  if (r.mode !== 'expr' || !r.value) return 'neutral'
  const pill = pillByExpr.value.get(r.value.trim())
  return pill ? pillCompat(pill.type, t.type) : 'neutral'
}

function selectPill(expr: string) {
  selectedPill.value = selectedPill.value === expr ? null : expr
}
function toggleExpand(path: string) {
  expanded.value = { ...expanded.value, [path]: !expanded.value[path] }
}
function mapPillToRow(key: string, expr: string) {
  implicitPassThrough.value = false
  rows.value = rows.value.map((r) => (r.key === key ? { ...r, mode: 'expr', value: expr } : r))
}
function onRowActivate(key: string) {
  if (!selectedPill.value) return
  mapPillToRow(key, selectedPill.value)
  selectedPill.value = null
}
function onSimpleSelect(key: string, expr: string) {
  if (expr) mapPillToRow(key, expr)
  else clearRow(key)
  selectedPill.value = null
}
function setRowMode(key: string, mode: MappingMode) {
  implicitPassThrough.value = false
  rows.value = rows.value.map((r) => (r.key === key ? { ...r, mode } : r))
}
function setRowValue(key: string, value: string) {
  implicitPassThrough.value = false
  rows.value = rows.value.map((r) => (r.key === key ? { ...r, value } : r))
}
function clearRow(key: string) {
  implicitPassThrough.value = false
  const t = targets.value.find((x) => x.key === key)
  rows.value = rows.value.map((r) => (r.key === key
    ? { key, mode: t?.required ? 'static' : 'skip', value: '', type: r.type }
    : r))
  selectedPill.value = null
}

function onPillDragStart(e: DragEvent, expr: string) {
  if (e.dataTransfer) { e.dataTransfer.setData('text/plain', expr); e.dataTransfer.effectAllowed = 'copy' }
  selectedPill.value = expr
}
function onRowDragOver(e: DragEvent, key: string) { e.preventDefault(); dragOverKey.value = key }
function onRowDragLeave(key: string) { if (dragOverKey.value === key) dragOverKey.value = null }
function onRowDrop(e: DragEvent, key: string) {
  e.preventDefault()
  const expr = e.dataTransfer?.getData('text/plain') || selectedPill.value
  if (expr) { mapPillToRow(key, expr); selectedPill.value = null }
  dragOverKey.value = null
}

function enterRaw() {
  implicitPassThrough.value = false
  rawExpr.value = buildObjectExpression(rows.value)
  rawMode.value = true
  selectedPill.value = null
}
function leaveRaw() {
  const seeded = seedRows(props.targetSchema, rawExpr.value)
  rows.value = seeded.rows
  // Only stay in fields view when the expression decomposed cleanly.
  if (seeded.raw === '') rawMode.value = false
}
function onRawInput(e: Event) { rawExpr.value = (e.target as HTMLTextAreaElement).value }

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && selectedPill.value) { selectedPill.value = null; e.stopPropagation() }
}

function simpleValue(row: MappingField): string {
  if (row.mode === 'static' && row.value) return `Fixed value: ${row.value}`
  if (row.mode === 'expr' && row.value) {
    const prefix = `${root.value}.`
    return row.value.startsWith(prefix) ? `From ${row.value.slice(prefix.length)}` : 'Custom mapping'
  }
  return 'Choose a field'
}

const rawPlaceholder = computed(() => `{ field: ${root.value}.value }`)
</script>

<template>
  <div class="fm" :class="{ 'fm--armed': armed }" @keydown="onKeydown">
    <div class="fm-top">
      <span class="fm-status" :class="statusWarn ? 'fm-status--warn' : 'fm-status--ok'">
        <Icon :icon="statusWarn ? 'tabler:alert-triangle' : 'tabler:circle-check'" aria-hidden="true" />
        <span>{{ statusLine }}</span>
      </span>
      <button
        v-if="showAssist && targetContract"
        type="button"
        class="fm-ai"
        @click="assistPending ? emit('cancel-assist') : emit('assist')"
      >
        <Icon :icon="assistPending ? 'tabler:x' : 'tabler:wand'" aria-hidden="true" />
        <span>{{ assistPending ? 'Cancel' : 'Draft with AI' }}</span>
      </button>
    </div>
    <p v-if="assistPending" class="fm-note">Drafting a field mapping…</p>
    <p v-else-if="assistError" class="fm-err"><Icon icon="tabler:alert-triangle" aria-hidden="true" /> {{ assistError }}</p>

    <div v-if="armed" class="fm-armbar">
      <Icon icon="tabler:pointer" aria-hidden="true" />
      <span>Mapping <code>{{ selectedPill }}</code> — pick a target field, or press Esc.</span>
    </div>

    <div v-if="simple && !targetContract" class="fm-contract-missing">
      <Icon icon="tabler:alert-triangle" aria-hidden="true" />
      <span>This step’s input fields didn’t load. Refresh the step before mapping it.</span>
    </div>

    <p v-else-if="!hasTargetFields && !rawMode" class="fm-empty fm-no-mapping">
      This step takes no input fields, so the connection passes through without a mapping.
    </p>

    <div v-else class="fm-cols">
      <!-- SOURCE -->
      <section class="fm-col fm-col--src" aria-label="Source fields">
        <div class="fm-col-hd">{{ sourceTitle || 'From' }}</div>
        <div class="fm-pills">
          <div
            v-for="f in visibleSource"
            :key="f.expr"
            class="fm-pill-row"
            :style="{ '--fm-depth': `${f.depth * 14}px` }"
          >
            <button
              v-if="f.expandable"
              type="button"
              class="fm-twist"
              :aria-expanded="!!expanded[f.path]"
              :aria-label="`Expand ${f.name}`"
              @click="toggleExpand(f.path)"
            >
              <Icon :icon="expanded[f.path] ? 'tabler:chevron-down' : 'tabler:chevron-right'" aria-hidden="true" />
            </button>
            <span v-else class="fm-twist-sp" aria-hidden="true"></span>
            <button
              type="button"
              class="fm-pill"
              :class="{ 'is-sel': selectedPill === f.expr }"
              draggable="true"
              :title="f.description || f.expr"
              @click="selectPill(f.expr)"
              @dragstart="onPillDragStart($event, f.expr)"
            >
              <span class="fm-pill-name">{{ f.name }}</span>
              <span class="fm-pill-type">{{ f.type }}</span>
            </button>
          </div>
          <p v-if="!visibleSource.length" class="fm-empty">
            No fields are available from the previous step yet.
          </p>
        </div>
      </section>

      <!-- TARGET -->
      <section class="fm-col fm-col--tgt" aria-label="Target fields">
        <div class="fm-col-hd">{{ targetTitle || 'To' }}</div>

        <template v-if="rawMode && (!simple || advancedOpen)">
          <label class="fm-raw">
            <span class="fm-raw-lbl">Expression</span>
            <textarea
              class="fm-raw-input"
              :value="rawExpr"
              rows="4"
              spellcheck="false"
              :placeholder="rawPlaceholder"
              aria-label="Mapping expression"
              @input="onRawInput"
            ></textarea>
          </label>
          <p class="fm-hint">Build the complete input with one expression.</p>
        </template>

        <div v-else-if="!rawMode" class="fm-rows">
          <p v-if="!targets.length" class="fm-empty">This target takes no input — nothing to map.</p>
          <div
            v-for="t in targets"
            :key="t.key"
            class="fm-row"
            :class="{
              'fm-row--needed': t.required && missing.includes(t.title || t.key),
              'is-drop': dragOverKey === t.key,
              'is-mapped': isMapped(rowOf(t.key)),
            }"
            :data-test="`fm-row-${t.key}`"
            @dragover="onRowDragOver($event, t.key)"
            @dragleave="onRowDragLeave(t.key)"
            @drop="onRowDrop($event, t.key)"
          >
            <button
              type="button"
              class="fm-row-hd"
              :aria-label="armed ? `Map ${selectedPill} into ${t.title}` : t.title"
              @click="onRowActivate(t.key)"
            >
              <span class="fm-row-name">{{ t.title }}</span>
              <span v-if="t.required" class="fm-req">required</span>
              <span class="fm-row-type">{{ t.type || 'any' }}</span>
              <span
                v-if="rowCompat(t) === 'mismatch'"
                class="fm-compat fm-compat--warn"
                title="This field's type may not match the target"
              >type?</span>
              <Icon v-if="armed" class="fm-row-drop" icon="tabler:arrow-bar-to-down" aria-hidden="true" />
            </button>
            <div v-if="simple && !advancedOpen" class="fm-simple-row">
              <select
                class="fm-simple-value"
                :value="rowOf(t.key).mode === 'expr' ? rowOf(t.key).value : ''"
                :aria-label="`Choose a source field for ${t.title}`"
                @change="onSimpleSelect(t.key, ($event.target as HTMLSelectElement).value)"
              >
                <option value="">{{ simpleValue(rowOf(t.key)) }}</option>
                <option v-for="source in sourceOptions" :key="source.expr" :value="source.expr">{{ source.name }}</option>
              </select>
              <button
                v-if="isMapped(rowOf(t.key))"
                type="button"
                class="fm-clear"
                :aria-label="`Clear ${t.title}`"
                title="Clear"
                @click="clearRow(t.key)"
              ><Icon icon="tabler:x" aria-hidden="true" /></button>
            </div>
            <div v-else class="fm-row-body">
              <select
                class="fm-mode"
                :value="rowOf(t.key).mode"
                :aria-label="`How to fill ${t.title}`"
                @change="setRowMode(t.key, ($event.target as HTMLSelectElement).value as MappingMode)"
              >
                <option value="expr">Field / expression</option>
                <option value="static">Fixed value</option>
                <option v-if="!t.required" value="skip">Leave empty</option>
              </select>
              <button
                v-if="rowOf(t.key).mode === 'skip'"
                type="button"
                class="fm-cell fm-cell--empty"
                @click="onRowActivate(t.key)"
              >{{ armed ? 'Drop it here' : 'Left empty' }}</button>
              <input
                v-else-if="rowOf(t.key).mode === 'static'"
                class="fm-cell fm-input"
                :value="rowOf(t.key).value"
                :placeholder="t.description || 'value'"
                :aria-label="`${t.title} fixed value`"
                @input="setRowValue(t.key, ($event.target as HTMLInputElement).value)"
              />
              <input
                v-else
                class="fm-cell fm-input fm-mono"
                :value="rowOf(t.key).value"
                :placeholder="selectedPill || `${root}.field`"
                :aria-label="`${t.title} expression`"
                @input="setRowValue(t.key, ($event.target as HTMLInputElement).value)"
              />
              <button
                v-if="isMapped(rowOf(t.key))"
                type="button"
                class="fm-clear"
                :aria-label="`Clear ${t.title}`"
                title="Clear"
                @click="clearRow(t.key)"
              ><Icon icon="tabler:x" aria-hidden="true" /></button>
            </div>
          </div>
        </div>
        <p v-else class="fm-empty">A custom mapping is configured. Open Advanced mapping to inspect it.</p>
      </section>
    </div>

    <button v-if="simple && (hasTargetFields || rawMode)" type="button" class="fm-linkbtn" @click="advancedOpen = !advancedOpen">
      {{ advancedOpen ? 'Hide advanced mapping' : 'Advanced mapping' }}
    </button>
    <button v-else-if="hasTargetFields && !rawMode" type="button" class="fm-linkbtn" @click="enterRaw">
      Write the whole expression myself
    </button>
    <button v-else-if="hasTargetFields && rawMode" type="button" class="fm-linkbtn" @click="leaveRaw">
      Back to fields
    </button>
    <button v-if="simple && advancedOpen && hasTargetFields && !rawMode" type="button" class="fm-linkbtn" @click="enterRaw">
      Edit the complete expression
    </button>
    <button v-if="simple && advancedOpen && hasTargetFields && rawMode" type="button" class="fm-linkbtn" @click="leaveRaw">
      Back to field mapping
    </button>
  </div>
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import Tag from 'primevue/tag'
import AnchoredPanel from '@widgets/app/AnchoredPanel.vue'
import { computed, nextTick, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { exportWorkflow, humanError, setWorkflowLabels } from '../api/api'
import { downloadJson, flowFilename } from '../mapping/portable'
import { addLabel, removeLabel } from './workflow-labels'
import { normalizeLabels } from '../domain/workflow-labels'
import type { ListItem, WorkflowRow } from './workflow-row'

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary'

function workflowStatusSeverity(tone: WorkflowRow['status']['tone']): TagSeverity {
  return tone === 'published' ? 'success' : 'warn'
}

function runStatusSeverity(row: WorkflowRow): TagSeverity {
  if (!row.lastRun.present) return 'secondary'
  if (row.lastRun.tone === 'ok') return 'success'
  if (row.lastRun.tone === 'error') return 'danger'
  return 'info'
}

// The workflow list table: the dense rows (flat or grouped), inline label editing, the
// per-row overflow menu and export. Owns its ephemeral row-interaction UI (open menu, label
// editor draft, per-row busy spinners) and performs the label-save / export reads itself,
// emitting the outcomes so the parent updates its rows and shared error banners.
const props = defineProps<{
  items: ListItem[]
}>()
const emit = defineEmits<{
  (e: 'open', id: string): void
  (e: 'labels-saved', id: string, labels: string[]): void
  (e: 'label-error', message: string): void
  (e: 'export-error', message: string): void
  (e: 'share', row: WorkflowRow, invoker: HTMLElement | null): void
  (e: 'ask-delete', row: WorkflowRow, invoker: HTMLElement | null): void
}>()

// Inline label management state: which row's editor is open, its draft text, the row
// currently saving.
const editingLabelsFor = ref<string | null>(null)
const labelDraft = ref('')
const labelBusy = ref('')
const labelInputRef = ref<{ $el?: HTMLElement } | null>(null)
// Per-row overflow menu (Export lives here) and the in-flight export row. The menu
// rides the shared AnchoredPanel: PrimeVue's popup Menu binds document-level
// listeners that read the retargeted event.target of a real pointer (the shadow
// host), so it closes on the click that should activate an item; AnchoredPanel
// dismisses via composedPath and places with fixed coordinates above the table's
// scroll and container contexts.
interface RowMenuEntry {
  /** Absent on a separator, which carries no label - see the `separator` branch. */
  label?: string
  visibleLabel?: string
  icon?: string
  title?: string
  disabled?: boolean
  danger?: boolean
  separator?: boolean
  command?: () => void
}
const openMenuFor = ref<string | null>(null)
const exportBusy = ref('')
const rowMenuInvoker = ref<HTMLElement | null>(null)
const rowMenuOpen = computed({
  get: () => openMenuFor.value !== null,
  set: (v: boolean) => {
    if (!v) closeRowMenu()
  },
})
const activeMenuRow = computed(() => {
  const id = openMenuFor.value
  if (!id) return null
  const item = props.items.find((candidate) => candidate.kind === 'row' && candidate.row.id === id)
  return item?.kind === 'row' ? item.row : null
})

function openLabelEditor(id: string, e: Event) {
  e.stopPropagation()
  const opening = editingLabelsFor.value !== id
  editingLabelsFor.value = opening ? id : null
  labelDraft.value = ''
  emit('label-error', '')
  if (opening) nextTick(focusLabelInput)
}
function focusLabelInput() {
  const element = labelInputRef.value?.$el
  if (element instanceof HTMLInputElement) element.focus()
}
function closeLabelEditor() {
  editingLabelsFor.value = null
  labelDraft.value = ''
}
async function saveLabels(id: string, next: string[]) {
  labelBusy.value = id
  emit('label-error', '')
  try {
    const saved = await setWorkflowLabels(id, next)
    emit('labels-saved', id, saved)
  } catch (e) {
    emit('label-error', humanError(e, 'Couldn’t update labels.'))
  } finally {
    labelBusy.value = ''
  }
}
async function addRowLabel(row: WorkflowRow) {
  const current = normalizeLabels(row.labels)
  const next = addLabel(current, labelDraft.value)
  labelDraft.value = ''
  if (next === current) return
  await saveLabels(row.id, next)
}
async function removeRowLabel(row: WorkflowRow, label: string, e: Event) {
  e.stopPropagation()
  await saveLabels(row.id, removeLabel(normalizeLabels(row.labels), label))
}

function toggleRowMenu(id: string, e: Event) {
  e.stopPropagation()
  if (openMenuFor.value === id) {
    closeRowMenu()
    return
  }
  openMenuFor.value = id
  rowMenuInvoker.value = e.currentTarget instanceof HTMLElement ? e.currentTarget : null
}
function closeRowMenu() {
  openMenuFor.value = null
  rowMenuInvoker.value = null
}
function pickMenuItem(entry: RowMenuEntry) {
  if (entry.disabled || !entry.command) return
  entry.command()
}

// Export is published-only: the portable artifact is the frozen published source, so a
// draft has nothing to share. The menu item is disabled on a draft with a directed hint;
// this guard is the backstop.
async function exportRow(row: WorkflowRow) {
  if (!row.status.published || exportBusy.value) return
  exportBusy.value = row.id
  emit('export-error', '')
  try {
    const flow = await exportWorkflow(row.id)
    downloadJson(flowFilename(flow.title), flow)
    closeRowMenu()
  } catch (e) {
    emit('export-error', humanError(e, 'Couldn’t export this Workflow.'))
  } finally {
    exportBusy.value = ''
  }
}

function onAskDelete(row: WorkflowRow) {
  const invoker = rowMenuInvoker.value
  closeRowMenu()
  emit('ask-delete', row, invoker)
}
function onShare(row: WorkflowRow) {
  const invoker = rowMenuInvoker.value
  closeRowMenu()
  emit('share', row, invoker)
}

const rowMenuItems = computed<RowMenuEntry[]>(() => {
  const row = activeMenuRow.value
  if (!row) return []
  const exportAvailable = row.status.published && exportBusy.value !== row.id
  const exportLabel = row.status.published
    ? 'Export'
    : 'Export unavailable. Publish this Workflow before exporting it.'
  return [
    {
      label: 'Share',
      icon: 'tabler:share',
      title: 'Share this Workflow',
      command: () => onShare(row),
    },
    { separator: true },
    {
      label: exportLabel,
      visibleLabel: 'Export',
      icon: 'tabler:download',
      disabled: !exportAvailable,
      title: row.status.published
        ? 'Download this published Workflow as JSON'
        : 'Publish this Workflow before exporting it',
      command: () => exportRow(row),
    },
    { separator: true },
    {
      label: 'Delete',
      icon: 'tabler:trash',
      title: 'Delete this Workflow',
      danger: true,
      command: () => onAskDelete(row),
    },
  ]
})
</script>

<template>
  <div class="kx-list wf-table" role="table" aria-label="Workflows">
    <div class="wf-table-head" role="row">
      <span role="columnheader">Name</span>
      <span role="columnheader">Labels</span>
      <span role="columnheader">Location</span>
      <span role="columnheader">Status</span>
      <span role="columnheader">Last run</span>
      <span role="columnheader">Updated</span>
      <span role="columnheader" class="wf-sr-only">Actions</span>
    </div>
    <template v-for="item in items" :key="item.key">
      <div v-if="item.kind === 'header'" class="wf-group-head" role="row">
        <Icon :icon="item.empty ? 'tabler:tag-off' : 'tabler:tag'" aria-hidden="true" />
        <span class="wf-group-title">{{ item.header }}</span>
        <span class="wf-group-count">{{ item.count }}</span>
      </div>
      <div
        v-else
        class="kx-row wf-row"
        role="row"
        tabindex="0"
        @click="emit('open', item.row.id)"
        @keydown.enter="emit('open', item.row.id)"
        @keydown.space.prevent="emit('open', item.row.id)"
      >
        <span class="wf-row-main" role="cell">
          <span class="wf-row-icon"><Icon icon="tabler:route" aria-hidden="true" /></span>
          <span class="wf-row-text">
            <span class="wf-row-name">
              <strong>{{ item.row.title }}</strong>
            </span>
            <span v-if="item.row.subline" class="wf-row-sub">{{ item.row.subline }}</span>
          </span>
        </span>
        <span class="wf-labels-cell" role="cell" data-label="Labels" @click.stop>
          <span v-for="l in item.row.labels" :key="l" class="wf-label-chip">
            <span class="wf-label-chip-text">{{ l }}</span>
            <Button class="wf-label-x" text rounded severity="secondary" :aria-label="`Remove label ${l}`" :disabled="labelBusy === item.row.id" @click.stop="removeRowLabel(item.row, l, $event)">
              <Icon icon="tabler:x" aria-hidden="true" />
            </Button>
          </span>
          <template v-if="editingLabelsFor === item.row.id">
            <InputText
              ref="labelInputRef"
              v-model="labelDraft"
              class="wf-label-input"
              type="text"
              placeholder="Add label…"
              :aria-label="`Add a label to ${item.row.title}`"
              @click.stop
              @keydown.enter.stop.prevent="addRowLabel(item.row)"
              @keydown.escape.stop="closeLabelEditor"
            />
            <Button class="wf-label-done" text rounded severity="secondary" aria-label="Done editing labels" @click.stop="closeLabelEditor"><Icon icon="tabler:check" aria-hidden="true" /></Button>
          </template>
          <Button
            v-else
            class="wf-label-add"
            text
            severity="secondary"
            :aria-label="`Add a label to ${item.row.title}`"
            :disabled="labelBusy === item.row.id"
            :loading="labelBusy === item.row.id"
            @click.stop="openLabelEditor(item.row.id, $event)"
          >
            <Icon v-if="labelBusy !== item.row.id" icon="tabler:plus" aria-hidden="true" />
            <span v-if="!item.row.labels.length">Label</span>
          </Button>
        </span>
        <span class="wf-loc-cell" :class="!item.row.location.present && 'is-empty'" role="cell" data-label="Location">
          <template v-if="item.row.location.present">
            <Icon icon="tabler:folder" class="wf-loc-ico" aria-hidden="true" />
            <span class="wf-loc-name" :title="item.row.location.title">{{ item.row.location.label }}</span>
          </template>
        </span>
        <span class="wf-status-cell" role="cell" data-label="Status">
          <Tag
            class="wf-status-tag"
            :severity="workflowStatusSeverity(item.row.status.tone)"
            :title="item.row.status.hasDraft && item.row.status.published ? 'Published, with unpublished draft edits' : item.row.status.published ? 'Published' : 'Not published yet'"
          >
            <Icon v-if="item.row.status.hasDraft && item.row.status.published" icon="tabler:pencil" class="wf-pill-ico" aria-hidden="true" />
            {{ item.row.status.label }}
          </Tag>
        </span>
        <span class="wf-lastrun" role="cell" data-label="Last run">
          <Tag class="wf-last-run-tag" :severity="runStatusSeverity(item.row)" :title="item.row.lastRun.title">
            <ProgressSpinner
              v-if="item.row.lastRun.present && item.row.lastRun.tone === 'pending'"
              class="wf-status-spinner"
              stroke-width="4"
              aria-label="Run in progress"
            />
            <Icon v-else :icon="item.row.lastRun.icon" aria-hidden="true" />
            <span>{{ item.row.lastRun.label }}</span>
          </Tag>
          <span v-if="item.row.lastRun.cause" class="wf-last-run-cause" :title="item.row.lastRun.cause">{{ item.row.lastRun.cause }}</span>
        </span>
        <span class="wf-row-updated" role="cell" data-label="Updated">{{ item.row.updated }}</span>
        <span class="wf-row-actions" role="cell" @click.stop>
          <Button
            class="wf-row-menu-btn"
            text
            rounded
            severity="secondary"
            :class="openMenuFor === item.row.id && 'is-open'"
            :aria-label="`Actions for ${item.row.title}`"
            :aria-expanded="openMenuFor === item.row.id"
            @click.stop="toggleRowMenu(item.row.id, $event)"
          >
            <Icon icon="tabler:dots-vertical" aria-hidden="true" />
          </Button>
        </span>
      </div>
    </template>
  </div>
  <AnchoredPanel v-model:open="rowMenuOpen" :anchor="rowMenuInvoker" align="right" :width="190">
    <div class="wf-row-menu" role="menu" aria-label="Workflow actions">
      <template v-for="(entry, i) in rowMenuItems" :key="i">
        <div v-if="entry.separator" class="wf-row-menu-sep" role="separator" />
        <button
          v-else
          type="button"
          class="wf-row-menu-item"
          :class="entry.danger && 'wf-row-menu-item--danger'"
          role="menuitem"
          :title="entry.title"
          :disabled="entry.disabled"
          :aria-label="entry.label"
          @click="pickMenuItem(entry)"
        >
          <Icon v-if="entry.icon" :icon="entry.icon" aria-hidden="true" />
          <span>{{ entry.visibleLabel || entry.label }}</span>
        </button>
      </template>
    </div>
  </AnchoredPanel>
</template>

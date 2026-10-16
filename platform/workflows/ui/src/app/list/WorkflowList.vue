<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import { computed, nextTick, ref } from 'vue'
import { Icon } from '@iconify/vue'
import Dialog from 'primevue/dialog'
import { useHostVisibilityRefresh, useProps } from '@wippy-fe/webcomponent-vue'
import { applyCommands, createWorkflow, deleteWorkflow, humanError, listWorkflows, setWorkflowLabels } from '../api/api'
import { restoreOverlayFocusAfterHide } from '../overlay-focus'
import type { WorkflowSummary } from '../types'
import type { ListItem, WorkflowRow } from './workflow-row'
import { mapWorkflowRows } from './workflow-row'
import { allLabels, filterByLabel, groupByLabel, NO_LABEL_KEY } from './workflow-labels'
import { WorkflowCreateFlow } from './create-flow'
import { boundaryScaffold } from './boundary-scaffold'
import WorkflowListHeader from './WorkflowListHeader.vue'
import WorkflowTable from './WorkflowTable.vue'
import ImportModal from './ImportModal.vue'
import { mountWorkflowShare } from '../share'

const emit = defineEmits<{ (e: 'open', id: string): void }>()

// The workspace "+" folder this surface is mounted under, when the host provides one.
// useProps exposes host attributes camelCased (parent-id -> parentId), so read camel-first
// directly. Empty on the standalone route mount — the create dialog then shows
// no placement line. Read inline (not via the shared @widgets useParentId) because crossing
// that package's Ref boundary trips a dual-vue identity check under this project's vue-tsc.
const props = useProps<Record<string, unknown>>()
const parentId = computed(() => {
  const v = props.value || {}
  const camel = typeof v.parentId === 'string' ? v.parentId : ''
  return camel.trim()
})

const rows = ref<WorkflowSummary[]>([])
const loading = ref(true)
const error = ref('')
const q = ref('')
const newTitle = ref('')
const newLabel = ref('')
const submitting = ref(false)
// W18 label organization: filter by a single label (null = all, NO_LABEL_KEY = un-labeled),
// and a flat / grouped-by-label view toggle. Labels are organization metadata, not folders.
const labelFilter = ref<string | null>(null)
const groupBy = ref<'flat' | 'label'>('flat')
// The label-save error surfaces its own banner, distinct from the general error.
const labelError = ref('')
// One create path: a workflow is a workflow. Every new workflow starts with the required
// Start + Finish contract. Error is an optional exit the author drops only when the flow
// needs a typed failure result.
const createOpen = ref(false)
// Portable Flow import is a separate dialog owned by its component.
const importOpen = ref(false)
const shareTarget = ref<WorkflowRow | null>(null)
const shareHost = ref<HTMLElement | null>(null)
const rootEl = ref<HTMLElement | null>(null)
const overlayInvoker = ref<HTMLElement | null>(null)
const overlayFallback = ref<HTMLElement | null>(null)
let overlayFocusGeneration = 0

function rememberOverlayInvoker(fallback: HTMLElement | null = null) {
  overlayFocusGeneration += 1
  const root = rootEl.value?.getRootNode() as ShadowRoot | undefined
  overlayInvoker.value = root?.activeElement instanceof HTMLElement ? root.activeElement : null
  overlayFallback.value = fallback
}

// PrimeVue owns focus trapping and restoration. In the embedded Wippy iframe its
// document.activeElement stops at the workflow host, so PrimeVue cannot always see
// the shadow-root invoker. Wait past its hide transition and intervene only if the
// workflow shadow root still has no focused element.
async function restoreOverlayFocusFallback() {
  const generation = overlayFocusGeneration
  const target = overlayInvoker.value
  const fallback = overlayFallback.value
  await nextTick()
  const root = rootEl.value?.getRootNode() as ShadowRoot | undefined
  const restored = await restoreOverlayFocusAfterHide({
    root: root ?? null,
    target,
    fallback,
    isCurrent: () => generation === overlayFocusGeneration,
  })
  if (!restored) return
  overlayFocusGeneration += 1
  overlayInvoker.value = null
  overlayFallback.value = null
}

// The create sequence, made idempotent across retries so a failed scaffold or an abandoned
// dialog never strands (or multiplies) empty untitled drafts. A fresh scaffold is generated
// per apply so a reused draft still gets clean node ids.
const createFlow = new WorkflowCreateFlow({
  createWorkflow: (title, parent) => createWorkflow(title, parent),
  applyScaffold: (id) => applyCommands(id, boundaryScaffold()).then(() => {}),
  setLabels: (id, labels) => setWorkflowLabels(id, labels).then(() => {}),
  deleteWorkflow: (id) => deleteWorkflow(id),
})

const allRows = computed(() => mapWorkflowRows(rows.value))
// The full label vocabulary across every workflow (not just the filtered set), so the
// filter chrome always offers every label regardless of the current search/view.
const labelVocab = computed(() => allLabels(allRows.value))
const filteredRows = computed(() => {
  const ql = q.value.trim().toLowerCase()
  let list = allRows.value.filter((r) => {
    if (!ql) return true
    return `${r.title} ${r.id}`.toLowerCase().includes(ql)
  })
  if (labelFilter.value !== null) list = filterByLabel(list, labelFilter.value)
  return list
})
const groups = computed(() => groupByLabel(filteredRows.value))

// The rendered sequence. Flat view is one row per workflow; grouped view interleaves a
// header before each label's rows, so a single template renders both.
const listItems = computed<ListItem[]>(() => {
  if (groupBy.value !== 'label') return filteredRows.value.map((row) => ({ kind: 'row', key: row.id, row }))
  const items: ListItem[] = []
  for (const g of groups.value) {
    items.push({ kind: 'header', key: `h:${g.key}`, header: g.header, empty: g.key === NO_LABEL_KEY, count: g.rows.length })
    for (const row of g.rows) items.push({ kind: 'row', key: `${g.key}:${row.id}`, row })
  }
  return items
})

const totalCount = computed(() => rows.value.length)

// Row label saves and exports happen inside WorkflowTable; the parent applies the outcome to
// its rows and its shared error banners.
function onLabelsSaved(id: string, labels: string[]) {
  rows.value = rows.value.map((r) => (r.id === id ? { ...r, labels } : r))
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    rows.value = await listWorkflows()
  } catch (e) {
    error.value = humanError(e, 'Couldn’t load your Workflows.')
  } finally {
    loading.value = false
  }
}

// A name is required — an unnamed create is what produced the "Untitled workflow" drafts.
const canCreate = computed(() => !!newTitle.value.trim() && !submitting.value)

function startCreate() {
  rememberOverlayInvoker()
  newTitle.value = ''
  newLabel.value = ''
  error.value = ''
  createOpen.value = true
}
function closeCreate() {
  createOpen.value = false
  void restoreOverlayFocusFallback()
  // Sweep a draft that was created but never scaffolded (a scaffold failure the user then
  // dismissed) so closing the dialog never leaves an empty orphan behind.
  if (createFlow.pendingDraftId) createFlow.abandon().then(load)
}

async function submitCreate() {
  if (!createOpen.value || submitting.value) return
  const title = newTitle.value.trim()
  if (!title) { error.value = 'Name your Workflow first.'; return }
  submitting.value = true
  error.value = ''
  try {
    const id = await createFlow.create(title, newLabel.value, parentId.value || undefined)
    createOpen.value = false
    emit('open', id)
  } catch (e) {
    // The draft id is retained inside the flow, so a retry reuses it instead of minting a
    // second workflow.
    error.value = humanError(e, 'Couldn’t create the Workflow.')
  } finally {
    submitting.value = false
  }
}

// ── Per-row delete: the cleanup affordance for abandoned/duplicate drafts. Deletes the
// component through the shared teardown, behind a confirm so it is never accidental.
const deleteTarget = ref<WorkflowRow | null>(null)
const deleteBusy = ref(false)
const focusAfterDelete = ref(false)
// PrimeVue owns the mask, focus trap, Escape handling, focus return and close button;
// the head/body/foot reuse the module's kx-modal-* layout classes.
const dialogPt = {
  header: { class: 'kx-modal-head' },
  content: { style: 'padding: 0' },
  footer: { class: 'kx-modal-foot' },
}
function openImport() {
  rememberOverlayInvoker()
  importOpen.value = true
}
function closeImport() {
  importOpen.value = false
  void restoreOverlayFocusFallback()
}
function askDelete(row: WorkflowRow) {
  const actions = Array.from(rootEl.value?.querySelectorAll<HTMLElement>('button[aria-label]') ?? [])
    .find((button) => button.getAttribute('aria-label') === `Actions for ${row.title}`) ?? null
  rememberOverlayInvoker(actions)
  focusAfterDelete.value = false
  deleteTarget.value = row
}
function cancelDelete() {
  focusAfterDelete.value = false
  deleteTarget.value = null
  void restoreOverlayFocusFallback()
}
async function focusDeleteFallback() {
  if (!focusAfterDelete.value) return
  focusAfterDelete.value = false
  await nextTick()
  rootEl.value?.querySelector<HTMLElement>('button[aria-label^="Actions for"]')?.focus()
  overlayFocusGeneration += 1
  overlayInvoker.value = null
  overlayFallback.value = null
}
async function confirmDelete() {
  const row = deleteTarget.value
  if (!row || deleteBusy.value) return
  deleteBusy.value = true
  error.value = ''
  try {
    await deleteWorkflow(row.id)
    rows.value = rows.value.filter((r) => r.id !== row.id)
    focusAfterDelete.value = true
    deleteTarget.value = null
  } catch (e) {
    error.value = humanError(e, 'Couldn’t delete this Workflow.')
  } finally {
    deleteBusy.value = false
  }
}

async function openShare(row: WorkflowRow) {
  const actions = Array.from(rootEl.value?.querySelectorAll<HTMLElement>('button[aria-label]') ?? [])
    .find((button) => button.getAttribute('aria-label') === `Actions for ${row.title}`) ?? null
  rememberOverlayInvoker(actions)
  shareTarget.value = row
  await nextTick()
  if (shareHost.value) await mountWorkflowShare(shareHost.value, row.id, row.title, closeShare)
}
function closeShare() {
  shareTarget.value = null
  void restoreOverlayFocusFallback()
}

useHostVisibilityRefresh(load)
</script>

<template>
  <div ref="rootEl" class="wf-list kx">
    <WorkflowListHeader
      :total-count="totalCount"
      :label-vocab="labelVocab"
      v-model:q="q"
      v-model:label-filter="labelFilter"
      v-model:group-by="groupBy"
      @import="openImport"
      @create="startCreate"
    />

    <Message v-if="error" class="wf-banner" severity="error" @close="error = ''">{{ error }}</Message>
    <Message v-if="labelError" class="wf-banner" severity="error" @close="labelError = ''">{{ labelError }}</Message>

    <Dialog
      :visible="createOpen"
      :modal="true"
      :dismissable-mask="true"
      class="kx-modal"
      :pt="dialogPt"
      aria-label="New Workflow"
      @update:visible="(v) => { if (!v) closeCreate() }"
    >
      <template #header>
        <span class="kx-modal-head-icon"><Icon icon="tabler:route" aria-hidden="true" /></span>
        <div class="kx-modal-head-text" style="flex: 1">
          <div class="kx-modal-head-title">New Workflow</div>
          <div class="kx-modal-head-sub">Start with inputs and a result. Add an Error exit only when you need one.</div>
        </div>
      </template>
      <div class="kx-modal-body">
        <div class="kx-field">
          <label class="kx-field-lbl">Name</label>
          <InputText
            v-model="newTitle"
            class="kx-input"
            type="text"
            placeholder="Name your Workflow"
            aria-label="Workflow name"
            autofocus
            @keydown.enter="submitCreate"
          />
        </div>
        <div class="kx-field">
          <label class="kx-field-lbl">Label <span class="kx-field-opt">optional</span></label>
          <InputText
            v-model="newLabel"
            class="kx-input"
            type="text"
            placeholder="e.g. sales"
            aria-label="Workflow label"
            @keydown.enter="submitCreate"
          />
        </div>
        <p v-if="parentId" class="wf-create-place">
          <Icon icon="tabler:folder" aria-hidden="true" />
          <span>Placed in the selected folder.</span>
        </p>
      </div>
      <template #footer>
        <Button severity="secondary" text @click="closeCreate">Cancel</Button>
        <Button :disabled="!canCreate" :loading="submitting" @click="submitCreate">
          <Icon v-if="!submitting" icon="tabler:check" aria-hidden="true" />
          <span>Create</span>
        </Button>
      </template>
    </Dialog>

    <ImportModal
      :open="importOpen"
      @close="closeImport"
      @open="(id) => emit('open', id)"
    />

    <Dialog
      :visible="!!deleteTarget"
      :modal="true"
      :dismissable-mask="true"
      class="kx-modal wf-del-modal"
      :pt="dialogPt"
      aria-label="Delete Workflow"
      @update:visible="(v) => { if (!v) cancelDelete() }"
      @after-hide="focusDeleteFallback"
    >
      <template #header>
        <span class="kx-modal-head-icon wf-del-icon"><Icon icon="tabler:trash" aria-hidden="true" /></span>
        <div class="kx-modal-head-text" style="flex: 1">
          <div class="kx-modal-head-title">Delete Workflow</div>
          <div class="kx-modal-head-sub">This removes the Workflow and its history. It can’t be undone.</div>
        </div>
      </template>
      <div class="kx-modal-body">
        <p class="wf-del-note">Delete <strong>{{ deleteTarget?.title }}</strong>?</p>
      </div>
      <template #footer>
        <Button severity="secondary" text @click="cancelDelete">Cancel</Button>
        <Button severity="danger" :disabled="deleteBusy" :loading="deleteBusy" @click="confirmDelete">
          <Icon v-if="!deleteBusy" icon="tabler:trash" aria-hidden="true" />
          <span>Delete</span>
        </Button>
      </template>
    </Dialog>

    <main class="kx-body">
      <div v-if="loading" class="kx-list wf-runs-loading">
        <ProgressSpinner class="wf-status-spinner" stroke-width="4" aria-label="Loading Workflows" />
        <span>Loading Workflows…</span>
      </div>

      <div v-else-if="!filteredRows.length && !q && labelFilter === null" class="kx-empty">
        <div class="kx-empty-ico"><Icon icon="tabler:route" aria-hidden="true" /></div>
        <p class="kx-empty-title">No Workflows yet</p>
        <p class="kx-empty-sub">Create a Workflow from typed Blocks, then publish it when it’s ready.</p>
        <Button @click="startCreate">
          <Icon icon="tabler:plus" aria-hidden="true" />
          <span>New Workflow</span>
        </Button>
      </div>

      <div v-else-if="!filteredRows.length" class="kx-empty">
        <div class="kx-empty-ico"><Icon icon="tabler:search" aria-hidden="true" /></div>
        <p class="kx-empty-title">{{ labelFilter !== null ? 'No Workflows with this label' : 'No matches' }}</p>
        <p class="kx-empty-sub">{{ labelFilter !== null ? 'No Workflows carry this label yet — add it to a Workflow from its row.' : `Nothing matches "${q}".` }}</p>
      </div>

      <WorkflowTable
        v-else
        :items="listItems"
        @open="(id) => emit('open', id)"
        @labels-saved="onLabelsSaved"
        @label-error="(m) => labelError = m"
        @export-error="(m) => error = m"
        @share="openShare"
        @ask-delete="askDelete"
      />
    </main>

    <!-- The platform share widget owns its dialog and access cascade. -->
    <div v-if="shareTarget" ref="shareHost"></div>
  </div>
</template>

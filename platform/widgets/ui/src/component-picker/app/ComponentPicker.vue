<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import { useComponentProps, useComponentEvents } from '../constants.ts'
import { parseSelectedId } from '../../app/pickerValue'
import WcMount from '../../app/WcMount.vue'
import AnchoredPanel from '../../app/AnchoredPanel.vue'

// Single-instance picker over the threads API (GET source). A component class owns
// a stream of events; to subscribe a trigger automation to ONE of the user's
// chats the create form mounts this filtered by the producing class
// (thread_class) and reads the chosen thread/component id back as {thread_id}.
// Listing is the established thread-component invariant: GET /threads scopes to the
// actor's readable threads and ?thread_class=<class> narrows to instances of one
// class. The endpoint pages the component service internally, so one request is
// enough.
//
// Create-path: when the picked class's binding declares meta.component.create.view,
// the empty state and the list footer offer "+ Create new <noun>" — mounting that
// declared view via WcMount and, on its `created` event, refreshing + auto-selecting
// the new instance. The create view is resolved generically (GET
// /api/v1/component-kinds/create-view?class=), so this works for EVERY kind that
// declares one, with no kind-specific code here. A mount that already injects the
// resolved view (component.create_ui in `meta`) short-circuits the lookup.
const props = useComponentProps()
const emit = useComponentEvents()

interface Row { [k: string]: unknown }
interface Item { id: string; label: string; icon: string; selection: Record<string, unknown> }
interface ViewComponentRef { tag_name?: unknown; title?: unknown }

function str(v: unknown): string { return typeof v === 'string' ? v : (v == null ? '' : String(v)) }
function obj(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === 'object') return v as Record<string, unknown>
  if (typeof v === 'string' && v.trim().startsWith('{')) {
    try {
      const decoded = JSON.parse(v)
      return decoded && typeof decoded === 'object' ? decoded as Record<string, unknown> : null
    } catch {
      return null
    }
  }
  return null
}
function rowId(row: Row): string {
  return str(row.id || row.thread_id || row.component_id || row.webhook_id).trim()
}
function rowLabel(row: Row): string {
  const attrs = obj(row.attrs)
  return str(
    row.label ||
    row.title ||
    row.name ||
    row.component_title ||
    (attrs && (attrs.label || attrs.title || attrs.name))
  ).trim()
}
function rowIcon(row: Row): string {
  return str(row.icon || row.component_icon).trim() || 'tabler:message-circle'
}

function schemaSource(raw: unknown): string {
  const schema = obj(raw)
  if (!schema) return ''
  // The mount may pass the picker field's own schema (source at top level) or a
  // wrapping object schema (source declared on one of its properties).
  const direct = str(schema.source).trim()
  if (direct) return direct
  const properties = obj(schema.properties)
  if (!properties) return ''
  for (const field of Object.values(properties)) {
    const declaration = obj(field)
    const declared = str(declaration?.source).trim()
    if (declared) return declared
  }
  return ''
}
// A catalog may declare a structured value on each row (for example a
// revision-pinned reference). The schema names that row field and the config
// key; the picker transports it without interpreting the producer's domain.
const selectionField = computed(() => {
  const properties = obj(obj(props.value?.schema)?.properties)
  for (const [key, raw] of Object.entries(properties || {})) {
    const field = obj(raw)
    if (typeof field?.value_field === 'string' && field.value_field) return { key, valueField: field.value_field }
  }
  return null
})
function selectionFor(row: Row, id: string): Record<string, unknown> {
  const field = selectionField.value
  if (!field) return { thread_id: id }
  if (!(field.valueField in row)) throw new Error('Catalog item is missing its declared selection value.')
  return { [field.key]: row[field.valueField] }
}
function configuredId(raw: unknown): string {
  const field = selectionField.value
  if (!field) return parseSelectedId(raw, 'thread_id')
  const value = obj(raw)?.[field.key]
  if (typeof value === 'string') return value
  const reference = obj(value)
  return typeof reference?.id === 'string' ? reference.id : ''
}
const source = computed(() => str(props.value?.source).trim() || schemaSource(props.value?.schema) || '/api/v1/threads')
// A custom catalog owns its own filtering. Only the canonical thread endpoint
// receives the thread_class and limit query parameters below.
const threadSource = computed(() => source.value.split('?')[0] === '/api/v1/threads')
// thread_class arrives either as its own attribute or inside the `meta` object the
// poller mount passes ({ type: "thread", thread_class }).
const metaObj = computed(() => {
  const raw = str(props.value?.meta).trim()
  if (raw.startsWith('{')) {
    try { return JSON.parse(raw) as { thread_class?: unknown; title?: unknown; component?: unknown; delete_endpoint?: unknown } } catch { return {} }
  }
  return {}
})
const threadClass = computed(() => str(props.value?.threadClass).trim() || str(metaObj.value.thread_class).trim())
// An optional "delete a listed component" capability: a base endpoint the field
// config (directly or via `meta`) supplies. When present the list rows offer a gated
// delete (DELETE <endpoint>/<id>), keeping the picker generic — it knows nothing about
// what it deletes, only that the host declared the id deletable.
const deleteEndpoint = computed(() => str(props.value?.deleteEndpoint).trim() || str(metaObj.value.delete_endpoint).trim())

// A create view can be injected by the mounting context (meta.component.create_ui)
// or resolved from the class's binding via the backend. Either yields a mountable
// view.component tag + its title.
const injectedCreateUi = computed<ViewComponentRef | null>(() => {
  if (!threadSource.value) return null
  const c = (metaObj.value as { component?: { create_ui?: unknown } } | undefined)?.component?.create_ui
  return c && typeof c === 'object' ? c as ViewComponentRef : null
})
const resolvedCreateView = ref<ViewComponentRef | null>(null)
const createTag = computed(() => str(injectedCreateUi.value?.tag_name).trim() || str(resolvedCreateView.value?.tag_name).trim())
const createTitle = computed(() => str(injectedCreateUi.value?.title).trim() || str(resolvedCreateView.value?.title).trim())

// The placeholder reflects the field's own title (e.g. "Knowledge base", "Chat")
// so the prompt matches the selected class, with a neutral fallback.
const pickNoun = computed(() => (str(props.value?.title).trim() || str(metaObj.value.title).trim()).toLowerCase())
const placeholder = computed(() => props.value?.placeholder || (pickNoun.value ? `Select a ${pickNoun.value}…` : 'Select…'))
// The create affordance names the noun from the field title, then the create view's
// own title, then a neutral fallback.
const createNoun = computed(() => pickNoun.value || createTitle.value.toLowerCase() || 'one')
const createLabel = computed(() => `Create new ${createNoun.value}`)
// An instance must never surface its raw id as its name. When a row carries no human
// label (or the list projection fell back to the id) name it generically from the
// field noun, e.g. "Untitled webhook".
const untitledLabel = computed(() => (pickNoun.value ? `Untitled ${pickNoun.value}` : 'Untitled'))
// An empty list is a dead end unless it explains itself: name the class (from the
// field title) and point at creating one, instead of a bare "No matches".
const emptyText = computed(() => pickNoun.value
  ? `No ${pickNoun.value} available yet — create one first, then return here.`
  : 'Nothing available yet — create one first, then return here.')

const items = ref<Item[]>([])
const loaded = ref(false)
const loading = ref(false)
const open = ref(false)
const creating = ref(false)
const selectedId = ref('')
// Per-row delete state: the id armed for confirmation, the id being deleted, and the
// last delete error (shown inline, e.g. the server's "in use by N" message on a 409).
const confirmDeleteId = ref('')
const deletingId = ref('')
const deleteError = ref('')

const ctrl = ref<HTMLElement | null>(null)

// Resolve the class's declared create view once per class. Skipped when the mount
// already injected one. A class with no creating binding leaves createTag empty, so
// no create affordance shows.
async function resolveCreateView() {
  if (!threadSource.value) { resolvedCreateView.value = null; return }
  if (injectedCreateUi.value) { resolvedCreateView.value = null; return }
  const cls = threadClass.value
  if (!cls) { resolvedCreateView.value = null; return }
  try {
    const { data } = await api.get(`/api/v1/component-kinds/create-view?class=${encodeURIComponent(cls)}`)
    const cv = data?.create_view
    resolvedCreateView.value = cv && str(cv.tag_name).trim() ? cv as ViewComponentRef : null
  } catch {
    resolvedCreateView.value = null
  }
}

// The threads endpoint returns the canonical picker envelope: data.items, each a
// flat { id, label, icon }. The picker reads those fields directly.
async function load() {
  if (loading.value) return
  loading.value = true
  try {
    const cls = threadClass.value
    const url = threadSource.value
      ? (cls
        ? `${source.value}?thread_class=${encodeURIComponent(cls)}&limit=100`
        : `${source.value}?limit=100`)
      : source.value
    const rows: Row[] = []
    let pageUrl = url
    let offset = 0
    while (true) {
      const { data } = await api.get(pageUrl)
      if (data?.success === false) throw new Error(String(data.error || 'Could not load components'))
      const page: Row[] = Array.isArray(data?.items)
        ? data.items as Row[]
        : (Array.isArray(data?.threads) ? data.threads as Row[] : [])
      rows.push(...page)
      const next = data?.next_offset
      if (next == null) break
      if (typeof next !== 'number' || !Number.isSafeInteger(next) || next <= offset) {
        throw new Error('The server returns an invalid component offset.')
      }
      offset = next
      const [path, query = ''] = url.split('?')
      const params = new URLSearchParams(query)
      params.set('offset', String(offset))
      pageUrl = `${path}?${params}`
    }
    const seen = new Set<string>()
    const out: Item[] = []
    for (const r of rows) {
      const id = rowId(r)
      if (!id || seen.has(id)) continue
      seen.add(id)
      const lbl = rowLabel(r)
      out.push({ id, label: (lbl && lbl !== id) ? lbl : untitledLabel.value, icon: rowIcon(r), selection: selectionFor(r, id) })
    }
    items.value = out
    loaded.value = true
    emit('load', undefined)
  } catch (e) {
    emit('error', { message: 'failed to list options', error: e })
  } finally {
    loading.value = false
  }
  resolveCreateView()
}

const selectedItem = computed(() => items.value.find(i => i.id === selectedId.value) || null)
// The last label that resolved for the current selection. A post-select list reload
// (or the create-then-refresh) momentarily drops the chosen id from `items`; without
// this the trigger would fall back to the prompt and flash the placeholder between the
// select and the reloaded row. The cache belongs to one selectedId and is dropped when
// the selection moves to an id with no known label.
const lastLabel = ref<{ id: string; label: string } | null>(null)
function rememberLabel(id: string, label: string) {
  if (id && label) lastLabel.value = { id, label }
}
// The closed trigger shows, in order: the resolved row label from the loaded list, then
// the cached label for this selection (holding the name through a reload), then the
// prompt while a preselected id is still loading with no cached name, and finally a
// generic name rather than leaking the raw id. The placeholder itself only shows when
// there is genuinely no selection (handled in the template via `selectedId`).
const selectedLabel = computed(() => {
  const it = selectedItem.value
  if (it) return it.label
  if (lastLabel.value && lastLabel.value.id === selectedId.value) return lastLabel.value.label
  if (loading.value || !loaded.value) return placeholder.value
  return untitledLabel.value
})
// Keep the cache in step with the resolution: seed it when the row resolves for the
// current selection, and drop a stale entry when the selection moves elsewhere.
watch([selectedItem, selectedId], ([it, id]) => {
  if (it) rememberLabel(id as string, (it as Item).label)
  else if (lastLabel.value && lastLabel.value.id !== id) lastLabel.value = null
}, { immediate: true })

async function hydrateSelectedLabel() {
  const id = selectedId.value
  if (!id || selectedItem.value || loading.value) return
  await load()
}

function pick(item: Item) {
  selectedId.value = item.id
  // Seed the cache from the chosen row up front so the name holds through the reload
  // this selection triggers, before the fresh list catches up.
  rememberLabel(item.id, item.label)
  emit('change', item.selection)
  emit('config-changed', item.selection)
  open.value = false
}

function armDelete(item: Item) {
  deleteError.value = ''
  confirmDeleteId.value = item.id
}
function cancelDelete() {
  confirmDeleteId.value = ''
  deleteError.value = ''
}
// Read a human message out of a delete failure: the backend's gate response
// (e.g. 409 { error, subscriber_count }) carried either as a rejected request or a
// success:false body.
function deleteErrText(data: unknown, err: unknown): string {
  const body = (data && typeof data === 'object')
    ? data as Record<string, unknown>
    : (err && typeof err === 'object' && (err as { response?: { data?: unknown } }).response?.data && typeof (err as { response?: { data?: unknown } }).response!.data === 'object'
      ? (err as { response: { data: Record<string, unknown> } }).response.data
      : null)
  if (body) {
    const msg = str(body.error).trim()
    if (msg) return msg
    const n = Number(body.subscriber_count)
    if (n > 0) return `In use by ${n} — remove those first.`
  }
  if (err instanceof Error && err.message) return err.message
  return 'Could not delete.'
}
// Delete a listed component through the host-declared endpoint. On success the row is
// dropped and the list refreshed; on a gate failure (409) the error is surfaced inline
// and nothing is removed.
async function doDelete(item: Item) {
  const base = deleteEndpoint.value
  if (!base || deletingId.value) return
  deletingId.value = item.id
  deleteError.value = ''
  try {
    const url = `${base.replace(/\/+$/, '')}/${encodeURIComponent(item.id)}`
    const { data } = await api.delete(url)
    if (data && typeof data === 'object' && (data as { success?: unknown }).success === false) {
      deleteError.value = deleteErrText(data, null)
      return
    }
    confirmDeleteId.value = ''
    if (item.id === selectedId.value) selectedId.value = ''
    loaded.value = false
    await load()
  } catch (e) {
    deleteError.value = deleteErrText(null, e)
  } finally {
    deletingId.value = ''
  }
}

function createdId(detail: unknown): string {
  if (typeof detail === 'string') return detail
  if (!detail || typeof detail !== 'object') return ''
  const d = detail as Record<string, unknown>
  return str(d.thread_id || d.webhook_id || d.component_id || d.id).trim()
}
function createdLabel(detail: unknown): string {
  if (!detail || typeof detail !== 'object') return ''
  const d = detail as Record<string, unknown>
  return str(d.label || d.title || d.name).trim()
}

function startCreate() {
  if (!createTag.value) return
  creating.value = true
}
function closeCreate() { creating.value = false }

// On `created`: refresh the list and auto-select the new instance (synthesizing a
// row when the fresh list has not caught up yet), then report it.
async function onCreated(detail: unknown) {
  const id = createdId(detail)
  creating.value = false
  loaded.value = false
  await load()
  if (id) {
    const listed = items.value.find(i => i.id === id)
    if (!listed && selectionField.value) {
      const message = 'The created item has no published selection value in the catalog.'
      emit('error', { message, error: new Error(message) })
      return
    }
    const item = listed || { id, label: createdLabel(detail) || untitledLabel.value, icon: 'tabler:components', selection: { thread_id: id } }
    if (!items.value.find(i => i.id === id)) items.value = [item, ...items.value]
    pick(item)
    emit('created', { thread_id: id })
  }
}

// Read the selection out of either `value` or its `config` alias (the poller
// config form sets `config`), tolerating an object string or a bare id.
watch(() => [props.value?.value, props.value?.config, props.value?.schema], () => {
  selectedId.value = configuredId(props.value?.config) || configuredId(props.value?.value)
  hydrateSelectedLabel()
}, { immediate: true })

watch(() => [props.value?.threadClass, props.value?.meta, props.value?.source, props.value?.schema], () => {
  loaded.value = false
  items.value = []
  resolvedCreateView.value = null
  confirmDeleteId.value = ''
  deleteError.value = ''
  closeCreate()
  if (open.value) load()
})

// Placement, outside-click and Escape are owned by AnchoredPanel; this just toggles
// open and lazy-loads the list on the first open.
function toggleOpen() {
  open.value = !open.value
  if (open.value && !loaded.value) load()
}
</script>

<template>
  <div ref="ctrl" class="cp" :class="open && 'cp-open'" role="button" tabindex="0" :aria-expanded="open" @click="toggleOpen" @keydown.enter="toggleOpen" @keydown.space.prevent="toggleOpen">
    <Icon :icon="selectedItem?.icon || 'tabler:message-circle'" class="cp-lead" aria-hidden="true" />
    <span class="cp-value" :class="!selectedId && 'cp-ph'">{{ selectedId ? selectedLabel : placeholder }}</span>
    <Icon :icon="open ? 'tabler:chevron-up' : 'tabler:chevron-down'" class="cp-caret" aria-hidden="true" />
  </div>

  <AnchoredPanel v-model:open="open" :anchor="ctrl" :min-width="260" :max-height="320">
    <div class="cp-pop">
    <div v-if="loading" class="cp-state"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading…</div>
    <div v-else-if="creating" class="cp-create"><WcMount :tag="createTag" @created="onCreated" @close="closeCreate" /></div>
    <div v-else-if="!items.length" class="cp-state cp-state--stack">
      <span>{{ emptyText }}</span>
      <button v-if="createTag" type="button" class="cp-create-btn" data-test="cp-create" @click.stop="startCreate">
        <Icon icon="tabler:plus" aria-hidden="true" />
        <span>{{ createLabel }}</span>
      </button>
    </div>
    <template v-else>
      <div class="cp-list">
        <div
          v-for="item in items"
          :key="item.id"
          class="cp-row cp-row--compound"
          :class="item.id === selectedId && 'cp-row-on'"
        >
          <button type="button" class="cp-row-main" @click="pick(item)">
            <Icon :icon="item.icon" class="cp-ico" aria-hidden="true" />
            <span class="cp-label">{{ item.label }}</span>
            <Icon v-if="item.id === selectedId" icon="tabler:check" class="cp-check" aria-hidden="true" />
          </button>
          <template v-if="deleteEndpoint">
            <template v-if="confirmDeleteId === item.id">
              <button type="button" class="cp-row-del cp-row-del-yes" :disabled="deletingId === item.id" title="Confirm delete" aria-label="Confirm delete" data-test="cp-del-confirm" @click.stop="doDelete(item)">
                <Icon :icon="deletingId === item.id ? 'tabler:loader-2' : 'tabler:check'" :class="deletingId === item.id && 'spin'" aria-hidden="true" />
              </button>
              <button type="button" class="cp-row-del" title="Cancel" aria-label="Cancel delete" @click.stop="cancelDelete">
                <Icon icon="tabler:x" aria-hidden="true" />
              </button>
            </template>
            <button v-else type="button" class="cp-row-del" title="Delete" aria-label="Delete" data-test="cp-del" @click.stop="armDelete(item)">
              <Icon icon="tabler:trash" aria-hidden="true" />
            </button>
          </template>
        </div>
        <div v-if="deleteError" class="cp-del-err" data-test="cp-del-err">{{ deleteError }}</div>
      </div>
      <button v-if="createTag" type="button" class="cp-create-foot" data-test="cp-create-foot" @click.stop="startCreate">
        <Icon icon="tabler:plus" aria-hidden="true" />
        <span>{{ createLabel }}</span>
      </button>
    </template>
    </div>
  </AnchoredPanel>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import { useComponentProps, useComponentEvents } from '../constants.ts'
import { parseSelectedIds } from '../../app/pickerValue'
import { errMsg } from '../../app/errMsg'
import AnchoredPanel from '../../app/AnchoredPanel.vue'
import { ResourcePager, toggleValue, type FetchPage, type PickRow, type SearchMode } from '../resourcePager.ts'
import { discoverySource, listSource, rowsOf, toPickRow, type RowKeys } from '../pageSource.ts'

// Shared async multi-select. Renders the SELECTED items as compact removable
// chips and an inline search input; the result panel (fixed-positioned, in the
// shadow root) pages through the source one page at a time — "Load more"
// follows the source's next_cursor — and opens drillable containers with a
// breadcrumb back out. Rows come from a list endpoint (`source`) or from a
// connection's discovery (`connection-id`). The search text goes to the source
// when it searches server-side; with search="local" (or a source answering
// `search: false`) it filters the loaded rows and says so. Rows the source marks
// non-selectable stay visible, disabled, with the reason. Selection is reported
// via the `change` event, always as an id array (single-select emits 0 or 1).
const props = useComponentProps()
const emit = useComponentEvents()

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 1000
const SEARCH_DELAY_MS = 180

// useProps() returns a ref whose .value is the props object with declared
// kebab-case attributes camelCased (connection-id -> connectionId).
const source = computed(() => props.value?.source || '')
const connectionId = computed(() => props.value?.connectionId || '')
const discoverPath = computed(() => props.value?.discoverPath || '/api/v1/connections/{id}/discover_resources')
const searchMode = computed<SearchMode>(() => props.value?.search === 'local' ? 'local' : 'server')
const pageSize = computed(() => {
  const n = Number(props.value?.pageSize)
  return Number.isInteger(n) && n >= 1 ? Math.min(n, MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE
})
const keys = computed<RowKeys>(() => ({
  idKey: props.value?.idKey || 'id',
  labelKey: props.value?.labelKey || 'name',
  descKey: props.value?.descKey || 'description',
  iconKey: props.value?.iconKey || 'icon',
  metaKey: props.value?.metaKey || '',
  drillKey: props.value?.drillKey || 'id',
}))
const responseKey = computed(() => props.value?.responseKey || (connectionId.value ? 'resources' : ''))
const unselectableHint = computed(() => props.value?.unselectableHint || 'This item cannot be selected.')
const multi = computed(() => props.value?.multi !== false)
const placeholder = computed(() => props.value?.placeholder || 'Search…')
const hasSource = computed(() => !!(connectionId.value || source.value))

function fetcher(): FetchPage {
  if (connectionId.value) {
    return discoverySource({ connectionId: connectionId.value, discoverPath: discoverPath.value, pageSize: pageSize.value, keys: keys.value })
  }
  return listSource({ source: source.value, responseKey: responseKey.value, pageSize: pageSize.value, keys: keys.value })
}

const pager = reactive(new ResourcePager(fetcher(), searchMode.value)) as ResourcePager

const selected = ref<string[]>([])
// Display of the selected ids (chips), keyed by id so chips keep their label and
// icon after the listed rows move on to another page, level, or query.
const chipById = ref<Record<string, { label: string; icon: string }>>({})

const open = ref(false)
const query = ref('')
const activeIdx = ref(-1)

const ctrl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)

const visible = computed(() => pager.visible)
const errorText = computed(() => pager.error ? errMsg(pager.error, 'The list could not be loaded.') : '')
const emptyText = computed(() => {
  if (pager.query) return `No matches for “${pager.query}”.`
  const here = pager.trail[pager.trail.length - 1]
  return here ? `Nothing in ${here.label}.` : 'Nothing to choose from.'
})

function remember(row: PickRow) {
  if (!row.value) return
  chipById.value = { ...chipById.value, [row.value]: { label: row.label, icon: row.icon } }
}
function labelOf(id: string): string { return chipById.value[id]?.label || id }
function iconOf(id: string): string { return chipById.value[id]?.icon || '' }
function isOn(id: string) { return selected.value.includes(id) }
function rowKey(r: PickRow): string { return r.drillId || r.value }
function actionable(r: PickRow | undefined): boolean { return !!r && (r.selectable || r.drillable) }

// A list source resolves preselected chips with GET {source}?ids=<csv>. A
// connection's discovery has no id lookup; its chips take their labels from the
// rows as pages load.
async function resolveChips(ids: string[]) {
  const missing = ids.filter(id => !chipById.value[id])
  if (connectionId.value || !source.value || !missing.length) return
  try {
    const { data } = await api.get(`${source.value}?ids=${encodeURIComponent(missing.join(','))}`)
    for (const raw of rowsOf(data, responseKey.value)) remember(toPickRow(raw, keys.value, { selectable: true, drillable: false }))
  } catch (e) {
    emit('error', { message: errMsg(e, 'The selected items could not be resolved.'), error: e })
  }
}

// Initial + live selection from the attribute, without emitting a change
// (attribute-driven, not user-driven).
watch(() => props.value?.selected, v => {
  selected.value = parseSelectedIds(v)
  resolveChips(selected.value)
}, { immediate: true })

watch(() => pager.rows, rows => {
  for (const r of rows) if (r.value && isOn(r.value) && !chipById.value[r.value]) remember(r)
})

watch(() => pager.error, e => {
  if (e) emit('error', { message: errorText.value, error: e })
})

// Another source (or search mode, page size, key mapping) is another list. The
// signature is a string so a props object re-created with equal values (a
// `selected` update) leaves the loaded list alone.
const sourceSignature = computed(() => JSON.stringify([source.value, connectionId.value, discoverPath.value, searchMode.value, pageSize.value, keys.value, responseKey.value]))
watch(sourceSignature, () => {
  pager.configure(fetcher(), searchMode.value)
  query.value = ''
  activeIdx.value = -1
  if (open.value && hasSource.value) pager.search('')
})

let searchTimer: ReturnType<typeof setTimeout> | null = null
function onInput() {
  ensureOpen()
  activeIdx.value = -1
  if (searchTimer) clearTimeout(searchTimer)
  if (pager.serverSearch) searchTimer = setTimeout(() => { void pager.search(query.value) }, SEARCH_DELAY_MS)
  else void pager.search(query.value)
}

function pick(r: PickRow) {
  if (!r.selectable) return
  remember(r)
  if (multi.value) {
    selected.value = toggleValue(selected.value, r.value)
    nextTick(() => inputEl.value?.focus())
  } else {
    selected.value = [r.value]
    query.value = ''
    open.value = false
  }
  emitChange()
}

function drill(r: PickRow) {
  activeIdx.value = -1
  void pager.drill(r)
}

function up(depth: number) {
  activeIdx.value = -1
  void pager.up(depth)
}

function remove(id: string) {
  selected.value = selected.value.filter(x => x !== id)
  emitChange()
  inputEl.value?.focus()
}

function emitChange() { emit('change', { selected: [...selected.value], labels: selected.value.map(labelOf) }) }

// Placement (incl. re-anchoring when chips wrap) is owned by AnchoredPanel via its
// ResizeObserver on the anchor. The first page loads on first open; the guard
// keeps the control's @click and the input's @focus from double-fetching.
function ensureOpen() {
  if (!open.value) open.value = true
  if (hasSource.value && !pager.loaded && !pager.loading && !pager.error) void pager.search(query.value)
}
function focusInput() { ensureOpen(); inputEl.value?.focus() }

function step(dir: 1 | -1) {
  const list = visible.value
  let i = activeIdx.value
  for (let n = 0; n < list.length; n++) {
    i = dir === 1 ? Math.min(i + 1, list.length - 1) : Math.max(i - 1, 0)
    if (actionable(list[i])) { activeIdx.value = i; return }
  }
}

function activate(r: PickRow) {
  if (r.selectable) pick(r)
  else if (r.drillable) drill(r)
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') { open.value = false; return }
  if (e.key === 'Backspace' && !query.value && selected.value.length) {
    remove(selected.value[selected.value.length - 1]); return
  }
  if (!open.value && (e.key === 'ArrowDown' || e.key === 'Enter')) { focusInput(); return }
  if (e.key === 'ArrowDown') { e.preventDefault(); step(1) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); step(-1) }
  else if (e.key === 'Enter') {
    e.preventDefault()
    const r = visible.value[activeIdx.value] ?? visible.value.find(actionable)
    if (actionable(r)) activate(r as PickRow)
  }
}

onMounted(() => emit('load', undefined))
onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<template>
  <div ref="ctrl" class="ms" @click="focusInput">
    <span v-for="id in selected" :key="id" class="ms-chip">
      <Icon v-if="iconOf(id)" :icon="iconOf(id)" class="ms-chip-ico" aria-hidden="true" />
      <span class="ms-chip-label">{{ labelOf(id) }}</span>
      <button type="button" class="ms-chip-x" :title="`Remove ${labelOf(id)}`" :aria-label="`Remove ${labelOf(id)}`" @click.stop="remove(id)">
        <Icon icon="tabler:x" aria-hidden="true" />
      </button>
    </span>
    <input
      ref="inputEl"
      v-model="query"
      class="ms-input"
      type="text"
      :placeholder="selected.length && multi ? '' : placeholder"
      :aria-label="placeholder"
      :aria-expanded="open"
      spellcheck="false"
      autocomplete="off"
      @focus="focusInput"
      @input="onInput"
      @keydown="onKey"
    />
  </div>

  <AnchoredPanel v-model:open="open" :anchor="ctrl" :min-width="260" :max-height="340">
    <div class="ms-pop" :aria-busy="pager.loading">
      <nav v-if="pager.trail.length" class="ms-crumbs" aria-label="Location">
        <button type="button" class="ms-crumb" @click="up(0)">All</button>
        <template v-for="(level, depth) in pager.trail" :key="level.id">
          <Icon icon="tabler:chevron-right" class="ms-crumb-sep" aria-hidden="true" />
          <button v-if="depth < pager.trail.length - 1" type="button" class="ms-crumb" @click="up(depth + 1)">{{ level.label }}</button>
          <span v-else class="ms-crumb ms-crumb-here" aria-current="location">{{ level.label }}</span>
        </template>
      </nav>

      <p v-if="pager.filtersLocally" class="ms-hint" role="status">
        This source cannot search, so only the {{ pager.rows.length }} loaded items are filtered.<template v-if="pager.hasMore"> Load more to search further.</template>
      </p>

      <div v-if="pager.error" class="ms-alert" role="alert">
        <Icon icon="tabler:alert-circle" class="ms-alert-ico" aria-hidden="true" />
        <span class="ms-alert-text">{{ errorText }}</span>
        <button type="button" class="ms-link" @click="pager.retry()">Try again</button>
      </div>

      <div v-if="!hasSource" class="ms-state">This picker has no source to list from.</div>
      <div v-else-if="pager.loading && !pager.rows.length" class="ms-state" role="status">
        <Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> {{ pager.query && pager.serverSearch ? 'Searching…' : 'Loading…' }}
      </div>
      <div v-else-if="pager.loaded && !visible.length && !pager.error" class="ms-state">{{ emptyText }}</div>

      <div v-if="visible.length" class="ms-list" role="group" aria-label="Results">
        <div v-for="(r, i) in visible" :key="rowKey(r)" class="ms-item">
          <button
            v-if="r.selectable"
            type="button"
            class="ms-row"
            :class="[isOn(r.value) && 'ms-row-on', i === activeIdx && 'ms-row-active']"
            :aria-pressed="isOn(r.value)"
            @click="pick(r)"
            @mousemove="activeIdx = i"
          >
            <Icon :icon="r.icon || 'tabler:point'" class="ms-row-ico" aria-hidden="true" />
            <span class="ms-row-main">
              <span class="ms-row-title">
                {{ r.label }}
                <span v-if="r.meta" class="ms-row-tag">{{ r.meta }}</span>
              </span>
              <span v-if="r.description" class="ms-row-sub">{{ r.description }}</span>
            </span>
            <Icon v-if="isOn(r.value)" icon="tabler:check" class="ms-row-check" aria-hidden="true" />
          </button>
          <button
            v-else-if="r.drillable"
            type="button"
            class="ms-row"
            :class="i === activeIdx && 'ms-row-active'"
            :aria-label="`Open ${r.label}`"
            @click="drill(r)"
            @mousemove="activeIdx = i"
          >
            <Icon :icon="r.icon || 'tabler:folder'" class="ms-row-ico" aria-hidden="true" />
            <span class="ms-row-main">
              <span class="ms-row-title">
                {{ r.label }}
                <span v-if="r.meta" class="ms-row-tag">{{ r.meta }}</span>
              </span>
              <span v-if="r.description" class="ms-row-sub">{{ r.description }}</span>
            </span>
            <Icon icon="tabler:chevron-right" class="ms-row-go" aria-hidden="true" />
          </button>
          <button v-else type="button" class="ms-row ms-row-off" disabled>
            <Icon :icon="r.icon || 'tabler:point'" class="ms-row-ico" aria-hidden="true" />
            <span class="ms-row-main">
              <span class="ms-row-title">{{ r.label }}</span>
              <span class="ms-row-sub">{{ unselectableHint }}</span>
            </span>
          </button>
          <button
            v-if="r.selectable && r.drillable"
            type="button"
            class="ms-row-drill"
            :title="`Open ${r.label}`"
            :aria-label="`Open ${r.label}`"
            @click="drill(r)"
          >
            <Icon icon="tabler:chevron-right" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div v-if="pager.hasMore" class="ms-foot">
        <span class="ms-count">{{ visible.length }} shown<template v-if="multi"> · {{ selected.length }} selected</template></span>
        <button type="button" class="ms-more" :disabled="pager.loading" @click="pager.loadMore()">
          <Icon v-if="pager.loading" icon="tabler:loader-2" class="spin" aria-hidden="true" />
          {{ pager.loading ? 'Loading…' : 'Load more' }}
        </button>
      </div>
    </div>
  </AnchoredPanel>
</template>

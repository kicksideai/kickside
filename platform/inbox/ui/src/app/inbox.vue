<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import Tabs from 'primevue/tabs'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import { api } from '@wippy-fe/proxy'
import { useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'
import InboxItem from './InboxItem.vue'
import { isItem, isRecord, type Item } from './item'
import { subscribeComponentMeta } from '@widgets/app/componentRealtime'
import { relativeTime as relativeTimeBase } from '@widgets/app/datetime'
import { errMsg } from '@widgets/app/errMsg'
import { statusLabel, INBOX_META_FIELD_TYPES } from './labels'

// Inbox host (the container). A Gmail-style master/detail: a filter strip across
// folders (Pending / Resolved / All), a compact native list, and a detail pane
// that renders the selected item through its declared item-type component. Stays live
// from the owner inbox component's canonical public meta topic.

interface Kind {
  value: string
  name: string
  icon?: string
  component_tag?: string
  actions?: string[]
  action_owner?: 'component'
}
interface Stats {
  item_count?: number
  pending_count?: number
  resolved_count?: number
  urgent_count?: number
  high_count?: number
}

const FILTERS = [
  { key: 'pending', label: 'Pending', icon: 'tabler:clock' },
  { key: 'resolved', label: 'Resolved', icon: 'tabler:checks' },
  { key: 'all', label: 'All', icon: 'tabler:inbox' },
]

const items = ref<Item[]>([])
const stats = ref<Stats>({})
const totalCount = ref(0)
const kinds = ref<Record<string, Kind>>({})
const loading = ref(true)
const error = ref('')
const filter = ref('pending')
const selectedId = ref('')
const resolvingId = ref('')
const resolvingAction = ref('')
let componentUnsub: (() => void) | null = null
let connectedComponentId = ''
let requestId = 0
let disposed = false
// A terminal write receipt remains authoritative until the projection returns it.
const resolutions = new Map<string, Item>()
let resolvedCountFloor = 0

const selected = computed(() => items.value.find(i => i.id === selectedId.value) || null)
const kindOf = (t: string): Kind | undefined => kinds.value[t]
const hasOwn = (obj: Record<string, unknown>, key: string): boolean => Object.prototype.hasOwnProperty.call(obj, key)
const headerCount = computed(() => {
  if (filter.value === 'pending') return Number(stats.value.pending_count ?? totalCount.value ?? items.value.length)
  if (filter.value === 'resolved') return Number(stats.value.resolved_count ?? totalCount.value ?? items.value.length)
  if (filter.value === 'all') return Number(stats.value.item_count ?? totalCount.value ?? items.value.length)
  return Number(totalCount.value || items.value.length)
})
// The dot and the icon tile are not Tags, so they take a class named for the
// priority rather than for a colour; the colour itself still comes from the
// theme's severity ramp, in styles.css.
function priorityClass(p?: string): string {
  return `kx-priority-${p === 'urgent' || p === 'high' || p === 'low' ? p : 'normal'}`
}

function applyMeta(meta: Record<string, unknown>) {
  const patch: Record<string, number> = {}
  for (const key of Object.keys(INBOX_META_FIELD_TYPES)) {
    const value = meta[key]
    if (hasOwn(meta, key) && typeof value === 'number') patch[key] = value
  }
  if (Object.keys(patch).length) stats.value = { ...stats.value, ...patch }
}

function relativeTime(unix?: number): string {
  return relativeTimeBase(unix, { suffix: false })
}
// The absolute timestamp stays one hover away from the compact relative label.
function absoluteTime(unix?: number): string {
  return unix ? new Date(unix * 1000).toLocaleString() : ''
}

async function loadKinds() {
  try {
    const { data } = await api.get('/api/v1/inbox/item-types')
    const map: Record<string, Kind> = {}
    if (isRecord(data) && Array.isArray(data.item_types)) {
      for (const value of data.item_types) {
        if (isRecord(value) && typeof value.value === 'string' && typeof value.name === 'string'
          && (value.icon === undefined || typeof value.icon === 'string')
          && (value.component_tag === undefined || typeof value.component_tag === 'string')
          && (value.actions === undefined || (Array.isArray(value.actions) && value.actions.every((action: unknown) => typeof action === 'string')))
          && (value.action_owner === undefined || value.action_owner === 'component')) {
          map[value.value] = { value: value.value, name: value.name, icon: value.icon, component_tag: value.component_tag, actions: value.actions, action_owner: value.action_owner }
        }
      }
    }
    kinds.value = map
  } catch (cause) { error.value = errMsg(cause, 'Could not load inbox item types.') }
}

function matchesFilter(item: Item): boolean {
  return filter.value === 'all' || (filter.value === 'resolved' ? item.status !== 'pending' : item.status === filter.value)
}

function reconcile(projected: Item[], counts: Stats, total: number, acknowledge = true): void {
  if (acknowledge) {
    for (const item of projected) {
      if (item.status !== 'pending') resolutions.delete(item.id)
    }
  }
  if (!resolutions.size) resolvedCountFloor = 0
  const merged = new Map(projected.map(item => [item.id, item]))
  for (const item of resolutions.values()) {
    const wasListed = merged.has(item.id)
    if (matchesFilter(item)) {
      merged.set(item.id, item)
      if (!wasListed) total += 1
    } else if (merged.delete(item.id)) total -= 1
  }
  const priorityRank: Record<string, number> = { urgent: 4, high: 3, normal: 2, low: 1 }
  items.value = [...merged.values()].sort((a, b) =>
    (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0) || (b.created_at || 0) - (a.created_at || 0))
  const resolved = Math.min(counts.item_count || 0, Math.max(counts.resolved_count || 0, resolvedCountFloor))
  stats.value = { ...counts, resolved_count: resolved, pending_count: (counts.item_count || 0) - resolved }
  totalCount.value = total
  if (!items.value.some(item => item.id === selectedId.value)) selectedId.value = items.value[0]?.id || ''
}

async function load() {
  if (disposed) return
  const current = ++requestId
  error.value = ''
  try {
    const { data } = await api.get('/api/v1/inbox?status=' + encodeURIComponent(filter.value))
    if (current !== requestId || disposed) return
    if (!isRecord(data) || !Array.isArray(data.items) || !data.items.every(isItem)) {
      throw new Error('Invalid inbox list response.')
    }
    // The first response discovers the owner's topic; its snapshot predates
    // our subscription. Subscribe, then read the snapshot we actually render
    // so a delivery during discovery cannot fall into a load/subscribe gap.
    if (typeof data.component_id === 'string' && connectRealtime(data.component_id)) {
      await load()
      return
    }
    reconcile(data.items, {
      item_count: Number(data.item_count ?? 0),
      pending_count: Number(data.pending_count ?? 0),
      resolved_count: Number(data.resolved_count ?? 0),
      urgent_count: Number(data.urgent_count ?? 0),
      high_count: Number(data.high_count ?? 0),
    }, Number(data.total_count ?? data.items.length))
  } catch (e) {
    if (current === requestId && !disposed) error.value = errMsg(e, 'Could not load the inbox.')
  } finally {
    if (current === requestId && !disposed) loading.value = false
  }
}

watch(filter, () => { selectedId.value = ''; load() })

async function resolve(payload: { id: string; action: string; form?: Record<string, unknown> }) {
  error.value = ''
  resolvingId.value = payload.id
  resolvingAction.value = payload.action
  const initialResolvedCount = stats.value.resolved_count || 0
  try {
    const body = payload.form ? { form: payload.form } : undefined
    const { data } = await api.post(`/api/v1/inbox/${encodeURIComponent(payload.id)}/${encodeURIComponent(payload.action)}`, body)
    if (disposed) return
    if (!isRecord(data) || data.success !== true || !isItem(data.item)
      || data.item.id !== payload.id || data.item.status === 'pending' || data.item.action !== payload.action) {
      throw new Error('Invalid inbox resolution response.')
    }
    ++requestId
    resolutions.set(payload.id, data.item)
    resolvedCountFloor = Math.max(resolvedCountFloor + 1, initialResolvedCount + 1)
    reconcile(items.value, stats.value, totalCount.value, false)
    await load()
  } catch (e) {
    error.value = errMsg(e, 'Could not resolve this item.')
  } finally {
    resolvingId.value = ''
    resolvingAction.value = ''
  }
}

async function del(id: string) {
  error.value = ''
  try {
    await api.delete(`/api/v1/inbox/${encodeURIComponent(id)}`)
    resolutions.delete(id)
    if (!resolutions.size) resolvedCountFloor = 0
    if (selectedId.value === id) selectedId.value = ''
    await load()
  } catch (e) {
    error.value = errMsg(e, 'Could not delete this item.')
  }
}

async function createTestNotice() {
  try {
    await api.post('/api/v1/inbox', {
      item_type: 'notice',
      title: 'Test notice ' + new Date().toLocaleTimeString(),
      content: 'Created to exercise the realtime round-trip.',
      priority: 'high',
    })
  } catch (e) {
    error.value = errMsg(e, 'Could not create the test notice.')
  }
}

function connectRealtime(id: string): boolean {
  if (!id || connectedComponentId === id) return false
  if (componentUnsub) componentUnsub()
  componentUnsub = null
  connectedComponentId = ''
  componentUnsub = subscribeComponentMeta(id, (event) => {
    applyMeta(event.meta)
    void load()
  }, INBOX_META_FIELD_TYPES)
  if (!componentUnsub) throw new Error('Could not subscribe to the inbox.')
  connectedComponentId = id
  return true
}

useHostVisibilityRefresh(async () => {
  await Promise.all([loadKinds(), load()])
})

onUnmounted(() => {
  disposed = true
  ++requestId
  resolutions.clear()
  if (componentUnsub) componentUnsub()
  componentUnsub = null
  connectedComponentId = ''
})
</script>

<template>
  <div class="kx-inbox">
    <header class="kx-head-bar">
      <div class="kx-head-row">
        <div class="kx-head-icon"><Icon icon="tabler:inbox" aria-hidden="true" /></div>
        <div class="kx-head-text">
          <h1 class="kx-title">Inbox</h1>
          <p class="kx-sub">{{ headerCount }} {{ filter }} · live</p>
        </div>
        <div class="kx-head-actions">
          <Button type="button" label="New notice" severity="secondary" outlined @click="createTestNotice" />
        </div>
      </div>
      <Tabs :value="filter" data-kx-separator="surface" @update:value="filter = String($event)">
        <TabList aria-label="Inbox folders" :pt="{ tabList: { class: 'kx-tabs-list' } }">
          <Tab class="kx-tab" v-for="f in FILTERS" :key="f.key" :value="f.key" :data-testid="`inbox-tab-${f.key}`">
            <Icon :icon="f.icon" aria-hidden="true" />
            {{ f.label }}
          </Tab>
        </TabList>
      </Tabs>
    </header>

    <Message v-if="error" severity="error" class="kx-alert">{{ error }}</Message>

    <main class="kx-shell">
      <aside class="kx-list-pane">
        <div v-if="loading" class="kx-loading">Loading...</div>
        <div v-else-if="!items.length" class="kx-list-empty">
          {{ filter === 'pending' ? 'Inbox zero — nothing to review.' : 'Nothing here.' }}
        </div>
        <button
          v-for="item in items"
          :key="item.id"
          class="kx-item"
          :class="{ active: selectedId === item.id }"
          @click="selectedId = item.id"
        >
          <span class="kx-priority-dot" :class="priorityClass(item.priority)" />
          <div class="kx-item-main">
            <div class="kx-item-line">
              <span class="kx-item-title" :class="{ pending: item.status === 'pending' }">
                {{ item.title }}
              </span>
              <span class="kx-time" :title="absoluteTime(item.created_at)">{{ relativeTime(item.created_at) }}</span>
            </div>
            <p v-if="item.content" class="kx-preview">{{ item.content }}</p>
            <Tag
              v-if="item.status !== 'pending'"
              severity="secondary"
              :value="statusLabel(item.status)"
              class="kx-status kx-tag-sm"
            />
          </div>
        </button>
      </aside>

      <section class="kx-detail-pane">
        <div v-if="!selected" class="kx-detail-empty">
          Select an item to view it.
        </div>
        <div v-else class="kx-detail-card">
          <InboxItem
            :key="selected.id"
            :item="selected"
            :tag="kindOf(selected.item_type)?.component_tag"
            :icon="kindOf(selected.item_type)?.icon"
            :type-label="kindOf(selected.item_type)?.name"
            :actions="kindOf(selected.item_type)?.actions"
            :action-owner="kindOf(selected.item_type)?.action_owner"
            :resolving="resolvingId === selected.id"
            :resolving-action="resolvingAction"
            @resolve="resolve"
            @delete="del"
          />
        </div>
      </section>
    </main>
  </div>
</template>

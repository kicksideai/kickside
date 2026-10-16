<script setup lang="ts">
import { ref, onBeforeUnmount, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import { api, loadByTagName } from '@wippy-fe/proxy'
import { useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'
import { apiError } from '../constants'
import ConnectionPicker from './ConnectionPicker.vue'
import { subscribeComponentMeta, type ComponentMetaEvent } from '@widgets/app/componentRealtime'
import { CONNECTION_META_FIELD_TYPES } from '../status'
import type { Connection } from './connections.types.ts'
import type { Provider } from './connection-picker.types.ts'
import { useConnectionPresentation } from './useConnectionPresentation.ts'

// Connections surface. Lists OAuth connections (/connections) and the providers
// kickside/oauth discovers (/oauth/providers/discover). Adding one opens the
// ConnectionPicker dialog (catalog → configure → provider popup); the page just
// lists state and launches the picker.
const connections = ref<Connection[]>([])
const providers = ref<Provider[]>([])
const loading = ref(true)
const loadingMore = ref(false)
// error: transient failures from row actions (remove / load more) shown inline while
// the list stays visible. loadError: the initial load failed, so there is no list to
// show — it drives a directed error state with retry instead of a misleading empty page.
const error = ref('')
const loadError = ref('')
const confirmId = ref('')
const search = ref('')
const presentation = useConnectionPresentation({ providers, connections, search, confirmId })
const {
  providerKey, providerLabel, providerIcon, connIcon, statusClass, statusLabel,
  statusDetail, connectionDescription, filteredProviders, filteredConnections,
} = presentation
const connectionsTotal = ref(0)
const connectionsHasMore = ref(false)
const PAGE_SIZE = 100

// Picker dialog state.
const pickerOpen = ref(false)
const pickerProvider = ref<string | undefined>(undefined)
const pickerReauth = ref<{ componentId: string; name?: string } | undefined>(undefined)

// Connections are components, so sharing uses the same component access popup as
// Skills, Knowledge, and Agents.
const shareOpen = ref(false)
const shareTarget = ref<Connection | null>(null)
const shareHost = ref<HTMLElement | null>(null)

function connectionUrl(offset: number): string {
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String(offset),
  })
  return `/api/v1/connections?${params.toString()}`
}

async function fetchConnections(offset: number) {
  const { data } = await api.get(connectionUrl(offset))
  return data ?? { connections: [], total_count: 0, has_more: false }
}

async function load() {
  loading.value = true
  error.value = ''
  loadError.value = ''
  try {
    // No per-request fallbacks: a failed connections/catalog fetch must surface as an
    // error state, not collapse into an empty list that reads as "nothing connected".
    const [conns, oauthProvs, credentialProvs] = await Promise.all([
      fetchConnections(0),
      api.get('/api/v1/oauth/providers/discover'),
      api.get('/api/v1/connections/providers/discover'),
    ])
    connections.value = (conns.connections ?? []) as Connection[]
    connectionsTotal.value = Number(conns.total_count ?? connections.value.length)
    connectionsHasMore.value = Boolean(conns.has_more)
    syncComponentSubscriptions()
    providers.value = mergeProviders([
      ...((oauthProvs.data?.providers ?? []) as Provider[]),
      ...((credentialProvs.data?.providers ?? []) as Provider[]),
    ])
  } catch (e) {
    loadError.value = apiError(e)
    connections.value = []
    providers.value = []
    connectionsTotal.value = 0
    connectionsHasMore.value = false
    syncComponentSubscriptions()
  } finally {
    loading.value = false
  }
}

async function loadMoreConnections() {
  if (loadingMore.value || !connectionsHasMore.value) return
  loadingMore.value = true
  error.value = ''
  try {
    const data = await fetchConnections(connections.value.length)
    const next = (data.connections ?? []) as Connection[]
    connections.value = [...connections.value, ...next]
    connectionsTotal.value = Number(data.total_count ?? connectionsTotal.value)
    connectionsHasMore.value = Boolean(data.has_more)
    syncComponentSubscriptions()
  } catch (e) {
    error.value = apiError(e)
  } finally {
    loadingMore.value = false
  }
}

function mergeProviders(list: Provider[]): Provider[] {
  const byKey: Record<string, Provider> = {}
  for (const p of list) {
    const k = providerKey(p)
    if (!k) continue
    byKey[k] = byKey[k] ? { ...p, ...byKey[k] } : p
  }
  return Object.values(byKey)
}

function scopeList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((s): s is string => typeof s === 'string' && s.length > 0)
  if (typeof value !== 'string') return []
  return value.split(/\s+/).filter(Boolean)
}

// Values arrive already coerced by subscribeComponentMeta (CONNECTION_META_FIELD_TYPES);
// this maps the typed meta keys onto the connection row shape.
function applyMetaToConnection(row: Connection, meta: Record<string, unknown>, deleted: string[] = []): Connection {
  const patch: Partial<Connection> = {}
  if (typeof meta.title === 'string') patch.name = meta.title
  if (typeof meta.provider === 'string') patch.provider = meta.provider
  if (typeof meta.icon === 'string') patch.icon = meta.icon
  if (typeof meta.connection_state === 'string') patch.connection_state = meta.connection_state
  if (typeof meta.reauth_reason === 'string') patch.reauth_reason = meta.reauth_reason
  if (typeof meta.expires_at === 'number') patch.expires_at = meta.expires_at
  if (typeof meta.refresh_expires_at === 'number') patch.refresh_expires_at = meta.refresh_expires_at
  if (typeof meta.last_token_refresh === 'string') patch.last_token_refresh = meta.last_token_refresh
  if (typeof meta.scopes_granted === 'string') {
    const scopes = scopeList(meta.scopes_granted)
    patch.scopes_granted = scopes
    patch.scope_count = scopes.length
  }
  if (typeof meta.oauth_connection === 'boolean') patch.oauth = meta.oauth_connection

  const next = { ...row, ...patch }
  for (const key of deleted) {
    const mapped = key === 'title' ? 'name' : key
    delete (next as Record<string, unknown>)[mapped]
  }
  return next
}

const componentUnsubs = new Map<string, () => void>()
const componentPending = new Set<string>()
let componentSubGeneration = 0

function applyComponentMetaEvent(id: string, payload: ComponentMetaEvent) {
  connections.value = connections.value.map(c =>
    c.component_id === id ? applyMetaToConnection(c, payload.meta || {}, payload.deleted || []) : c)
}

function clearComponentSubscriptions() {
  componentSubGeneration++
  componentPending.clear()
  for (const off of componentUnsubs.values()) off()
  componentUnsubs.clear()
}

function syncComponentSubscriptions() {
  const ids = new Set(connections.value.map(c => c.component_id).filter(Boolean))
  for (const [id, off] of componentUnsubs) {
    if (!ids.has(id)) {
      off()
      componentUnsubs.delete(id)
    }
  }
  const generation = componentSubGeneration
  for (const id of ids) {
    if (componentUnsubs.has(id) || componentPending.has(id)) continue
    componentPending.add(id)
    const off = subscribeComponentMeta(id, (event) => applyComponentMetaEvent(id, event), CONNECTION_META_FIELD_TYPES)
    componentPending.delete(id)
    if (!off) continue
    if (generation !== componentSubGeneration || !connections.value.some(c => c.component_id === id)) {
      off()
      continue
    }
    componentUnsubs.set(id, off)
  }
}

function openPicker(provider?: string, reauth?: { componentId: string; name?: string }) {
  pickerProvider.value = provider
  pickerReauth.value = reauth
  pickerOpen.value = true
}

async function openShare(c: Connection) {
  shareTarget.value = c
  shareOpen.value = true
  await nextTick()
  await mountShare()
}

function closeShare() {
  shareOpen.value = false
  shareTarget.value = null
}

async function mountShare() {
  const c = shareTarget.value
  if (!shareHost.value || !c) return
  shareHost.value.innerHTML = ''
  if (!customElements.get('kickside-share')) {
    try { await loadByTagName('kickside-share', { timeoutMs: 8000 }) } catch { /* inert if undefined */ }
  }
  const el = document.createElement('kickside-share')
  el.setAttribute('config', JSON.stringify({
    resource_id: c.component_id,
    access_url: `/api/v1/component-access/grants/${encodeURIComponent(c.component_id)}`,
    share_url: `/api/v1/component-access/share/${encodeURIComponent(c.component_id)}`,
    title: c.name || c.provider || 'Connection',
  }))
  el.style.display = 'block'
  el.addEventListener('close', closeShare)
  shareHost.value.appendChild(el)
}

// Re-authorize an existing connection (e.g. to grant more scopes): reopen the
// picker for its provider, carrying the component_id so init updates it in place.
function reconnect(c: Connection) {
  if (!c.provider) return
  const provider = providers.value.find(p => providerKey(p) === c.provider)
  openPicker(c.provider, c.oauth || provider?.create_ui_id
    ? { componentId: c.component_id, name: c.name }
    : undefined)
}
function onConnected() {
  pickerOpen.value = false
  pickerReauth.value = undefined
  connections.value = []
  load()
}

async function remove(c: Connection) {
  if (confirmId.value !== c.component_id) { confirmId.value = c.component_id; return }
  confirmId.value = ''
  error.value = ''
  try {
    const { data } = await api.delete(`/api/v1/connections/${encodeURIComponent(c.component_id)}`)
    if (!data?.success) throw new Error(data?.error || 'delete failed')
    await load()
  } catch (e) {
    error.value = apiError(e)
  }
}

useHostVisibilityRefresh(load)
onBeforeUnmount(clearComponentSubscriptions)
</script>

<template>
  <div class="conn-page">
    <!-- Header -->
    <header class="kx-head">
      <div class="kx-head-icon"><Icon icon="tabler:plug-connected" aria-hidden="true" /></div>
      <div class="kx-head-text">
        <h1 class="kx-title">Connections</h1>
        <p class="kx-head-sub">Connect external services and manage them here.</p>
      </div>
      <div class="kx-head-actions">
        <label class="kx-search" role="search">
          <Icon icon="tabler:search" class="kx-search-ico" aria-hidden="true" />
          <input v-model="search" class="kx-search-input" type="search" placeholder="Search services" aria-label="Search services" />
          <button v-if="search" class="kx-search-clear" @click="search = ''" aria-label="Clear search"><Icon icon="tabler:x" aria-hidden="true" /></button>
        </label>
        <Button label="Connect app" @click="openPicker()">
          <template #icon><Icon icon="tabler:plus" aria-hidden="true" /></template>
        </Button>
      </div>
    </header>

    <div class="conn-body">
      <div v-if="loading" class="conn-loading">Loading…</div>

      <!-- Initial load failed: a directed error with retry, not an empty list. -->
      <section v-else-if="loadError" class="conn-empty au d1">
        <div class="lt-empty-hero is-danger"><Icon icon="tabler:plug-x" /></div>
        <div class="e-title">Couldn't load connections</div>
        <div class="e-sub">{{ loadError }}</div>
        <Button label="Try again" class="conn-retry" @click="load">
          <template #icon><Icon icon="tabler:refresh" aria-hidden="true" /></template>
        </Button>
      </section>

      <template v-else>
        <!-- Row-action failures (remove / load more) stay inline; the list remains. -->
        <div v-if="error" class="msg err au"><Icon icon="tabler:alert-circle" />{{ error }}</div>

        <!-- Your connections -->
        <section v-if="filteredConnections.length" class="block au d1">
          <div class="block-head"><h2 class="lt-section-header">Your connections</h2></div>
          <div class="live-grid">
            <div v-for="c in filteredConnections" :key="c.component_id" class="live-card s-live" :class="`state-${statusClass(c)}`">
              <div class="lc-top">
                <div class="lc-ico"><Icon :icon="connIcon(c)" aria-hidden="true" /></div>
                <div class="lc-top-r">
                  <button class="lc-add" :title="`Share ${c.name || c.provider}`" :aria-label="`Share ${c.name || c.provider}`" @click="openShare(c)">
                    <Icon icon="tabler:share" />
                  </button>
                  <button class="lc-add" :title="`Reconnect ${c.name || c.provider}`" :aria-label="`Reconnect ${c.name || c.provider}`" @click="reconnect(c)">
                    <Icon icon="tabler:refresh" />
                  </button>
                  <button
                    class="lc-add lc-danger"
                    :class="confirmId === c.component_id && 'armed'"
                    :title="confirmId === c.component_id ? 'Click again to remove' : `Remove ${c.name || c.provider}`"
                    :aria-label="`Remove ${c.name || c.provider}`"
                    @click="remove(c)"
                  >
                    <Icon :icon="confirmId === c.component_id ? 'tabler:check' : 'tabler:trash'" />
                  </button>
                </div>
              </div>
              <div class="lc-name">{{ c.name || c.provider || 'Connection' }}</div>
              <div class="lc-desc">{{ connectionDescription(c) }}</div>
              <div class="lc-status" :class="`state-${statusClass(c)}`">
                <span class="dot" />
                <span class="lc-primary">{{ statusLabel(c) }}</span>
                <span v-if="statusDetail(c)" class="lc-secondary">· {{ statusDetail(c) }}</span>
              </div>
            </div>
          </div>
          <div v-if="connectionsTotal || connectionsHasMore" class="list-foot">
            <span>{{ connections.length }} of {{ connectionsTotal || connections.length }} loaded</span>
            <button
              v-if="connectionsHasMore"
              class="ghost-action"
              :disabled="loadingMore"
              @click="loadMoreConnections"
            >
              <Icon :icon="loadingMore ? 'tabler:loader-2' : 'tabler:chevron-down'" :class="loadingMore && 'spin'" />
              Load more
            </button>
          </div>
        </section>

        <!-- Empty state. "Pick a service below" points at the provider grid, so
             this invitation only renders when there are providers to pick. -->
        <section v-else-if="!search && providers.length" class="conn-empty au d1">
          <div class="lt-empty-hero is-success"><Icon icon="tabler:plug-connected" /></div>
          <div class="e-title">Connect your first app</div>
          <div class="e-sub">Pick a service below — your agents and automations will read events and act through it.</div>
        </section>

        <!-- Add a connection -->
        <section v-if="filteredProviders.length" class="block au d2">
          <div class="block-head"><h2 class="lt-section-header">{{ filteredConnections.length ? 'Add another' : 'Available services' }}</h2></div>
          <div class="setup-grid">
            <button v-for="p in filteredProviders" :key="providerKey(p)" :data-provider-key="providerKey(p)" class="setup-card" @click="openPicker(providerKey(p))">
              <div class="setup-ico"><Icon :icon="providerIcon(p)" aria-hidden="true" /></div>
              <div class="setup-text">
                <div class="setup-name">{{ providerLabel(p) }}</div>
                <div class="setup-desc">{{ p.description || `Set up ${providerLabel(p)}` }}</div>
              </div>
              <Icon icon="tabler:arrow-right" class="setup-arrow" aria-hidden="true" />
            </button>
          </div>
        </section>

        <section v-else-if="search" class="conn-empty au d1">
          <div class="lt-empty-hero is-info"><Icon icon="tabler:search-off" /></div>
          <div class="e-title">No services match “{{ search }}”</div>
        </section>
        <section v-else-if="!providers.length && !connections.length" class="conn-empty au d2">
          <div class="lt-empty-hero is-info"><Icon icon="tabler:plug-x" /></div>
          <div class="e-title">No providers available</div>
          <div class="e-sub">Install a provider module to add a connection here.</div>
        </section>
      </template>
    </div>

    <ConnectionPicker
      v-if="pickerOpen"
      :providers="providers"
      :provider="pickerProvider"
      :reauth="pickerReauth"
      @close="pickerOpen = false"
      @connected="onConnected"
    />

    <!-- Share: the reusable kickside-share popup owns its own modal chrome
         (backdrop + panel); we just mount the tag and close on its `close`. -->
    <div v-if="shareOpen" ref="shareHost"></div>
  </div>
</template>

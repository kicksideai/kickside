<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import { apiError, useComponentEvents } from '../constants'
import ConnectionPicker from './ConnectionPicker.vue'
import { resolveConnectionState } from '../status'

// kickside-onboard-connections — the onboarding "connect your tools" step. A clean
// catalog of the providers the registry exposes (OAuth + API-key), each opening the
// shared ConnectionPicker (which owns the OAuth popup / credential form / per-plugin
// setup UI). It is fully skippable and drives the host wizard via done/back. Nothing
// here is provider-specific: the catalog is whatever the discover endpoints return.
const emit = useComponentEvents()

interface Scope { scope: string; name?: string; description?: string }
interface CredentialField {
  key: string
  label?: string
  type?: 'text' | 'password' | 'url' | 'email' | 'select' | 'checkbox'
  required?: boolean
}
interface CredentialSchema { fields?: CredentialField[]; submit_label?: string }
interface Provider {
  id?: string
  impl_id?: string
  provider?: string
  name?: string
  title?: string
  description?: string
  icon?: string
  oauth_provider?: string
  group?: string
  available_scopes?: Scope[]
  default_scopes?: string[]
  credential_schema?: CredentialSchema
  create_ui_id?: string
}
interface Connection {
  component_id: string
  name?: string
  provider?: string
  icon?: string
  connection_state?: string
  expires_at?: number | null
}

const connections = ref<Connection[]>([])
const providers = ref<Provider[]>([])
const loading = ref(true)
const error = ref('')
const search = ref('')

const pickerOpen = ref(false)
const pickerProvider = ref<string | undefined>(undefined)

const providerKey = (p: Provider) => p.provider ?? ''
const providerLabel = (p: Provider) => p.title ?? p.name ?? p.oauth_provider ?? 'Provider'
const providerIcon = (p: Provider) => p.icon || 'tabler:plug'
const isCredential = (p: Provider) => !!(p.credential_schema && !p.oauth_provider)

function mergeProviders(list: Provider[]): Provider[] {
  const byKey: Record<string, Provider> = {}
  for (const p of list) {
    const k = providerKey(p)
    if (!k) continue
    byKey[k] = byKey[k] ? { ...p, ...byKey[k] } : p
  }
  return Object.values(byKey)
}

const connectedKeys = computed(() => new Set(connections.value.map(c => c.provider).filter(Boolean) as string[]))
const available = computed(() => {
  const q = search.value.trim().toLowerCase()
  return providers.value
    .filter(p => !q || providerLabel(p).toLowerCase().includes(q) || (p.group || '').toLowerCase().includes(q))
    .sort((a, b) => providerLabel(a).localeCompare(providerLabel(b)))
})
function connIcon(c: Connection): string {
  return c.icon || providers.value.find(p => providerKey(p) === c.provider)?.icon || 'tabler:plug-connected'
}
function connOk(c: Connection): boolean {
  return resolveConnectionState(c.connection_state, c.expires_at) === 'connected'
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    // No per-request fallbacks: a failed catalog fetch must surface as an error,
    // not collapse into an empty catalog that reads as "nothing to connect".
    const [conns, oauthProvs, credProvs] = await Promise.all([
      api.get('/api/v1/connections?limit=100&offset=0')
        .then((r: { data: { connections?: Connection[] } }) => r.data),
      api.get('/api/v1/oauth/providers/discover'),
      api.get('/api/v1/connections/providers/discover'),
    ])
    connections.value = (conns.connections ?? []) as Connection[]
    providers.value = mergeProviders([
      ...((oauthProvs.data?.providers ?? []) as Provider[]),
      ...((credProvs.data?.providers ?? []) as Provider[]),
    ])
  } catch (e) {
    error.value = apiError(e)
    connections.value = []
    providers.value = []
  } finally {
    loading.value = false
  }
}

function openPicker(key: string) {
  pickerProvider.value = key
  pickerOpen.value = true
}
async function onConnected() {
  pickerOpen.value = false
  await load()
}

onMounted(load)
</script>

<template>
  <div class="conn-page oc">
    <div v-if="loading" class="oc-loading">
      <Icon icon="tabler:loader-2" class="spin" />
      <span>Loading services…</span>
    </div>

    <template v-else>
      <!-- Load failure is a directed error with a retry, not an empty catalog. -->
      <div v-if="error" class="oc-error">
        <Icon icon="tabler:alert-triangle" aria-hidden="true" />
        <div class="oc-error-body">
          <div class="oc-error-title">Couldn't load services</div>
          <div class="oc-error-sub">{{ error }}</div>
        </div>
        <button type="button" class="oc-btn oc-primary" @click="load">
          <Icon icon="tabler:refresh" aria-hidden="true" /> Try again
        </button>
      </div>

      <template v-else>
      <!-- Already connected -->
      <div v-if="connections.length" class="oc-block">
        <div class="oc-head">Connected</div>
        <div class="oc-conns">
          <div v-for="c in connections" :key="c.component_id" class="oc-conn">
            <span class="oc-conn-ico"><Icon :icon="connIcon(c)" aria-hidden="true" /></span>
            <span class="oc-conn-name">{{ c.name || c.provider }}</span>
            <span class="oc-dot" :class="{ ok: connOk(c) }" />
          </div>
        </div>
      </div>

      <!-- Catalog -->
      <div class="oc-block">
        <div class="oc-head-row">
          <span class="oc-head">{{ connections.length ? 'Add more' : 'Available services' }}</span>
          <div class="oc-search">
            <Icon icon="tabler:search" class="oc-search-ico" aria-hidden="true" />
            <input v-model="search" placeholder="Search services" aria-label="Search services">
          </div>
        </div>

        <div v-if="available.length" class="oc-grid">
          <button
            v-for="p in available"
            :key="providerKey(p)"
            type="button"
            class="oc-tile"
            :class="{ done: connectedKeys.has(providerKey(p)) }"
            @click="openPicker(providerKey(p))"
          >
            <span class="oc-tile-ico"><Icon :icon="providerIcon(p)" aria-hidden="true" /></span>
            <span class="oc-tile-body">
              <span class="oc-tile-name">{{ providerLabel(p) }}</span>
              <span class="oc-tile-auth">{{ isCredential(p) ? 'API key' : 'OAuth' }}</span>
            </span>
            <Icon
              :icon="connectedKeys.has(providerKey(p)) ? 'tabler:circle-check' : 'tabler:plus'"
              class="oc-tile-add"
              aria-hidden="true"
            />
          </button>
        </div>
        <div v-else class="oc-empty">No connectable services are configured yet.</div>
      </div>
      </template>

      <div class="oc-foot">
        <button type="button" class="oc-btn oc-ghost" @click="emit('back', undefined)">‹ Back</button>
        <span class="oc-foot-sp" />
        <button v-if="connections.length" type="button" class="oc-btn oc-primary" @click="emit('done', undefined)">Continue ›</button>
        <button v-else type="button" class="oc-btn oc-ghost" @click="emit('done', undefined)">Skip for now</button>
      </div>
    </template>

    <ConnectionPicker
      v-if="pickerOpen"
      :providers="providers"
      :provider="pickerProvider"
      @connected="onConnected"
      @close="pickerOpen = false"
    />
  </div>
</template>

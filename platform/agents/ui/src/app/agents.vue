<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import { api, host, loadByTagName } from '@wippy-fe/proxy'
import { useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'
import { useComponentEvents } from '../constants.ts'
import AgentForm from './AgentForm.vue'
import { errMsg } from '@widgets/app/errMsg'
import { loadToolCatalog } from './toolCatalog.ts'

// Canonical WC: the authenticated client comes from @wippy-fe/proxy; in-component
// modals replace window.confirm; the universal --p-* theme vocabulary renders it
// in any host's shadow DOM.
interface Agent {
  id: string
  title?: string
  description?: string
  icon?: string
  model?: string
  // Session start-token packed by the API per agent (wippy.session); opening a
  // chat with it starts a chat with this specific agent.
  start_token?: string
  access_level?: number
}
interface TraitAffects { tools?: boolean; behavior?: boolean; memory?: boolean }
interface Trait { id: string; title?: string; description?: string; icon?: string; tags?: string[]; prompt?: string; tools?: string[]; web_component?: string; provider?: string; affects?: TraitAffects }
interface Tool { id: string; title?: string; icon?: string; llm_alias?: string; llm_description?: string }
interface Model { name: string; title?: string; provider?: string }


const loading = ref(false)
const error = ref('')
const agents = ref<Agent[]>([])
const query = ref('')

const traits = ref<Trait[]>([])
const tools = ref<Tool[]>([])
const models = ref<Model[]>([])
const emit = useComponentEvents()

function cap(s: string): string { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s }

// A card's model is stored as a model name or a "class:<name>" reference. Resolve
// it to a human label: the class name (e.g. "Fast") or the model's title.
function modelLabel(m?: string): string {
  if (!m) return ''
  if (m.startsWith('class:')) return cap(m.slice(6))
  return models.value.find(x => x.name === m)?.title || m
}
function isClass(m?: string): boolean { return !!m && m.startsWith('class:') }

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return agents.value
  return agents.value.filter(a =>
    (a.title || '').toLowerCase().includes(q) ||
    (a.description || '').toLowerCase().includes(q),
  )
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/api/v1/user-agents')
    if (!data?.success) throw new Error(data?.error || 'failed to load agents')
    agents.value = (data.agents || []) as Agent[]
  } catch (e) {
    agents.value = []
    error.value = errMsg(e, 'could not load agents')
  } finally {
    loading.value = false
  }
}

// Option lists for the editor. Each endpoint degrades to an empty list when the
// owning module is not installed in this host (knowledge/models are optional),
// so the form simply hides the controls it can't populate.
async function loadOptions() {
  try { const { data } = await api.get('/api/v1/agents/traits'); traits.value = data?.success ? (data.traits || []) : [] } catch { traits.value = [] }
  try { tools.value = await loadToolCatalog() } catch { tools.value = [] }
  // no-cache: model discovery reflects the live registry, and a stale cached
  // response (or an SPA-fallback HTML body cached while the route was warming)
  // would leave the picker empty.
  // capability=generate: chat/tool-use models only — embedding models are not selectable for an agent.
  try { const { data } = await api.get('/api/v1/models/list?capability=generate', { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } }); models.value = data?.success ? (data.models || []) : [] } catch { models.value = [] }
}

// ── chat ──
// Open a chat with this specific agent: the host starts a chat from the
// agent's session start-token (packed per agent by the API).
function startChat(a: Agent) {
  if (a.start_token) emit('kickside-chat-open', { kind: 'start', startToken: a.start_token })
}

// ── editor ──
const formOpen = ref(false)
const formAgentId = ref<string | null>(null)
function openCreate() { formAgentId.value = null; formOpen.value = true }
function openEdit(a: Agent) { formAgentId.value = a.id; formOpen.value = true }
function onSaved() { formOpen.value = false; load() }

// ── delete ──
// The destructive confirm runs in the host layer via host.confirm (rendered
// outside this web component), so no in-component modal is needed.
async function askRemove(a: Agent) {
  const ok = await host.confirm({
    header: 'Delete agent',
    message: `Delete “${a.title || '(untitled)'}”? This can't be undone.`,
    icon: 'tabler:trash',
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
  })
  if (!ok) return
  error.value = ''
  try {
    const { data } = await api.delete(`/api/v1/user-agents/${a.id}`)
    if (!data?.success) throw new Error(data?.error || 'delete failed')
    await load()
  } catch (e) {
    error.value = errMsg(e, 'delete failed')
  }
}

// ── share ──
// An agent is a component, so it shares through the generic component access
// endpoints + the reusable kickside-share popup, mounted by tag.
const shareOpen = ref(false)
const shareTarget = ref<Agent | null>(null)
const shareHost = ref<HTMLElement | null>(null)

function openShare(a: Agent) { shareTarget.value = a; shareOpen.value = true }
function closeShare() { shareOpen.value = false; shareTarget.value = null }

async function mountShare() {
  const a = shareTarget.value
  if (!shareHost.value || !a) return
  shareHost.value.innerHTML = ''
  if (!customElements.get('kickside-share')) {
    try { await loadByTagName('kickside-share', { timeoutMs: 8000 }) } catch { /* inert if undefined */ }
  }
  const el = document.createElement('kickside-share')
  el.setAttribute('config', JSON.stringify({
    resource_id: a.id,
    access_url: `/api/v1/component-access/grants/${encodeURIComponent(a.id)}`,
    share_url: `/api/v1/component-access/share/${encodeURIComponent(a.id)}`,
    title: a.title || '',
  }))
  el.style.display = 'block'
  el.addEventListener('close', closeShare)
  shareHost.value.appendChild(el)
}

watch([shareOpen, shareHost], async () => {
  if (shareOpen.value && shareHost.value) await mountShare()
})

useHostVisibilityRefresh(async () => {
  await Promise.all([load(), loadOptions()])
})
</script>

<template>
  <div class="kx">
    <header class="kx-head">
      <div class="kx-head-icon"><Icon icon="tabler:robot" aria-hidden="true" /></div>
      <div class="kx-head-text">
        <h1 class="kx-title">Agents</h1>
        <p class="kx-head-sub">Configured assistants — a model, a prompt, and the capabilities and tools they use.</p>
      </div>
      <div class="kx-head-actions">
        <span class="kx-count"><Icon icon="tabler:robot" aria-hidden="true" /> {{ agents.length }} agent{{ agents.length !== 1 ? 's' : '' }}</span>
        <div class="kx-search">
          <Icon icon="tabler:search" class="kx-search-ico" aria-hidden="true" />
          <input v-model="query" class="kx-search-input" type="text" placeholder="Search agents…" />
        </div>
        <Button type="button" data-testid="agents-create" label="New agent" @click="openCreate">
          <template #icon="{ class: iconClass }">
            <Icon icon="tabler:plus" :class="iconClass" aria-hidden="true" />
          </template>
        </Button>
      </div>
    </header>

    <div v-if="error" class="kx-err">{{ error }}</div>


    <div class="kx-body">
      <div v-if="loading && !agents.length" class="kx-loading">
        <Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading…
      </div>

      <div v-else-if="!agents.length" class="kx-empty">
        <div class="kx-empty-ico"><Icon icon="tabler:robot" aria-hidden="true" /></div>
        <div class="kx-empty-title">No agents yet</div>
        <div class="kx-empty-sub">Agents are configured assistants — a model, a prompt, and the capabilities and tools they can use. Create one to get started.</div>
        <Button type="button" data-testid="agents-create" label="New agent" @click="openCreate">
          <template #icon="{ class: iconClass }">
            <Icon icon="tabler:plus" :class="iconClass" aria-hidden="true" />
          </template>
        </Button>
      </div>

      <div v-else-if="!filtered.length" class="kx-empty">
        <div class="kx-empty-title">No matches</div>
        <div class="kx-empty-sub">No agents match the current search.</div>
      </div>

      <div v-else class="kx-grid">
        <div
          v-for="a in filtered"
          :key="a.id"
          class="kx-card kx-focus-halo"
          tabindex="0"
          @click="openEdit(a)"
          @keydown.enter="openEdit(a)"
          @keydown.space.prevent="openEdit(a)"
        >
          <div class="kx-card-head">
            <span class="kx-ficon"><Icon :icon="a.icon || 'tabler:robot'" aria-hidden="true" /></span>
            <div class="kx-card-id">
              <div class="kx-card-name" :title="a.title || '(untitled)'">{{ a.title || '(untitled)' }}</div>
              <div v-if="a.model" class="kx-card-meta">
                <span class="kx-model" :title="a.model">
                  <Icon :icon="isClass(a.model) ? 'tabler:category' : 'tabler:cpu'" aria-hidden="true" />
                  {{ modelLabel(a.model) }}
                </span>
              </div>
            </div>
            <div class="kx-card-actions" @click.stop>
              <Button type="button" severity="secondary" outlined size="small" title="Edit" :aria-label="`Edit ${a.title}`" @click="openEdit(a)">
                <template #icon="{ class: iconClass }"><Icon icon="tabler:pencil" :class="iconClass" aria-hidden="true" /></template>
              </Button>
              <Button type="button" severity="secondary" outlined size="small" title="Share" :aria-label="`Share ${a.title}`" @click="openShare(a)">
                <template #icon="{ class: iconClass }"><Icon icon="tabler:share" :class="iconClass" aria-hidden="true" /></template>
              </Button>
              <Button type="button" severity="danger" outlined size="small" title="Delete" :aria-label="`Delete ${a.title}`" @click="askRemove(a)">
                <template #icon="{ class: iconClass }"><Icon icon="tabler:trash" :class="iconClass" aria-hidden="true" /></template>
              </Button>
            </div>
          </div>
          <div class="kx-card-desc">{{ a.description || 'No description' }}</div>
          <button class="kx-card-chat" :disabled="!a.start_token" @click.stop="startChat(a)" :title="a.start_token ? 'Chat with this agent' : 'Chat unavailable'">
            <Icon icon="tabler:message" aria-hidden="true" /> Chat
          </button>
        </div>
      </div>
    </div>

    <AgentForm
      :open="formOpen"
      :agent-id="formAgentId"
      :traits="traits"
      :tools="tools"
      :models="models"
      :agents="agents"
      @close="formOpen = false"
      @saved="onSaved"
    />

    <!-- Share: the reusable kickside-share popup owns its own modal chrome
         (backdrop + panel); we just mount the tag and close on its `close`. -->
    <div v-if="shareOpen" ref="shareHost"></div>
  </div>
</template>

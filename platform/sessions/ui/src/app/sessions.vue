<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import { host, on } from '@wippy-fe/proxy'
import { useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'
import { useComponentEvents, useComponentProps } from '../constants.ts'
import type { ProviderBadge, Session, SessionMessage } from '../types.ts'
import { useSessionsApi } from './useSessionsApi.ts'
import SessionRow from './SessionRow.vue'
import MessagesDrawer from './MessagesDrawer.vue'

// Sessions manager. Lists the user's chat sessions and lets them resume (reopen
// the saved conversation), restart (a fresh chat with the same agent), rename,
// preview, and delete. Matches the shared .kx- visual language of the other
// pages. Reads/writes go through the wippy/session API via the @wippy-fe/proxy
// client; chats open through the proxy host bridge, optionally in the sidebar.

// A user is capped at a few hundred sessions (the runtime per-user limit), so the
// whole set is loaded at once -- no pagination, no "load more".
const MAX = 300
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const api = useSessionsApi()
const hostProps = useComponentProps()
const emit = useComponentEvents()
const sidebarMode = computed(() => hostProps.value?.mode === 'sidebar')
const navigationMode = computed(() => hostProps.value?.mode === 'navigation')
const compactMode = computed(() => sidebarMode.value || navigationMode.value)
const activeSessionId = computed(() => hostProps.value?.activeSessionId || '')
const artifactsActive = computed(() => !!hostProps.value?.artifactsActive)

const sessions = ref<Session[]>([])
const total = ref(0)
const agentMap = ref<Record<string, string>>({})
const providerMap = ref<Record<string, ProviderBadge>>({})
const loading = ref(true)
const error = ref('')
const actionError = ref('')
const search = ref('')
const favOnly = ref(false)
const stops: Array<() => void> = []
let refreshTimer: ReturnType<typeof setTimeout> | null = null

function isFav(s: Session): boolean { return !!s.public_meta?.favorite }

// Resolve a session's agent to a human name; never surface a raw id/uuid.
function agentLabel(s: Session): string {
  const a = s.current_agent || ''
  if (!a) return ''
  const bare = a.replace(/^user_agent:/, '')
  if (agentMap.value[bare]) return agentMap.value[bare]
  if (a.startsWith('user_agent:')) return '' // user agent not resolvable -> hide its uuid
  const tail = a.includes(':') ? (a.split(':').pop() || '') : bare
  return UUID_RE.test(tail) ? '' : tail
}

const favCount = computed(() => sessions.value.filter(isFav).length)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const rows = sessions.value.filter((s) => {
    if (favOnly.value && !isFav(s)) return false
    if (!q) return true
    return (s.title || '').toLowerCase().includes(q) || agentLabel(s).toLowerCase().includes(q)
  })
  // Favorites pinned to the top; sort is stable so the rest keep their
  // recency order from the API.
  return [...rows].sort((a, b) => Number(isFav(b)) - Number(isFav(a)))
})

// Client-side pagination over the filtered set. Changing the search/filter resets
// to the first page; deleting rows clamps the page so it never points past the end.
const PAGE_SIZE = 25
const page = ref(1)
watch([search, favOnly], () => { page.value = 1 })
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
watch(totalPages, (t) => { if (page.value > t) page.value = t })
const paged = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filtered.value.slice(start, start + PAGE_SIZE)
})
const rangeStart = computed(() => filtered.value.length ? (page.value - 1) * PAGE_SIZE + 1 : 0)
const rangeEnd = computed(() => Math.min(filtered.value.length, page.value * PAGE_SIZE))
const pageWindow = computed(() => buildPageWindow(page.value, totalPages.value))
function goto(p: number) { page.value = Math.max(1, Math.min(totalPages.value, p)) }

// A compact page list with ellipses: 1 … 4 5 6 … 20.
function buildPageWindow(cur: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const out: (number | string)[] = [1]
  const start = Math.max(2, cur - 1)
  const end = Math.min(total - 1, cur + 1)
  if (start > 2) out.push('…')
  for (let i = start; i <= end; i++) out.push(i)
  if (end < total - 1) out.push('…')
  out.push(total)
  return out
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [{ sessions: rows, total: count }, titles, badges] = await Promise.all([
      api.list(MAX, 0),
      api.agentTitles(),
      api.providerBadges(),
    ])
    sessions.value = rows
    total.value = count
    agentMap.value = titles
    providerMap.value = badges
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}

function queueRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => { void load() }, 150)
}

function flashError(e: unknown) { actionError.value = (e as Error).message }

async function onFavorite(s: Session) {
  const next = !isFav(s)
  s.public_meta = { ...(s.public_meta || {}), favorite: next }
  try {
    await api.setFavorite(s.session_id, next)
  } catch (e) {
    s.public_meta = { ...(s.public_meta || {}), favorite: !next }
    flashError(e)
  }
}

function onResume(s: Session) {
  emit('session-select', { sessionId: s.session_id })
  emit('kickside-chat-open', { kind: 'session', sessionId: s.session_id })
}
async function onRestart(s: Session) {
  try {
    const startToken = await api.startToken(s.current_agent, s.current_model)
    emit('kickside-chat-open', { kind: 'start', startToken })
  } catch (e) { flashError(e) }
}
function onNewChat() {
  emit('new-chat', undefined)
}
function onOpenArtifacts() {
  emit('artifacts-open', undefined)
}
async function onRename(s: Session, title: string) {
  const prev = s.title
  s.title = title
  try { await api.rename(s.session_id, title) } catch (e) { s.title = prev; flashError(e) }
}

// Delete flow. The host provides a themed confirm dialog (rendered in-shadow via
// the facade), so the removal is gated by host.confirm rather than a hand-rolled
// modal.
async function onDelete(s: Session) {
  const ok = await host.confirm({
    header: 'Delete session',
    message: `Delete “${s.title?.trim() || 'Untitled chat'}” and its messages? This can’t be undone.`,
    icon: 'tabler:alert-triangle',
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
  })
  if (!ok) return
  try {
    await api.remove(s.session_id)
    sessions.value = sessions.value.filter(x => x.session_id !== s.session_id)
    total.value = Math.max(0, total.value - 1)
  } catch (e) { flashError(e) }
}

// Preview flow.
const previewOpen = ref(false)
const previewTitle = ref('')
const previewMessages = ref<SessionMessage[]>([])
const previewLoading = ref(false)
const previewError = ref('')
async function onPreview(s: Session) {
  previewOpen.value = true
  previewTitle.value = s.title?.trim() || 'Untitled chat'
  previewMessages.value = []
  previewError.value = ''
  previewLoading.value = true
  try { previewMessages.value = await api.messages(s.session_id) }
  catch (e) { previewError.value = (e as Error).message }
  finally { previewLoading.value = false }
}

useHostVisibilityRefresh(load)
onMounted(() => stops.push(on('session:*', queueRefresh)))
onBeforeUnmount(() => {
  stops.forEach(stop => stop())
  if (refreshTimer) clearTimeout(refreshTimer)
})
</script>

<template>
  <div class="kx" :class="{ 'kx-sidebar': compactMode }">
    <header v-if="sidebarMode" class="kx-side-head">
      <h1 class="kx-side-title">Sessions</h1>
      <Button type="button" class="kx-side-new" size="small" label="New chat" @click="onNewChat">
        <template #icon="{ class: iconClass }"><Icon icon="tabler:plus" :class="iconClass" aria-hidden="true" /></template>
      </Button>
    </header>
    <button
      v-if="sidebarMode"
      type="button"
      class="kx-side-artifacts"
      :class="{ 'is-active': artifactsActive }"
      :aria-current="artifactsActive ? 'page' : undefined"
      @click="onOpenArtifacts"
    >
      <Icon icon="tabler:binary-tree-2" aria-hidden="true" />
      <span>Artifacts</span>
      <Icon icon="tabler:chevron-right" class="kx-side-artifacts-caret" aria-hidden="true" />
    </button>
    <header v-else-if="!navigationMode" class="kx-head">
      <span class="kx-head-icon"><Icon icon="tabler:messages" aria-hidden="true" /></span>
      <div class="kx-head-text">
        <h1 class="kx-title">Sessions</h1>
        <p class="kx-head-sub">Resume, restart, rename, and review your chats.</p>
      </div>
      <div class="kx-head-actions">
        <Button type="button" size="small" label="New chat" @click="onNewChat">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:plus" :class="iconClass" aria-hidden="true" /></template>
        </Button>
        <label class="kx-search">
          <span class="sr-only">Search sessions</span>
          <Icon icon="tabler:search" class="kx-search-ico" aria-hidden="true" />
          <input v-model="search" class="kx-search-input" type="search" placeholder="Search sessions" />
          <button v-if="search" class="kx-search-clear" aria-label="Clear search" @click="search = ''">
            <Icon icon="tabler:x" aria-hidden="true" />
          </button>
        </label>
        <button
          class="kx-toggle"
          :class="{ 'kx-toggle-on': favOnly }"
          :aria-pressed="favOnly"
          :disabled="!favCount"
          :title="favCount ? 'Show only favorites' : 'No favorites yet'"
          @click="favOnly = !favOnly"
        >
          <Icon :icon="favOnly ? 'tabler:star-filled' : 'tabler:star'" aria-hidden="true" />
          <span>Favorites<template v-if="favCount"> · {{ favCount }}</template></span>
        </button>
        <Button type="button" severity="secondary" outlined title="Refresh" aria-label="Refresh" :loading="loading" :disabled="loading" @click="load">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:refresh" :class="iconClass" aria-hidden="true" /></template>
        </Button>
      </div>
    </header>

    <div class="kx-body">
      <div v-if="compactMode" class="kx-side-section-title">Chats and tasks</div>
      <div v-if="actionError" class="kx-err">
        <Icon icon="tabler:alert-triangle" aria-hidden="true" />
        <span>{{ actionError }}</span>
        <button class="kx-err-x" aria-label="Dismiss" @click="actionError = ''"><Icon icon="tabler:x" aria-hidden="true" /></button>
      </div>

      <div v-if="loading" class="kx-loading">
        <Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading…
      </div>

      <div v-else-if="error" class="kx-empty">
        <div class="kx-empty-ico"><Icon icon="tabler:alert-triangle" aria-hidden="true" /></div>
        <div class="kx-empty-title">Couldn’t load sessions</div>
        <div class="kx-empty-sub">{{ error }}</div>
        <Button type="button" label="Retry" @click="load">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:refresh" :class="iconClass" aria-hidden="true" /></template>
        </Button>
      </div>

      <div v-else-if="!sessions.length" class="kx-empty">
        <div class="kx-empty-ico"><Icon icon="tabler:message-plus" aria-hidden="true" /></div>
        <div class="kx-empty-title">No sessions yet</div>
        <div class="kx-empty-sub">Chats you start will show up here, ready to resume or restart.</div>
      </div>

      <div v-else-if="favOnly && !filtered.length" class="kx-empty">
        <div class="kx-empty-title">No favorites</div>
        <div class="kx-empty-sub">Star a session to pin it to the top and find it here.</div>
      </div>

      <div v-else-if="!filtered.length" class="kx-empty">
        <div class="kx-empty-title">No matches</div>
        <div class="kx-empty-sub">No sessions match the current search.</div>
      </div>

      <template v-else>
        <div class="kx-list">
          <SessionRow
            v-for="s in (compactMode ? filtered : paged)"
            :key="s.session_id"
            :session="s"
            :agent="agentLabel(s)"
            :providers="providerMap"
            :favorite="isFav(s)"
            :active="s.session_id === activeSessionId"
            @resume="onResume(s)"
            @restart="onRestart(s)"
            @preview="onPreview(s)"
            @favorite="onFavorite(s)"
            @rename="t => onRename(s, t)"
            @delete="onDelete(s)"
          />
        </div>

        <nav v-if="!compactMode && totalPages > 1" class="kx-pager" aria-label="Pagination">
          <span class="kx-pager-info">{{ rangeStart }}–{{ rangeEnd }} of {{ filtered.length }}</span>
          <div class="kx-pager-ctrls">
            <button class="kx-pager-btn" :disabled="page <= 1" aria-label="Previous page" @click="goto(page - 1)">
              <Icon icon="tabler:chevron-left" aria-hidden="true" />
            </button>
            <template v-for="(p, i) in pageWindow" :key="i">
              <span v-if="p === '…'" class="kx-pager-gap">…</span>
              <button v-else class="kx-pager-num" :class="{ 'kx-pager-cur': p === page }" @click="goto(p as number)">{{ p }}</button>
            </template>
            <button class="kx-pager-btn" :disabled="page >= totalPages" aria-label="Next page" @click="goto(page + 1)">
              <Icon icon="tabler:chevron-right" aria-hidden="true" />
            </button>
          </div>
        </nav>
      </template>
    </div>

    <MessagesDrawer
      :open="previewOpen"
      :title="previewTitle"
      :messages="previewMessages"
      :loading="previewLoading"
      :error="previewError"
      @close="previewOpen = false"
    />
  </div>
</template>

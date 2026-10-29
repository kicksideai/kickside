<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, markRaw, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { LayoutManager, LayoutManagerView } from '@wippy-fe/layout'
import { Icon } from '@iconify/vue'
import { useApi, useHost, useWippy } from '../composables/useWippy'
import { useSurfaces } from '../composables/useSurfaces'
import { normalizePath } from '../router/path'
import { createRefreshLadder } from '../composables/useRefreshLadder'
import CommandPalette from './CommandPalette.vue'
import SplashHost from './SplashHost.vue'
import AppNavigation from './AppNavigation.vue'
import LayoutPortalTarget from './LayoutPortalTarget.vue'
import BufferedSurfaceHost from './BufferedSurfaceHost.vue'
import ChatPanel from './ChatPanel.vue'
import ChatFlap from './ChatFlap.vue'
import SessionsPanel from './SessionsPanel.vue'
import ArtifactsGalleryPanel from './ArtifactsGalleryPanel.vue'
import { useChatController, isKicksideChatOpenDetail, type ChatContext, type KicksideChatOpenDetail } from './useChatController'
import { useShellBranding } from './useShellBranding'
import { useShellAccount } from './useShellAccount'
import { useSessionWorkspace } from './useSessionWorkspace'
import { sessionPath } from './sessionRoute'
import { completeSplashNavigation as navigateAfterSplash } from './splashNavigation'
import { useToneOverlay } from './useToneOverlay'
import {
  buildShellLayout,
  NAV_TARGET,
  SURFACE_TARGET,
  SESSIONS_TARGET,
  CHAT_TARGET,
} from './shellLayout'

const router = useRouter()
const route = useRoute()
const api = useApi()
const host = useHost()
const instance = useWippy()

const chat = useChatController((sessionId, context) => {
  host.setContext(context.context, sessionId, context.source)
})
const portalsReady = ref(false)
const mobileNavOpen = ref(false)
const mobileSessionsOpen = ref(false)
const contentMain = ref<HTMLElement | null>(null)
const { markUrl, appTitle, applyBranding } = useShellBranding(api)
const toneOverlay = useToneOverlay(contentMain)
const shellAccount = useShellAccount(api, host, instance)
const {
  currentUser, accountItems, profileWcOpen, profileWcHost,
  openComponentModal, openProfile, closeProfile,
  loadAccountItems, userInitials, fetchMe, logout,
} = shellAccount

const panelComponents = {
  nav: markRaw(LayoutPortalTarget),
  surface: markRaw(LayoutPortalTarget),
  sessions: markRaw(LayoutPortalTarget),
  chat: markRaw(LayoutPortalTarget),
}
const {
  renderableCategories, navItems, layout, home, splash, splashError, splashSaving,
  loaded, error: navError, loadNav, reloadNav, dismissSplash, advanceSplash,
} = useSurfaces()

const sessionWorkspace = useSessionWorkspace({
  route,
  router,
  host,
  chat,
  mobileNavOpen,
  mobileSessionsOpen,
  reportOwnedPanelError,
})
const {
  isSessionsRoute, isArtifactsWorkspace, activeSessionId, isNewChatRoute,
  selectSession, selectArtifactFromSessions, newSessionChat, openArtifactsWorkspace,
  openSessionInPanel, closeChatPanel, recordStartedSession,
} = sessionWorkspace

let lastNavResumeRefresh = 0
const { schedule: scheduleRegistryRefresh, clear: clearRegistryRefreshTimers } = createRefreshLadder(() => {
  reloadNav().then(applyHome)
  loadAccountItems()
})

function refreshNavOnResume() {
  if (document.visibilityState === 'hidden') return
  const now = Date.now()
  if (now - lastNavResumeRefresh < 5000) return
  lastNavResumeRefresh = now
  reloadNav().then(applyHome)
}

function refreshShellRegistryState() {
  scheduleRegistryRefresh()
  applyBranding()
}

const HUB_REFRESH_EVENTS = new Set(['hub.install.finished', 'hub.uninstall.finished', 'hub.migrations.finished'])
const REGISTRY_CHANGED_EVENT = 'kickside:registry-changed'

function eventName(msg: unknown): string {
  if (!isRecord(msg)) return ''
  const roots = [msg, msg.data, msg.payload, msg.detail]
  for (const root of roots) {
    if (isRecord(root) && typeof root.event === 'string') return root.event
  }
  return ''
}

function refreshFromHubLifecycle() {
  scheduleRegistryRefresh()
  window.dispatchEvent(new CustomEvent(REGISTRY_CHANGED_EVENT))
}

// Honor the admin-configured home page: when landing on "/", redirect to the
// chosen surface path. Only at the root so deep links and in-app nav are untouched.
function applyHome() {
  const target = normalizePath(home.value || '')
  if (route.path === '/' && target && target !== '/') router.replace(target)
}

// Collapse state is the only client-owned UI state in the shell; everything
// else (nav items, brand) is registry/facade sourced. Persisted so the rail
// width survives reloads.
const COLLAPSE_KEY = 'kickside.sidebar.collapsed'
const collapsed = ref(false)
const narrowSidebar = ref(false)
const railCollapsed = computed(() => collapsed.value || narrowSidebar.value)
let narrowSidebarQuery: MediaQueryList | null = null
function syncNarrowSidebar(event?: MediaQueryListEvent) {
  narrowSidebar.value = event ? event.matches : !!narrowSidebarQuery?.matches
}
try {
  collapsed.value = localStorage.getItem(COLLAPSE_KEY) === '1'
} catch {
  collapsed.value = false
}

// The manager is constructed before its view renders. It must therefore use
// the live route and persisted rail preference, rather than waiting for a
// non-immediate watcher to correct an ordinary-shell placeholder.
const layoutManager = new LayoutManager(buildShellLayout({
  sessionsRoute: isSessionsRoute.value,
  horizontalNav: layout.value === 'horizontal',
  navCollapsed: railCollapsed.value,
  chatOpen: chat.open.value,
  navOpen: mobileNavOpen.value,
  sessionsOpen: mobileSessionsOpen.value,
}, panelComponents))

function setCollapsed(value: boolean) {
  collapsed.value = value
  try {
    localStorage.setItem(COLLAPSE_KEY, value ? '1' : '0')
  } catch {
    // persistence unavailable; keep in-memory state
  }
}

function toggleCollapsed() {
  setCollapsed(!collapsed.value)
}

function syncManagedLayout() {
  layoutManager.setLayout(buildShellLayout({
    sessionsRoute: isSessionsRoute.value,
    horizontalNav: layout.value === 'horizontal',
    navCollapsed: railCollapsed.value,
    chatOpen: chat.open.value,
    navOpen: mobileNavOpen.value,
    sessionsOpen: mobileSessionsOpen.value,
  }, panelComponents))
}

watch([
  isSessionsRoute,
  () => layout.value,
  railCollapsed,
  () => chat.open.value,
  mobileNavOpen,
  mobileSessionsOpen,
], syncManagedLayout)
sessionWorkspace.start()

function handleChatOpen(event: Event) {
  const detail = (event as CustomEvent).detail
  if (!isKicksideChatOpenDetail(detail)) {
    console.warn('[kickside-chat] ignored invalid chat intent', detail)
    return
  }
  openChat(detail)
}

function openChat(detail: KicksideChatOpenDetail, context?: ChatContext) {
  mobileNavOpen.value = false
  mobileSessionsOpen.value = false
  if (detail.kind === 'session') chat.openSession(detail.sessionId, context)
  else chat.startChat(detail.startToken, context)
}

const unsubChatOpen = host.layout.on('kickside:chat-open', ({ payload }) => {
  if (!isRecord(payload)) return
  const detail = payload.intent === 'startChat'
    ? { kind: 'start', startToken: payload.startToken }
    : payload.intent === 'openSession'
      ? { kind: 'session', sessionId: payload.uuid }
      : null
  if (!isKicksideChatOpenDetail(detail)) return
  const context = payload.context as ChatContext | undefined
  if (payload.sidebar && !isSessionsRoute.value) openChat(detail, context)
  else {
    const path = detail.kind === 'session' ? sessionPath(detail.sessionId) : '/sessions'
    router.push(path).then(() => openChat(detail, context)).catch(reportOwnedPanelError)
  }
})

async function completeSplashNavigation(detail: {path: string; startToken?: string}) {
  await navigateAfterSplash(detail, {
    dismiss: dismissSplash,
    isSplashActive: () => !!splash.value,
    navigate,
    startChat: token => handleChatOpen(new CustomEvent('kickside-chat-open', {
      detail: {kind: 'start', startToken: token},
    })),
  })
}

function openMobileNavigation() {
  mobileSessionsOpen.value = false
  mobileNavOpen.value = true
}

function openMobileSessions() {
  mobileNavOpen.value = false
  mobileSessionsOpen.value = true
}

function reportOwnedPanelError(error: Error) {
  console.error('[kickside-shell] managed panel failed', error)
}

// Collapsed rail re-opens from the logo, by click or hover.
function expand() {
  // Compact mode is responsive, not a preference write. Touching or hovering the logo on
  // a phone must not silently change the rail width the user chose for their desktop.
  if (narrowSidebar.value) return
  if (collapsed.value) setCollapsed(false)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function navigatePathFromPayload(payload: unknown): string | null {
  if (!isRecord(payload)) return null

  const directPath = payload.path
  if (typeof directPath === 'string' && directPath && isSafeNavigatePath(directPath)) return directPath

  const nested = payload.data
  if (isRecord(nested) && typeof nested.path === 'string' && nested.path && isSafeNavigatePath(nested.path)) {
    return nested.path
  }

  return null
}

function isSafeNavigatePath(path: string): boolean {
  if (!path.startsWith('/') || path.startsWith('//')) return false
  if (path.includes('\\') || path.includes('://') || path.includes('%')) return false
  if (/[\u0000-\u001f\u007f]/.test(path)) return false

  const pathOnly = path.split(/[?#]/, 1)[0]
  if (!pathOnly) return false
  const parts = pathOnly.split('/').filter(Boolean)
  if (parts.some(part => part === '.' || part === '..')) return false

  // Any clean internal path is navigable: routing is memory-history within this
  // app, the catch-all resolves unknown paths to a graceful empty state, and the
  // structural guards above already reject external/traversal/control input. This
  // is what lets module surfaces deep-link to their own content (e.g.
  // /knowledge/<kbId>, /uploads/<fileId>) instead of only the app-owned surfaces.
  return true
}

const unsubNavigate = instance.on('action:navigate', (payload: unknown) => {
  const path = navigatePathFromPayload(payload)
  if (path) router.push(path)
})

// Centralized realtime: any admin nav change is broadcast on nav.changed via the
// relay central hub, so every open client (not just the editor) re-fetches the
// effective navigation and re-renders the rail live.
const unsubNavChanged = instance.on('nav.changed', refreshShellRegistryState)
const unsubHubChanged = instance.on('keeper.hub', (msg: unknown) => {
  if (HUB_REFRESH_EVENTS.has(eventName(msg))) refreshFromHubLifecycle()
})

function navigate(path: string) {
  mobileNavOpen.value = false
  return router.push(path)
}

// Vertical layout renders categories as collapsible sections. Collapsed keys are
// session-local; default expanded.
const collapsedCats = ref<Set<string>>(new Set())
function toggleCat(key: string) {
  const next = new Set(collapsedCats.value)
  next.has(key) ? next.delete(key) : next.add(key)
  collapsedCats.value = next
}

onMounted(() => {
  nextTick(() => { portalsReady.value = true })
  narrowSidebarQuery = window.matchMedia('(max-width: 640px)')
  syncNarrowSidebar()
  narrowSidebarQuery.addEventListener('change', syncNarrowSidebar)
  loadNav().then(applyHome)
  fetchMe()
  loadAccountItems()
  applyBranding()
  window.addEventListener('focus', refreshNavOnResume)
  document.addEventListener('visibilitychange', refreshNavOnResume)
  window.addEventListener('kickside:nav-changed', refreshShellRegistryState)
  window.addEventListener('kickside:modules-changed', scheduleRegistryRefresh)
  toneOverlay.start()
})
onUnmounted(() => {
  narrowSidebarQuery?.removeEventListener('change', syncNarrowSidebar)
  narrowSidebarQuery = null
  clearRegistryRefreshTimers()
  window.removeEventListener('focus', refreshNavOnResume)
  document.removeEventListener('visibilitychange', refreshNavOnResume)
  window.removeEventListener('kickside:nav-changed', refreshShellRegistryState)
  window.removeEventListener('kickside:modules-changed', scheduleRegistryRefresh)
  toneOverlay.stop()
  unsubChatOpen()
  unsubNavigate?.()
  unsubNavChanged?.()
  unsubHubChanged?.()
})
</script>

<template>
  <SplashHost
    v-if="splash"
    :key="splash.id"
    :splash="splash"
    :dismiss-error="splashError"
    :dismissing="splashSaving"
    @done="advanceSplash"
    @dismiss="dismissSplash"
    @navigate="completeSplashNavigation"
  />
  <div class="managed-app-shell h-full" @kickside-chat-open="handleChatOpen" @new-chat="newSessionChat">
    <LayoutManagerView :manager="layoutManager" />
    <div class="managed-mobile-actions">
      <button type="button" aria-label="Open navigation" title="Open navigation" @click="openMobileNavigation">
        <Icon icon="tabler:menu-2" aria-hidden="true" />
      </button>
      <button v-if="isSessionsRoute" type="button" aria-label="Open sessions" title="Open sessions" @click="openMobileSessions">
        <Icon icon="tabler:messages" aria-hidden="true" />
      </button>
    </div>
    <Teleport v-if="portalsReady" :to="`#${NAV_TARGET}`">
    <AppNavigation
      :class="railCollapsed ? 'sidebar--collapsed' : 'sidebar--expanded'"
      :layout="layout"
      :app-title="appTitle"
      :mark-url="markUrl"
      :is-new-chat-route="isNewChatRoute"
      :renderable-categories="renderableCategories"
      :nav-items="navItems"
      :loaded="loaded"
      :nav-error="navError"
      :rail-collapsed="railCollapsed"
      :collapsed-cats="collapsedCats"
      :current-user="currentUser"
      :account-items="accountItems"
      @new-chat="newSessionChat"
      @navigate="navigate"
      @toggle-collapsed="toggleCollapsed"
      @expand="expand"
      @toggle-cat="toggleCat"
      @open-profile="openProfile"
      @account-open="openComponentModal"
      @logout="logout"
    />
    </Teleport>

    <Teleport v-if="portalsReady" :to="`#${SURFACE_TARGET}`">
      <main ref="contentMain" class="managed-surface" style="background: var(--p-content-background)">
        <BufferedSurfaceHost :presented="!isSessionsRoute" />
      </main>
    </Teleport>

    <Teleport v-if="portalsReady && isSessionsRoute" :to="`#${SESSIONS_TARGET}`">
      <SessionsPanel
        :active-session-id="activeSessionId"
        :artifacts-active="isArtifactsWorkspace"
        :visible="isSessionsRoute"
        @session-select="selectSession"
        @artifact-select="selectArtifactFromSessions"
        @artifacts-open="openArtifactsWorkspace"
        @error="reportOwnedPanelError"
      />
    </Teleport>

    <Teleport v-if="portalsReady" :to="`#${CHAT_TARGET}`">
      <ArtifactsGalleryPanel
        v-if="isArtifactsWorkspace"
        :visible="isArtifactsWorkspace"
        @artifact-select="selectArtifactFromSessions"
        @error="reportOwnedPanelError"
      />
      <ChatPanel
        v-else
        :session-id="chat.sessionId.value"
        :start-token="chat.startToken.value"
        :generation="chat.generation.value"
        :closable="!isSessionsRoute"
        :sessions-appearance="isSessionsRoute"
        @session-started="recordStartedSession"
        @session-select="openSessionInPanel"
        @close="closeChatPanel"
        @error="reportOwnedPanelError"
      />
    </Teleport>

    <ChatFlap
      v-if="!isSessionsRoute && !chat.open.value"
      @show="chat.show"
    />

    <!-- Command palette (mod+K): mounts ui.command actions by tag. -->
    <CommandPalette />

    <!-- Account profile popup: the kickside-profile web component, mounted by tag. -->
    <div v-if="profileWcOpen" ref="profileWcHost"></div>
  </div>
</template>

<style scoped>
.managed-app-shell,
.managed-surface {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}
.managed-app-shell {
  position: relative;
  height: 100dvh;
  max-height: 100dvh;
  overflow: clip;
  --wippy-layout-splitter-bg: var(--p-content-border-color);
  --wippy-layout-splitter-hover-bg: var(--p-primary-color);
  --wippy-layout-splitter-hit-size: 14px;
  /* @wippy-fe/layout keeps the circle off at 0; a non-zero size is the opt-in. */
  --wippy-layout-splitter-handle-size: 15px;
  /* Semantic tokens change with the host theme, so the handle cannot retain a
     light-only fill when the browser or explicit facade mode switches dark. */
  --wippy-layout-splitter-handle-bg: var(--p-content-background);
  --wippy-layout-splitter-handle-border: 1px solid var(--p-content-border-color);
  --wippy-layout-splitter-handle-shadow: 0 1px 3px color-mix(in srgb, var(--p-text-color) 18%, transparent);
  --wippy-layout-splitter-handle-icon-color: var(--p-text-muted-color);
}
.managed-mobile-actions { display: none; }
@media (max-width: 767px) {
  .managed-mobile-actions { position: absolute; z-index: 900; top: .5rem; left: .5rem; display: flex; gap: .4rem; }
  .managed-mobile-actions button { display: grid; place-items: center; width: 2.25rem; height: 2.25rem; border-radius: var(--kx-radius-8); background: var(--p-content-background); color: var(--p-text-color); box-shadow: var(--p-popover-shadow); }
}
.managed-surface {
  overflow: hidden;
}
.managed-app-shell:has(.right-flap-container) .managed-surface {
  padding-inline-end: 48px;
}
</style>

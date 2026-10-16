import { computed, nextTick, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { useHost } from '../composables/useWippy'
import { useChatController } from './useChatController'
import { sessionIdFromPath, sessionPath } from './sessionRoute'

export function useSessionWorkspace(deps: {
  route: ReturnType<typeof useRoute>
  router: ReturnType<typeof useRouter>
  host: ReturnType<typeof useHost>
  chat: ReturnType<typeof useChatController>
  mobileNavOpen: Ref<boolean>
  mobileSessionsOpen: Ref<boolean>
  reportOwnedPanelError: (error: Error) => void
}) {
  const { route, router, host, chat, mobileNavOpen, mobileSessionsOpen, reportOwnedPanelError } = deps
  const isSessionsRoute = computed(() => route.path === '/sessions' || route.path.startsWith('/sessions/'))
  const isArtifactsWorkspace = computed(() => isSessionsRoute.value && route.query.view === 'artifacts')
  const activeSessionId = computed(() => sessionIdFromPath(route.path))
  const isNewChatRoute = computed(() => isSessionsRoute.value && !isArtifactsWorkspace.value && !activeSessionId.value)

  function broadcastArtifactSession(sessionId: string) {
    host.layout.broadcast('kickside:artifact-session', { sessionId })
  }

  function start() {
    watch(() => route.fullPath, () => {
      // An artifact panel belongs to the session in the URL. Broadcast all route
      // changes so it closes when navigation leaves Sessions.
      broadcastArtifactSession(isSessionsRoute.value ? activeSessionId.value : '')
      if (!isSessionsRoute.value || isArtifactsWorkspace.value) return
      if (activeSessionId.value) chat.openSession(activeSessionId.value)
      else if (chat.sessionId.value || chat.startToken.value) chat.newChat()
    }, { immediate: true })
  }

  function selectSession(sessionId: string) {
    mobileNavOpen.value = false
    mobileSessionsOpen.value = false
    broadcastArtifactSession(sessionId)
    chat.openSession(sessionId)
    void router.push(sessionPath(sessionId))
  }

  async function selectArtifactFromSessions(selection: { artifactId: string; sessionId: string }) {
    mobileNavOpen.value = false
    mobileSessionsOpen.value = false
    broadcastArtifactSession(selection.sessionId)
    chat.openSession(selection.sessionId)
    try {
      await router.push(sessionPath(selection.sessionId))
      await nextTick()
      await Promise.resolve(host.openArtifact(selection.artifactId, { target: 'sidebar' }))
    } catch (cause) {
      reportOwnedPanelError(cause instanceof Error ? cause : new Error(String(cause)))
    }
  }

  function newSessionChat() {
    mobileNavOpen.value = false
    mobileSessionsOpen.value = false
    broadcastArtifactSession('')
    chat.newChat()
    if (route.path !== '/sessions' || route.query.view) void router.push('/sessions')
  }

  function openArtifactsWorkspace() {
    mobileNavOpen.value = false
    mobileSessionsOpen.value = false
    host.layout.broadcast('kickside:artifact-close', { panelId: 'artifact' })
    void router.push({ path: '/sessions', query: { view: 'artifacts' } })
  }

  function openSessionInPanel(sessionId: string) {
    if (sessionId) chat.openSession(sessionId)
  }

  function closeChatPanel() {
    if (isSessionsRoute.value) {
      newSessionChat()
      return
    }
    chat.close()
  }

  function recordStartedSession(sessionId: string) {
    chat.recordStarted(sessionId)
    // Broadcast before the route lands so an artifact emitted during session
    // creation is not suppressed as off-session.
    if (isSessionsRoute.value) {
      broadcastArtifactSession(sessionId)
      void router.replace(sessionPath(sessionId))
    }
  }

  return {
    start,
    isSessionsRoute,
    isArtifactsWorkspace,
    activeSessionId,
    isNewChatRoute,
    selectSession,
    selectArtifactFromSessions,
    newSessionChat,
    openArtifactsWorkspace,
    openSessionInPanel,
    closeChatPanel,
    recordStartedSession,
  }
}

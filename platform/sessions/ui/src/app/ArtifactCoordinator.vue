<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { getLayoutManager, on } from '@wippy-fe/proxy'
import type { host as proxyHost } from '@wippy-fe/proxy'
import { useHost, useLayoutBus } from '@wippy-fe/webcomponent-vue'
import { useSessionsApi } from './useSessionsApi.ts'

interface LayoutEvent {
  channel?: string
  payload?: unknown
  sourcePanelId?: string | null
}

interface ArtifactIntent {
  intent?: string
  uuid?: string
  artifactId?: string
  target?: 'sidebar' | 'modal'
  reason?: 'click' | 'arrival'
}

interface SessionIntent {
  sessionId?: string
  session_id?: string
}

const PANEL_ID = 'artifact'
const MODAL_ID = 'artifact-modal'
/** Verified rendering size; the shell draws no header at all without one. */
const MODAL_SIZE = { width: '80vw', height: '80vh' }

// The generic is required because useHost() deliberately defaults to an
// unshaped value at the webcomponent boundary. This coordinator uses the
// managed-layout surface, so derive the exact host contract from the proxy.
const host = useHost<typeof proxyHost>()
const bus = useLayoutBus()
const api = useSessionsApi()
const manager = host ? getLayoutManager(host) : null
const stops: Array<() => void> = []

/**
 * The session the artifact panel is scoped to, i.e. the one in the URL.
 *
 * Seeded from the address bar because a click can land before the shell's
 * first broadcast, then kept current by `kickside:artifact-session`.
 */
const activeSessionId = ref(sessionIdFromPath(window.location.pathname))

/**
 * Guards the async gap in `openModal`. Without it a slow title lookup can
 * reopen a modal the user has already navigated away from, or let an older
 * artifact overwrite a newer one, because `MODAL_ID` is a singleton.
 */
let modalSequence = 0

function sessionIdFromPath(path: string): string {
  if (!path.startsWith('/sessions/')) return ''
  const encoded = path.slice('/sessions/'.length).split('/')[0] || ''
  try { return decodeURIComponent(encoded) } catch { return '' }
}

function artifactIdFrom(value: unknown): string {
  if (!value || typeof value !== 'object') return ''
  const payload = value as ArtifactIntent
  return String(payload.uuid || payload.artifactId || '')
}

function eventSessionId(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return ''
  const intent = payload as SessionIntent
  return String(intent.sessionId || intent.session_id || '')
}

function reveal() {
  manager?.expandPanel(PANEL_ID)
  manager?.openDrawer(PANEL_ID)
}

function hide() {
  manager?.closeDrawer(PANEL_ID)
  manager?.collapsePanel(PANEL_ID)
}

function closeModal() {
  // Invalidate any in-flight open so a late title lookup cannot reopen it.
  modalSequence++
  host?.layout?.closeModal(MODAL_ID)
}

/**
 * Open the artifact over the page instead of beside it.
 *
 * The title is fetched first: without one the layout shell renders no header,
 * and therefore no close button, leaving the reader only the Esc key. A failed
 * lookup still opens — a generic title beats swallowing the click.
 *
 * The close before the open is required, not tidiness: the receiver silently
 * drops `openModal` for an id that is already open, so replacing the contents
 * of a live modal would otherwise do nothing at all.
 */
async function openModal(id: string) {
  const sequence = ++modalSequence
  let title = 'Artifact'
  try {
    const detail = await api.artifact(id)
    if (detail?.title) title = detail.title
  } catch { /* fall through with the generic title */ }
  if (sequence !== modalSequence) return
  host?.layout?.closeModal(MODAL_ID)
  host?.layout?.openModal(MODAL_ID, {
    kind: 'artifact',
    id,
    title,
    dismissable: true,
    size: MODAL_SIZE,
  })
}

/**
 * Route an artifact to a surface.
 *
 * The side panel sits next to the session it belongs to, so it is only
 * meaningful on a `/sessions/<id>` route. The same chat component also runs as
 * a floating sidebar over Agents, Knowledge and the rest; revealing the panel
 * from there would park a session's artifact next to an unrelated page. Off a
 * session route the artifact opens in a modal instead.
 *
 * Arrivals are deliberately not routed off a session route. The web host
 * publishes click and arrival identically and takes no view on either; it is
 * this app that decides a surface worth revealing on demand is not one worth
 * throwing over the page unprompted.
 *
 * `sourcePanelId === PANEL_ID` is defence in depth and does not fire today:
 * the artifact panel is declared `kind: 'component'`, so it is a host element
 * rather than a window, and host-realm publishers arrive unattributed
 * (`source: null`). It is kept so the guard is already correct if the panel
 * ever becomes an iframe panel, which would otherwise let the panel silently
 * replace the artifact the reader is looking at.
 */
function showArtifact(id: string, intent?: ArtifactIntent, sourcePanelId?: string | null) {
  // An explicit request for a modal is honoured everywhere, including on a
  // session route — the caller knows something we do not.
  if (intent?.target === 'modal') {
    void openModal(id)
    return
  }
  const ownsPanel = !!activeSessionId.value && sourcePanelId !== PANEL_ID
  if (!ownsPanel) {
    if (intent?.reason === 'arrival') return
    void openModal(id)
    return
  }
  reveal()
  // Defer: the panel may be mounting from collapsed, and the broadcast is
  // what tells it which artifact to select.
  window.setTimeout(() => bus?.broadcast('kickside:artifact-open', { uuid: id }), 0)
}

/**
 * Follow the session the shell is showing.
 *
 * The modal closes on every broadcast, not only when the session id changes:
 * it is scoped to the page it was opened over, and the shell broadcasts on
 * each route change. Without that, walking from one non-session route to
 * another (`/agents` to `/knowledge`, both broadcasting an empty id) left the
 * modal hanging over the new page.
 *
 * The panel only closes when the session actually changes, because whatever it
 * holds then belongs to the previous session. ArtifactPanel clears its own
 * contents off the same broadcast; this closes the chrome around them.
 */
function setActiveSession(sessionId: string) {
  closeModal()
  if (sessionId === activeSessionId.value) return
  activeSessionId.value = sessionId
  hide()
}

function onLayoutEvent(event: LayoutEvent) {
  if (event.channel === 'kickside:artifact-session') {
    setActiveSession(eventSessionId(event.payload))
    return
  }
  if (event.channel === '@HOST/intent') {
    const payload = event.payload as ArtifactIntent | undefined
    if (payload?.intent === 'startChat' || payload?.intent === 'openSession') {
      bus?.send('main', 'kickside:chat-open', payload)
      return
    }
    const id = artifactIdFrom(payload)
    if (payload?.intent === 'openArtifact' && id)
      showArtifact(id, payload, event.sourcePanelId)
    return
  }
  if (event.channel === 'kickside:artifact-close') {
    closeModal()
    hide()
  }
}

/**
 * A `action:<command>` websocket push.
 *
 * The command is a topic segment, not a field: the proxy delivers the raw
 * `{ topic, data }` envelope and matches subscriptions against the full topic,
 * which is why the pattern below is two segments. Reading `envelope.action`
 * silently matched nothing.
 */
function onAction(message: unknown) {
  if (!message || typeof message !== 'object') return
  const envelope = message as { topic?: string, data?: Record<string, unknown> }
  const [, command] = String(envelope.topic || '').split(':')
  if (command !== 'sidebar') return
  const id = String(envelope.data?.artifact_uuid || '')
  if (!id) return
  // Scoped when the push says which session it belongs to, so a background
  // session cannot commandeer the panel of the one being read.
  const pushed = String(envelope.data?.session_id || '')
  if (pushed && pushed !== activeSessionId.value) return
  // Server-driven, not a physical click: it must not throw a modal over a page
  // the reader never touched, so it routes as an arrival.
  showArtifact(id, { reason: 'arrival' })
}

onMounted(() => {
  const stopBus = bus?.subscribe(onLayoutEvent)
  if (stopBus) stops.push(stopBus)
  // Two segments: the proxy matches the full websocket topic (`action:sidebar`)
  // segment by segment, so a one-segment `action` pattern never matches.
  stops.push(on('action:*', onAction))
})

onBeforeUnmount(() => stops.forEach(stop => stop()))
</script>

<template><span aria-hidden="true" /></template>

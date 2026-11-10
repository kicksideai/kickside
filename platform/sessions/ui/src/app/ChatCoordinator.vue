<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { getLayoutManager, on } from '@wippy-fe/proxy'
import type { host as proxyHost } from '@wippy-fe/proxy'
import { useHost, useLayoutBus } from '@wippy-fe/webcomponent-vue'
import {
  ARTIFACT_PANEL_ID,
  CHAT_PANEL_ID,
  isBareSessions,
  isDrawerSlot,
  isPanelDrawerOpen,
  isPanelOpen,
  isRecord,
  isSessionsPath,
  layoutName,
  layoutSnapshot,
  mainAppRoute,
  panelProps,
  parseRoute,
  pathSection,
  sessionIdFromPath,
  sessionPath,
  slotFor,
} from './hostRoute.ts'
import type { HostRoute, LayoutEvent, LayoutLike } from './hostRoute.ts'

/**
 * Kickside's chat routing for the host `chat` panel (@HOST/chat-wrapper).
 *
 * The chat panel lives in the host layout, so it works whatever page the
 * `main` panel shows. This coordinator owns every decision about it: where a
 * chat request goes, how `/sessions` (which keeps its own inline chat) and the
 * drawer hand a session to each other, and how the panel behaves across
 * breakpoints. It is eager because it is headless and must hear the first
 * intent.
 */

/** Bus channel on which this coordinator tells the chat empty state whether a start is in flight. */
const START_CHANNEL = 'kickside:chat-start'

interface IntentContext {
  context: Record<string, unknown>
  source?: { type: 'page' | 'artifact', uuid: string, instanceUUID?: string }
}

interface ChatIntent {
  intent?: string
  uuid?: string
  startToken?: string
  sidebar?: boolean
  context?: IntentContext
}

/** A token start whose session has not been announced yet. */
interface PendingStart {
  token: string
  /** Show the new session on /sessions/<id> instead of in the panel. */
  fullPage: boolean
  context?: IntentContext
  /** First path segment of the page the start was requested on. */
  section: string
  /** The session the panel held before this start, put back if the start is cancelled. */
  previousSessionId: string
  /**
   * The snapshot has shown this start's token. A cleared panel counts as the end
   * of the start only after that: before it, the token's patch is still on its
   * way, and the clear belongs to an earlier start.
   */
  seen: boolean
}

const host = useHost<typeof proxyHost>()
const bus = useLayoutBus()
const manager = host ? getLayoutManager(host) : null
const stops: Array<() => void> = []

let hostPath = window.location.pathname
let route: HostRoute = parseRoute(hostPath)
/** Layout name (not breakpoint name) the panel state was last applied to. */
let activeLayout = 'default'
let lastPropsKey = '|'
let lastChatDrawer = false
let lastArtifactDrawer = false
let lastSyncKey = ''
let pending: PendingStart | null = null
/**
 * The session this coordinator's latest patch gave the panel, until the
 * snapshot shows it. A patch applies in a later task, so until then the
 * snapshot still holds the session from before it.
 */
let patchedSession: string | null = null
/** Tabs this coordinator took away under /sessions, to put back afterwards. */
const removedTabs = new Map<string, unknown>()

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function readLayout(): LayoutLike | null {
  return layoutSnapshot(host)
}

type LayoutManager = NonNullable<typeof manager>

/**
 * The layout manager. onMounted subscribes every handler only after it found
 * one, so none can run without it; this is the single place that says so.
 */
function requireManager(): LayoutManager {
  if (!manager) throw new Error('[kickside-chat-coordinator] used before it started')
  return manager
}

/**
 * The route the reader is on. While the main panel shows the Kickside app page
 * its full route (query and hash included) is the live truth; otherwise only
 * the host path, from the address bar and `@history`, is known.
 */
function readRoute(layout: LayoutLike | null): HostRoute {
  const appRoute = mainAppRoute(layout)
  return parseRoute(appRoute ?? hostPath)
}

function routeKey(value: HostRoute): string {
  return `${value.path}${value.search}`
}

function propsKey(layout: LayoutLike | null): string {
  const props = panelProps(layout, CHAT_PANEL_ID)
  return `${text(props.sessionId)}|${text(props.startToken)}`
}

function patchChat(props: Record<string, unknown>) {
  if ('sessionId' in props) patchedSession = text(props.sessionId)
  host?.layout.updatePanel(CHAT_PANEL_ID, { props })
}

/**
 * Record what the snapshot now shows of the pending start and of the latest
 * patch. A start's own patch carries no session, which tells it apart from an
 * earlier finished start that left the same token in the panel.
 */
function noteSnapshot(layout: LayoutLike) {
  const props = panelProps(layout, CHAT_PANEL_ID)
  if (pending && text(props.startToken) === pending.token && !text(props.sessionId)) pending.seen = true
  if (patchedSession !== null && text(props.sessionId) === patchedSession) patchedSession = null
}

/**
 * Show the panel by the type of slot it has at this breakpoint. A drawer
 * opens, a column expands; never both, so a flag set for one slot type cannot
 * outlive a change of breakpoint.
 */
function reveal(layout: LayoutLike | null) {
  if (!layout) return
  const layoutManager = requireManager()
  if (isDrawerSlot(slotFor(layout, layoutManager.activeBreakpoint, CHAT_PANEL_ID)))
    layoutManager.openDrawer(CHAT_PANEL_ID)
  else
    layoutManager.expandPanel(CHAT_PANEL_ID)
}

function hide(layout: LayoutLike | null) {
  if (!layout) return
  const layoutManager = requireManager()
  if (isDrawerSlot(slotFor(layout, layoutManager.activeBreakpoint, CHAT_PANEL_ID)))
    layoutManager.closeDrawer(CHAT_PANEL_ID)
  else
    layoutManager.collapsePanel(CHAT_PANEL_ID)
}

function drawersOpen(layout: LayoutLike): { chat: boolean, artifact: boolean } {
  const breakpoint = requireManager().activeBreakpoint
  return {
    chat: isPanelDrawerOpen(layout, breakpoint, CHAT_PANEL_ID),
    artifact: isPanelDrawerOpen(layout, breakpoint, ARTIFACT_PANEL_ID),
  }
}

/**
 * On a narrow screen the chat and artifact drawers must not stack, however the
 * second one was opened: by a coordinator, by the chat tab, or by any panel
 * calling `host.layout.openDrawer`. This reads the layout, so it sees all of
 * them. Whichever drawer just opened stays; the other closes. When both opened
 * in one change (a breakpoint switch), the chat stays. Both found open when the
 * coordinator starts are settled the same way, once, at mount; after that only
 * an opening is acted on.
 */
function keepOneDrawer(layout: LayoutLike) {
  const { chat, artifact } = drawersOpen(layout)
  if (chat && artifact) {
    const chatOpened = !lastChatDrawer
    const artifactOpened = !lastArtifactDrawer
    if (artifactOpened && !chatOpened) requireManager().closeDrawer(CHAT_PANEL_ID)
    else if (chatOpened) requireManager().closeDrawer(ARTIFACT_PANEL_ID)
  }
  lastChatDrawer = chat
  lastArtifactDrawer = artifact
}

/**
 * Edge tabs that open the chat panel. Under /sessions the page has its own
 * chat and the panel stays closed. A tab in `mode: auto` shows whenever its
 * panel is closed, so it would stay on screen offering a chat that never opens
 * there; it is removed, and put back on leaving /sessions.
 */
function removeChatTabs(layout: LayoutLike | null) {
  for (const [id, def] of Object.entries(layout?.floating ?? {})) {
    if (!isRecord(def) || !isRecord(def.props) || def.props.target !== CHAT_PANEL_ID) continue
    if (removedTabs.has(id)) continue
    // Cached first: once removed, the snapshot no longer has the definition.
    removedTabs.set(id, JSON.parse(JSON.stringify(def)))
    host?.layout.removeFloating(id)
  }
}

function restoreChatTabs() {
  for (const [id, def] of removedTabs) host?.layout.addFloating(id, def as never)
  removedTabs.clear()
}

function applyContext(context: IntentContext | undefined, sessionId: string) {
  if (!context || !isRecord(context.context)) return
  host?.setContext(context.context, sessionId, context.source)
}

function isFullPage(intent: ChatIntent, current: HostRoute): boolean {
  return isSessionsPath(current.path) || intent.sidebar === false
}

/**
 * Set or clear the start in flight. The chat empty state locks its picker
 * while one is, so a second pick cannot race the first.
 */
function setPending(next: PendingStart | null) {
  const changed = (pending !== null) !== (next !== null)
  pending = next
  if (changed) bus?.broadcast(START_CHANNEL, { pending: next !== null })
}

/**
 * Cancel the start in flight: forget it and abort the panel's token exchange
 * by clearing the token and putting back the session the panel held before.
 * (Cancels caused by a panel that was already cleared, or by a pick, only
 * forget it: the panel has already moved on.)
 */
function cancelPending() {
  const start = pending
  if (!start) return
  setPending(null)
  patchChat({ startToken: null, sessionId: start.previousSessionId || null })
}

function openSession(intent: ChatIntent, sessionId: string) {
  const layout = readLayout()
  const current = readRoute(layout)
  applyContext(intent.context, sessionId)
  if (isFullPage(intent, current)) {
    cancelPending()
    host?.navigate(sessionPath(sessionId))
    return
  }
  // The patch below replaces the token and the session, which also cancels it.
  setPending(null)
  patchChat({ sessionId, startToken: null })
  reveal(layout)
}

function startChat(intent: ChatIntent, token: string) {
  const layout = readLayout()
  const current = readRoute(layout)
  const fullPage = isFullPage(intent, current)
  const section = pathSection(current.path)
  // The same token again is the start the panel already runs, or is about to:
  // a second patch would reset the panel and start another session. Only where
  // the session goes changes.
  const merged = pending !== null && pending.token === token
  if (pending && merged) {
    pending = { ...pending, fullPage, context: intent.context, section }
  }
  else {
    // A start replaced by this one hands on the session it was going to restore;
    // otherwise it is the session the panel shows, or is about to show.
    const previousSessionId = pending
      ? pending.previousSessionId
      : patchedSession ?? text(panelProps(layout, CHAT_PANEL_ID).sessionId)
    setPending({ token, fullPage, context: intent.context, section, previousSessionId, seen: false })
  }
  // A full-page start never shows the panel: its session opens on the page.
  if (fullPage && layout && isPanelOpen(layout, requireManager().activeBreakpoint, CHAT_PANEL_ID)) hide(layout)
  if (!merged) patchChat({ startToken: token, sessionId: null })
  if (!fullPage) reveal(layout)
}

/**
 * The chat panel announced a session: either a token start finished
 * (`{ sessionId }`, token kept) or the reader picked one in its selector
 * (`{ sessionId, startToken: null }`). The panel already shows it, so only a
 * start has anything left to do. The token the panel carries says which it was:
 *  - the pending start's token: that start finished;
 *  - no token: a pick, which supersedes the start;
 *  - another token: an older start finished while the pending start's token was
 *    still on its way to the panel (a patch applies in a later task), so the
 *    pending start keeps waiting.
 * A pick made before the start's patch landed is put in again, so that the patch
 * does not replace it.
 */
function onPanelAnnounced(sessionId: string) {
  const start = pending
  if (!start) return
  const token = text(panelProps(readLayout(), CHAT_PANEL_ID).startToken)
  if (token && token !== start.token) return
  setPending(null)
  if (token !== start.token) {
    if (!start.seen) patchChat({ sessionId, startToken: null })
    return
  }
  applyContext(start.context, sessionId)
  if (start.fullPage) {
    host?.navigate(sessionPath(sessionId))
    return
  }
  // A drawer start that finishes while the reader sits on a blank /sessions
  // takes the usual carry-in: the session moves inline.
  const current = readRoute(readLayout())
  if (isBareSessions(current)) host?.navigate(`${sessionPath(sessionId)}${current.search}${current.hash}`)
}

function onLayoutEvent(event: LayoutEvent) {
  if (event.channel !== '@HOST/intent' || !isRecord(event.payload)) return
  const intent = event.payload as ChatIntent
  const sessionId = text(intent.uuid)
  const token = text(intent.startToken)
  // The panel's own announcements first: they are not requests, and treating
  // one as a request would navigate to the page it is already showing.
  if (intent.intent === 'openSession' && sessionId) {
    if (event.sourcePanelId === CHAT_PANEL_ID) onPanelAnnounced(sessionId)
    else openSession(intent, sessionId)
    return
  }
  if (intent.intent === 'startChat' && token) startChat(intent, token)
}

function onNavigated(prev: HostRoute, next: HostRoute, layout: LayoutLike) {
  let held = text(panelProps(layout, CHAT_PANEL_ID).sessionId)
  // A full-page start belongs to the page section it was requested on
  // (`/keeper`, `/git`, `/sessions`, ...). Moving within the section, to
  // another sub-route, query or hash, keeps it, so `/sessions` to
  // `/sessions?view=artifacts` still opens the new chat on completion. A drawer
  // start is not tied to any page and is never cancelled by navigation.
  if (pending?.fullPage && pathSection(next.path) !== pending.section) {
    held = pending.previousSessionId
    cancelPending()
  }
  const wasSessions = isSessionsPath(prev.path)
  const isSessions = isSessionsPath(next.path)
  if (isSessions && !wasSessions) {
    hide(layout)
    removeChatTabs(layout)
    // Bare /sessions is a blank chat; a session held in the panel moves inline.
    // A panel cleared by "New chat" holds none, so it is left blank.
    if (held && isBareSessions(next))
      host?.navigate(`${sessionPath(held)}${next.search}${next.hash}`)
  }
  else if (!isSessions && wasSessions) {
    const left = sessionIdFromPath(prev.path)
    if (left) {
      // The patch pins the session left behind, so the panel cancels its token
      // exchange, closes the late session and announces nothing. The start is
      // over; what the reader does next decides what comes after it.
      setPending(null)
      patchChat({ sessionId: left, startToken: null })
    }
    hide(layout)
    restoreChatTabs()
  }
}

function watchPanel(layout: LayoutLike) {
  const key = propsKey(layout)
  if (key !== lastPropsKey) {
    // "New chat" clears both props, and so does the Host when a token exchange
    // fails; a start still waiting must not revive them. A start whose token
    // has not been seen yet is not the one cleared: its patch is still queued.
    if (key === '|' && pending?.seen) setPending(null)
    lastPropsKey = key
  }
  keepOneDrawer(layout)
}

/**
 * What the sync reacts to: the route, the chat panel's session and token, and
 * whether the chat or artifact drawer is open. A splitter drag changes the
 * layout many times without touching any of them.
 */
function syncKey(layout: LayoutLike): string {
  const { chat, artifact } = drawersOpen(layout)
  return `${routeKey(readRoute(layout))}#${propsKey(layout)}#${chat}#${artifact}`
}

function sync() {
  const layout = readLayout()
  if (!layout) return
  noteSnapshot(layout)
  const key = syncKey(layout)
  if (key === lastSyncKey) return
  lastSyncKey = key
  const prev = route
  route = readRoute(layout)
  if (routeKey(prev) !== routeKey(route)) onNavigated(prev, route, layout)
  watchPanel(layout)
}

/**
 * The panel is a drawer at one width and a column at another. Its logical
 * state, open or closed, carries over; the destination slot's default does not.
 */
function onBreakpoint() {
  const layout = readLayout()
  if (!layout) return
  const next = layoutName(layout, requireManager().activeBreakpoint)
  const prev = activeLayout
  if (next === prev) return
  activeLayout = next
  if (isPanelOpen(layout, prev, CHAT_PANEL_ID) && !isSessionsPath(route.path)) reveal(layout)
  else hide(layout)
}

onMounted(() => {
  const layout = readLayout()
  if (!host || !manager || !bus || !layout) {
    console.error('[kickside-chat-coordinator] not started: needs a managed layout host with a layout manager, a layout bus and a layout snapshot', {
      host: !!host,
      manager: !!manager,
      bus: !!bus,
      snapshot: !!layout,
    })
    return
  }
  route = readRoute(layout)
  activeLayout = layoutName(layout, manager.activeBreakpoint)
  lastPropsKey = propsKey(layout)
  const { chat, artifact } = drawersOpen(layout)
  if (chat && artifact) manager.closeDrawer(ARTIFACT_PANEL_ID)
  lastChatDrawer = chat
  lastArtifactDrawer = artifact && !chat
  lastSyncKey = syncKey(layout)
  if (isSessionsPath(route.path)) {
    hide(layout)
    removeChatTabs(layout)
  }
  stops.push(bus.subscribe(onLayoutEvent))
  stops.push(manager.on('change', sync))
  stops.push(manager.on('breakpoint', onBreakpoint))
  // The host path alone, no query: an extra signal beside the layout changes.
  stops.push(on('@history', ({ path }) => {
    hostPath = path
    sync()
  }))
})

onBeforeUnmount(() => {
  stops.forEach(stop => stop())
  stops.length = 0
  cancelPending()
  restoreChatTabs()
})
</script>

<template><span aria-hidden="true" /></template>

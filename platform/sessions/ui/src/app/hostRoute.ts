// Route and layout helpers shared by the two host-realm coordinators
// (ArtifactCoordinator and ChatCoordinator). Pure functions: no host access,
// so both read the same facts the same way.

export const MAIN_PANEL_ID = 'main'
export const CHAT_PANEL_ID = 'chat'
export const ARTIFACT_PANEL_ID = 'artifact'
/** The Kickside app page. Only this page owns the Sessions routes. */
export const APP_PAGE_ID = 'app.views:main'

export interface HostRoute {
  path: string
  search: string
  hash: string
}

/** The pieces of a layout snapshot or declaration these helpers read. */
export interface LayoutLike {
  layouts?: Record<string, unknown>
  panels?: Record<string, unknown>
  floating?: Record<string, unknown>
  activeBreakpoint?: string
}

interface SlotLike {
  panel: string
  display?: string
  collapsed?: boolean
}

/** A layout bus envelope, as the coordinators and panels receive it. */
export interface LayoutEvent {
  channel?: string
  payload?: unknown
  sourcePanelId?: string | null
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function parseRoute(value: string): HostRoute {
  const hashAt = value.indexOf('#')
  const hash = hashAt >= 0 ? value.slice(hashAt) : ''
  const rest = hashAt >= 0 ? value.slice(0, hashAt) : value
  const queryAt = rest.indexOf('?')
  return {
    path: queryAt >= 0 ? rest.slice(0, queryAt) : rest,
    search: queryAt >= 0 ? rest.slice(queryAt) : '',
    hash,
  }
}

/** `/sessions` and `/sessions/...` only; `/sessionsX` is not a Sessions route. */
export function isSessionsPath(path: string): boolean {
  return path === '/sessions' || path.startsWith('/sessions/')
}

/**
 * The session id in a Sessions path. A segment that is not valid percent
 * encoding is returned as written: it still names a session route, so it must
 * never read as the blank `/sessions`.
 */
export function sessionIdFromPath(path: string): string {
  if (!path.startsWith('/sessions/')) return ''
  const encoded = path.slice('/sessions/'.length).split('/')[0] || ''
  try { return decodeURIComponent(encoded) } catch { return encoded }
}

/** The first path segment: the page section, `keeper` for `/keeper/x`, `` for `/`. */
export function pathSection(path: string): string {
  return path.split('/')[1] ?? ''
}

export function sessionPath(sessionId: string): string {
  return `/sessions/${encodeURIComponent(sessionId)}`
}

/** `/sessions?view=artifacts`: the cross-session gallery, which has no chat. */
export function isArtifactsView(route: HostRoute): boolean {
  return isSessionsPath(route.path)
    && !sessionIdFromPath(route.path)
    && new URLSearchParams(route.search).get('view') === 'artifacts'
}

/** The "new chat" route: Sessions with no session and no gallery view. */
export function isBareSessions(route: HostRoute): boolean {
  return isSessionsPath(route.path)
    && !sessionIdFromPath(route.path)
    && !isArtifactsView(route)
}

/**
 * The full route of the main panel while it shows the Kickside app page, or
 * null when another page (Keeper, Git) or nothing reportable is there.
 */
export function mainAppRoute(layout: LayoutLike | null | undefined): string | null {
  const main = layout?.panels?.[MAIN_PANEL_ID]
  if (!isRecord(main) || main.kind !== 'page' || main.id !== APP_PAGE_ID) return null
  return typeof main.route === 'string' && main.route.startsWith('/') ? main.route : null
}

/** The main panel shows the Kickside app page (whether or not it has reported a route). */
function mainIsAppPage(layout: LayoutLike | null | undefined): boolean {
  const main = layout?.panels?.[MAIN_PANEL_ID]
  return isRecord(main) && main.kind === 'page' && main.id === APP_PAGE_ID
}

/**
 * The app page is in `main` and shows a Sessions route. Before the page has
 * reported its first route the host path stands in, as it does everywhere else.
 */
export function appOwnsSessions(layout: LayoutLike | null | undefined, hostPath: string): boolean {
  if (!mainIsAppPage(layout)) return false
  return isSessionsPath(parseRoute(mainAppRoute(layout) ?? hostPath).path)
}

/**
 * Whether a `kickside:artifact-session` announcement may move the artifact
 * panel: only the current app page, while it shows Sessions. A retired or
 * foreign page must not. One rule, used by the coordinator and the panel.
 */
export function acceptsArtifactSession(
  sourcePanelId: string | null | undefined,
  layout: LayoutLike | null | undefined,
  hostPath: string,
): boolean {
  return sourcePanelId === MAIN_PANEL_ID && appOwnsSessions(layout, hostPath)
}

function findSlot(children: unknown, panelId: string): SlotLike | null {
  if (!Array.isArray(children)) return null
  for (const child of children) {
    if (!isRecord(child)) continue
    if (typeof child.panel === 'string') {
      if (child.panel === panelId) return child as unknown as SlotLike
      continue
    }
    const nested = findSlot(child.children, panelId)
    if (nested) return nested
  }
  return null
}

/** The layout name a breakpoint resolves to; unknown names use `default`. */
export function layoutName(layout: LayoutLike, breakpoint: string | undefined): string {
  return breakpoint && layout.layouts?.[breakpoint] ? breakpoint : 'default'
}

export function slotFor(layout: LayoutLike, breakpoint: string | undefined, panelId: string): SlotLike | null {
  const tree = layout.layouts?.[layoutName(layout, breakpoint)]
  return isRecord(tree) ? findSlot(tree.children, panelId) : null
}

export function isDrawerSlot(slot: SlotLike | null): boolean {
  return !!slot?.display && slot.display.startsWith('drawer-')
}

function drawerOpen(layout: LayoutLike, panelId: string): boolean {
  const panel = layout.panels?.[panelId]
  return isRecord(panel) && panel.drawerOpen === true
}

/** Whether the panel is shown in the given breakpoint's slot type. */
export function isPanelOpen(layout: LayoutLike, breakpoint: string | undefined, panelId: string): boolean {
  const slot = slotFor(layout, breakpoint, panelId)
  if (!slot) return false
  return isDrawerSlot(slot) ? drawerOpen(layout, panelId) : !slot.collapsed
}

/** True only for a panel whose active slot is a drawer that is open. */
export function isPanelDrawerOpen(layout: LayoutLike, breakpoint: string | undefined, panelId: string): boolean {
  return isDrawerSlot(slotFor(layout, breakpoint, panelId)) && drawerOpen(layout, panelId)
}

export function panelProps(layout: LayoutLike | null | undefined, panelId: string): Record<string, unknown> {
  const panel = layout?.panels?.[panelId]
  return isRecord(panel) && isRecord(panel.props) ? panel.props : {}
}

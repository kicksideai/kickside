// The host `chat` panel is a drawer on a narrow screen and a column on a wide
// one. The shell only cares about the drawer: an open chat drawer and the
// shell's own mobile drawers must not be open together.

export const HOST_CHAT_PANEL = 'chat'

interface LayoutSnapshotLike {
  layouts?: Record<string, unknown>
  panels?: Record<string, unknown>
  activeBreakpoint?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function findSlot(children: unknown, panelId: string): Record<string, unknown> | null {
  if (!Array.isArray(children)) return null
  for (const child of children) {
    if (!isRecord(child)) continue
    if (typeof child.panel === 'string') {
      if (child.panel === panelId) return child
      continue
    }
    const nested = findSlot(child.children, panelId)
    if (nested) return nested
  }
  return null
}

export function isChatDrawerOpen(snapshot: LayoutSnapshotLike | null | undefined): boolean {
  if (!snapshot?.layouts) return false
  const name = snapshot.activeBreakpoint && snapshot.layouts[snapshot.activeBreakpoint]
    ? snapshot.activeBreakpoint
    : 'default'
  const tree = snapshot.layouts[name]
  const slot = isRecord(tree) ? findSlot(tree.children, HOST_CHAT_PANEL) : null
  if (typeof slot?.display !== 'string' || !slot.display.startsWith('drawer-')) return false
  const panel = snapshot.panels?.[HOST_CHAT_PANEL]
  return isRecord(panel) && panel.drawerOpen === true
}

import { ref, type Ref } from 'vue'
import type { Connection } from '@vue-flow/core'
import type { RunRow } from '../api/api'
import type { CatalogItem } from '../catalog/catalog'

interface CanvasCreateMenuOptions {
  viewingRun: Ref<RunRow | null>
  catalog: Ref<CatalogItem[]>
  paletteOpen: Ref<boolean>
  screenToFlowCoordinate: (point: { x: number; y: number }) => { x: number; y: number }
  placeItem: (item: CatalogItem, at?: { x: number; y: number }) => string
  placeNote: (at?: { x: number; y: number }) => void
  placeFrame: (at?: { x: number; y: number }) => void
  focusPaletteSearch: () => void
  onConnect: (connection: Connection) => void
  settleConnectHint: () => void
}

export function useCanvasCreateMenu(options: CanvasCreateMenuOptions) {
  const {
    viewingRun, catalog, paletteOpen, screenToFlowCoordinate,
    placeItem, placeNote, placeFrame, focusPaletteSearch, onConnect, settleConnectHint,
  } = options
  const paneMenu = ref<{ x: number; y: number } | null>(null)
  const dropPicker = ref<{ x: number; y: number; source: string; sourceHandle?: string } | null>(null)
  let dragSource: { node: string; handle?: string } | null = null
  let dragConnected = false

  function openPaneMenu(event: MouseEvent) {
    if (viewingRun.value) return
    event.preventDefault()
    event.stopPropagation()
    paneMenu.value = { x: event.clientX, y: event.clientY }
  }
  function onPaneContextMenu(event: MouseEvent) { openPaneMenu(event) }
  function onNodeContextMenu(payload: { event: MouseEvent | TouchEvent; node: { id: string; type?: string } }) {
    // Touch has no right-click; only the mouse path opens the menu.
    if (!(payload.event instanceof MouseEvent)) return
    if (payload.node.type === 'wfFrame' || payload.node.type === 'wfNote') openPaneMenu(payload.event)
  }
  function closePaneMenu() { paneMenu.value = null }
  function menuFlowPos(): { x: number; y: number } {
    const menu = paneMenu.value
    if (!menu) return { x: 0, y: 0 }
    const point = screenToFlowCoordinate({ x: menu.x, y: menu.y })
    return { x: Math.round(point.x), y: Math.round(point.y) }
  }
  function menuAddStep() {
    closePaneMenu()
    paletteOpen.value = true
    focusPaletteSearch()
  }
  function menuAddNote() { const point = menuFlowPos(); closePaneMenu(); placeNote(point) }
  function menuAddFrame() { const point = menuFlowPos(); closePaneMenu(); placeFrame(point) }

  // A connection released on empty canvas offers step creation at the drop point,
  // pre-wired through the existing connect path.
  function onConnectStart(params: { nodeId?: string | null; handleId?: string | null; handleType?: string | null }) {
    dragConnected = false
    dragSource = params?.nodeId && params?.handleType === 'source'
      ? { node: params.nodeId, handle: params.handleId ?? undefined }
      : null
  }
  function handleConnect(connection: Connection) {
    dragConnected = true
    onConnect(connection)
  }
  function onConnectEnd(event?: MouseEvent | TouchEvent) {
    settleConnectHint()
    const source = dragSource
    dragSource = null
    if (dragConnected || !source || viewingRun.value) return
    if (!(event instanceof MouseEvent)) return
    const target = event.target as HTMLElement | null
    if (!target || !target.classList.contains('vue-flow__pane')) return
    dropPicker.value = { x: event.clientX, y: event.clientY, source: source.node, sourceHandle: source.handle }
  }
  function closeDropPicker() { dropPicker.value = null }
  function dropPickerPick(item: CatalogItem) {
    const picker = dropPicker.value
    if (!picker) return
    closeDropPicker()
    const point = screenToFlowCoordinate({ x: picker.x, y: picker.y })
    const id = placeItem(item, { x: Math.round(point.x), y: Math.round(point.y) })
    onConnect({ source: picker.source, sourceHandle: picker.sourceHandle ?? null, target: id, targetHandle: null } as Connection)
  }

  return {
    paneMenu, openPaneMenu, onPaneContextMenu, onNodeContextMenu, closePaneMenu, menuAddStep,
    menuAddNote, menuAddFrame, dropPicker, onConnectStart, onConnect: handleConnect,
    onConnectEnd, closeDropPicker, dropPickerPick,
  }
}

// Node/note/frame placement + drag-drop for the workflow canvas, extracted from
// WorkflowCanvas. Owns the click-to-place cascade and the canvas element ref; provides the
// note-resize seam. The doc/apply/select and VueFlow coordinate helpers are passed in.
import { provide, ref, type Ref } from 'vue'
import type { SyncEngine } from '../mapping/sync'
import { containerAt, nodeDimensionsFor, resolvePositions } from '../mapping/graph-sync'
import { cascadeOffset, CASCADE_WRAP, freePosition, freeRectPosition, type Rect } from '../mapping/placement'
import { PERSIST_NOTE_SIZE, type PersistNoteSize } from '../nodes/frame'
import type { CatalogItem } from '../catalog/catalog'
import * as C from '../api/commands'
import { planSplice } from './canvas-connect'

export interface PlacementCtx {
  engine: SyncEngine
  layoutDir: Ref<'TB' | 'LR'>
  apply: (cmds: C.Command[], refit?: boolean) => void
  select: (kind: 'node' | 'edge' | 'note', id: string) => void
  catalog: Ref<CatalogItem[]>
  getViewport: () => { x: number; y: number; zoom: number }
  screenToFlowCoordinate: (pos: { x: number; y: number }) => { x: number; y: number }
}

// The connection under a drop: VueFlow renders each edge as a group carrying its id, and the
// pointer lands on that group's wide interaction stroke.
export function edgeAt(target: EventTarget | null): string | null {
  const edge = target instanceof Element ? target.closest('.vue-flow__edge') : null
  return edge?.getAttribute('data-id') || null
}

export function useCanvasPlacement(ctx: PlacementCtx) {
  const { engine, layoutDir, apply, select, catalog, getViewport, screenToFlowCoordinate } = ctx

  const canvasEl = ref<HTMLElement | null>(null)
  function centerOfCanvas(): { x: number; y: number } {
    try {
      const vp = getViewport()
      const rect = canvasEl.value?.getBoundingClientRect()
      const cx = rect ? rect.width / 2 : 400
      const cy = rect ? rect.height / 2 : 260
      return { x: Math.round((cx - vp.x) / vp.zoom), y: Math.round((cy - vp.y) / vp.zoom) }
    } catch {
      return { x: 200, y: 160 }
    }
  }

  // Click-to-place cascades each new step off canvas centre so a run of placements
  // never stacks on one point. A drag-drop supplies its own drop point and resets the
  // cascade.
  const placeCascade = ref(0)
  // Every current node position, the anchors a new placement must not land on top of.
  function occupiedPoints(): { x: number; y: number }[] {
    return Object.values(resolvePositions(engine.doc, layoutDir.value))
  }
  function occupiedCards(positions = resolvePositions(engine.doc, layoutDir.value)): Rect[] {
    return Object.entries(positions).flatMap(([id, point]) => {
      const node = engine.doc.nodes[id]
      if (!node) return []
      const dimensions = nodeDimensionsFor(node)
      return [{ x: point.x, y: point.y, width: dimensions.width, height: dimensions.height }]
    })
  }
  function cascadedCenter(): { x: number; y: number } {
    const c = centerOfCanvas()
    const { dx, dy } = cascadeOffset(placeCascade.value)
    placeCascade.value = (placeCascade.value + 1) % CASCADE_WRAP
    return freePosition({ x: c.x + dx, y: c.y + dy }, occupiedPoints())
  }

  // Where a placed step lands in the graph. `edge` inserts it into that connection;
  // `bodyParent` drops it straight into a loop/parallel body, wired through the container's
  // `body` port in the same commit so releasing a step inside the box visibly joins the
  // repeated subgraph.
  interface PlaceInto { edge?: string; bodyParent?: string }

  function placeItem(item: CatalogItem, at?: { x: number; y: number }, into: PlaceInto = {}): string {
    const pos = at ? (placeCascade.value = 0, at) : cascadedCenter()
    const id = C.uid()
    const placement: C.Command[] = [
      C.addNode({
        id,
        kind: item.kind,
        title: item.title,
        ref: item.ref,
      }),
      C.setPosition(id, pos.x, pos.y),
    ]
    const spliced = into.edge ? planSplice(engine.doc, into.edge, id, placement, layoutDir.value) : null
    const cmds = spliced
      ?? (into.bodyParent
        ? [...placement, C.addEdge({ id: C.uid(), source_id: into.bodyParent, target_id: id, source_port: 'body' })]
        : placement)
    apply(cmds)
    select('node', id)
    return id
  }

  function placeNote(at?: { x: number; y: number }) {
    const pos = at ? (placeCascade.value = 0, at) : cascadedCenter()
    const id = C.uid()
    apply([C.addNote({ id, text: '' }), C.setPosition(id, pos.x, pos.y)])
    select('note', id)
  }

  // A frame opens larger than a note and seeds its size onto the layout row so it renders
  // at the intended dimensions before the first resize.
  function placeFrame(at?: { x: number; y: number }) {
    const pos = at ? (placeCascade.value = 0, at) : cascadedCenter()
    const id = C.uid()
    apply([
      C.addNote({ id, text: 'Frame', kind: 'frame', color: 'slate' }),
      C.setPosition(id, pos.x, pos.y, 420, 280),
    ])
    select('note', id)
  }

  // Resizing a note/frame commits its new geometry through the same layout position path
  // a drag uses; the echo suppresses the broadcast round-trip from jumping the local box.
  const persistNoteSize: PersistNoteSize = (id, x, y, width, height) => {
    engine.recordLayoutEcho(id, x, y)
    apply([C.setPosition(id, x, y, width, height)])
  }
  provide(PERSIST_NOTE_SIZE, persistNoteSize)

  function onDrop(e: DragEvent) {
    e.preventDefault()
    const paletteId = e.dataTransfer?.getData('application/wf-item')
    if (!paletteId) return
    let pos = { x: 200, y: 160 }
    try {
      pos = screenToFlowCoordinate({ x: e.clientX, y: e.clientY })
    } catch { /* fall back to default */ }
    if (paletteId === 'note:new') {
      placeNote(pos)
      return
    }
    if (paletteId === 'frame:new') {
      placeFrame(pos)
      return
    }
    const item = catalog.value.find((it) => it.paletteId === paletteId)
    if (!item) return
    // A step released on a connection is inserted into it; one released inside a
    // loop/parallel box joins that body (its position is kept so it lands where dropped); a
    // drop that lands on an existing node nudges off it.
    const positions = resolvePositions(engine.doc, layoutDir.value)
    const parent = containerAt(engine.doc, pos, positions)
    const dimensions = nodeDimensionsFor({ id: '', kind: item.kind, title: item.title })
    const at = parent ? pos : freeRectPosition(pos, dimensions, occupiedCards(positions))
    placeItem(item, at, { edge: edgeAt(e.target) ?? undefined, bodyParent: parent || undefined })
  }
  function onDragOver(e: DragEvent) {
    e.preventDefault()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
  }

  return { canvasEl, placeItem, placeNote, placeFrame, onDrop, onDragOver }
}

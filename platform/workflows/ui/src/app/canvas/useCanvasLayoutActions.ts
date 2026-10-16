import type { Ref } from 'vue'
import type { NodeDragEvent } from '@vue-flow/core'
import type { SyncEngine } from '../mapping/sync'
import { autoLayout, clampRegionFor, clampToRegion, deriveContainers, nodeDimensionsFor, resolvePositions } from '../mapping/graph-sync'
import { READABLE_FIT_MIN_ZOOM } from './canvas-fit'
import type { RunRow } from '../api/api'
import * as C from '../api/commands'

interface CanvasLayoutActionsOptions {
  engine: SyncEngine
  layoutDir: Ref<'TB' | 'LR'>
  viewingRun: Ref<RunRow | null>
  canvasEl: Ref<HTMLElement | null>
  apply: (commands: C.Command[], refit?: boolean) => Promise<void> | void
  prepareCanvasAction: () => Promise<boolean>
  fitView: (options?: any) => void
  canvasFitOptions: (duration?: number) => any
}

export function useCanvasLayoutActions(options: CanvasLayoutActionsOptions) {
  const { engine, layoutDir, viewingRun, canvasEl, apply, prepareCanvasAction, fitView, canvasFitOptions } = options

  function onNodeDragStop(event: NodeDragEvent) {
    const moved = event.nodes?.length ? event.nodes : [event.node]
    const positions = resolvePositions(engine.doc, layoutDir.value)
    const { parentOf, containers } = deriveContainers(engine.doc, positions)
    const commands: C.Command[] = []
    for (const node of moved) {
      if (!node) continue
      let { x, y } = node.position
      // A body member stays within its container's extent until disconnected from the body.
      const parent = parentOf[String(node.id)]
      if (parent) {
        const container = containers.find((item) => item.id === parent)
        if (container) {
          const region = clampRegionFor(engine.doc, parent, container.members, positions, String(node.id))
          const documentNode = engine.doc.nodes[String(node.id)]
          ;({ x, y } = clampToRegion(x, y, region, documentNode ? nodeDimensionsFor(documentNode) : undefined))
        }
      }
      engine.recordLayoutEcho(String(node.id), x, y)
      commands.push(C.setPosition(String(node.id), x, y))
    }
    apply(commands)
  }

  async function runAutoLayout(direction = engine.doc.direction) {
    if (viewingRun.value) return
    await prepareCanvasAction()
    const rect = canvasEl.value?.getBoundingClientRect()
    const positions = autoLayout(engine.doc, direction, rect ? {
      width: rect.width, height: rect.height, minZoom: READABLE_FIT_MIN_ZOOM,
    } : undefined)
    const commands = Object.entries(positions).map(([id, point]) => C.setPosition(id, point.x, point.y))
    if (direction !== engine.doc.direction) commands.unshift(C.setDirection(direction))
    if (commands.length) await apply(commands, true)
  }

  function toggleDir() {
    void runAutoLayout(engine.doc.direction === 'TB' ? 'LR' : 'TB')
  }

  async function fit() {
    // Closing the compact overlay triggers the canonical post-rail double-rAF fit.
    // Return before fitting against an occluded width and showing a second jump.
    await prepareCanvasAction()
    try { fitView(canvasFitOptions()) } catch { /* no-op */ }
  }

  return { onNodeDragStop, runAutoLayout, toggleDir, fit }
}

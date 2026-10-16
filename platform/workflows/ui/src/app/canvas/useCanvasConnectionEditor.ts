import { computed, ref, type Ref } from 'vue'
import type { Connection } from '@vue-flow/core'
import type { SyncEngine } from '../mapping/sync'
import { nodeDeclaresFailedPort, nodeOutPorts } from '../mapping/graph-sync'
import { FAILED_PORT } from '../domain/node-policy'
import { humanTitle } from '../domain/labels'
import { buildConnectionEdgeOptions, type ConnectionEdgeOption, type ConnectionRequest, type ConnectionSourceOption, type ConnectionTargetOption } from './connection-editor'

interface CanvasConnectionEditorOptions {
  engine: SyncEngine
  revision: Ref<number>
  layoutDir: Ref<'TB' | 'LR'>
  clearIntentOverlays: () => void
  rememberOverlayInvoker: (fallback?: HTMLElement | null) => void
  restoreOverlayFocusFallback: () => Promise<void>
  onConnect: (connection: Connection) => void
}

export function useCanvasConnectionEditor(options: CanvasConnectionEditorOptions) {
  const { engine, revision, layoutDir, clearIntentOverlays, rememberOverlayInvoker, restoreOverlayFocusFallback, onConnect } = options
  const connectionsOpen = ref(false)

  const connectionSources = computed<ConnectionSourceOption[]>(() => {
    void revision.value
    const result: ConnectionSourceOption[] = []
    for (const node of Object.values(engine.doc.nodes)) {
      if (node.kind === 'finish' || node.kind === 'error') continue
      const title = humanTitle(node.title, node.ref)
      const ports = nodeOutPorts(node)
      const named = ports.length > 1 || (ports[0]?.id ?? '') !== ''
      for (const port of ports) {
        const handle = named ? port.id : (layoutDir.value === 'LR' ? 'out-right' : 'out-bottom')
        result.push({
          key: JSON.stringify([node.id, handle]),
          nodeId: node.id,
          handle,
          label: `${title} — ${port.label || 'Output'}`,
        })
      }
      if (nodeDeclaresFailedPort(node)) {
        result.push({
          key: JSON.stringify([node.id, FAILED_PORT.id]),
          nodeId: node.id,
          handle: FAILED_PORT.id,
          label: `${title} — ${FAILED_PORT.label}`,
        })
      }
    }
    return result
  })
  const connectionTargets = computed<ConnectionTargetOption[]>(() => {
    void revision.value
    return Object.values(engine.doc.nodes)
      .filter((node) => node.kind !== 'start')
      .map((node) => ({ nodeId: node.id, label: humanTitle(node.title, node.ref) }))
  })
  const connectionEdges = computed<ConnectionEdgeOption[]>(() => {
    void revision.value
    return buildConnectionEdgeOptions(engine.doc)
  })
  const connectionTargetHandle = computed(() => layoutDir.value === 'LR' ? 'in-left' : 'in-top')

  function openConnections(invoker: HTMLElement | null = null) {
    clearIntentOverlays()
    rememberOverlayInvoker(invoker)
    connectionsOpen.value = true
  }
  function closeConnections() {
    connectionsOpen.value = false
    void restoreOverlayFocusFallback()
  }
  function createConnection(request: ConnectionRequest) {
    onConnect(request as Connection)
  }

  return {
    connectionsOpen, connectionSources, connectionTargets, connectionEdges, connectionTargetHandle,
    openConnections, closeConnections, createConnection,
  }
}

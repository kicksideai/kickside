// @vitest-environment happy-dom
import { afterEach, describe, it, expect } from 'vitest'
import { defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useCanvasPlacement } from './canvas-placement'
import { SyncEngine, emptyDoc, foldCommands } from '../mapping/sync'
import { registerBlocks } from '../domain/node-policy'
import type { CatalogItem } from '../catalog/catalog'
import type { WfDoc, WfNode, WfEdge } from '../types'
import { CMD } from '../types'
import type * as C from '../api/commands'

// A palette drop is the primary "add a step" gesture. Released on an existing connection it
// inserts the step into that connection; released anywhere else it places a free step.

const RUN_CODE = 'test:block.run_code'

const runCode: CatalogItem = {
  paletteId: `block:${RUN_CODE}`, kind: 'block', category: 'Logic', title: 'Run Code', subtitle: '', icon: 'tabler:code', ref: RUN_CODE,
}
const loop: CatalogItem = { paletteId: 'kind:cycle', kind: 'cycle', category: 'Logic', title: 'Loop', subtitle: '', icon: 'tabler:rotate' }
const finish: CatalogItem = { paletteId: 'kind:finish', kind: 'finish', category: 'Structure', title: 'Finish', subtitle: '', icon: 'tabler:circle-check' }

function startFinishEngine(): SyncEngine {
  const engine = new SyncEngine()
  engine.doc = emptyDoc()
  engine.doc.nodes = {
    start: { id: 'start', kind: 'start', title: 'Start' } as WfNode,
    finish: { id: 'finish', kind: 'finish', title: 'Finish' } as WfNode,
  }
  engine.doc.edges = {
    'e-sf': { id: 'e-sf', source_id: 'start', target_id: 'finish', source_port: 'out', target_port: 'in' } as WfEdge,
  }
  engine.doc.positions = { start: { x: 0, y: 0 }, finish: { x: 0, y: 400 } }
  return engine
}

function mountPlacement(engine: SyncEngine, catalog: CatalogItem[]) {
  const batches: C.Command[][] = []
  const selected: Array<{ kind: string; id: string }> = []
  const Harness = defineComponent({
    template: '<div />',
    setup() {
      return useCanvasPlacement({
        engine,
        layoutDir: ref<'TB' | 'LR'>('TB'),
        apply: (cmds) => {
          batches.push(cmds)
          foldCommands(engine.doc, cmds)
        },
        select: (kind, id) => { selected.push({ kind, id }) },
        catalog: ref(catalog),
        getViewport: () => ({ x: 0, y: 0, zoom: 1 }),
        screenToFlowCoordinate: (pos) => pos,
      })
    },
  })
  const wrapper = mount(Harness)
  const onDrop = (wrapper.vm as unknown as { onDrop: (e: DragEvent) => void }).onDrop
  return { onDrop, batches, selected }
}

// The rendered connector exactly as VueFlow draws it: a group carrying the edge id, whose
// wide transparent interaction stroke is what the pointer lands on.
function renderedEdge(edgeId: string): Element {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  group.setAttribute('class', 'vue-flow__edge vue-flow__edge-mapping-completeness')
  group.setAttribute('data-id', edgeId)
  const hit = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  hit.setAttribute('class', 'vue-flow__edge-interaction')
  group.appendChild(hit)
  svg.appendChild(group)
  document.body.appendChild(svg)
  return hit
}

function paletteDrop(item: CatalogItem, target: EventTarget, at = { x: 40, y: 200 }): DragEvent {
  return {
    preventDefault: () => {},
    dataTransfer: { getData: (type: string) => (type === 'application/wf-item' ? item.paletteId : '') },
    clientX: at.x,
    clientY: at.y,
    target,
  } as unknown as DragEvent
}

function wiring(doc: WfDoc): string[] {
  return Object.values(doc.edges)
    .map((e) => `${e.source_id}:${e.source_port ?? ''}->${e.target_id}:${e.target_port ?? ''}`)
    .sort()
}

function addedNodeId(batch: C.Command[]): string {
  const add = batch.find((c) => c.type === CMD.NODE_ADD)
  expect(add).toBeTruthy()
  return String(add!.body.id)
}

afterEach(() => {
  document.body.innerHTML = ''
  registerBlocks([])
})

describe('palette drop onto a connection', () => {
  it('inserts the step into the connection in one batch: Start -> step -> Finish', () => {
    registerBlocks([{
      id: RUN_CODE, label: 'Run Code',
      ports: [{ id: 'result', label: 'Result', direction: 'out' }, { id: 'error', label: 'Error', direction: 'out' }],
    }])
    const engine = startFinishEngine()
    const { onDrop, batches, selected } = mountPlacement(engine, [runCode])

    onDrop(paletteDrop(runCode, renderedEdge('e-sf')))

    expect(batches).toHaveLength(1)
    const id = addedNodeId(batches[0])
    expect(batches[0]).toContainEqual({ type: CMD.EDGE_REMOVE, body: { id: 'e-sf' } })
    expect(engine.doc.edges['e-sf']).toBeUndefined()
    expect(wiring(engine.doc)).toEqual([
      `${id}:result->finish:in`,
      `start:out->${id}:`,
    ].sort())
    expect(selected).toEqual([{ kind: 'node', id }])
  })

  it('continues a spliced loop from its exit port, never from its body', () => {
    const engine = startFinishEngine()
    const { onDrop, batches } = mountPlacement(engine, [loop])

    onDrop(paletteDrop(loop, renderedEdge('e-sf')))

    const id = addedNodeId(batches[0])
    expect(wiring(engine.doc)).toEqual([
      `${id}:done->finish:in`,
      `start:out->${id}:`,
    ].sort())
  })

  it('places a boundary step dropped on a connection without rewiring it', () => {
    const engine = startFinishEngine()
    const { onDrop, batches } = mountPlacement(engine, [finish])

    onDrop(paletteDrop(finish, renderedEdge('e-sf')))

    expect(batches).toHaveLength(1)
    expect(batches[0].some((c) => c.type === CMD.EDGE_REMOVE)).toBe(false)
    expect(wiring(engine.doc)).toEqual(['start:out->finish:in'])
  })

  it('places a free step when the drop lands off every connection', () => {
    const engine = startFinishEngine()
    const { onDrop, batches } = mountPlacement(engine, [runCode])
    const pane = document.createElement('div')
    pane.className = 'vue-flow__pane'
    document.body.appendChild(pane)

    onDrop(paletteDrop(runCode, pane, { x: 600, y: 200 }))

    expect(batches).toHaveLength(1)
    expect(batches[0].map((c) => c.type)).toEqual([CMD.NODE_ADD, CMD.LAYOUT_SET_POSITION])
    expect(wiring(engine.doc)).toEqual(['start:out->finish:in'])
  })
})

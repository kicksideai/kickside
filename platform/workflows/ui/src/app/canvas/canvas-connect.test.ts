// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { planConnect, planSplice, useCanvasConnect } from './canvas-connect'
import * as C from '../api/commands'
import type { WfDoc, WfNode, WfEdge } from '../types'
import { CMD } from '../types'
import { registerBlocks } from '../domain/node-policy'
import { SyncEngine, emptyDoc } from '../mapping/sync'
import type { RunRow } from '../api/api'

// planConnect is the pure heart of the on-connect flow (W11.1): given the doc and a landed
// connection it builds the command batch and classifies the edge as plain / auto / ambiguous.
// Testing it here proves the flow decision without mounting the canvas.

function doc(nodes: WfNode[], edges: WfEdge[] = []): WfDoc {
  return {
    nodes: Object.fromEntries(nodes.map((n) => [n.id, n])),
    edges: Object.fromEntries(edges.map((e) => [e.id, e])),
    notes: {},
    positions: {},
    viewport: null, direction: 'TB',
    params: {}, labels: [],
    headSeq: 0,
    definitionEditSeq: 0,
    canUndo: false,
    canRedo: false,
  }
}

const conn = (source: string, target: string) => ({
  source, target, sourceHandle: 'out-bottom', targetHandle: 'in-top',
})

const objSchema = (properties: Record<string, unknown>, required: string[] = []) => ({ type: 'object', required, properties })

describe('planConnect', () => {
  it('refuses a structurally illegal drop (self-loop) with null', () => {
    const d = doc([{ id: 'a', kind: 'block', title: 'A' }])
    expect(planConnect(d, conn('a', 'a'), 'TB')).toBeNull()
  })

  it('refuses a duplicate connection with null', () => {
    const d = doc(
      [{ id: 'a', kind: 'block', title: 'A' }, { id: 'b', kind: 'block', title: 'B' }],
      [{ id: 'e1', source_id: 'a', target_id: 'b', source_port: 'out-bottom', target_port: 'in-top' }],
    )
    expect(planConnect(d, conn('a', 'b'), 'TB')).toBeNull()
  })

  it('applies an obvious mapping silently (auto): addEdge + the transform update', () => {
    const d = doc([
      { id: 'a', kind: 'block', title: 'A', output_schema: objSchema({ email: { type: 'string' }, name: { type: 'string' } }) },
      { id: 'b', kind: 'block', title: 'B', input_schema: objSchema({ email: { type: 'string' } }, ['email']) },
    ])
    const plan = planConnect(d, conn('a', 'b'), 'TB')
    expect(plan).not.toBeNull()
    expect(plan!.action).toBe('auto')
    const add = plan!.cmds.find((c) => c.type === CMD.EDGE_ADD)
    const upd = plan!.cmds.find((c) => c.type === CMD.EDGE_UPDATE)
    expect(add).toBeTruthy()
    expect(add?.body.source_port).toBeUndefined()
    expect(add?.body.target_port).toBeUndefined()
    expect(upd?.body.transform).toBe('{ email: output.email }')
    expect(upd?.body.id).toBe(plan!.edgeId)
  })

  it('persists declared routes while discarding canvas-only handle ids', () => {
    const d = doc([
      { id: 'a', kind: 'branch', title: 'A' },
      { id: 'b', kind: 'block', ref: 'app:block.engine_linear', title: 'B' },
    ])
    const plan = planConnect(d, { source: 'a', target: 'b', sourceHandle: 'true', targetHandle: 'in-top' }, 'TB')!
    const add = plan.cmds.find((c) => c.type === CMD.EDGE_ADD)
    expect(add?.body.source_port).toBe('true')
    expect(add?.body.target_port).toBeUndefined()
  })

  it('uses a just-edited Start contract immediately when connecting to a tool', () => {
    const query = objSchema({ query: { type: 'string' } }, ['query'])
    const d = doc([
      {
        id: 'start', kind: 'start', title: 'Start',
        config: { input_schema: query },
        // The decorated snapshot still carries the old projection until a reload.
        output_schema: objSchema({}),
      },
      { id: 'search', kind: 'block', title: 'Google Search', input_schema: query },
    ])
    const plan = planConnect(d, conn('start', 'search'), 'TB')!
    expect(plan.action).toBe('auto')
    expect(plan.cmds.find((c) => c.type === CMD.EDGE_ADD)?.body.source_port).toBe('out')
    expect(plan.sourceSchema).toEqual(query)
    expect(plan.cmds.find((c) => c.type === CMD.EDGE_UPDATE)?.body.transform)
      .toBe('{ query: output.query }')
  })

  it('connects both edges of a declared review step without inventing contracts', () => {
    const event = objSchema({ record_id: { type: 'string' }, object_type: { type: 'string' }, values: { type: 'object' } }, ['record_id', 'object_type'])
    const decision = objSchema({ outcome: { type: 'string', enum: ['approve', 'reject'] }, form: { type: 'object' } }, ['outcome'])
    const d = doc([
      { id: 'start', kind: 'start', title: 'Record created', config: { input_schema: event } },
      { id: 'review', kind: 'block', ref: 'test:block.review', title: 'Review new record', input_schema: event, output_schema: decision },
      { id: 'finish', kind: 'finish', title: 'Reviewed', config: { output_schema: decision } },
    ])
    const intoReview = planConnect(d, conn('start', 'review'), 'TB')!
    expect(intoReview.targetSchema).toEqual(event)
    expect(intoReview.action).toBe('auto')
    expect(intoReview.result.unresolved).toEqual([])

    const intoFinish = planConnect(d, conn('review', 'finish'), 'TB')!
    expect(intoFinish.cmds.find((c) => c.type === CMD.EDGE_ADD)?.body.target_port).toBe('in')
    expect(intoFinish.sourceSchema).toEqual(decision)
    expect(intoFinish.targetSchema).toEqual(decision)
    expect(intoFinish.action).toBe('auto')
    expect(intoFinish.result.unresolved).toEqual([])
  })

  it('uses the declared schema of the exact intrinsic output port', () => {
    const result = objSchema({ query: { type: 'string' } }, ['query'])
    registerBlocks([{
      id: 'test:block.search_router', label: 'Search router',
      output_schema: objSchema({ unrelated: { type: 'number' } }),
      ports: [{ id: 'search', label: 'Search', direction: 'out', schema: result }],
    }])
    const d = doc([
      { id: 'router', kind: 'block', ref: 'test:block.search_router', title: 'Search router' },
      { id: 'search', kind: 'block', title: 'Google Search', input_schema: result },
    ])
    const plan = planConnect(d, { source: 'router', target: 'search', sourceHandle: 'search', targetHandle: 'in-top' }, 'TB')!
    expect(plan.action).toBe('auto')
    expect(plan.sourceSchema).toEqual(result)
    expect(plan.cmds.find((c) => c.type === CMD.EDGE_UPDATE)?.body.transform)
      .toBe('{ query: output.query }')
  })

  it('drops an ambiguous edge into pending: addEdge only, no transform, blockers named', () => {
    const d = doc([
      { id: 'a', kind: 'block', title: 'A', output_schema: objSchema({ name: { type: 'string' } }) },
      { id: 'b', kind: 'block', title: 'B', input_schema: objSchema({ id: { type: 'string' }, name: { type: 'string' } }, ['id']) },
    ])
    const plan = planConnect(d, conn('a', 'b'), 'TB')!
    expect(plan.action).toBe('ambiguous')
    expect(plan.cmds.some((c) => c.type === CMD.EDGE_UPDATE)).toBe(false)
    expect(plan.result.unresolved.map((u) => u.key)).toEqual(['id'])
  })

  it('keeps a schema-less logic step transparent', () => {
    const d = doc([
      { id: 'a', kind: 'block', title: 'A', output_schema: objSchema({ email: { type: 'string' } }) },
      { id: 'b', kind: 'combine', title: 'Combine' },
    ])
    const plan = planConnect(d, conn('a', 'b'), 'TB')!
    expect(plan.action).toBe('plain')
    expect(plan.cmds).toHaveLength(1)
    expect(plan.cmds[0].type).toBe(CMD.EDGE_ADD)
  })

  it('keeps a callable step with a missing contract loud instead of pretending no mapping is needed', () => {
    const d = doc([
      { id: 'start', kind: 'start', title: 'Start', config: { input_schema: objSchema({ query: { type: 'string' } }, ['query']) } },
      { id: 'search', kind: 'block', title: 'Google Search', ref: 'tools:google' },
    ])
    const plan = planConnect(d, conn('start', 'search'), 'TB')!
    expect(plan.action).toBe('contract-unavailable')
    expect(plan.cmds).toHaveLength(1)
  })

  it('adopts a declared step output into an empty Finish without opening mapping', () => {
    const result = objSchema({ items: { type: 'array' } }, ['items'])
    const empty = objSchema({})
    const d = doc([
      { id: 'search', kind: 'block', title: 'Google Search', output_schema: result },
      { id: 'finish', kind: 'finish', title: 'Finish', config: { output_schema: empty }, input_schema: empty },
    ])
    const plan = planConnect(d, conn('search', 'finish'), 'TB')!
    expect(plan.action).toBe('adopt-finish')
    expect(plan.cmds.find((c) => c.type === CMD.NODE_UPDATE)?.body).toEqual({
      id: 'finish', config: { output_schema: result },
    })
    expect(plan.cmds.some((c) => c.type === CMD.EDGE_UPDATE)).toBe(false)
  })
})

// isValidConnection is a VueFlow hook reused two ways: VueFlow calls it for a live
// interactive drag (a bare Connection, no id) AND to re-validate every already-stored edge
// whenever v-model:edges is set — every rebuild, keyed off the edge's own id. Refusing
// unconditionally while viewing a past run (read-only) rejected every stored edge from the
// second path, so a run view rendered with zero edges even though the definition has them.
describe('useCanvasConnect isValidConnection', () => {
  function mountHarness(viewingRunInitial: RunRow | null) {
    const engine = new SyncEngine()
    engine.doc = emptyDoc()
    engine.doc.nodes = {
      a: { id: 'a', kind: 'block', title: 'A' } as WfNode,
      b: { id: 'b', kind: 'block', title: 'B' } as WfNode,
    }
    const viewingRun = ref<RunRow | null>(viewingRunInitial)
    const Harness = defineComponent({
      template: '<div />',
      setup() {
        return useCanvasConnect({
          engine, apply: () => {}, select: () => {}, layoutDir: ref('TB'), viewingRun,
        })
      },
    })
    return mount(Harness)
  }

  it('accepts an already-stored edge (carries an id) even while viewing a read-only run', () => {
    const wrapper = mountHarness({ run_id: 'r1' } as unknown as RunRow)
    const isValidConnection = (wrapper.vm as unknown as { isValidConnection: (c: unknown) => boolean }).isValidConnection
    const storedEdge = { id: 'e1', source: 'a', target: 'b', sourceHandle: 'out-bottom', targetHandle: 'in-top' }
    expect(isValidConnection(storedEdge)).toBe(true)
  })

  it('still refuses a fresh interactive drag (no id) while viewing a read-only run', () => {
    const wrapper = mountHarness({ run_id: 'r1' } as unknown as RunRow)
    const isValidConnection = (wrapper.vm as unknown as { isValidConnection: (c: unknown) => boolean }).isValidConnection
    const liveDrag = { source: 'a', target: 'b', sourceHandle: 'out-bottom', targetHandle: 'in-top' }
    expect(isValidConnection(liveDrag)).toBe(false)
  })

  it('keeps validating a fresh interactive drag by its compatibility when not viewing a run', () => {
    const wrapper = mountHarness(null)
    const isValidConnection = (wrapper.vm as unknown as { isValidConnection: (c: unknown) => boolean }).isValidConnection
    const liveDrag = { source: 'a', target: 'a', sourceHandle: 'out-bottom', targetHandle: 'in-top' }
    expect(isValidConnection(liveDrag)).toBe(false)
    const legalDrag = { source: 'a', target: 'b', sourceHandle: 'out-bottom', targetHandle: 'in-top' }
    expect(isValidConnection(legalDrag)).toBe(true)
  })
})

describe('planSplice', () => {
  const placement = (id: string) => [C.addNode({ id, kind: 'block', title: 'Step' }), C.setPosition(id, 0, 200)]

  it('replaces the connection with two legs through the step and leaves the doc untouched', () => {
    const d = doc(
      [
        { id: 'a', kind: 'block', title: 'A', output_schema: objSchema({ email: { type: 'string' } }) },
        { id: 'b', kind: 'block', title: 'B', input_schema: objSchema({ email: { type: 'string' } }, ['email']) },
      ],
      [{ id: 'ab', source_id: 'a', target_id: 'b' }],
    )
    const cmds = planSplice(d, 'ab', 'step', placement('step'), 'TB')!
    const adds = cmds.filter((c) => c.type === CMD.EDGE_ADD).map((c) => `${c.body.source_id}->${c.body.target_id}`)
    expect(cmds.slice(0, 3).map((c) => c.type)).toEqual([CMD.NODE_ADD, CMD.LAYOUT_SET_POSITION, CMD.EDGE_REMOVE])
    expect(adds).toEqual(['a->step', 'step->b'])
    expect(d.edges.ab).toBeTruthy()
    expect(d.nodes.step).toBeUndefined()
  })

  it('refuses a connection the doc no longer carries', () => {
    const d = doc([{ id: 'a', kind: 'block', title: 'A' }, { id: 'b', kind: 'block', title: 'B' }])
    expect(planSplice(d, 'gone', 'step', placement('step'), 'TB')).toBeNull()
  })
})

// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import { SyncEngine } from '../mapping/sync'
import type { ApplyResult } from '../types'
import type { Command } from '../api/commands'
import { workflowEdits } from './workflow-edits'
import { useCanvasAuthoring } from './use-canvas-authoring'
import NodeConfigPanel from '../panels/NodeConfigPanel.vue'
import { registerBlocks } from '../domain/node-policy'
import WcMount from '@widgets/app/WcMount.vue'

vi.mock('@wippy-fe/proxy', () => ({ api: { get: vi.fn(async () => ({ data: {} })) }, loadByTagName: vi.fn(async () => {}) }))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<i />' } }))
vi.mock('@widgets/app/WcMount.vue', () => ({ default: { name: 'WcMount', props: ['config'], emits: ['change'], template: '<div />' } }))

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(done => { resolve = done })
  return { promise, resolve }
}

it('keeps rapid block edits visible through older HTTP and realtime echoes, and persists them in order', async () => {
  registerBlocks([{ id: 'fixture:block', label: 'Block', config_schema: { type: 'object', properties: { a: { type: 'string' }, b: { type: 'string' } } } }])
  const engine = new SyncEngine()
  engine.reset({ nodes: [{ id: 'n', kind: 'block', ref: 'fixture:block', title: 'Block', config: { a: '', b: '' } }], head_seq: 10 })
  const first = deferred<ApplyResult>()
  const second = deferred<ApplyResult>()
  const requests: Command[][] = []
  const request = vi.fn((commands: Command[]) => {
    requests.push(commands)
    return requests.length === 1 ? first.promise : second.promise
  })
  const revision = ref(0)
  const apply = workflowEdits({ engine, request, rebuild: () => { revision.value++ }, recover: vi.fn() })
  const wrapper = mount(defineComponent({ setup() {
    const author = useCanvasAuthoring({ doc: () => engine.doc, revision, readOnly: () => false, apply,
      openInspector: vi.fn(), reportError: vi.fn(), confirmNodeRemoval: vi.fn() })
    author.select('node', 'n')
    return () => h(NodeConfigPanel, { workflowId: 'wf', node: author.selectedNode.value, edge: null, note: null, catalog: [], onUpdateNode: author.updateNode })
  } }), { global: { stubs: { ConfigAssist: true } } })
  const form = wrapper.getComponent(WcMount)
  // A second edit while the first request is in flight and the panel
  // still has the first render’s props.
  form.vm.$emit('change', { a: 'one' })
  await Promise.resolve()
  form.vm.$emit('change', { b: 'two' })
  expect(engine.doc.nodes.n.config).toEqual({ a: 'one', b: 'two' })
  await Promise.resolve()
  const echo = { seq: 11, type: 'kickside.workflows.events:node.updated', body: { id: 'n', config: { a: 'one', b: '' } } }
  engine.ingest([echo])
  revision.value++
  expect(engine.doc.nodes.n.config).toEqual({ a: 'one', b: 'two' })
  first.resolve({ events: [echo], head_seq: 11, can_undo: true, can_redo: false })
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
  expect(engine.doc.nodes.n.config).toEqual({ a: 'one', b: 'two' })
  expect(requests).toHaveLength(2)
  const config = requests[1][0].body.config
  expect(config).toEqual({ a: 'one', b: 'two' })
  second.resolve({ events: [{ seq: 12, type: 'kickside.workflows.events:node.updated', body: { id: 'n', config } }], head_seq: 12, can_undo: true, can_redo: false })
  await Promise.resolve()
  await Promise.resolve()
  expect(engine.doc.nodes.n.config).toEqual({ a: 'one', b: 'two' })
  expect(engine.doc.headSeq).toBe(12)
  wrapper.unmount()
})

it('retains the latest same-field edit when an earlier sequenced echo arrives', async () => {
  const engine = new SyncEngine()
  engine.reset({ nodes: [{ id: 'n', kind: 'block', title: 'Block', config: { text: '' } }], head_seq: 10 })
  const response = deferred<ApplyResult>()
  const apply = workflowEdits({ engine, request: () => response.promise, rebuild: vi.fn(), recover: vi.fn() })
  void apply([{ type: 'node.update', body: { id: 'n', config: { text: 'a' } } }])
  void apply([{ type: 'node.update', body: { id: 'n', config: { text: 'ab' } } }])
  engine.ingest([{ seq: 11, type: 'kickside.workflows.events:node.updated', body: { id: 'n', config: { text: 'a' } } }])
  expect(engine.doc.nodes.n.config).toEqual({ text: 'ab' })
})

describe('response ordering', () => {
  it('keeps history cursors from the newest revision when an older response arrives last', () => {
    const engine = new SyncEngine()
    engine.reset({ head_seq: 10 })
    engine.applyResponse({ events: [], head_seq: 12, can_undo: true, can_redo: false })
    engine.applyResponse({ events: [], head_seq: 11, can_undo: false, can_redo: true })
    expect(engine.doc.canUndo).toBe(true)
    expect(engine.doc.canRedo).toBe(false)
  })
})


it('confirms a staged layout save even when its realtime echo is visually suppressed', async () => {
  const engine = new SyncEngine()
  engine.reset({ nodes: [{ id: 'n', kind: 'block', title: 'Block' }], layout: { positions: { n: { x: 0, y: 0 } } }, head_seq: 10 })
  const result = deferred<ApplyResult>()
  const apply = workflowEdits({ engine, request: () => result.promise, rebuild: vi.fn(), recover: vi.fn() })
  engine.recordLayoutEcho('n', 100, 200)
  const done = apply([{ type: 'layout.set-position', body: { node_id: 'n', x: 100, y: 200 } }])
  const echo = { seq: 11, type: 'kickside.workflows.events:layout.position-set', body: { node_id: 'n', x: 100, y: 200 } }
  engine.ingest([echo])
  result.resolve({ events: [echo], head_seq: 11, can_undo: true, can_redo: false })
  await done
  expect(engine.doc.positions.n).toEqual({ x: 100, y: 200 })
})

it.each(['http-first', 'realtime-first'] as const)('keeps a palette add after acknowledgement (%s)', async (order) => {
  const engine = new SyncEngine()
  engine.reset({ nodes: [{ id: 's', kind: 'start', title: 'Start' }], head_seq: 6 })
  const result = deferred<ApplyResult>()
  const apply = workflowEdits({ engine, request: () => result.promise, rebuild: vi.fn(), recover: vi.fn() })
  const done = apply([
    { type: 'node.add', body: { id: 'n', kind: 'branch', title: 'Condition' } },
    { type: 'layout.set-position', body: { node_id: 'n', x: 499, y: 304 } },
  ])
  const events = [
    { seq: 7, type: 'kickside.workflows.events:node.added', body: { id: 'n', kind: 'branch', title: 'Condition' } },
    { seq: 8, type: 'kickside.workflows.events:layout.position-set', body: { node_id: 'n', x: 499, y: 304 } },
  ]
  expect(engine.doc.nodes.n).toBeDefined()
  if (order === 'realtime-first') {
    expect(engine.ingest(events).needsRefetch).toBe(false)
    engine.ingest(events)
  }
  result.resolve({ events, head_seq: 8, can_undo: true, can_redo: false })
  await done
  if (order === 'http-first') engine.ingest(events)
  expect(engine.doc.nodes.n).toMatchObject({ kind: 'branch', title: 'Condition' })
  expect(engine.doc.positions.n).toEqual({ x: 499, y: 304 })
  expect(engine.doc.headSeq).toBe(8)
})

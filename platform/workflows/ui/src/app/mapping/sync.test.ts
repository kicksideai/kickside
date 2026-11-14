import { describe, expect, it } from 'vitest'
import { SyncEngine, applyEvent, docFromState, emptyDoc } from './sync'
import { EVENT, type WfEvent } from '../types'

function ev(seq: number, type: string, body: Record<string, unknown>): WfEvent {
  return { seq, type, body }
}

describe('applyEvent', () => {
  it('adds, updates and removes a node', () => {
    const doc = emptyDoc()
    applyEvent(doc, ev(1, 'kickside.workflows.events:node.added', { id: 'n1', kind: 'block', title: 'Send' }))
    expect(doc.nodes.n1).toMatchObject({ id: 'n1', kind: 'block', title: 'Send' })

    applyEvent(doc, ev(2, 'kickside.workflows.events:node.updated', { id: 'n1', title: 'Send email' }))
    expect(doc.nodes.n1.title).toBe('Send email')
    expect(doc.nodes.n1.kind).toBe('block')

    applyEvent(doc, ev(3, 'kickside.workflows.events:node.removed', { id: 'n1' }))
    expect(doc.nodes.n1).toBeUndefined()
  })

  it('drops a node position when the node is removed', () => {
    const doc = emptyDoc()
    applyEvent(doc, ev(1, 'kickside.workflows.events:node.added', { id: 'n1', kind: 'block', title: 'X' }))
    applyEvent(doc, ev(2, 'kickside.workflows.events:layout.position-set', { node_id: 'n1', x: 10, y: 20 }))
    expect(doc.positions.n1).toEqual({ x: 10, y: 20 })
    applyEvent(doc, ev(3, 'kickside.workflows.events:node.removed', { id: 'n1' }))
    expect(doc.positions.n1).toBeUndefined()
  })

  it('drops every incident edge when a node is removed', () => {
    const doc = emptyDoc()
    for (const id of ['a', 'b', 'c']) {
      applyEvent(doc, ev(1, 'kickside.workflows.events:node.added', { id, kind: 'block', title: id.toUpperCase() }))
    }
    applyEvent(doc, ev(2, 'kickside.workflows.events:edge.added', { id: 'incoming', source_id: 'a', target_id: 'b' }))
    applyEvent(doc, ev(3, 'kickside.workflows.events:edge.added', { id: 'outgoing', source_id: 'b', target_id: 'c' }))
    applyEvent(doc, ev(4, 'kickside.workflows.events:edge.added', { id: 'unrelated', source_id: 'a', target_id: 'c' }))

    applyEvent(doc, ev(5, 'kickside.workflows.events:node.removed', { id: 'b' }))

    expect(Object.keys(doc.edges)).toEqual(['unrelated'])
  })

  it('adds, updates and removes an edge', () => {
    const doc = emptyDoc()
    applyEvent(doc, ev(1, 'kickside.workflows.events:edge.added', { id: 'e1', source_id: 'a', target_id: 'b' }))
    expect(doc.edges.e1).toMatchObject({ source_id: 'a', target_id: 'b' })
    applyEvent(doc, ev(2, 'kickside.workflows.events:edge.updated', { id: 'e1', transform: '{ ok: output.ok }' }))
    expect(doc.edges.e1.transform).toBe('{ ok: output.ok }')
    applyEvent(doc, ev(3, 'kickside.workflows.events:edge.removed', { id: 'e1' }))
    expect(doc.edges.e1).toBeUndefined()
  })

  it('renders a stored mapping-spec transform as output-rooted text, not "[object Object]"', () => {
    const doc = emptyDoc()
    // The backend persists an edge transform as this object with an input-rooted expr.
    applyEvent(doc, ev(1, 'kickside.workflows.events:edge.added', {
      id: 'e1', source_id: 'a', target_id: 'b',
      transform: { v: 1, mode: 'expr', expr: '{ query: input.data_ids[1] }' },
    }))
    expect(doc.edges.e1.transform).toBe('{ query: output.data_ids[1] }')

    // An EDGE_UPDATE carrying the same object form is normalized identically (not copied
    // through verbatim as an object).
    applyEvent(doc, ev(2, 'kickside.workflows.events:edge.updated', {
      id: 'e1', transform: { v: 1, mode: 'expr', expr: '{ query: input.topic }' },
    }))
    expect(doc.edges.e1.transform).toBe('{ query: output.topic }')
    expect(doc.edges.e1.transform).not.toContain('[object Object]')
  })

  it('reads an empty transform spec as pass-through', () => {
    const doc = emptyDoc()
    // A transform-less edge serializes as an empty table; an empty object reads the same.
    applyEvent(doc, ev(1, 'kickside.workflows.events:edge.added', { id: 'e1', source_id: 'a', target_id: 'b', transform: [] }))
    expect(doc.edges.e1.transform).toBe('')
    applyEvent(doc, ev(2, 'kickside.workflows.events:edge.updated', { id: 'e1', transform: {} }))
    expect(doc.edges.e1.transform).toBe('')
  })

  it('sets the viewport and params', () => {
    const doc = emptyDoc()
    applyEvent(doc, ev(1, 'kickside.workflows.events:layout.viewport-set', { x: 5, y: 6, zoom: 1.5 }))
    expect(doc.viewport).toEqual({ x: 5, y: 6, zoom: 1.5 })
    applyEvent(doc, ev(2, 'kickside.workflows.events:param.set', { key: 'timeout', value: 30 }))
    expect(doc.params.timeout).toBe(30)
  })

  it('flags an unknown event kind for refetch and leaves state intact', () => {
    const doc = emptyDoc()
    const out = applyEvent(doc, ev(1, 'node.teleport', { id: 'n1' }))
    expect(out.unknown).toBe(true)
    expect(out.changed).toBe(false)
    expect(Object.keys(doc.nodes)).toHaveLength(0)
  })

  it('ignores an update to a node that does not exist', () => {
    const doc = emptyDoc()
    const out = applyEvent(doc, ev(1, 'kickside.workflows.events:node.updated', { id: 'ghost', title: 'X' }))
    expect(out.changed).toBe(false)
    expect(doc.nodes.ghost).toBeUndefined()
  })

  it('round-trips a Block config with a context expression like any other config field', () => {
    const doc = emptyDoc()
    applyEvent(doc, ev(1, 'kickside.workflows.events:node.added', { id: 'h1', kind: 'block', ref: 'test.blocks:approve_refund', title: 'Approve refund', config: { prompt: 'Approve?' } }))
    applyEvent(doc, ev(2, 'kickside.workflows.events:node.updated', {
      id: 'h1',
      config: { prompt: 'Approve?', context: '{ customer: input.customer, amount: input.amount }' },
    }))
    expect(doc.nodes.h1.config).toEqual({ prompt: 'Approve?', context: '{ customer: input.customer, amount: input.amount }' })
  })
})

describe('docFromState', () => {
  it('normalizes arrays and a layout block into the keyed doc', () => {
    const doc = docFromState({
      nodes: [{ id: 'n1', kind: 'start', title: 'Start' }],
      edges: [{ id: 'e1', source_id: 'n1', target_id: 'n2' }],
      notes: [{ id: 'note1', body: 'hi' }],
      layout: { positions: { n1: { x: 40, y: 40 } } },
      viewport: { x: 0, y: 0, zoom: 1 },
      head_seq: 7,
      can_undo: true,
      can_redo: false,
    })
    expect(doc.nodes.n1.kind).toBe('start')
    expect(doc.edges.e1.target_id).toBe('n2')
    expect(doc.notes.note1.text).toBe('hi')
    expect(doc.positions.n1).toEqual({ x: 40, y: 40 })
    expect(doc.headSeq).toBe(7)
    expect(doc.canUndo).toBe(true)
  })

  it('rejects missing, unknown, and retired raw node kinds instead of inventing a fallback', () => {
    const doc = docFromState({
      nodes: [
        { id: 'missing', title: 'Missing kind' },
        { id: 'unknown', kind: 'teleport', title: 'Unknown kind' },
        { id: 'retired', kind: 'func', title: 'Retired raw function' },
        { id: 'canonical', kind: 'block', ref: 'test.blocks:send', title: 'Send' },
      ],
    })

    expect(Object.keys(doc.nodes)).toEqual(['canonical'])
    expect(doc.nodes.canonical).toMatchObject({ kind: 'block', ref: 'test.blocks:send' })
  })

  it('reads note text from the store `body` field and round-trips a frame kind + color', () => {
    const doc = docFromState({
      notes: [
        { id: 'n1', body: 'hello', color: 'blue', kind: 'note' },
        { id: 'f1', body: 'Zone A', color: 'slate', kind: 'frame' },
      ],
    })
    expect(doc.notes.n1.text).toBe('hello')
    expect(doc.notes.n1.kind).toBe('note')
    expect(doc.notes.f1.text).toBe('Zone A')
    expect(doc.notes.f1.kind).toBe('frame')
    expect(doc.notes.f1.color).toBe('slate')
  })

  it('reads note body without accepting an undeclared text alias', () => {
    const doc = docFromState({ notes: [{ id: 'n1', text: 'unsupported' }] })
    expect(doc.notes.n1.text).toBe('')
  })

  it('round-trips a real stored edge transform without corrupting it', () => {
    // The exact shape the live sandwich workflow persists for its edges. It must read as
    // output-rooted authoring text, and re-storing that text (backend re-roots to `input`)
    // must reproduce the same displayed text — no "[object Object]" ever enters the store.
    const stored = { v: 1, mode: 'expr', expr: '{ query: input.data_ids[1] }' }
    const doc = docFromState({ edges: [{ id: 'e1', source_id: 'a', target_id: 'b', transform: stored }] })
    const displayed = doc.edges.e1.transform
    expect(displayed).toBe('{ query: output.data_ids[1] }')
    expect(displayed).not.toContain('[object Object]')

    // The mapper saves `displayed` (output-rooted); the backend re-roots output->input and
    // wraps it back into the spec object. Reading that again is stable.
    const reStored = { v: 1, mode: 'expr', expr: (displayed ?? '').replace(/\boutput\b/g, 'input') }
    const doc2 = docFromState({ edges: [{ id: 'e1', source_id: 'a', target_id: 'b', transform: reStored }] })
    expect(doc2.edges.e1.transform).toBe(displayed)
  })

  it.each(['{ }', '[ ]'])('preserves the authored %s expression as an explicit mapping', (transform) => {
    const doc = docFromState({ edges: [{ id: 'e1', source_id: 'start', target_id: 'finish', transform }] })
    expect(doc.edges.e1.transform).toBe(transform)
  })

  it.each([
    ['an empty array', []],
    ['an empty object', {}],
    ['an empty mapping spec', { v: 1, mode: 'expr', expr: '' }],
    ['a whitespace-only string', '   '],
    ['an input identity expression', 'input'],
  ])('reloads %s as pass-through rather than a custom mapping', (_case, transform) => {
    const doc = docFromState({
      edges: [{ id: 'start-finish', source_id: 'start', target_id: 'finish', transform }],
    })
    expect(doc.edges['start-finish'].transform).toBe('')
  })
})

describe('layout reducer', () => {
  it('a position-only layout event preserves the saved width/height (moving never resizes)', () => {
    const doc = emptyDoc()
    applyEvent(doc, ev(1, 'kickside.workflows.events:note.added', { id: 'f1', body: 'Zone', kind: 'frame' }))
    applyEvent(doc, ev(2, 'kickside.workflows.events:layout.position-set', { node_id: 'f1', x: 0, y: 0, width: 640, height: 400 }))
    applyEvent(doc, ev(3, 'kickside.workflows.events:layout.position-set', { node_id: 'f1', x: 100, y: 80 }))
    expect(doc.positions.f1).toEqual({ x: 100, y: 80, width: 640, height: 400 })
  })

  it('an explicit width/height in a layout event still overrides the saved dimensions', () => {
    const doc = emptyDoc()
    applyEvent(doc, ev(1, 'kickside.workflows.events:note.added', { id: 'f1', body: 'Zone', kind: 'frame' }))
    applyEvent(doc, ev(2, 'kickside.workflows.events:layout.position-set', { node_id: 'f1', x: 0, y: 0, width: 640, height: 400 }))
    applyEvent(doc, ev(3, 'kickside.workflows.events:layout.position-set', { node_id: 'f1', x: 0, y: 0, width: 500, height: 300 }))
    expect(doc.positions.f1).toEqual({ x: 0, y: 0, width: 500, height: 300 })
  })
})

describe('note reducer', () => {
  it('adds a frame and updates its title, color and kind', () => {
    const engine = new SyncEngine()
    engine.applyResponse({
      events: [ev(1, 'kickside.workflows.events:note.added', { id: 'f1', body: 'Frame', kind: 'frame', color: 'slate' })],
      head_seq: 1,
      can_undo: true,
      can_redo: false,
    })
    expect(engine.doc.notes.f1.kind).toBe('frame')
    expect(engine.doc.notes.f1.text).toBe('Frame')

    engine.ingest([ev(2, 'kickside.workflows.events:note.updated', { id: 'f1', body: 'Ingest zone', color: 'teal' })])
    expect(engine.doc.notes.f1.text).toBe('Ingest zone')
    expect(engine.doc.notes.f1.color).toBe('teal')
    expect(engine.doc.notes.f1.kind).toBe('frame')
  })
})

describe('SyncEngine dedup + optimistic apply', () => {
  it('optimistically applies its own response events and advances lastAppliedSeq', () => {
    const engine = new SyncEngine()
    const out = engine.applyResponse({
      events: [ev(1, 'kickside.workflows.events:node.added', { id: 'n1', kind: 'block', title: 'Draft' })],
      head_seq: 1,
      can_undo: true,
      can_redo: false,
    })
    expect(out.changed).toBe(true)
    expect(engine.doc.nodes.n1).toBeDefined()
    expect(engine.lastAppliedSeq).toBe(1)
    expect(engine.doc.canUndo).toBe(true)
  })

  it('drops the realtime re-delivery of an already-applied seq', () => {
    const engine = new SyncEngine()
    engine.applyResponse({ events: [ev(1, 'kickside.workflows.events:node.added', { id: 'n1', kind: 'block', title: 'A' })], head_seq: 1, can_undo: true, can_redo: false })
    // The workflow topic echoes seq 1 back; it must be a no-op.
    const out = engine.ingest([ev(1, 'kickside.workflows.events:node.added', { id: 'n1', kind: 'block', title: 'MUTATED' })])
    expect(out.applied).toHaveLength(0)
    expect(engine.doc.nodes.n1.title).toBe('A')
  })

  it('applies a strictly newer peer event over the topic', () => {
    const engine = new SyncEngine()
    engine.reset({ nodes: [], edges: [], head_seq: 5 })
    const out = engine.ingest([ev(6, 'kickside.workflows.events:node.added', { id: 'peer', kind: 'block', title: 'Peer add' })])
    expect(out.applied).toHaveLength(1)
    expect(engine.doc.nodes.peer).toBeDefined()
    expect(engine.lastAppliedSeq).toBe(6)
  })

  it('sorts an out-of-order batch and applies each once', () => {
    const engine = new SyncEngine()
    const out = engine.ingest([
      ev(3, 'kickside.workflows.events:node.updated', { id: 'n1', title: 'v3' }),
      ev(1, 'kickside.workflows.events:node.added', { id: 'n1', kind: 'block', title: 'v1' }),
      ev(2, 'kickside.workflows.events:node.updated', { id: 'n1', title: 'v2' }),
    ])
    expect(out.applied).toHaveLength(3)
    expect(engine.doc.nodes.n1.title).toBe('v3')
    expect(engine.lastAppliedSeq).toBe(3)
  })

  it('reports needsRefetch on an unknown kind but still advances the cursor', () => {
    const engine = new SyncEngine()
    const out = engine.ingest([ev(1, 'workflow.rekeyed', {})])
    expect(out.needsRefetch).toBe(true)
    expect(engine.lastAppliedSeq).toBe(1)
  })
})

describe('SyncEngine layout echo suppression', () => {
  it('suppresses the visual patch of a matching own layout echo but advances seq', () => {
    const engine = new SyncEngine()
    engine.reset({ nodes: [{ id: 'n1', kind: 'block', title: 'A' }], head_seq: 0 })
    // Local drag committed n1 to (100, 200).
    engine.recordLayoutEcho('n1', 100, 200, 1000)
    // The broadcast of that same save arrives before its own HTTP response registers.
    const out = engine.ingest([ev(1, 'kickside.workflows.events:layout.position-set', { node_id: 'n1', x: 100, y: 200 })], { now: 1100 })
    expect(out.applied).toHaveLength(0)
    // The position is not written from the echo (local drag is already the truth)...
    expect(engine.doc.positions.n1).toBeUndefined()
    // ...but the seq still advances so later events aren't mis-ordered.
    expect(engine.lastAppliedSeq).toBe(1)
  })

  it('applies a peer layout move that does not match any echo', () => {
    const engine = new SyncEngine()
    engine.reset({ nodes: [{ id: 'n1', kind: 'block', title: 'A' }], head_seq: 0 })
    engine.recordLayoutEcho('n1', 100, 200, 1000)
    // Peer moved the node somewhere else — different coordinates, must apply.
    const out = engine.ingest([ev(1, 'kickside.workflows.events:layout.position-set', { node_id: 'n1', x: 300, y: 400 })], { now: 1100 })
    expect(out.applied).toHaveLength(1)
    expect(engine.doc.positions.n1).toEqual({ x: 300, y: 400 })
  })

  it('does not suppress an echo that arrives after the 500ms window', () => {
    const engine = new SyncEngine()
    engine.reset({ nodes: [{ id: 'n1', kind: 'block', title: 'A' }], head_seq: 0 })
    engine.recordLayoutEcho('n1', 100, 200, 1000)
    const out = engine.ingest([ev(1, 'kickside.workflows.events:layout.position-set', { node_id: 'n1', x: 100, y: 200 })], { now: 1700 })
    expect(out.applied).toHaveLength(1)
    expect(engine.doc.positions.n1).toEqual({ x: 100, y: 200 })
  })

  it('consumes each echo once', () => {
    const engine = new SyncEngine()
    engine.reset({ nodes: [{ id: 'n1', kind: 'block', title: 'A' }], head_seq: 0 })
    engine.recordLayoutEcho('n1', 100, 200, 1000)
    engine.ingest([ev(1, 'kickside.workflows.events:layout.position-set', { node_id: 'n1', x: 100, y: 200 })], { now: 1100 })
    // A second identical position at the same spot is a real move now (echo spent).
    const out = engine.ingest([ev(2, 'kickside.workflows.events:layout.position-set', { node_id: 'n1', x: 100, y: 200 })], { now: 1200 })
    expect(out.applied).toHaveLength(1)
    expect(engine.doc.positions.n1).toEqual({ x: 100, y: 200 })
  })
})

describe('SyncEngine definition edit head (marker-excluded draft detection)', () => {
  it('folds the server marker-excluded edit head from /state', () => {
    // Fixed live shape for a freshly published, unedited "UX Audit Sandwich": the raw head
    // includes the publish marker (42) but the edit head excludes it (41).
    const doc = docFromState({ head_seq: 42, definition_edit_seq: 41 })
    expect(doc.headSeq).toBe(42)
    expect(doc.definitionEditSeq).toBe(41)
  })


  it('advances the edit head with an applied edit but NOT with a non-projected marker', () => {
    const engine = new SyncEngine()
    engine.reset({ nodes: [], head_seq: 41, definition_edit_seq: 41 })
    // A real authored edit advances both heads.
    engine.ingest([ev(42, 'kickside.workflows.events:node.added', { id: 'n1', kind: 'block', title: 'A' })])
    expect(engine.doc.headSeq).toBe(42)
    expect(engine.doc.definitionEditSeq).toBe(42)
    // An unrecognized event (a version.published marker) advances the raw head only, so a
    // fresh publish keeps reading clean against its own def_seq.
    engine.ingest([ev(43, 'kickside.workflows.events:version.published', { version: 2 })])
    expect(engine.doc.headSeq).toBe(43)
    expect(engine.doc.definitionEditSeq).toBe(42)
  })

  it('advances the edit head from an apply/undo/redo envelope head_seq', () => {
    const engine = new SyncEngine()
    engine.reset({ nodes: [], head_seq: 3, definition_edit_seq: 3 })
    engine.applyResponse({ events: [], head_seq: 9, can_undo: true, can_redo: false })
    expect(engine.doc.definitionEditSeq).toBe(9)
  })
})

describe('server event vocabulary', () => {
  it.each(Object.values(EVENT))('recognizes the server event %s', (type) => {
    expect(applyEvent(emptyDoc(), ev(1, type, {})).unknown).toBe(false)
  })

  it('keeps command names out of the server event plane', () => {
    expect(applyEvent(emptyDoc(), ev(1, 'node.add', { id: 'n', kind: 'branch' })).unknown).toBe(true)
  })

  it('projects labels while keeping version markers outside the edit head', () => {
    const engine = new SyncEngine()
    engine.ingest([ev(1, 'kickside.workflows.events:labels.set', { labels: ['review'] })])
    expect(engine.doc.labels).toEqual(['review'])
    expect(engine.doc.definitionEditSeq).toBe(1)
    const result = engine.ingest([ev(2, 'kickside.workflows.events:version.restored', {})])
    expect(result.needsRefetch).toBe(true)
    expect(engine.doc.headSeq).toBe(2)
    expect(engine.doc.definitionEditSeq).toBe(1)
  })
})

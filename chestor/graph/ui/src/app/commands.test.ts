import { describe, expect, it } from 'vitest'
import * as C from './commands'
import { EV } from './types'

describe('command builders', () => {
  it('addNode mints an id, carries type/name and optional parent', () => {
    const cmd = C.addNode({ type: 'service', name: 'X', parentId: 'p1' })
    expect(cmd.type).toBe(EV.NODE_ADDED)
    expect(cmd.body.type).toBe('service')
    expect(cmd.body.name).toBe('X')
    expect(cmd.body.parent_id).toBe('p1')
    expect(typeof cmd.body.id).toBe('string')
  })

  it('addNode omits parent_id when unset', () => {
    expect(C.addNode({ type: 't', name: 'n' }).body.parent_id).toBeUndefined()
  })

  it('updateNode wraps id + patch', () => {
    expect(C.updateNode('n1', { name: 'Y' })).toEqual({ type: EV.NODE_UPDATED, body: { id: 'n1', name: 'Y' } })
  })

  it('reparentNode sends empty string to detach', () => {
    expect(C.reparentNode('n1', null).body.parent_id).toBe('')
    expect(C.reparentNode('n1', 'p').body.parent_id).toBe('p')
  })

  it('addEdge maps source/target', () => {
    const cmd = C.addEdge({ type: 'sync', sourceId: 'a', targetId: 'b' })
    expect(cmd.type).toBe(EV.EDGE_ADDED)
    expect(cmd.body.source_id).toBe('a')
    expect(cmd.body.target_id).toBe('b')
  })

  it('reverseEdge swaps source/target', () => {
    const cmd = C.reverseEdge({ id: 'e1', source_id: 'a', target_id: 'b' })
    expect(cmd.type).toBe(EV.EDGE_UPDATED)
    expect(cmd.body).toMatchObject({ id: 'e1', source_id: 'b', target_id: 'a' })
  })

  it('reverseEdge swaps persisted handles', () => {
    const cmd = C.reverseEdge({
      id: 'e1',
      source_id: 'a',
      target_id: 'b',
      properties: { sourceHandle: 'right', targetHandle: 'left', routing: 'smoothstep' },
    })
    expect(cmd.body.properties).toEqual({ sourceHandle: 'left', targetHandle: 'right', routing: 'smoothstep' })
  })

  it('setPosition rounds coordinates and includes size when finite', () => {
    const cmd = C.setPosition('n', 10.6, 20.2, 210.9, undefined)
    expect(cmd.body).toMatchObject({ node_id: 'n', x: 11, y: 20, width: 211 })
    expect(cmd.body.height).toBeUndefined()
  })

  it('attachMaterial defaults source to inline', () => {
    const cmd = C.attachMaterial({ targetType: 'node', targetId: 'n', kind: 'note' })
    expect(cmd.type).toBe(EV.MATERIAL_ATTACHED)
    expect(cmd.body.source).toEqual({ type: 'inline' })
    expect(cmd.body.target_type).toBe('node')
  })

  it('attachMaterial carries component reference sources', () => {
    const cmd = C.attachMaterial({ targetType: 'edge', targetId: 'e', kind: 'reference', title: 'Component ref', source: { type: 'component', component_id: 'cmp-1' } })
    expect(cmd.body).toMatchObject({
      target_type: 'edge',
      target_id: 'e',
      kind: 'reference',
      title: 'Component ref',
      source: { type: 'component', component_id: 'cmp-1' },
    })
  })

  it('type register/update/remove route to the right event per kind', () => {
    expect(C.registerType('node', { id: 't', title: 'T' }).type).toBe(EV.NODE_TYPE_REGISTERED)
    expect(C.updateType('edge', 't', { title: 'T2' }).type).toBe(EV.EDGE_TYPE_UPDATED)
    expect(C.removeType('material', 't').type).toBe(EV.MATERIAL_TYPE_REMOVED)
    expect(C.removeType('material', 't').body).toEqual({ id: 't' })
  })

  it('uid returns unique strings', () => {
    expect(C.uid()).not.toBe(C.uid())
  })
})

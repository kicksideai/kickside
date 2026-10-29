// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { describe, expect, it } from 'vitest'
import { addNode, updateNode } from '../api/commands'
import { docFromState, applyEvent } from './sync'
import { EVENT } from '../types'
describe('Retry fields on canvas nodes', () => {
  it('retains policies and scalar timeouts in snapshots, commands and event patches', () => {
    const node = { id: 'step', kind: 'block' as const, title: 'Step', ref: 'example:step', retry_policy: { maximum_attempts: 3 }, start_to_close_timeout: '2s', schedule_to_close_timeout: 8000 }
    expect(addNode(node).body).toEqual(node)
    const doc = docFromState({ nodes: [node] })
    expect(doc.nodes.step.retry_policy).toEqual(node.retry_policy)
    expect(doc.nodes.step.start_to_close_timeout).toBe('2s')
    const patch = updateNode('step', { retry_policy: false })
    applyEvent(doc, { seq: 1, type: EVENT.NODE_UPDATED, body: patch.body })
    expect(doc.nodes.step.retry_policy).toBeUndefined()
    expect(doc.nodes.step.schedule_to_close_timeout).toBe(8000)
  })
})

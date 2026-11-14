import { describe, expect, it } from 'vitest'
import type { PublishIssue } from '../api/api'
import { PUBLISH_GATE_HINT, firstIssueNodeId, issuesByNode, nodeIssueMessage } from './publish-issues'

const issue = (over: Partial<PublishIssue> = {}): PublishIssue => ({ code: '', message: '', nodeId: '', ...over })

describe('nodeIssueMessage', () => {
  it('uses user vocabulary for an unset Condition and identifies the node to open', () => {
    const issues = [issue({ code: 'branch_predicate_missing', message: 'branch node requires config.predicate', nodeId: 'condition-1' })]
    expect(nodeIssueMessage(issues[0])).toBe('Set the condition.')
    expect(firstIssueNodeId(issues)).toBe('condition-1')
  })
  it('peels the redundant node prefix, leaving the directed instruction', () => {
    const m = nodeIssueMessage(issue({
      code: 'node_config_missing',
      message: 'node knowledge_sink config.kb_id is required; set it before publishing',
      nodeId: 'knowledge_sink',
    }))
    expect(m).toBe('config.kb_id is required; set it before publishing')
  })

  it('falls back to a code headline carrying the configuration hint when the server sends no message', () => {
    const m = nodeIssueMessage(issue({ code: 'node_config_missing', nodeId: 'n1' }))
    expect(PUBLISH_GATE_HINT).toBe('Set a value or make it an input.')
    expect(m).toContain(PUBLISH_GATE_HINT)
  })

  it('keeps a message that carries no node prefix verbatim', () => {
    expect(nodeIssueMessage(issue({ message: 'Something specific is wrong here' }))).toBe('Something specific is wrong here')
  })
})

describe('issuesByNode', () => {
  it('groups issues by node id and drops whole-graph reasons with no node id', () => {
    const byNode = issuesByNode([
      issue({ code: 'a', message: 'x', nodeId: 'n1' }),
      issue({ code: 'b', message: 'y', nodeId: 'n1' }),
      issue({ code: 'c', message: 'graph-wide', nodeId: '' }),
    ])
    expect([...byNode.keys()]).toEqual(['n1'])
    expect(byNode.get('n1')).toHaveLength(2)
  })
})

// Copy + mapping for publish-gate compile issues, kept as exported, unit-tested functions
// (CONVENTIONS "honest copy as testable data"). The wording matches what the compiler
// actually enforces: every required Block config field must be set before publication.

import type { PublishIssue } from '../api/api'

// The directed instruction emitted when required Block configuration is absent.
export const PUBLISH_GATE_HINT = 'Set a value or make it an input.'

// A code the FE has its own headline for, when the server sends no message text.
const CODE_HEADLINE: Record<string, string> = {
  node_config_missing: `This step is missing required configuration. ${PUBLISH_GATE_HINT}`,
  branch_predicate_missing: 'Set the condition.',
}

// The message to show ON the offending node card. The compiler names the node id in its
// message ("node <id> config.<field> …"); that prefix is redundant on the card (the card
// IS the node), so it is peeled, leaving the directed instruction. Falls back to a
// code-derived headline, then to a generic line.
export function nodeIssueMessage(issue: PublishIssue): string {
  if (issue.code === 'branch_predicate_missing') return CODE_HEADLINE.branch_predicate_missing
  const raw = (issue.message || '').trim()
  if (raw) {
    const peeled = raw.replace(/^node\s+\S+\s+/i, '').trim()
    return peeled || raw
  }
  return CODE_HEADLINE[issue.code] || 'This step isn’t ready to publish yet.'
}

/** First directed fix target; the canvas opens this node when publish is refused. */
export function firstIssueNodeId(issues: PublishIssue[]): string {
  return issues.find((issue) => !!issue.nodeId)?.nodeId || ''
}

// Group the flat issue list by node id, dropping whole-graph reasons (no node id) — those
// stay in the summary banner. First issue per node wins the card mark; the rest still count
// toward that node's issue tally.
export function issuesByNode(issues: PublishIssue[]): Map<string, PublishIssue[]> {
  const byNode = new Map<string, PublishIssue[]>()
  for (const issue of issues) {
    if (!issue.nodeId) continue
    const list = byNode.get(issue.nodeId)
    if (list) list.push(issue)
    else byNode.set(issue.nodeId, [issue])
  }
  return byNode
}

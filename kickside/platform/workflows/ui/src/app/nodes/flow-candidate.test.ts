import { describe, expect, it } from 'vitest'
import { analyzeFlowCandidate, schemaSummary } from './flow-candidate'

const inputSchema = {
  type: 'object',
  required: ['account_id'],
  properties: {
    account_id: { type: 'string' },
    amount: { type: 'number' },
    note: { type: 'string' },
    priority: { type: 'string' },
  },
}

describe('Flow candidate analysis', () => {
  it('marks workflows with declared IO schemas as callable', () => {
    const c = analyzeFlowCandidate(
      {
        id: 'child',
        title: 'Enrich Lead',
        // The fixed server shape: has_draft_changes is authoritative (publish markers already
        // excluded server-side), so it is surfaced verbatim, not re-derived from head/def seqs.
        has_draft_changes: true,
        published_version: 2,
        interface: {
          input_schema: inputSchema,
          output_schema: { type: 'object', properties: { score: { type: 'integer' } } },
        },
      },
      {
        headSeq: 7,
        params: {},
      },
      [{ version: 2, def_seq: 6 }],
      'parent',
    )
    expect(c.callable).toBe(true)
    expect(c.published_version).toBe(2)
    expect(c.has_draft_changes).toBe(true)
    expect(c.input_summary).toBe('object: account_id, amount, note +1')
    expect(c.output_summary).toBe('object: score')
  })

  it('does not re-derive draft state when the server reports a clean published workflow', () => {
    // Fixed live shape for "UX Audit Sandwich": published v1, no unpublished edits. Even
    // though the raw head sits past the published def_seq (the publish marker), the server's
    // has_draft_changes is false and the FE trusts it — no client-side head/def re-derivation.
    const c = analyzeFlowCandidate(
      {
        id: 'ux-audit',
        title: 'UX Audit Sandwich',
        has_draft_changes: false,
        published_version: 1,
        published_def_seq: 41,
        head_seq: 42,
        interface: { input_schema: inputSchema, output_schema: { type: 'object', properties: { ok: { type: 'boolean' } } } },
      },
      { headSeq: 42, params: {} },
      [{ version: 1, def_seq: 41 }],
      'parent',
    )
    expect(c.published_version).toBe(1)
    expect(c.has_draft_changes).toBe(false)
  })

  it('does not infer callability from a raw node shape', () => {
    const c = analyzeFlowCandidate(
      { id: 'wf', title: 'Webhook Flow' },
      {
        nodes: [
          { id: 's', kind: 'start', output_schema: { type: 'object' } },
          { id: 'a', kind: 'block' },
        ],
        edges: [{ source_id: 't', target_id: 'a' }],
        params: {},
      },
      [],
      'parent',
    )
    expect(c.callable).toBe(false)
    expect(c.trigger_label).toBe('Declared input')
  })

  it('falls back to draft params when list summaries are not enriched', () => {
    const c = analyzeFlowCandidate(
      { id: 'wf', title: 'Reusable Flow' },
      {
        params: {
          input_schema: inputSchema,
          output_schema: { type: 'object', properties: { ok: { type: 'boolean' } } },
        },
      },
      [],
      'parent',
    )
    expect(c.callable).toBe(true)
    expect(c.input_summary).toBe('object: account_id, amount, note +1')
    expect(c.output_summary).toBe('object: ok')
  })
})

describe('schemaSummary', () => {
  it('summarizes absent and scalar schemas', () => {
    expect(schemaSummary(null)).toBe('No schema')
    expect(schemaSummary({ type: 'string' })).toBe('string')
  })
})

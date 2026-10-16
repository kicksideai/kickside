import { describe, expect, it } from 'vitest'
import { fieldSummary, hasUnpublishedEdits, restoreDraftMessage, restoredDraftRoute, summarizeInterface } from './version-history'
import type { WorkflowInterface } from '../types'

describe('hasUnpublishedEdits', () => {
  // Fixed live shape for "UX Audit Sandwich": published v1 at def_seq 41. The server's
  // marker-excluded edit head equals 41 (the publish marker at raw seq 42 does not count), so
  // a freshly published, unedited canvas reads clean — the same has_draft_changes:false the
  // server now reports. No client-side +1 marker fudge.
  it('reads an edit head equal to the latest def_seq as clean', () => {
    expect(hasUnpublishedEdits(41, 41)).toBe(false)
  })

  // "adv-runner-contract": published v1 at def_seq 3 with an edit head of 30 — many authored
  // events beyond the version, so the draft carries unpublished edits.
  it('reads an edit head beyond the latest def_seq as having unpublished edits', () => {
    expect(hasUnpublishedEdits(30, 3)).toBe(true)
  })

  it('flips to true on the first authored edit past the published version', () => {
    expect(hasUnpublishedEdits(5, 5)).toBe(false) // matches the published version
    expect(hasUnpublishedEdits(6, 5)).toBe(true) // one edit past it
  })

  it('reports no pending draft when nothing has been published', () => {
    expect(hasUnpublishedEdits(10, null)).toBe(false)
    expect(hasUnpublishedEdits(10, undefined)).toBe(false)
  })
})

describe('summarizeInterface', () => {
  // The interface a version froze, as returned by versions.get for "UX Audit Sandwich" v1.
  const iface: WorkflowInterface = {
    input_count: 2,
    output_count: 2,
    error_count: 2,
    input_keys: ['audience', 'topic'],
    output_keys: ['content', 'source_url'],
    error_keys: ['error_message', 'step_name'],
  }

  it('surfaces the key names and counts for each side', () => {
    const s = summarizeInterface(iface)
    expect(s.input).toEqual(['audience', 'topic'])
    expect(s.output).toEqual(['content', 'source_url'])
    expect(s.error).toEqual(['error_message', 'step_name'])
    expect(s.inputCount).toBe(2)
    expect(s.outputCount).toBe(2)
    expect(s.errorCount).toBe(2)
    expect(s.empty).toBe(false)
  })

  it('marks a null interface as empty with no keys', () => {
    const s = summarizeInterface(null)
    expect(s.empty).toBe(true)
    expect(s.input).toEqual([])
    expect(s.inputCount).toBe(0)
  })

  it('falls back to key length when a count is absent', () => {
    const s = summarizeInterface({ input_keys: ['a', 'b', 'c'] })
    expect(s.inputCount).toBe(3)
    expect(s.empty).toBe(false)
  })

  it('is non-empty when a count is present without explicit keys', () => {
    const s = summarizeInterface({ input_count: 4 })
    expect(s.inputCount).toBe(4)
    expect(s.input).toEqual([])
    expect(s.empty).toBe(false)
  })
})

describe('fieldSummary', () => {
  it('joins named keys', () => {
    expect(fieldSummary(['topic', 'audience'], 2)).toBe('topic, audience')
  })

  it('describes a known count without names', () => {
    expect(fieldSummary([], 1)).toBe('1 field')
    expect(fieldSummary([], 3)).toBe('3 fields')
  })

  it('reads an empty side as none', () => {
    expect(fieldSummary([], 0)).toBe('none')
  })
})

describe('restore-as-new-draft flow', () => {
  it('states that history remains immutable and routes to the created draft', () => {
    expect(restoreDraftMessage(3)).toContain('This never changes version history.')
    expect(restoredDraftRoute('wf-restored')).toBe('wf-restored')
  })
})

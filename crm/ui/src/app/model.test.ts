import { describe, it, expect } from 'vitest'
import {
  parseMeta,
  assembleForm,
  matchedAttributes,
  reasonLabel,
  confidencePercent,
  confidenceTone,
  MERGE_ACTIONS,
} from './model'

// A payload matching what merge_arm.metadata_for emits for the merge-review Block
// input (crm_id, object_type, left_id, right_id, confidence, reason, evidence,
// and Flow run correlation). Action vocabulary is declaration-owned and
// never copied into this item payload.
function meta(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    crm_id: 'crm-1',
    object_type: 'person',
    left_id: 'p1',
    right_id: 'p2',
    confidence: 0.6,
    reason: 'domain_name',
    evidence: { domain_attr: 'email', domain: 'acme.com', name_attr: 'name', name_similarity: 0.9 },
    workflow_id: 'wf-1',
    run_id: 'run-1',
    dataflow_id: 'df-1',
    signal_id: 'sig-1',
    ...overrides,
  })
}

describe('parseMeta', () => {
  it('parses a well-formed merge-review payload', () => {
    const m = parseMeta('crm-merge-review:df-1:sig-1', 'Possible duplicate person', meta())
    expect(m.ok).toBe(true)
    if (!m.ok) return
    expect(m.crmId).toBe('crm-1')
    expect(m.objectType).toBe('person')
    expect(m.left.id).toBe('p1')
    expect(m.right.id).toBe('p2')
    expect(m.confidence).toBeCloseTo(0.6)
    expect(m.reasonCode).toBe('domain_name')
    expect(m.reasonLabel).toBe('Same domain and a similar name')
    expect(m.workflow.signalId).toBe('sig-1')
  })

  it('surfaces evidence as highlightable matched attributes', () => {
    const m = parseMeta('id', '', meta())
    if (!m.ok) throw new Error('expected ok')
    expect(m.matchedAttrs).toContain('email')
    expect(m.matchedAttrs).toContain('name')
    expect(m.matched.find((x) => x.attr === 'email')?.value).toBe('acme.com')
    expect(m.matched.find((x) => x.attr === 'name')?.value).toBe('90% name match')
  })

  it('renders record columns from context when the payload carries them', () => {
    const m = parseMeta(
      'id',
      '',
      meta({
        context: {
          left: { values: { name: 'Ada Example', email: 'ada@acme.com' }, aliases: ['ada@old.com'], activity_count: 4 },
          right: { name: 'A. Example', email: 'ada@acme.com' },
        },
      }),
    )
    if (!m.ok) throw new Error('expected ok')
    expect(m.left.label).toBe('Ada Example')
    expect(m.left.aliases).toEqual(['ada@old.com'])
    expect(m.left.activityCount).toBe(4)
    expect(m.left.values.find((v) => v.attr === 'email')?.value).toBe('ada@acme.com')
    // flat map (no values wrapper) also works
    expect(m.right.label).toBe('A. Example')
    expect(m.right.activityCount).toBeNull()
  })

  it('falls back to the record id as label when no context is present', () => {
    const m = parseMeta('id', '', meta())
    if (!m.ok) throw new Error('expected ok')
    expect(m.left.label).toBe('p1')
    expect(m.left.values).toEqual([])
  })

  it('flags malformed JSON without throwing and keeps the raw reference', () => {
    const m = parseMeta('id-9', 'summary', '{not json')
    expect(m.ok).toBe(false)
    if (m.ok) return
    expect(m.itemId).toBe('id-9')
    expect(m.raw).toBe('{not json')
    expect(m.error).toBeTruthy()
  })

  it('flags a payload missing the compared records', () => {
    const m = parseMeta('id', '', meta({ left_id: '', right_id: '' }))
    expect(m.ok).toBe(false)
  })

  it('accepts an already-parsed metadata object', () => {
    const m = parseMeta('id', '', { left_id: 'a', right_id: 'b', object_type: 'company' })
    expect(m.ok).toBe(true)
    if (!m.ok) return
    expect(m.objectType).toBe('company')
  })

  it('does not consume action configuration from item metadata', () => {
    const m = parseMeta('id', '', meta({ actions: ['skip'], form: { type: 'object' }, card_contract: { stale: true } }))
    if (!m.ok) throw new Error('expected ok')
    expect(m).not.toHaveProperty('actions')
    expect(MERGE_ACTIONS).toEqual(['merged', 'do_not_merge', 'skipped'])
  })
})

describe('matchedAttributes', () => {
  it('handles the value_exact evidence shape', () => {
    expect(matchedAttributes({ attr: 'email', value: 'ada@acme.com' })).toEqual([{ attr: 'email', value: 'ada@acme.com' }])
  })
  it('handles the domain evidence shape', () => {
    expect(matchedAttributes({ attr: 'website', domain: 'acme.com' })).toEqual([{ attr: 'website', value: 'acme.com' }])
  })
  it('handles an array of evidence entries', () => {
    const out = matchedAttributes([{ attr: 'email', value: 'x' }, { attr: 'phone', value: 'y' }])
    expect(out).toHaveLength(2)
  })
  it('ignores non-object evidence', () => {
    expect(matchedAttributes(null)).toEqual([])
    expect(matchedAttributes('nope')).toEqual([])
  })
})

describe('reason + confidence helpers', () => {
  it('maps known reason codes and humanizes unknown ones', () => {
    expect(reasonLabel('email_exact')).toBe('Same email address')
    expect(reasonLabel('some_new_pattern')).toBe('Some New Pattern')
    expect(reasonLabel('')).toBe('Possible duplicate')
  })
  it('clamps and buckets confidence', () => {
    expect(confidencePercent(0.6)).toBe(60)
    expect(confidencePercent(2)).toBe(100)
    expect(confidencePercent(-1)).toBe(0)
    expect(confidenceTone(0.9)).toBe('high')
    expect(confidenceTone(0.7)).toBe('medium')
    expect(confidenceTone(0.4)).toBe('low')
  })
})

describe('assembleForm', () => {
  const opts = { leftId: 'p1', rightId: 'p2' }

  it('assembles a merge with the selected winner and exact loser', () => {
    const { form, error } = assembleForm('merged', { ...opts, winnerId: 'p1' })
    expect(error).toBeNull()
    expect(form).toEqual({ winner_id: 'p1', loser_id: 'p2' })
  })

  it('assembles do_not_merge', () => {
    expect(assembleForm('do_not_merge', opts).form).toEqual({})
  })

  it('assembles skipped', () => {
    expect(assembleForm('skipped', opts).form).toEqual({})
  })

  it('requires a valid winner for merged', () => {
    const bad = assembleForm('merged', opts)
    expect(bad.form).toBeNull()
    expect(bad.error).toBeTruthy()

    const good = assembleForm('merged', { ...opts, winnerId: 'p2' })
    expect(good.error).toBeNull()
    expect(good.form).toEqual({ winner_id: 'p2', loser_id: 'p1' })
  })

  it('attaches a trimmed note when provided', () => {
    const { form } = assembleForm('skipped', { ...opts, note: '  later  ' })
    expect(form).toEqual({ note: 'later' })
  })

  it('omits an empty note', () => {
    const { form } = assembleForm('merged', { ...opts, winnerId: 'p1', note: '   ' })
    expect(form).not.toHaveProperty('note')
  })

  it('rejects an unknown action', () => {
    const { form, error } = assembleForm('nope', opts)
    expect(form).toBeNull()
    expect(error).toBeTruthy()
  })
})

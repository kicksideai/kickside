import { describe, it, expect } from 'vitest'
import { autoMap, canonicalName, autoMapWhy } from './auto-map'

// The confidence rule is the product's trust boundary: it must apply silently ONLY when
// every required target field has exactly one name+type-compatible source candidate, and
// hand off to the intent popover on any required-field ambiguity. The near-miss cases are
// tested hard — two candidates, a name match with the wrong type, and optional-only matches
// that must never trigger a silent apply.

const obj = (properties: Record<string, unknown>, required: string[] = []) => ({
  type: 'object', required, properties,
})

describe('canonicalName', () => {
  it('folds case and separators so name variants compare equal', () => {
    expect(canonicalName('contactId')).toBe('contactid')
    expect(canonicalName('contact_id')).toBe('contactid')
    expect(canonicalName('Contact Id')).toBe('contactid')
    expect(canonicalName('contactId')).toBe(canonicalName('contact_id'))
  })
  it('keeps genuinely different names distinct', () => {
    expect(canonicalName('email')).not.toBe(canonicalName('emails'))
  })
})

describe('autoMap — unambiguous auto-apply', () => {
  it('maps a single required field with an exact name and type match', () => {
    const src = obj({ email: { type: 'string' }, name: { type: 'string' } })
    const tgt = obj({ email: { type: 'string' } }, ['email'])
    const r = autoMap(src, tgt)
    expect(r.status).toBe('auto')
    expect(r.transform).toBe('{ email: output.email }')
    expect(r.fields).toHaveLength(1)
    expect(r.fields[0]).toMatchObject({ key: 'email', expr: 'output.email', match: 'exact', typed: true })
    expect(r.fields[0].why).toContain('the names match')
    expect(r.fields[0].why).toContain('the types are compatible')
  })

  it('matches by canonical name across snake_case / camelCase', () => {
    const src = obj({ contactId: { type: 'string' } })
    const tgt = obj({ contact_id: { type: 'string' } }, ['contact_id'])
    const r = autoMap(src, tgt)
    expect(r.status).toBe('auto')
    expect(r.transform).toBe('{ contact_id: output.contactId }')
    expect(r.fields[0].match).toBe('canonical')
    expect(r.fields[0].why).toContain('same field name')
  })

  it('maps optional fields opportunistically when they also resolve uniquely', () => {
    const src = obj({ email: { type: 'string' }, name: { type: 'string' } })
    const tgt = obj({ email: { type: 'string' }, name: { type: 'string' } }, ['email'])
    const r = autoMap(src, tgt)
    expect(r.status).toBe('auto')
    expect(r.transform).toBe('{ email: output.email, name: output.name }')
  })

  it('applies with the required set resolved even when an optional field stays ambiguous', () => {
    // `email` (required) resolves uniquely; `tag` (optional) has two candidates — optional
    // ambiguity must NOT block the apply, and the ambiguous optional is left unmapped.
    const src = obj({ email: { type: 'string' }, tag: { type: 'string' }, Tag: { type: 'string' } })
    const tgt = obj({ email: { type: 'string' }, tag: { type: 'string' } }, ['email'])
    const r = autoMap(src, tgt)
    expect(r.status).toBe('auto')
    expect(r.transform).toBe('{ email: output.email }')
  })

  it('treats an undeclared upstream type as compatible but marks the why as unchecked', () => {
    const src = obj({ email: {} }) // no type on source
    const tgt = obj({ email: { type: 'string' } }, ['email'])
    const r = autoMap(src, tgt)
    expect(r.status).toBe('auto')
    expect(r.fields[0].typed).toBe(false)
    expect(r.fields[0].why).toContain('isn’t declared')
  })

  it('emits expressions rooted on a non-default source root (bindings use input)', () => {
    const src = obj({ email: { type: 'string' } })
    const tgt = obj({ email: { type: 'string' } }, ['email'])
    const r = autoMap(src, tgt, 'input')
    expect(r.transform).toBe('{ email: input.email }')
  })
})

describe('autoMap — ambiguity blocks the silent apply', () => {
  it('does NOT auto-apply when a required field has two name+type candidates', () => {
    // Both `email` and `e_mail` canonicalize to the same name and are type-compatible.
    const src = obj({ email: { type: 'string' }, e_mail: { type: 'string' } })
    const tgt = obj({ email: { type: 'string' } }, ['email'])
    const r = autoMap(src, tgt)
    expect(r.status).toBe('ambiguous')
    expect(r.transform).toBe('')
    expect(r.fields).toHaveLength(0)
    expect(r.unresolved).toHaveLength(1)
    expect(r.unresolved[0]).toMatchObject({ key: 'email', reason: 'multiple' })
    expect(r.unresolved[0].candidates).toEqual(expect.arrayContaining(['output.email', 'output.e_mail']))
  })

  it('does NOT auto-apply on a name match with the wrong type (the near miss)', () => {
    const src = obj({ count: { type: 'string' } })
    const tgt = obj({ count: { type: 'boolean' } }, ['count'])
    const r = autoMap(src, tgt)
    expect(r.status).toBe('ambiguous')
    expect(r.unresolved[0]).toMatchObject({ key: 'count', reason: 'type' })
  })

  it('does NOT auto-apply when only OPTIONAL fields match and a required field is unmatched', () => {
    // The source carries `name` (optional target) but nothing for the required `id`.
    const src = obj({ name: { type: 'string' } })
    const tgt = obj({ id: { type: 'string' }, name: { type: 'string' } }, ['id'])
    const r = autoMap(src, tgt)
    expect(r.status).toBe('ambiguous')
    expect(r.unresolved.map((u) => u.key)).toEqual(['id'])
    expect(r.unresolved[0].reason).toBe('none')
    expect(r.transform).toBe('')
  })

  it('is ambiguous when the upstream declares no fields but the target requires some', () => {
    const src = { type: 'string' } // scalar upstream, no fields
    const tgt = obj({ contact_id: { type: 'string' }, message: { type: 'string' } }, ['contact_id', 'message'])
    const r = autoMap(src, tgt)
    expect(r.status).toBe('ambiguous')
    expect(r.unresolved).toHaveLength(2)
  })

  it('reports each blocking required field, resolving the ones it can', () => {
    const src = obj({ id: { type: 'string' } })
    const tgt = obj({ id: { type: 'string' }, url: { type: 'string' } }, ['id', 'url'])
    const r = autoMap(src, tgt)
    // `id` resolves but `url` does not — the whole edge stays pending (no incomplete silent apply).
    expect(r.status).toBe('ambiguous')
    expect(r.fields).toHaveLength(0)
    expect(r.unresolved.map((u) => u.key)).toEqual(['url'])
  })
})

describe('autoMap — nothing to do', () => {
  it('skips when the target declares no input fields', () => {
    const src = obj({ email: { type: 'string' } })
    expect(autoMap(src, obj({})).status).toBe('skip')
    expect(autoMap(src, undefined).status).toBe('skip')
    expect(autoMap(src, { type: 'string' }).status).toBe('skip')
  })

  it('creates a Start -> Finish edge with no transform when both contracts are empty', () => {
    const empty = obj({})
    expect(autoMap(empty, empty)).toEqual({
      status: 'skip', fields: [], transform: '', unresolved: [],
    })
  })

  it('skips an optional-only target with no matches rather than nagging', () => {
    const src = obj({ zzz: { type: 'string' } })
    const tgt = obj({ note: { type: 'string' } }) // optional, no required
    const r = autoMap(src, tgt)
    expect(r.status).toBe('skip')
    expect(r.transform).toBe('')
  })

  it('auto-applies an optional-only target when an optional field does resolve', () => {
    const src = obj({ note: { type: 'string' } })
    const tgt = obj({ note: { type: 'string' } })
    const r = autoMap(src, tgt)
    expect(r.status).toBe('auto')
    expect(r.transform).toBe('{ note: output.note }')
  })
})

describe('autoMapWhy', () => {
  it('states a name and type match for an exact typed pair', () => {
    expect(autoMapWhy({ title: 'Email', expr: 'output.email', sourceName: 'email', match: 'exact', typed: true }))
      .toBe('Email ← output.email · the names match and the types are compatible.')
  })
  it('names the source field on a canonical match and flags an unchecked type', () => {
    const s = autoMapWhy({ title: 'Contact id', expr: 'output.contactId', sourceName: 'contactId', match: 'canonical', typed: false })
    expect(s).toContain('“contactId” is the same field name')
    expect(s).toContain('isn’t declared')
  })
})

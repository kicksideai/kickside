import { describe, expect, it } from 'vitest'
import { recordFromRoute, recordIdFromRoute, recordRoute } from './crm-route'

describe('CRM record routes', () => {
  it('round-trips opaque provider record IDs', () => {
    const route = recordRoute('person', 'contacts/524190630611')
    expect(route).toBe('person/r~Y29udGFjdHMvNTI0MTkwNjMwNjEx')
    expect(recordIdFromRoute(route.split('/'))).toBe('contacts/524190630611')
  })

  it('round-trips unicode identifiers without introducing a path separator', () => {
    const route = recordRoute('company', 'Zürich/東京')
    expect(route).toBe('company/r~WsO8cmljaC_mnbHkuqw')
    expect(recordIdFromRoute(route.split('/'))).toBe('Zürich/東京')
  })

  it('rejects unencoded routes', () => {
    expect(recordIdFromRoute(['person', 'p1'])).toBeUndefined()
    expect(recordIdFromRoute('person/contacts/524190630611'.split('/'))).toBeUndefined()
  })

  it('rejects malformed and non-canonical encoded identifiers', () => {
    expect(recordIdFromRoute(['person', 'r~%%%'])).toBeUndefined()
    expect(recordIdFromRoute(['person', 'r~YQ=='])).toBeUndefined()
  })
})

describe('CRM record route resolution', () => {
  it('resolves the canonical opaque segment the surface mints', () => {
    expect(recordFromRoute(recordRoute('person', 'contacts/524190630611').split('/')))
      .toEqual({ kind: 'record', recordId: 'contacts/524190630611' })
  })

  it('resolves a record named plainly by a link from outside the CRM', () => {
    // The exact shape a meetings contact chip mints, as the browser sends it.
    expect(recordFromRoute('person/person%3Ahubspot%3A150366411620'.split('/')))
      .toEqual({ kind: 'record', recordId: 'person:hubspot:150366411620' })
    // An id with nothing in it that needs escaping is the same string either
    // way, so the single decode leaves it untouched.
    expect(recordFromRoute(['person', 'person:hubspot:150366411620']))
      .toEqual({ kind: 'record', recordId: 'person:hubspot:150366411620' })
  })

  // The shell hands its path over percent-encoded and this reader decodes it
  // once. Twice would read the "%41" this id genuinely contains as an escape and
  // resolve a record called "aAb"; not at all would resolve "a%2541b".
  it('decodes a plain segment exactly once, so a literal percent survives', () => {
    expect(recordFromRoute(['person', encodeURIComponent('a%41b')]))
      .toEqual({ kind: 'record', recordId: 'a%41b' })
    expect(recordFromRoute(['person', encodeURIComponent('50% off')]))
      .toEqual({ kind: 'record', recordId: '50% off' })
  })

  it('reads an object on its own as the object, not as a record', () => {
    expect(recordFromRoute(['person'])).toEqual({ kind: 'none' })
    expect(recordFromRoute([])).toEqual({ kind: 'none' })
  })

  it('calls an unreadable record segment unresolvable rather than no record', () => {
    // Silently answering "no record" is what turned every broken deep link into
    // the list -- the address named a record and the surface must say it could
    // not open that one.
    expect(recordFromRoute(['person', 'r~%%%'])).toEqual({ kind: 'unresolvable', segment: 'r~%%%' })
    expect(recordFromRoute(['person', 'r~YQ=='])).toEqual({ kind: 'unresolvable', segment: 'r~YQ==' })
    expect(recordFromRoute(['person', '%E0%A4%A'])).toEqual({ kind: 'unresolvable', segment: '%E0%A4%A' })
    // An id carrying a path separator can only travel opaquely; unencoded it is
    // not recoverable from the segments.
    expect(recordFromRoute('person/contacts/524190630611'.split('/')))
      .toEqual({ kind: 'unresolvable', segment: 'contacts/524190630611' })
  })

  it('keeps the canonical reader strict for what the surface itself mints', () => {
    expect(recordIdFromRoute(['person', 'p1'])).toBeUndefined()
  })

  // "r~" is reserved on the MINT side: recordRoute encodes every id opaquely, so
  // an id that itself begins with "r~" round-trips rather than colliding with the
  // marker.
  it('round-trips a record id that itself begins with the reserved prefix', () => {
    const route = recordRoute('person', 'r~not-encoded')
    expect(route).toBe('person/r~cn5ub3QtZW5jb2RlZA')
    expect(recordFromRoute(route.split('/')))
      .toEqual({ kind: 'record', recordId: 'r~not-encoded' })
  })

  // The reverse, and it is deliberate rather than an oversight. A segment
  // beginning with "r~" is read as opaque and as nothing else, so a plain id
  // starting with "r~" that a caller wrote by hand fails base64url canonicity
  // and is answered as unresolvable. Falling back to reading it as plaintext
  // would make the encoding ambiguous, and an ambiguous encoding cannot
  // round-trip the case above.
  it('calls a hand-written plain id starting with the reserved prefix unresolvable', () => {
    expect(recordFromRoute(['person', 'r~person:hubspot:1']))
      .toEqual({ kind: 'unresolvable', segment: 'r~person:hubspot:1' })
    // Base64url alphabet, but not canonical output of the minter.
    expect(recordFromRoute(['person', 'r~abc']))
      .toEqual({ kind: 'unresolvable', segment: 'r~abc' })
  })
})

import { describe, it, expect } from 'vitest'
import * as copy from './intent-copy'
import { autoRevealSummary } from './intent-copy'

// The interaction's promise rides on these strings, so they're guarded: every constant is a
// non-empty single sentence (one terminal period, no run-ons), and the pluralizing summary
// reads correctly at 1 and many.

const STRINGS = [
  copy.AUTO_REVEAL_TITLE, copy.AUTO_TRACE_LABEL, copy.AUTO_REVEAL_HINT,
  copy.INTENT_PROMPT, copy.INTENT_PLACEHOLDER, copy.INTENT_HELP, copy.INTENT_SUBMIT, copy.INTENT_DRAFTING,
  copy.PREVIEW_TITLE, copy.PREVIEW_ACCEPT, copy.PREVIEW_OPEN_MAPPER, copy.PREVIEW_RETRY,
  copy.INTENT_DISMISS, copy.INTENT_DEGRADE, copy.INTENT_DISMISS_HINT,
]

describe('intent-copy', () => {
  it('every string is present and non-empty', () => {
    for (const s of STRINGS) expect(s.trim().length).toBeGreaterThan(0)
  })

  it('stays to one sentence — no period followed by a new capitalized sentence', () => {
    // A trailing period is fine; an abbreviation like "e.g." (lowercase after) is fine; a
    // period followed by a capitalized word signals two sentences crammed into one.
    for (const s of STRINGS) expect(s).not.toMatch(/\.\s+[A-Z]/)
  })

  it('autoRevealSummary pluralizes correctly', () => {
    expect(autoRevealSummary(1)).toBe('Mapped 1 field by name and type.')
    expect(autoRevealSummary(3)).toBe('Mapped 3 fields by name and type.')
  })
})

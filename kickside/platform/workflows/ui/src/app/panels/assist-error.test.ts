import { describe, expect, it } from 'vitest'
import { ASSIST_TEMPORARY, humanizeAssistError } from './assist-error'

const FALLBACK = 'The assistant couldn’t draft a schema.'

describe('humanizeAssistError', () => {
  it('prefers the human message when the backend sends both fields', () => {
    expect(humanizeAssistError({ error: 'assist_unavailable', message: 'AI assist is temporarily unavailable — try again shortly.' }, FALLBACK))
      .toBe('AI assist is temporarily unavailable — try again shortly.')
  })

  it('maps a bare assist_unavailable code (no message) to a directed sentence, never the token', () => {
    const out = humanizeAssistError({ error: 'assist_unavailable' }, FALLBACK)
    expect(out).toBe(ASSIST_TEMPORARY)
    expect(out).not.toBe('assist_unavailable')
  })

  it('degrades any other snake_case code to the fallback rather than leaking it', () => {
    expect(humanizeAssistError({ error: 'some_internal_code' }, FALLBACK)).toBe(FALLBACK)
  })

  it('passes a plain human error sentence through', () => {
    expect(humanizeAssistError({ error: 'Rate limit exceeded' }, FALLBACK)).toBe('Rate limit exceeded')
  })

  it('falls back when neither field is present', () => {
    expect(humanizeAssistError({}, FALLBACK)).toBe(FALLBACK)
    expect(humanizeAssistError(null, FALLBACK)).toBe(FALLBACK)
  })
})

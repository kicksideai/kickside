import { describe, expect, it } from 'vitest'
import { EVENT_TYPES, eventKind, reportPlaceholder, resultMarkdown } from './events'

const ev = (type: string, body: any = {}, seq = 1) => ({ type, body, seq })

describe('research event classification', () => {
  it('classifies every canonical colon-delimited event id', () => {
    expect(eventKind(ev(EVENT_TYPES.request))).toBe('request')
    expect(eventKind(ev(EVENT_TYPES.progress))).toBe('progress')
    expect(eventKind(ev(EVENT_TYPES.result))).toBe('result')
    expect(eventKind(ev(EVENT_TYPES.failed))).toBe('failed')
  })

  it('uses the exact wire ids from the module vocabulary', () => {
    expect(EVENT_TYPES.result).toBe('kickside.research.events:result')
    expect(EVENT_TYPES.failed).toBe('kickside.research.events:failed')
  })

  it('does not classify dot-suffixed or foreign ids as terminals', () => {
    expect(eventKind(ev('kickside.research.events.result'))).toBe('progress')
    expect(eventKind(ev('other.module.events:result'))).toBe('progress')
    expect(eventKind(ev(''))).toBe('progress')
    expect(eventKind({ type: undefined as unknown as string })).toBe('progress')
  })
})

describe('resultMarkdown', () => {
  it('prefers the RESULT event markdown over the projected value', () => {
    const events = [ev(EVENT_TYPES.request, { prompt: 'x' }), ev(EVENT_TYPES.result, { markdown: '# Live' }, 2)]
    expect(resultMarkdown(events, '# Projected')).toBe('# Live')
  })

  it('falls back to the projected report when no RESULT event is loaded', () => {
    expect(resultMarkdown([ev(EVENT_TYPES.progress, { step: 'reading' })], '# Projected')).toBe('# Projected')
  })

  it('treats blank markdown as no report', () => {
    expect(resultMarkdown([ev(EVENT_TYPES.result, { markdown: '   ' })], '  ')).toBe('')
    expect(resultMarkdown([ev(EVENT_TYPES.result, {})], undefined)).toBe('')
  })
})

describe('reportPlaceholder', () => {
  it('names the terminal state instead of promising a report', () => {
    expect(reportPlaceholder('failed')).toBe('No report was produced.')
    expect(reportPlaceholder('complete')).toBe('This run completed without a report.')
    expect(reportPlaceholder('running')).toBe('The report will appear here when the run completes.')
    expect(reportPlaceholder('pending')).toBe('The report will appear here when the run completes.')
  })
})

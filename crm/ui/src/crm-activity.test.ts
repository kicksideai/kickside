import { describe, expect, it } from 'vitest'
import {
  activityDetails,
  activityFacts,
  activityHref,
  activityIcon,
  activityLabel,
  activityTitle,
  anchorRecordId,
  chunk,
  directionLabel,
  durationLabel,
  externalReference,
  lastTouchedAt,
  meetingHref,
  meetingIdByReference,
  meetingReferences,
  outcomeLabel,
  participants,
  personName,
  sourceLabel,
} from './crm-activity'
import type { CrmActivity } from './crm-types'

function meeting(overrides: Partial<CrmActivity> & Record<string, unknown> = {}): CrmActivity {
  return {
    activity_id: 'fireflies:01KZ7G6ZP4XS352J9FP212FKD4',
    activity_type: 'meeting',
    occurred_at: '2026-08-05T19:30:00.000Z',
    source: 'fireflies',
    external_id: 'fireflies:01KZ7G6ZP4XS352J9FP212FKD4',
    payload: { title: 'Example Interview Prep', attendee_emails: ['sam.example@example.test', 'jules.example@example.test'] },
    ...overrides,
  } as CrmActivity
}

describe('activity vocabulary', () => {
  // Every kind a producer writes has a written-out name and its own mark. A new
  // kind still reads as words, never as the stored code.
  it('names every activity kind the producers write', () => {
    const kinds = ['meeting', 'call', 'email', 'note', 'task']
    for (const kind of kinds) {
      expect(activityLabel(kind)).not.toBe(kind)
      expect(activityLabel(kind)).toMatch(/^[A-Z]/)
      expect(activityIcon(kind)).toMatch(/^tabler:/)
    }
    expect(new Set(kinds.map(activityIcon)).size).toBe(kinds.length)
  })

  it('humanizes an activity kind it has never seen instead of printing the code', () => {
    expect(activityLabel('site_visit')).toBe('Site Visit')
    expect(activityLabel('')).toBe('Activity')
    expect(activityIcon('site_visit')).toBe('tabler:point')
  })

  it('reads the stored direction compass points as words', () => {
    expect(directionLabel('in')).toBe('Inbound')
    expect(directionLabel('out')).toBe('Outbound')
    expect(directionLabel('inbound')).toBe('Inbound')
    expect(directionLabel('OUT')).toBe('Outbound')
    expect(directionLabel('')).toBe('')
    expect(directionLabel(undefined)).toBe('')
  })

  it('reads upstream outcome constants as words', () => {
    const constants = ['SCHEDULED', 'COMPLETED', 'RESCHEDULED', 'NO_SHOW', 'CANCELED']
    for (const constant of constants) {
      const label = outcomeLabel(constant)
      expect(label).not.toBe(constant)
      expect(label).not.toMatch(/_/)
      expect(label).toMatch(/^[A-Z]/)
    }
    expect(outcomeLabel('half_attended')).toBe('Half Attended')
    expect(outcomeLabel('')).toBe('')
  })

  it('says a duration the way a person says it', () => {
    expect(durationLabel(1800)).toBe('30 min')
    expect(durationLabel(3600)).toBe('1 hr')
    expect(durationLabel(4500)).toBe('1 hr 15 min')
    expect(durationLabel(20)).toBe('Under a minute')
    expect(durationLabel(0)).toBe('')
    expect(durationLabel(undefined)).toBe('')
    expect(durationLabel(-60)).toBe('')
  })
})

describe('activity presentation', () => {
  it('titles a row by what happened and never by its id', () => {
    expect(activityTitle(meeting())).toBe('Example Interview Prep')
    const untitled = activityTitle(meeting({ payload: {} }))
    expect(untitled).toBe('Meeting')
    expect(untitled).not.toContain('fireflies')
  })

  it('reads people out of the addresses on the activity and drops the record itself', () => {
    expect(personName('sam.example@example.test')).toBe('Sam Example')
    expect(personName('jd@example.test')).toBe('Jd')
    const others = participants(meeting(), 'jules.example@example.test')
    expect(others).toEqual([{ name: 'Sam Example', email: 'sam.example@example.test' }])
  })

  it('deduplicates participants case-insensitively and tolerates an empty payload', () => {
    const row = meeting({ payload: { attendee_emails: ['A@b.com', 'a@b.com', '', 'c@d.com'] } })
    expect(participants(row).map((person) => person.email)).toEqual(['A@b.com', 'c@d.com'])
    expect(participants(meeting({ payload: {} }))).toEqual([])
  })

  it('states only the facts an activity actually carries', () => {
    expect(activityFacts(meeting()).map((fact) => fact.label)).toEqual(['Meeting'])
    const rich = meeting({ duration_sec: 2700, direction: 'out', outcome: 'COMPLETED', has_transcript: true })
    expect(activityFacts(rich).map((fact) => fact.label)).toEqual(['Meeting', '45 min', 'Outbound', 'Completed', 'Transcript'])
  })

  it('marks an unfinished task as open and a finished one as neither', () => {
    const open = { activity_id: 'a1', activity_type: 'task', due_at: '2026-08-20T00:00:00Z', done: false } as CrmActivity
    expect(activityFacts(open).map((fact) => fact.key)).toEqual(['type', 'due'])
    expect(activityFacts({ ...open, done: true }).map((fact) => fact.key)).toEqual(['type'])
  })

  it('answers when the record was last touched from the newest row that carries a time', () => {
    expect(lastTouchedAt([meeting({ occurred_at: '' }), meeting({ occurred_at: '2026-08-01T10:00:00Z' })])).toBe('2026-08-01T10:00:00Z')
    expect(lastTouchedAt([])).toBe('')
  })
})

describe('meeting resolution', () => {
  it('strips the source prefix the producer composed the external id with', () => {
    expect(externalReference(meeting())).toBe('01KZ7G6ZP4XS352J9FP212FKD4')
    expect(externalReference(meeting({ source: 'hubspot', external_id: 'hubspot:meetings:77' }))).toBe('meetings:77')
    expect(externalReference(meeting({ source: '', external_id: '01KZ7G6ZP4XS352J9FP212FKD4' }))).toBe('01KZ7G6ZP4XS352J9FP212FKD4')
    expect(externalReference(meeting({ external_id: '' }))).toBe('')
  })

  it('asks only about meetings, once per distinct reference', () => {
    const rows = [
      meeting(),
      meeting({ activity_id: 'a2' }),
      meeting({ activity_id: 'a3', external_id: 'fireflies:SECOND' }),
      { activity_id: 'a4', activity_type: 'email', source: 'hubspot', external_id: 'hubspot:emails:9' } as CrmActivity,
    ]
    expect(meetingReferences(rows)).toEqual(['01KZ7G6ZP4XS352J9FP212FKD4', 'SECOND'])
  })

  it('splits a long chronology into bounded request batches', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    expect(chunk([], 100)).toEqual([])
    expect(chunk([1, 2], 0)).toEqual([[1], [2]])
  })

  it('maps every reference a readable meeting carries to that meeting', () => {
    const items = [
      { meeting_id: 'm-1', refs: [{ system: 'fireflies', external_id: '01KZ7G6ZP4XS352J9FP212FKD4' }, { system: 'calendar', external_id: 'evt-1' }] },
      { meeting_id: '', refs: [{ external_id: 'ignored' }] },
      { meeting_id: 'm-2', refs: 'not-a-list' },
    ]
    expect(meetingIdByReference(items)).toEqual({ '01KZ7G6ZP4XS352J9FP212FKD4': 'm-1', 'evt-1': 'm-1' })
    expect(meetingIdByReference(undefined)).toEqual({})
  })

  it('links a meeting the caller may read and leaves the rest without a way in', () => {
    const byReference = { '01KZ7G6ZP4XS352J9FP212FKD4': 'm-1' }
    expect(activityHref(meeting(), byReference)).toBe('/meetings/m-1')
    expect(activityHref(meeting({ external_id: 'fireflies:PRIVATE' }), byReference)).toBe('')
    expect(activityHref({ activity_id: 'a', activity_type: 'email', external_id: 'x' } as CrmActivity, byReference)).toBe('')
    expect(meetingHref('')).toBe('')
    expect(meetingHref('a b/c')).toBe('/meetings/a%20b%2Fc')
  })
})

describe('what a row says beyond its headline', () => {
  it('names the system the row came from and stays silent when nobody recorded one', () => {
    expect(sourceLabel(meeting())).toBe('Fireflies')
    expect(sourceLabel(meeting({ source: 'hubspot' }))).toBe('Hubspot')
    expect(sourceLabel(meeting({ source: '' }))).toBe('')
    expect(sourceLabel({ activity_id: 'a', activity_type: 'note' } as CrmActivity)).toBe('')
  })

  it('reads a note body out of the payload the producer wrote', () => {
    const note = {
      activity_id: 'hubspot:note:1',
      activity_type: 'note',
      source: 'hubspot',
      payload: { title: 'Scoping call recap', body: 'Agreed on a two-week discovery.', added_by: 'Sam Example' },
    } as CrmActivity
    expect(activityDetails(note)).toEqual([
      { label: 'Body', text: 'Agreed on a two-week discovery.' },
      { label: 'Added By', text: 'Sam Example' },
    ])
  })

  it('never repeats what the row already reads out, and offers nothing when there is nothing left', () => {
    expect(activityDetails(meeting())).toEqual([])
    expect(activityDetails({ activity_id: 'a', activity_type: 'note' } as CrmActivity)).toEqual([])
    expect(activityDetails({ activity_id: 'a', activity_type: 'note', payload: { note: '', tags: [] } } as CrmActivity)).toEqual([])
  })

  it('names the record a row is keyed to only when it is not the record being read', () => {
    const call = { activity_id: 'c1', activity_type: 'call', record_id: 'person:ada' } as CrmActivity
    expect(anchorRecordId(call, 'company:acme')).toBe('person:ada')
    expect(anchorRecordId(call, 'person:ada')).toBe('')
    expect(anchorRecordId({ activity_id: 'c2', activity_type: 'call' } as CrmActivity, 'company:acme')).toBe('')
  })
})

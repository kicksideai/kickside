import { describe, expect, it } from 'vitest'
import { formFromSchedule, scheduleFromForm, toRecurringSchedule, fromRecurringSchedule } from './schedule'

describe('recurring schedule vocabulary', () => {
  it.each([{ type: 'interval', expression: '15m' }, { type: 'cron', expression: '0 8 * * 1-5' }] as const)(
    'round-trips $type through the cadence model', schedule => {
      const cadence = fromRecurringSchedule(schedule)
      const form = formFromSchedule(cadence)
      expect(toRecurringSchedule(scheduleFromForm(form))).toEqual(schedule)
    })
  it('keeps empty schedules incomplete in both directions', () => {
    expect(fromRecurringSchedule(null)).toBeNull()
    expect(toRecurringSchedule(null)).toBeNull()
  })
  it('keeps the trigger default custom and explicitly scopes the daily default', () => {
    expect(formFromSchedule(null).cronPreset).toBe('custom')
    expect(formFromSchedule(null, 'daily')).toMatchObject({ cronPreset: 'daily', cronTime: '' })
    expect(scheduleFromForm(formFromSchedule(null, 'daily'))).toBeNull()
  })
})

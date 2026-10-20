// Cadence in operator words. The stored spec carries a scheduler expression;
// this module is the only place that knows how to read one into the form's
// widgets and write one back out, so the form itself renders and nothing else.

import type { ScheduleType, TriggerSchedule } from './spec'

export type PeriodicUnit = 'm' | 'h' | 'd'
export type CronPreset = 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'custom'

export const CANONICAL_PERIODIC_TYPE: ScheduleType = 'ticker'

// The fire envelope a timer delivers, published so a consumer can map from it.
export const TIMER_OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    fired_at: { type: 'string', format: 'date-time', title: 'Fired at' },
    occurred_at: { type: 'string', format: 'date-time', title: 'Occurred at' },
    schedule: {
      type: 'object',
      title: 'Schedule',
      properties: {
        type: { type: 'string' },
        expression: { type: 'string' },
        tz: { type: 'string' },
      },
    },
  },
}

const WEEKDAYS = [
  ['0', 'Sunday'],
  ['1', 'Monday'],
  ['2', 'Tuesday'],
  ['3', 'Wednesday'],
  ['4', 'Thursday'],
  ['5', 'Friday'],
  ['6', 'Saturday'],
] as const
// Select option lists (label/value objects — labels differ from the stored value).
export const WEEKDAY_OPTIONS = WEEKDAYS.map(([value, label]) => ({ label, value }))
export const PERIODIC_UNITS: { label: string; value: PeriodicUnit }[] = [
  { label: 'minutes', value: 'm' },
  { label: 'hours', value: 'h' },
  { label: 'days', value: 'd' },
]
export const CRON_PRESETS: { label: string; value: CronPreset }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekdays', value: 'weekdays' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Custom cron expression', value: 'custom' },
]

// The widget state behind the two cadence faces: an every-N interval, or specific
// times expressed as a cron preset.
export interface ScheduleForm {
  specificTimes: boolean
  periodicEvery: number
  periodicUnit: PeriodicUnit
  cronPreset: CronPreset
  cronTime: string
  cronWeekday: string
  cronMonthday: number
  customCron: string
}

function positiveInt(value: unknown): number | null {
  const n = Math.floor(Number(value))
  return Number.isFinite(n) && n > 0 ? n : null
}
function parsePeriodic(expression: unknown): { n: number; unit: PeriodicUnit } | null {
  const m = typeof expression === 'string' ? expression.trim().match(/^([1-9]\d*)([mhd])$/) : null
  return m ? { n: Number(m[1]), unit: m[2] as PeriodicUnit } : null
}
function pad2(n: number): string { return String(n).padStart(2, '0') }
function parseTime(minute: string, hour: string): string | null {
  if (!/^\d+$/.test(minute) || !/^\d+$/.test(hour)) return null
  const m = Number(minute)
  const h = Number(hour)
  if (m < 0 || m > 59 || h < 0 || h > 23) return null
  return `${pad2(h)}:${pad2(m)}`
}
function parseCron(expression: unknown): null | { preset: CronPreset; time: string; weekday?: string; monthday?: number; custom?: string } {
  const raw = typeof expression === 'string' ? expression.trim() : ''
  const parts = raw.split(/\s+/)
  if (parts.length !== 5) return raw ? { preset: 'custom', time: '', custom: raw } : null
  const [minute, hour, dom, mon, dow] = parts
  const time = parseTime(minute, hour)
  if (!time || mon !== '*') return { preset: 'custom', time: '', custom: raw }
  if (dom === '*' && dow === '*') return { preset: 'daily', time }
  if (dom === '*' && dow === '1-5') return { preset: 'weekdays', time }
  if (dom === '*' && /^[0-6]$/.test(dow)) return { preset: 'weekly', time, weekday: dow }
  if (dow === '*' && /^(?:[1-9]|[12]\d|3[01])$/.test(dom)) return { preset: 'monthly', time, monthday: Number(dom) }
  return { preset: 'custom', time: '', custom: raw }
}

// Read a stored schedule into the widgets. An expression the presets cannot
// express reads through the custom face verbatim rather than being rewritten.
export function formFromSchedule(schedule: TriggerSchedule | null, defaultPreset: CronPreset = 'custom'): ScheduleForm {
  if (!schedule || !schedule.expression) {
    return {
      specificTimes: true,
      periodicEvery: 0,
      periodicUnit: 'm',
      cronPreset: defaultPreset,
      cronTime: '',
      cronWeekday: '',
      cronMonthday: 0,
      customCron: '',
    }
  }
  const t = schedule.type
  const expression = schedule.expression
  const periodic = parsePeriodic(expression)
  if ((t === 'interval' || t === 'ticker') && periodic) {
    return {
      specificTimes: false,
      periodicEvery: periodic.n,
      periodicUnit: periodic.unit,
      cronPreset: 'daily',
      cronTime: '',
      cronWeekday: '',
      cronMonthday: 0,
      customCron: '',
    }
  }
  const parsed = t === 'cron' ? parseCron(expression) : { preset: 'custom' as CronPreset, time: '', custom: expression }
  return {
    specificTimes: true,
    periodicEvery: 0,
    periodicUnit: 'm',
    cronPreset: parsed?.preset || 'custom',
    cronTime: parsed?.time || '',
    cronWeekday: parsed?.weekday || '',
    cronMonthday: parsed?.monthday || 0,
    customCron: parsed?.custom || (parsed?.preset === 'custom' ? expression : ''),
  }
}

// Write the widgets back out. An empty custom expression is no schedule at all,
// which the gate reports rather than the form inventing one.
export function scheduleFromForm(form: ScheduleForm): TriggerSchedule | null {
  if (!form.specificTimes) {
    const n = positiveInt(form.periodicEvery)
    if (n == null) return null
    return {
      type: CANONICAL_PERIODIC_TYPE,
      expression: `${n}${form.periodicUnit}`,
    }
  }
  if (form.cronPreset === 'custom') {
    const expression = form.customCron.trim()
    return expression ? { type: 'cron', expression } : null
  }
  const [hourRaw, minuteRaw] = form.cronTime.split(':')
  if (!parseTime(minuteRaw, hourRaw)) return null
  const h = Math.min(23, Math.max(0, Number(hourRaw)))
  const m = Math.min(59, Math.max(0, Number(minuteRaw)))
  if (form.cronPreset === 'weekdays') return { type: 'cron', expression: `${m} ${h} * * 1-5` }
  if (form.cronPreset === 'weekly') {
    if (!form.cronWeekday) return null
    return { type: 'cron', expression: `${m} ${h} * * ${form.cronWeekday}` }
  }
  if (form.cronPreset === 'monthly') {
    const day = positiveInt(form.cronMonthday)
    return day == null ? null : { type: 'cron', expression: `${m} ${h} ${Math.min(31, day)} * *` }
  }
  return { type: 'cron', expression: `${m} ${h} * * *` }
}

export interface RecurringSchedule {
  type: 'cron' | 'interval'
  expression: string
}

export function fromRecurringSchedule(schedule: RecurringSchedule | null): TriggerSchedule | null {
  if (!schedule) return null
  return { type: schedule.type === 'interval' ? CANONICAL_PERIODIC_TYPE : 'cron', expression: schedule.expression }
}

export function toRecurringSchedule(schedule: TriggerSchedule | null): RecurringSchedule | null {
  if (!schedule || schedule.type === 'once') return null
  return { type: schedule.type === 'cron' ? 'cron' : 'interval', expression: schedule.expression }
}

// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
export interface Field { value: unknown; source: 'default' | 'host' | 'admin'; fallback: unknown; default?: unknown; min?: number; max?: number; unit?: string }
export interface Control { key: string; title: string; help: string; unit: string; durationMilliseconds?: boolean; min?: number; max?: number }
export const groups: { title: string; help: string; fields: Control[] }[] = [
  { title: 'Workers', help: 'Balance throughput with database and provider capacity.', fields: [
    { key: 'worker.count_postgres', title: 'Postgres workers', help: 'Jobs that can execute together on Postgres. Higher counts use more connections and provider capacity.', unit: 'workers', min: 1, max: 256 },
    { key: 'worker.count_sqlite', title: 'SQLite workers', help: 'Jobs that can execute together on SQLite. Its write concurrency keeps this pool small.', unit: 'workers', min: 1, max: 2 },
    { key: 'worker.awaited_slots', title: 'Awaited slots', help: 'Extra slots reserved for jobs other jobs wait for, so waiting work can keep moving.', unit: 'slots', min: 1, max: 256 },
  ] },
  { title: 'Claiming and fairness', help: 'Choose how the next available slots pick up work.', fields: [
    { key: 'worker.claim_batch', title: 'Claim batch', help: 'Maximum jobs claimed in one database transaction. Smaller batches keep transactions short.', unit: 'jobs', min: 1, max: 256 },
    { key: 'fairness.shares', title: 'Queue shares', help: 'Relative turns for each tier when all tiers have work. Unused turns are available to other tiers.', unit: 'shares', min: 0, max: 1000 },
  ] },
  { title: 'Leases and retries', help: 'Lease changes apply to new executions. Active executions retain their lease timing.', fields: [
    { key: 'lease.timeout', title: 'Lease timeout', help: 'How long a claimed job stays owned without renewal. Use whole seconds, at least 1s.', unit: 'duration · e.g. 45s' },
    { key: 'lease.heartbeat', title: 'Lease heartbeat', help: 'Time between renewals. Must be positive and shorter than the lease timeout.', unit: 'duration · e.g. 10s' },
    { key: 'retry.max_attempts', title: 'Maximum attempts', help: 'Attempt limit for newly enqueued one-shot jobs. Existing jobs retain their attempt limit.', unit: 'attempts', min: 1, max: 1000000 },
    { key: 'retry.retry_after_ms', title: 'Initial retry delay', help: 'Minimum delay before retrying a failed one-shot job.', unit: 'duration · e.g. 1s', durationMilliseconds: true, min: 1, max: 86400000 },
    { key: 'retry.max_delay_ms', title: 'Maximum retry delay', help: 'Cap on exponential retry delay. A provider’s explicit retry delay may be longer.', unit: 'duration · e.g. 15m', durationMilliseconds: true, min: 1000, max: 86400000 },
  ] },
  { title: 'Execution limits', help: 'Keep each execution bounded while allowing enough time for useful work.', fields: [
    { key: 'proc.max_execution', title: 'Maximum execution time', help: 'Default time limit for subsequent executions. A job’s declared execution limit takes precedence.', unit: 'duration · e.g. 60m' },
  ] },
]
export const controls = groups.flatMap(group => group.fields)
export const tiers = ['live', 'backfill', 'maintenance'] as const
export const tierTitle = (tier: string) => tier.charAt(0).toUpperCase() + tier.slice(1)
export const inputId = (key: string) => key.replaceAll('.', '-')
export const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
export function durationMs(raw: unknown): number {
  const original = String(raw)
  const negative = original.startsWith('-')
  const value = /^[+-]/.test(original) ? original.slice(1) : original
  if (/^\d+d$/.test(value)) { if (original !== value) return NaN; const days = Number(value.slice(0, -1)); return days <= 36500 ? days * 86400000 : NaN }
  const parts = [...value.matchAll(/((?:\d+(?:\.\d*)?|\.\d+))(ns|us|µs|µs|μs|ms|s|m|h)/g)]
  if (!parts.length || parts.map(part => part[0]).join('') !== value) return NaN
  const scale: Record<string, number> = { ns: .000001, us: .001, 'µs': .001, 'μs': .001, ms: 1, s: 1000, m: 60000, h: 3600000 }
  const milliseconds = parts.reduce((total, part) => total + Number(part[1]) * scale[part[2]], 0)
  const whole = Math.round(milliseconds)
  // Normalize floating arithmetic without truncating fractional milliseconds.
  if (negative) return -milliseconds
  return Math.abs(milliseconds - whole) <= Number.EPSILON * Math.max(1, milliseconds) * 2 ? whole : milliseconds
}
export function formatMilliseconds(value: number): string {
  for (const [unit, scale] of [['d', 86400000], ['h', 3600000], ['m', 60000], ['s', 1000]] as const) {
    if (value >= scale && value % scale === 0) return `${value / scale}${unit}`
  }
  return value >= 1000 ? `${value / 1000}s` : `${value}ms`
}
export function displayValue(control: Control, value: unknown): unknown {
  return control.durationMilliseconds ? formatMilliseconds(Number(value)) : value
}
export function storedValue(control: Control, value: unknown): unknown {
  return control.durationMilliseconds ? durationMs(value) : value
}
export function boundsLabel(control: Control): string {
  if (control.durationMilliseconds) return `${formatMilliseconds(control.min!)}–${formatMilliseconds(control.max!)}`
  return control.min === undefined ? 'Positive duration' : `${control.min}–${control.max} ${control.unit}${control.key === 'fairness.shares' ? ' per tier; total above zero' : ''}`
}
export function validate(draft: Record<string, any>): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const control of controls) {
    const value = draft[control.key]
    if (control.key === 'fairness.shares') {
      if (tiers.some(tier => !Number.isInteger(value?.[tier]) || value[tier] < 0 || value[tier] > 1000)
        || tiers.reduce((sum, tier) => sum + (value?.[tier] || 0), 0) === 0) errors[control.key] = 'Use whole shares from 0–1000; at least one tier needs a share.'
    } else if (control.durationMilliseconds) {
      const milliseconds = durationMs(value)
      if (!Number.isInteger(milliseconds) || milliseconds < control.min! || milliseconds > control.max!) errors[control.key] = `Enter a duration from ${boundsLabel(control)}, in whole milliseconds.`
    } else if (control.min !== undefined) {
      if (!Number.isInteger(value) || value < control.min || value > control.max!) errors[control.key] = `Use a whole number from ${control.min}–${control.max}.`
    } else if (!Number.isFinite(durationMs(value)) || durationMs(value) < 1) errors[control.key] = 'Enter a positive duration, such as 10s or 5m.'
  }
  const timeout = durationMs(draft['lease.timeout'])
  if (timeout < 1000 || timeout % 1000 !== 0) errors['lease.timeout'] = 'Use whole seconds, at least 1s.'
  if (durationMs(draft['lease.heartbeat']) >= timeout) errors['lease.heartbeat'] = 'Heartbeat must be shorter than the lease timeout.'
  return errors
}

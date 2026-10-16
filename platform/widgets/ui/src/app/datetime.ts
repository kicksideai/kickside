// Timestamp helpers shared across the UI. Values arrive as unix seconds, unix ms, or
// RFC/ISO strings; toMs normalizes all three so the formatters take one input shape.

// Unix values below 1e12 are seconds (1e12 ms is 2001-09-09, before which the app has
// no data), so scale those to ms. Numbers and all-digit strings are unix; any other
// string is an RFC/ISO date parsed by Date.parse. Falsy inputs (0, "", null) are "no
// date".
export function toMs(v: number | string | null | undefined): number | null {
  if (!v) return null
  let n: number
  if (typeof v === 'number') {
    n = v
  } else {
    const s = v.trim()
    if (/^\d+$/.test(s)) {
      n = Number(s)
    } else {
      const parsed = Date.parse(s)
      return Number.isNaN(parsed) ? null : parsed
    }
  }
  if (!Number.isFinite(n)) return null
  return n < 1e12 ? n * 1000 : n
}

// Date only. Pass Intl options to match a call site's style (long month, etc.); the
// default is the locale's own toLocaleDateString().
export function formatDate(v: number | string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  const ms = toMs(v)
  if (ms === null) return ''
  return new Date(ms).toLocaleDateString(undefined, opts)
}

// Date + time in the shared row style: short month, day, 2-digit hour/minute.
export function formatDateTime(v: number | string | null | undefined): string {
  const ms = toMs(v)
  if (ms === null) return ''
  return new Date(ms).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

interface RelativeOpts {
  // Append " ago" for past times (default true). Off gives a bare "5m"/"3h"/"2d".
  suffix?: boolean
  // 'day' caps at "Nd"; 'year' adds "Nmo"/"Ny" beyond a month (default 'day').
  maxUnit?: 'day' | 'year'
  // Render times ahead of `now` as "in Nm"/"in Nh"/"in Nd" (default false).
  future?: boolean
  // Reference instant, injectable for tests (default Date.now()).
  now?: number
}

// Relative "N units ago" / "in N units". Call-site variants the options cover:
// default (day cap, suffix " ago"); maxUnit:'year' adds month/year tiers;
// suffix:false omits " ago"; future:true renders ahead-of-now as "in Nm"/"in Nh"/"in Nd".
export function relativeTime(v: number | string | null | undefined, opts?: RelativeOpts): string {
  const ms = toMs(v)
  if (ms === null) return ''
  const now = opts?.now ?? Date.now()
  const suffix = opts?.suffix ?? true
  const maxUnit = opts?.maxUnit ?? 'day'
  const future = opts?.future ?? false
  const MIN = 60_000, HOUR = 60 * MIN, DAY = 24 * HOUR, MONTH = 30 * DAY, YEAR = 365 * DAY
  const diff = now - ms
  if (future && diff < 0) {
    const ahead = -diff
    if (ahead < MIN) return 'in <1m'
    if (ahead < HOUR) return `in ${Math.floor(ahead / MIN)}m`
    if (ahead < DAY) return `in ${Math.floor(ahead / HOUR)}h`
    return `in ${Math.floor(ahead / DAY)}d`
  }
  const d = Math.max(0, diff)
  if (d < MIN) return 'just now'
  const tail = suffix ? ' ago' : ''
  if (d < HOUR) return `${Math.floor(d / MIN)}m${tail}`
  if (d < DAY) return `${Math.floor(d / HOUR)}h${tail}`
  if (maxUnit === 'year') {
    if (d < MONTH) return `${Math.floor(d / DAY)}d${tail}`
    if (d < YEAR) return `${Math.floor(d / MONTH)}mo${tail}`
    return `${Math.floor(d / YEAR)}y${tail}`
  }
  return `${Math.floor(d / DAY)}d${tail}`
}

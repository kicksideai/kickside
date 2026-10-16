// The run state of an automation the round drives, read from its generic drive
// status (the `status` action; the list row carries the same projection). Every
// word here is user-facing: drive phases and source kinds never reach the page.

import type { StatusPill } from './row-status'

export interface DriveSummary {
  drive_key: string
  source_kind?: string
  phase?: string
  enabled?: boolean
  next_run_at?: string | null
  last_run_at?: string | null
  last_round_at?: string | null
  unresolved_count?: number
  uncertain_count?: number
  last_error?: { message?: string } | null
}

export interface DeliveryFailure {
  code: string
  message: string
  at: string
  item_key?: string
}

export interface DriveStatus {
  drives: DriveSummary[]
  delivery_failures?: { count: number; last_error?: DeliveryFailure }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFailure(value: unknown): value is DeliveryFailure {
  return isRecord(value) && typeof value.code === 'string' && typeof value.message === 'string'
    && typeof value.at === 'string' && (value.item_key === undefined || typeof value.item_key === 'string')
}

function isDrive(value: unknown): value is DriveSummary {
  if (!isRecord(value) || typeof value.drive_key !== 'string') return false
  for (const key of ['source_kind', 'phase']) {
    if (value[key] !== undefined && typeof value[key] !== 'string') return false
  }
  if (value.enabled !== undefined && typeof value.enabled !== 'boolean') return false
  for (const key of ['next_run_at', 'last_run_at', 'last_round_at']) {
    if (value[key] !== undefined && value[key] !== null && typeof value[key] !== 'string') return false
  }
  for (const key of ['unresolved_count', 'uncertain_count']) {
    if (value[key] !== undefined && (typeof value[key] !== 'number' || !Number.isInteger(value[key]) || value[key] < 0)) return false
  }
  if (value.last_error !== undefined && value.last_error !== null
    && (!isRecord(value.last_error) || (value.last_error.message !== undefined && typeof value.last_error.message !== 'string'))) return false
  return true
}

export function isDriveStatusResponse(value: unknown): value is DriveStatus & { success: true; next_page_token?: string | null } {
  if (!isRecord(value) || value.success !== true || !Array.isArray(value.drives) || !value.drives.every(isDrive)) return false
  if (value.next_page_token !== undefined && value.next_page_token !== null
    && (typeof value.next_page_token !== 'string' || !value.next_page_token)) return false
  const failures = value.delivery_failures
  return failures === undefined || (isRecord(failures) && typeof failures.count === 'number'
    && Number.isInteger(failures.count) && failures.count >= 0
    && (failures.last_error === undefined || isFailure(failures.last_error)))
}

export interface DriveFact { label: string; value: string; time?: boolean }

const BLOCKED_PROBLEM: Record<string, string> = {
  blocked_identity: 'The account this automation runs as needs to be confirmed.',
  blocked_access: 'This automation lost access to something it uses.',
  blocked_declaration: 'This automation\'s settings need to be fixed.',
}

// The drives that acquire work; a drive with no source only carries state.
function sourceDrives(status?: DriveStatus | null): DriveSummary[] {
  return (status?.drives || []).filter(d => d.source_kind !== 'none')
}

function isPaused(d: DriveSummary): boolean {
  return d.enabled === false || d.phase === 'paused'
}

// drivePill -> the status pill of the drives, or null when the automation has
// no source drives and reports through its public state instead.
export function drivePill(status?: DriveStatus | null): StatusPill | null {
  const drives = sourceDrives(status)
  const failed = (status?.delivery_failures?.count || 0) > 0
  if (!drives.length) return failed ? { kind: 'warn', label: 'Needs attention' } : null
  if (drives.some(d => (d.phase || '') in BLOCKED_PROBLEM)) return { kind: 'warn', label: 'Needs attention' }
  if (drives.every(isPaused)) return { kind: 'off', label: 'Paused' }
  if (failed) return { kind: 'warn', label: 'Needs attention' }
  if (drives.some(d => d.phase === 'degraded')) return { kind: 'warn', label: 'Retrying' }
  if (drives.some(d => d.phase === 'backpressure')) return { kind: 'live', label: 'Catching up' }
  if (drives.some(d => d.phase === 'pending')) return { kind: 'neutral', label: 'Starting' }
  return { kind: 'on', label: 'Active' }
}

// driveProblem -> what keeps the automation from running, in the reader's
// words; a retrying drive reports its last failure.
export function driveProblem(status?: DriveStatus | null): string {
  const failure = status?.delivery_failures?.last_error
  if (failure) return `${failure.code}: ${failure.message}`
  const drives = sourceDrives(status)
  for (const d of drives) {
    const blocked = BLOCKED_PROBLEM[d.phase || '']
    if (blocked) return blocked
  }
  for (const d of drives) {
    if (d.phase !== 'degraded') continue
    const message = typeof d.last_error?.message === 'string' ? d.last_error.message.trim() : ''
    return message || 'The last run failed; it is retrying.'
  }
  return ''
}

// driveFacts -> the drive facts the drawer shows: the next run of an enabled
// drive and the items waiting to retry, and the items awaiting retry.
export function driveFacts(status?: DriveStatus | null): DriveFact[] {
  const drives = sourceDrives(status)
  const facts: DriveFact[] = []
  const next = driveRunTimes(status).next
  if (next) facts.push({ label: 'Next run', value: next, time: true })
  const waiting = drives.reduce((n, d) => n + (d.unresolved_count || 0), 0)
  if (waiting > 0) facts.push({ label: 'Waiting to retry', value: `${waiting} ${waiting === 1 ? 'item' : 'items'}` })
  return facts
}

export function driveRunTimes(status?: DriveStatus | null): { last?: string; next?: string } {
  const drives = sourceDrives(status)
  const last = drives.map(d => d.last_run_at).filter((at): at is string => typeof at === 'string' && !!at).sort().at(-1)
  const next = drives.filter(d => !isPaused(d)).map(d => d.next_run_at)
    .filter((at): at is string => typeof at === 'string' && !!at).sort()[0]
  return { last, next }
}

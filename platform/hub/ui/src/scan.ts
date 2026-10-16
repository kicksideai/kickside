export type ScanSeverity = 'info' | 'warning' | 'critical'

// One thing the scan flagged in a specific module's code.
export interface ScanFinding {
  id: string
  module: string
  version?: string
  severity: ScanSeverity
  title: string
  detail?: string
  // Where in the module it was found (entry id / kind), for triage.
  location?: string
}

// idle      — not started (plan not ready yet)
// scanning  — in flight
// clean     — finished, nothing flagged
// warnings  — finished, only info/warning findings (soft-block, ignorable)
// critical  — finished, at least one critical finding (hard-block)
// error     — the scan itself failed after the backend accepted the request
// unavailable — endpoint/service is not available yet; install flow is non-blocking
// skipped   — operator explicitly chose not to spend reviewer/LLM tokens
export type ScanStatus = 'idle' | 'scanning' | 'clean' | 'warnings' | 'critical' | 'error' | 'unavailable' | 'skipped'

export interface ModuleScanResult {
  module: string
  version?: string
  status: ScanStatus
  summary?: string
  findings: ScanFinding[]
}

export interface ScanResult {
  status: ScanStatus            // overall verdict
  summary?: string             // overall headline
  modules: ModuleScanResult[]  // per-module results
  findings: ScanFinding[]      // flattened across modules (for counts / gating)
  scanned: number
  total: number
  error?: string
}

export function emptyScan(): ScanResult {
  return { status: 'idle', modules: [], findings: [], scanned: 0, total: 0 }
}

export function statusFromFindings(findings: ScanFinding[]): ScanStatus {
  if (findings.some(f => f.severity === 'critical')) return 'critical'
  if (findings.length > 0) return 'warnings'
  return 'clean'
}

export const SEVERITY_META: Record<ScanSeverity, { label: string; icon: string; tone: string }> = {
  info: { label: 'Info', icon: 'tabler:info-circle', tone: 'info' },
  warning: { label: 'Warning', icon: 'tabler:alert-triangle', tone: 'warn' },
  critical: { label: 'Critical', icon: 'tabler:shield-x', tone: 'danger' },
}

// Which severities the operator must acknowledge before install proceeds.
// `critical` is intentionally excluded from "soft" — the dialog hard-blocks it.
export function isSoftFinding(f: ScanFinding): boolean {
  return f.severity !== 'critical'
}

const VALID_STATUS: ScanStatus[] = ['clean', 'warnings', 'critical', 'error', 'unavailable', 'skipped']

function normStatus(s: unknown): ScanStatus {
  return VALID_STATUS.includes(s as ScanStatus) ? (s as ScanStatus) : 'clean'
}
function normSeverity(s: unknown): ScanSeverity {
  return s === 'critical' ? 'critical' : s === 'warning' ? 'warning' : 'info'
}

interface RawFinding { severity?: string; title?: string; detail?: string; location?: string }
interface RawModule { module?: string; version?: string; status?: string; summary?: string; findings?: RawFinding[] }
interface RawScan { overall_status?: string; overall_summary?: string; modules?: RawModule[]; scanned?: number; total?: number }

export function parseScanResponse(data: unknown): ScanResult {
  const raw = (data && typeof data === 'object' ? data : {}) as RawScan
  const modules: ModuleScanResult[] = []
  const flat: ScanFinding[] = []
  for (const m of raw.modules || []) {
    const mod = String(m.module || '')
    const version = m.version ? String(m.version) : undefined
    const findings: ScanFinding[] = (m.findings || []).map((f, i) => ({
      id: `${mod}#${i}`,
      module: mod,
      version,
      severity: normSeverity(f.severity),
      title: String(f.title || 'Issue'),
      detail: f.detail ? String(f.detail) : undefined,
      location: f.location ? String(f.location) : undefined,
    }))
    for (const f of findings) flat.push(f)
    modules.push({
      module: mod,
      version,
      status: normStatus(m.status),
      summary: m.summary ? String(m.summary) : undefined,
      findings,
    })
  }
  const total = typeof raw.total === 'number' ? raw.total : modules.length
  const scanned = typeof raw.scanned === 'number' ? raw.scanned : modules.length
  const status = raw.overall_status ? normStatus(raw.overall_status) : statusFromFindings(flat)
  return {
    status,
    summary: raw.overall_summary ? String(raw.overall_summary) : undefined,
    modules,
    findings: flat,
    scanned,
    total,
  }
}

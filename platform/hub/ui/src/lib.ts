// Pure presentation helpers for the hub UI — markdown rendering (sanitized),
// number/byte formatting, and per-module accent/icon derivation.
// Vue/DOM-free so they are unit-testable and reusable across the catalog and detail views.
import type {
  HubModuleListItem,
  HubDependency,
  HubPlanGraphNode,
  HubPlanRequirement,
  HubAuthStatus,
  HubExecutionStep,
} from './keeper-hub.ts'
export { moduleIdentityKeys, moduleMatchesComponent, normalizeModuleIdentity } from './moduleIdentity.ts'

// ── Number / size formatting ────────────────────────────────────────────────
export function fmtNum(n?: number): string {
  if (!n) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k'
  return String(n)
}

export function fmtBytes(n?: number): string {
  if (!n) return ''
  if (n >= 1_048_576) return (n / 1_048_576).toFixed(1) + ' MB'
  if (n >= 1024) return (n / 1024).toFixed(1) + ' KB'
  return n + ' B'
}

// ── Per-module accent + icon (mirrors keeper's hub) ─────────────────────────
const TYPE_ICONS: Record<string, string> = {
  library: 'tabler:book-2',
  service: 'tabler:server',
  application: 'tabler:apps',
  app: 'tabler:apps',
  page: 'tabler:browser',
  agent: 'tabler:robot',
}
const ACCENT_HUES = [261, 200, 24, 142, 330, 174, 12, 220, 280, 50]

export function moduleAccent(m: HubModuleListItem): string {
  const s = String(m.full_name || m.name || m.id || '')
  let hash = 0
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0
  return `hsl(${ACCENT_HUES[Math.abs(hash) % ACCENT_HUES.length]} 70% 56%)`
}

export function moduleIcon(m: HubModuleListItem): string {
  return TYPE_ICONS[String(m.type || '').toLowerCase()] || 'tabler:package'
}

// An app-type module carries its own bootstrap (gateway, host wiring), so it is
// flagged distinctly from a leaf capability.
export function isAppModule(m?: HubModuleListItem | null): boolean {
  const t = String(m?.type || '').toLowerCase()
  return t === 'app' || t === 'application'
}

export function isInstallableCatalogModule(m?: HubModuleListItem | null): boolean {
  if (!m) return false
  if (m.deprecated === true) return false
  return true
}

interface VisibilityCarrier {
  visibility?: unknown
  module_visibility?: unknown
  access?: unknown
  is_private?: unknown
  private?: unknown
  meta?: Record<string, unknown>
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

// Hub responses may carry visibility on catalog rows directly, or on installed
// dependency metadata. Only mark a module private when that metadata is explicit.
export function moduleIsPrivate(m?: VisibilityCarrier | null): boolean {
  if (!m) return false
  if (m.is_private === true || m.private === true) return true
  const direct = stringValue(m.visibility) || stringValue(m.module_visibility) || stringValue(m.access)
  if (direct === 'private') return true
  const meta = m.meta && typeof m.meta === 'object' ? m.meta : undefined
  if (!meta) return false
  const metaVisibility = stringValue(meta.visibility) || stringValue(meta.module_visibility) || stringValue(meta.access)
  if (metaVisibility === 'private') return true
  const hub = meta.hub && typeof meta.hub === 'object' ? meta.hub as Record<string, unknown> : undefined
  const hubVisibility = hub ? stringValue(hub.visibility) || stringValue(hub.module_visibility) || stringValue(hub.access) : ''
  return hubVisibility === 'private'
}

// ── Minimal, sanitized markdown → HTML for the README ───────────────────────
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Group consecutive bullet (-, *, +) or ordered (1. / 1)) lines into <ul>/<ol>.
function groupLists(text: string): string {
  const lines = text.split('\n')
  const out: string[] = []
  let list: 'ul' | 'ol' | null = null
  const close = () => { if (list) { out.push('</' + list + '>'); list = null } }
  for (const line of lines) {
    const ul = /^[ \t]*[-*+]\s+(.+)$/.exec(line)
    const ol = /^[ \t]*\d+[.)]\s+(.+)$/.exec(line)
    if (ul) {
      if (list !== 'ul') { close(); out.push('<ul>'); list = 'ul' }
      out.push('<li>' + ul[1] + '</li>')
    } else if (ol) {
      if (list !== 'ol') { close(); out.push('<ol>'); list = 'ol' }
      out.push('<li>' + ol[1] + '</li>')
    } else {
      close()
      out.push(line)
    }
  }
  close()
  return out.join('\n')
}

// Render a small, safe subset of markdown. Strips script/style/iframe, inline
// event handlers, and javascript: URLs before any other transform, so an
// untrusted README cannot inject active content.
export function renderMarkdown(src: string): string {
  if (!src) return ''
  let html = src
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '')
  const fences: string[] = []
  html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/g, (_m, _lang, code) => {
    fences.push(`<pre class="rm-pre"><code>${escapeHtml(code)}</code></pre>`)
    return ` FENCE${fences.length - 1} `
  })
  html = html.replace(/`([^`\n]+)`/g, (_m, code) => `<code class="rm-code">${escapeHtml(code)}</code>`)
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
    .replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
    .replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
    .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
    .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
    .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
    .replace(/^-{3,}$/gm, '<hr />')
  html = html.replace(/^(\|.+\|)\n(\|[\s:|-]+\|)\n((?:\|.*\|\n?)+)/gm, (_m, header, _sep, body) => {
    const cells = (row: string) => row.replace(/^\||\|$/g, '').split('|').map(c => c.trim())
    let out = '<table><thead><tr>'
    for (const h of cells(header)) out += `<th>${h}</th>`
    out += '</tr></thead><tbody>'
    for (const r of body.trim().split('\n').map(cells)) {
      out += '<tr>'
      for (const c of r) out += `<td>${c}</td>`
      out += '</tr>'
    }
    return out + '</tbody></table>'
  })
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|\W)\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    .replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
  html = groupLists(html)
  html = html.replace(/ FENCE(\d+) /g, (_m, i) => fences[Number(i)])
  const BLOCK_RE = /^\s*<\/?(?:[a-z][a-z0-9]*)\b/i
  return html.split(/\n{2,}/).map(p => {
    p = p.trim()
    if (!p) return ''
    if (BLOCK_RE.test(p)) return p
    return '<p>' + p.replace(/\n/g, '<br />') + '</p>'
  }).join('\n')
}

// ── Module identity / labels ────────────────────────────────────────────────
export function moduleComponent(m: HubModuleListItem): string {
  if (m.full_name) return m.full_name
  if (m.component) return m.component
  if (m.org && m.name) return `${m.org}/${m.name}`
  if (m.namespace && m.name) return `${m.namespace}/${m.name}`
  return ''
}

export function moduleLabel(m: HubModuleListItem): string {
  return m.display_name || moduleComponent(m) || m.id || '—'
}

export function moduleKey(m: HubModuleListItem): string {
  return String(m.full_name || m.id || moduleComponent(m))
}

// ── Catalog filter + sort (pure; reused by the discovery grid) ──────────────
export function filterCatalog(items: HubModuleListItem[], filter: string): HubModuleListItem[] {
  const f = filter.trim().toLowerCase()
  if (!f) return items
  return items.filter(item => {
    const label = (item.display_name || item.name || '').toLowerCase()
    const slug = (item.full_name || '').toLowerCase()
    const desc = (item.description || '').toLowerCase()
    return label.includes(f) || slug.includes(f) || desc.includes(f)
  })
}

export type SortMode = 'downloads' | 'name' | 'recent'
export function sortCatalog(items: HubModuleListItem[], mode: SortMode): HubModuleListItem[] {
  const list = [...items]
  if (mode === 'name') return list.sort((a, b) => String(a.display_name || a.name).localeCompare(String(b.display_name || b.name)))
  if (mode === 'recent') return list.sort((a, b) => String(b.update_time || '').localeCompare(String(a.update_time || '')))
  return list.sort((a, b) => (b.total_downloads || 0) - (a.total_downloads || 0))
}

// ── Installed ordering: app modules first, then kickside/*, then the rest;
// alphabetical within a tier. `lookup` recovers the catalog item for type info. ──
export function installedTier(dep: HubDependency, lookup: (component: string) => HubModuleListItem | undefined): number {
  if (isAppModule(lookup(dep.component))) return 0
  if (String(dep.component || '').startsWith('kickside/')) return 1
  return 2
}
export function sortInstalled(deps: HubDependency[], lookup: (component: string) => HubModuleListItem | undefined): HubDependency[] {
  return deps.slice().sort((a, b) => {
    const t = installedTier(a, lookup) - installedTier(b, lookup)
    return t !== 0 ? t : String(a.component || '').localeCompare(String(b.component || ''))
  })
}

export interface InstalledDependencyRow extends HubDependency {
  is_root?: boolean
  installed?: boolean
  used_by?: string[]
  used_by_count?: number
  source?: 'hub' | 'local' | string
}

export function isRootDependency(dep: Partial<InstalledDependencyRow>): boolean {
  if (typeof dep.is_root === 'boolean') return dep.is_root
  return (dep.used_by_count || 0) === 0 && (!dep.used_by || dep.used_by.length === 0)
}

export function dependencyRoleLabel(dep: Partial<InstalledDependencyRow>): 'root' | 'transitive' {
  return isRootDependency(dep) ? 'root' : 'transitive'
}

export function dependencyUsedByLabel(dep: Partial<InstalledDependencyRow>): string {
  const usedBy = (dep.used_by || []).filter(Boolean)
  const count = dep.used_by_count ?? usedBy.length
  if (count <= 0) return ''
  if (usedBy.length > 0) return `used by ${usedBy.join(', ')}`
  return `used by ${count} root${count === 1 ? '' : 's'}`
}

// Resolved version: prefer the lock's resolved_modules entry, else strip a leading
// range operator (>=, ^, ~, =, v) from the declared constraint.
export function resolvedDependencyVersion(dep: HubDependency): string {
  const resolved = (dep.meta as { hub?: { resolved_modules?: { name?: string; version?: string }[] } } | undefined)
    ?.hub?.resolved_modules?.find(r => r.name === dep.component)?.version
  if (resolved) return String(resolved)
  const entryVersion = ((dep as { entries?: { module?: string; module_version?: string }[] }).entries || [])
    .find(e => e.module === dep.component && e.module_version)?.module_version
  if (entryVersion) return String(entryVersion)
  const declared = String(dep.version || '').trim()
  if (declared === '*' || declared === '>=v0.0.0' || declared === '>=0.0.0') return ''
  return declared.replace(/^[>=<~^]+v?/, '')
}

// ── Install plan: tree, badges, requirements + error extraction ─────────────
export function requirementKey(req: HubPlanRequirement): string {
  return (req.parameter_name || req.full_id || req.id || req.name || '').trim()
}

export interface PlanTreeNode extends HubPlanGraphNode {
  children: PlanTreeNode[]
}

function planNodeKey(node: HubPlanGraphNode): string {
  return String(node.path || node.module || '').trim()
}

export function buildPlanTree(graph: HubPlanGraphNode[]): PlanTreeNode[] {
  const nodes = graph.map(n => ({ ...n, children: [] as PlanTreeNode[] }))
  const byPath = new Map<string, PlanTreeNode>()
  const byModule = new Map<string, PlanTreeNode[]>()
  for (const node of nodes) {
    const key = planNodeKey(node)
    if (key) byPath.set(key, node)
    const arr = byModule.get(node.module) || []
    arr.push(node)
    byModule.set(node.module, arr)
  }
  const roots: PlanTreeNode[] = []
  for (const node of nodes) {
    let parent: PlanTreeNode | undefined
    const parentKey = String(node.parent || '').trim()
    if (parentKey) parent = byPath.get(parentKey) || byModule.get(parentKey)?.[0]
    if (!parent && node.path && node.path.includes('/')) {
      const idx = node.path.lastIndexOf('/')
      parent = byPath.get(node.path.slice(0, idx))
    }
    if (parent && parent !== node) parent.children.push(node)
    else roots.push(node)
  }
  return roots
}

export type PlanBadgeTone = 'new' | 'shared' | 'installed' | 'upgrade'
export interface PlanNodeBadge { label: string; tone: PlanBadgeTone }

export function planNodeBadges(node: HubPlanGraphNode, opts?: { currentVersion?: string; targetModule?: string }): PlanNodeBadge[] {
  const badges: PlanNodeBadge[] = []
  const current = String(opts?.currentVersion || '')
  const canCompareDirect = current && node.version && (!opts?.targetModule || node.module === opts.targetModule || node.direct)
  if (canCompareDirect && current !== String(node.version)) {
    badges.push({ label: `upgrade from ${current}`, tone: 'upgrade' })
  }
  if (node.installed) badges.push({ label: 'installed', tone: 'installed' })
  else if (node.shared) badges.push({ label: 'shared', tone: 'shared' })
  else badges.push({ label: 'new', tone: 'new' })
  return badges
}

export function isTransitiveRequirement(req: HubPlanRequirement, rootModule?: string): boolean {
  if (req.transitive === true) return true
  if ((req.depth || 0) > 0) return true
  return Boolean(rootModule && req.module && req.module !== rootModule)
}

export function requirementConfiguredBy(req: HubPlanRequirement): string {
  return String(req.module || req.namespace || 'a dependency')
}

interface MissingRequirementsDetails {
  missing_requirements?: { id?: string; component?: string; reason?: string }[]
  missing_requirements_by_id?: Record<string, boolean | string>
}

export function requiredByList(details: unknown): string[] {
  if (!details || typeof details !== 'object') return []
  const d = details as { required_by?: Record<string, unknown> | unknown[]; required_by_text?: unknown }
  if (Array.isArray(d.required_by)) return d.required_by.map(String).filter(Boolean)
  if (d.required_by && typeof d.required_by === 'object') {
    return Object.values(d.required_by).map(String).filter(Boolean)
  }
  if (typeof d.required_by_text === 'string') {
    return d.required_by_text.split(',').map(s => s.trim()).filter(Boolean)
  }
  return []
}

export function executionSteps(payload: unknown): HubExecutionStep[] {
  if (!payload || typeof payload !== 'object') return []
  const p = payload as { payload?: { execution?: HubExecutionStep[] }; execution?: HubExecutionStep[] }
  return p.payload?.execution || p.execution || []
}

export function executionStepLabel(step: HubExecutionStep): string {
  return String(step.step || '').replace(/[._-]+/g, ' ').trim() || 'step'
}

// ── Hub auth + generic error text ───────────────────────────────────────────
export function isHubAuthUsable(st: HubAuthStatus | null | undefined): boolean {
  return Boolean(st?.authenticated && st.expired !== true)
}

export function errorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  if (err && typeof err === 'object') {
    const r = err as { response?: { data?: { error?: string } }; message?: string }
    return r.response?.data?.error || r.message || fallback
  }
  return fallback
}

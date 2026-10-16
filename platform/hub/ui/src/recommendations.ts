import type {
  HubDependency,
  HubListDependenciesResponse,
  HubModuleListItem,
  HubOrg,
} from './keeper-hub.ts'
import {
  isAppModule,
  isInstallableCatalogModule,
  moduleComponent,
  moduleIdentityKeys,
  moduleIsPrivate,
  moduleLabel,
} from './lib.ts'

export interface RecommendationIntent {
  id: string
  label: string
  terms: string[]
}

export const RECOMMENDATION_INTENTS: RecommendationIntent[] = [
  { id: 'connections', label: 'Connect services', terms: ['connection', 'integration', 'oauth', 'provider'] },
  { id: 'automation', label: 'Build automations', terms: ['automation', 'workflow', 'sync', 'webhook'] },
  { id: 'knowledge', label: 'Give agents knowledge', terms: ['knowledge', 'documents', 'search', 'memory'] },
  { id: 'analysis', label: 'Analyze data', terms: ['analysis', 'data', 'statistics', 'reporting'] },
  { id: 'crm', label: 'Manage customer data', terms: ['crm', 'contacts', 'customers', 'sales'] },
  { id: 'agents', label: 'Add agent capabilities', terms: ['agents', 'tools', 'skills', 'mcp'] },
]

const OFFICIAL_ORG = 'kickside'
const MAX_ASSIST_CANDIDATES = 60
const MAX_ASSIST_TITLE = 100
const MAX_ASSIST_DESCRIPTION = 240
const MAX_ASSIST_KEYWORDS = 8
const MAX_ASSIST_KEYWORD = 48
const MAX_CONFIGURED_COMPONENTS = 80
const STOP_WORDS = new Set([
  'about', 'and', 'for', 'from', 'into', 'that', 'the', 'this', 'with', 'workspace',
  'want', 'need', 'make', 'have', 'help', 'use', 'using', 'our', 'your',
])

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function boundedText(value: unknown, max: number): string {
  return stringValue(value).slice(0, max)
}

export interface AssistCandidate {
  component: string
  title: string
  description: string
  keywords: string[]
}

export interface ConfiguredComponentContext {
  component: string
  title?: string
  version?: string
  relationship: 'root' | 'transitive'
}

// The catalog is trusted only as recommendation data, not as an unbounded
// prompt source. Keep enough metadata for semantic matching while placing a
// small deterministic ceiling on both row count and every text field.
export function boundedAssistCandidates(modules: HubModuleListItem[]): AssistCandidate[] {
  return modules.slice(0, MAX_ASSIST_CANDIDATES).map(module => ({
    component: moduleComponent(module).trim(),
    title: boundedText(moduleLabel(module), MAX_ASSIST_TITLE),
    description: boundedText(module.description, MAX_ASSIST_DESCRIPTION),
    keywords: (module.keywords || [])
      .slice(0, MAX_ASSIST_KEYWORDS)
      .map(value => boundedText(String(value), MAX_ASSIST_KEYWORD))
      .filter(Boolean),
  })).filter(module => module.component)
}

// The dependency endpoint is the only authority for what is already present in
// the workspace. Catalog rows contribute display text only; they never infer
// compatibility, ownership, or dependency edges.
export function configuredComponentContext(
  dependencies: HubListDependenciesResponse['dependencies'],
  modules: NonNullable<HubListDependenciesResponse['modules']>,
  catalog: HubModuleListItem[],
): ConfiguredComponentContext[] {
  const titleByIdentity = new Map<string, string>()
  for (const row of catalog) {
    const title = boundedText(moduleLabel(row), MAX_ASSIST_TITLE)
    if (!title) continue
    for (const key of moduleIdentityKeys(row)) if (!titleByIdentity.has(key)) titleByIdentity.set(key, title)
  }
  const out = new Map<string, ConfiguredComponentContext>()
  const add = (
    componentValue: unknown,
    versionValue: unknown,
    relationship: 'root' | 'transitive',
  ) => {
    const component = stringValue(componentValue)
    const key = component.toLowerCase()
    if (!component) return
    const title = titleByIdentity.get(key)
    const version = boundedText(versionValue, 48)
    const existing = out.get(key)
    out.set(key, {
      component,
      ...((title && title.toLowerCase() !== key) || existing?.title ? { title: title || existing?.title } : {}),
      ...(version || existing?.version ? { version: version || existing?.version } : {}),
      relationship: relationship === 'root' || existing?.relationship === 'root' ? 'root' : 'transitive',
    })
  }
  const explicitlyAbsent = new Set<string>()
  for (const row of dependencies) {
    if (row.installed === false) {
      for (const key of moduleIdentityKeys(row)) explicitlyAbsent.add(key)
      continue
    }
    add(row.component, row.version, row.is_root === false ? 'transitive' : 'root')
  }
  for (const row of modules) {
    const keys = moduleIdentityKeys({ module: row.name, name: row.name })
    if (row.installed === false || keys.some(key => explicitlyAbsent.has(key))) continue
    const usedByCount = row.used_by_count ?? row.used_by?.length ?? 0
    if (row.is_root !== true && row.transitive === true && usedByCount === 0) continue
    add(
      row.name,
      row.version,
      row.is_root === true || row.transitive === false ? 'root' : 'transitive',
    )
  }
  return Array.from(out.values())
    .sort((left, right) => Number(left.relationship === 'transitive') - Number(right.relationship === 'transitive')
      || compareText(left.component, right.component))
    .slice(0, MAX_CONFIGURED_COMPONENTS)
}

// Catalog responses can arrive in a different order across keyword/page
// requests. Use a locale-independent comparator and an identity tie-breaker so
// the same catalog snapshot always produces the same recommendations.
function compareText(a: string, b: string): number {
  const left = a.trim().toLowerCase()
  const right = b.trim().toLowerCase()
  return left < right ? -1 : left > right ? 1 : 0
}

export function moduleOrganization(module: HubModuleListItem): string {
  const direct = stringValue(module.org)
  if (direct) return direct
  if (typeof module.organization === 'string') return module.organization.trim()
  if (module.organization && typeof module.organization === 'object') {
    const org = module.organization
    return stringValue(org.slug) || stringValue(org.name)
  }
  const component = moduleComponent(module)
  return component.includes('/') ? component.split('/')[0] : ''
}

export function searchTokens(prompt: string, intentIds: Iterable<string>): string[] {
  const tokens = new Set<string>()
  // User terms are the most specific catalog searches, so keep them ahead of
  // broad intent expansions. The caller intentionally caps live Hub searches;
  // putting intent synonyms first could otherwise crowd out provider names
  // such as `google` or `github`. Expand selected intents in declaration order
  // so toggling the same set in a different UI order produces identical work.
  for (const raw of prompt.toLowerCase().match(/[a-z0-9][a-z0-9_-]{2,}/g) || []) {
    if (!STOP_WORDS.has(raw)) tokens.add(raw)
  }
  const selected = new Set(Array.from(intentIds, id => String(id)))
  for (const intent of RECOMMENDATION_INTENTS) {
    if (!selected.has(intent.id)) continue
    for (const term of intent.terms) tokens.add(term)
  }
  return Array.from(tokens)
}

function moduleText(module: HubModuleListItem): {
  component: string
  title: string
  description: string
  keywords: Set<string>
} {
  return {
    component: moduleComponent(module).toLowerCase(),
    title: moduleLabel(module).toLowerCase(),
    description: stringValue(module.description).toLowerCase(),
    keywords: new Set((module.keywords || []).map(value => String(value).trim().toLowerCase()).filter(Boolean)),
  }
}

export function recommendationScore(module: HubModuleListItem, tokens: string[]): number {
  if (tokens.length === 0) return 1
  const text = moduleText(module)
  let score = 0
  for (const token of tokens) {
    if (text.keywords.has(token)) score += 40
    if (text.component.split(/[^a-z0-9]+/).includes(token)) score += 28
    else if (text.component.includes(token)) score += 12
    if (text.title.split(/[^a-z0-9]+/).includes(token)) score += 24
    else if (text.title.includes(token)) score += 10
    if (text.description.includes(token)) score += 5
  }
  return score
}

export function installedModuleKeys(
  dependencies: (HubDependency & { installed?: boolean })[],
  modules: { name?: string; installed?: boolean }[] = [],
): Set<string> {
  const keys = new Set<string>()
  const explicitlyAbsent = new Set<string>()
  for (const dependency of dependencies) {
    const depKeys = moduleIdentityKeys(dependency)
    if (dependency.installed === false) {
      for (const key of depKeys) explicitlyAbsent.add(key)
      continue
    }
    for (const key of depKeys) keys.add(key)
  }
  for (const module of modules) {
    if (module.installed === false) continue
    const moduleKeys = moduleIdentityKeys({ module: module.name, name: module.name })
    if (moduleKeys.some(key => explicitlyAbsent.has(key))) continue
    for (const key of moduleKeys) keys.add(key)
  }
  return keys
}

export function availableRecommendationModules(
  candidates: HubModuleListItem[],
  installed: Set<string>,
): HubModuleListItem[] {
  const byIdentity = new Map<string, HubModuleListItem>()
  // Registry searches and pages can resolve in any order. Normalize their
  // order before choosing a representative so duplicate catalog hits cannot
  // change either the retained row or downstream group ordering.
  const ordered = candidates.slice().sort((left, right) => {
    const leftIdentity = moduleIdentityKeys(left)[0] || ''
    const rightIdentity = moduleIdentityKeys(right)[0] || ''
    return compareText(leftIdentity, rightIdentity)
      || Number(moduleIsPrivate(right)) - Number(moduleIsPrivate(left))
      || compareText(moduleOrganization(left), moduleOrganization(right))
      || compareText(moduleLabel(left), moduleLabel(right))
      || compareText(stringValue(left.description), stringValue(right.description))
      || compareText((left.keywords || []).map(String).sort(compareText).join('\u0000'), (right.keywords || []).map(String).sort(compareText).join('\u0000'))
      || finiteNumber(right.total_downloads) - finiteNumber(left.total_downloads)
      || compareText(stringValue(left.type), stringValue(right.type))
      || compareText(stringValue(left.latest_version), stringValue(right.latest_version))
      || compareText(stringValue(left.id), stringValue(right.id))
  })
  for (const module of ordered) {
    if (!isInstallableCatalogModule(module) || isAppModule(module)) continue
    const keys = moduleIdentityKeys(module)
    const identity = keys[0]
    if (!identity || keys.some(key => installed.has(key))) continue
    if (!byIdentity.has(identity)) byIdentity.set(identity, module)
  }
  return Array.from(byIdentity.values())
}

export interface RecommendationGroup {
  id: string
  title: string
  modules: HubModuleListItem[]
  private: boolean
}

// A model-assisted ranker is advisory only. Normalize its result against the
// exact catalog snapshot supplied to it, preserving response order while
// dropping duplicates and invented IDs. The caller still applies installability
// and installed-state checks before opening any installer.
export function intersectRecommendedIds(
  value: unknown,
  candidateIds: string[],
  limit = 5,
): string[] {
  if (!Array.isArray(value)) return []
  const canonical = new Map<string, string>()
  for (const id of candidateIds) {
    const trimmed = String(id || '').trim()
    if (trimmed && !canonical.has(trimmed.toLowerCase())) canonical.set(trimmed.toLowerCase(), trimmed)
  }
  const out: string[] = []
  const seen = new Set<string>()
  for (const raw of value) {
    if (typeof raw !== 'string') continue
    const key = raw.trim().toLowerCase()
    const id = canonical.get(key)
    if (!id || seen.has(key)) continue
    seen.add(key)
    out.push(id)
    if (out.length >= limit) break
  }
  return out
}

export function deterministicRecommendationIds(groups: RecommendationGroup[], limit = 3): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const group of groups) {
    for (const module of group.modules) {
      const id = moduleComponent(module).trim()
      const key = id.toLowerCase()
      if (!id || seen.has(key)) continue
      seen.add(key)
      out.push(id)
      if (out.length >= limit) return out
    }
  }
  return out
}

function rank(modules: HubModuleListItem[], tokens: string[]): HubModuleListItem[] {
  return modules
    .map(module => ({ module, score: recommendationScore(module, tokens) }))
    .filter(row => tokens.length === 0 || row.score > 0)
    .sort((a, b) => b.score - a.score
      || finiteNumber(b.module.total_downloads) - finiteNumber(a.module.total_downloads)
      || compareText(moduleLabel(a.module), moduleLabel(b.module))
      || compareText(moduleComponent(a.module), moduleComponent(b.module)))
    .map(row => row.module)
}

function finiteNumber(value: unknown): number {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export function groupRecommendations(
  modules: HubModuleListItem[],
  tokens: string[],
  organizations: HubOrg[],
): RecommendationGroup[] {
  const publicModules = modules.filter(module => !moduleIsPrivate(module))
  const official = rank(
    publicModules.filter(module => moduleOrganization(module).toLowerCase() === OFFICIAL_ORG),
    tokens,
  )
  const groups: RecommendationGroup[] = []
  if (official.length) {
    groups.push({ id: 'official', title: 'Recommended by KickSide', modules: official, private: false })
  }

  const orgs = new Map<string, HubOrg>()
  const orderedOrgs = organizations.slice().sort((left, right) =>
    compareText(stringValue(left.name), stringValue(right.name))
      || compareText(stringValue(left.display_name), stringValue(right.display_name)))
  for (const org of orderedOrgs) {
    const key = stringValue(org.name).toLowerCase()
    if (key && !orgs.has(key)) orgs.set(key, org)
  }
  for (const [key, org] of Array.from(orgs.entries()).sort(([a], [b]) => compareText(a, b))) {
    const privateModules = rank(
      modules.filter(module => moduleIsPrivate(module) && moduleOrganization(module).toLowerCase() === key),
      tokens,
    )
    if (!privateModules.length) continue
    groups.push({
      id: `private:${key}`,
      title: `Private modules from ${stringValue(org.display_name) || stringValue(org.name)}`,
      modules: privateModules,
      private: true,
    })
  }

  const community = rank(
    publicModules.filter(module => moduleOrganization(module).toLowerCase() !== OFFICIAL_ORG),
    tokens,
  )
  if (community.length) {
    groups.push({ id: 'community', title: 'Other available modules', modules: community, private: false })
  }
  return groups
}

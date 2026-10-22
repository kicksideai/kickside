import type { HubListDependenciesResponse } from '../keeper-hub.ts'
import type { InstalledRow, RegistryEntry } from './modules-page.types.ts'

export const ENTRY_KIND_META: Record<string, { label: string; icon: string }> = {
  tool: { label: 'Tools', icon: 'tabler:tool' },
  'agent.trait': { label: 'Agent capabilities', icon: 'tabler:robot' },
  'contract.binding': { label: 'Contract bindings', icon: 'tabler:plug-connected' },
  'contract.definition': { label: 'Contracts', icon: 'tabler:file-description' },
  'view.page': { label: 'Pages', icon: 'tabler:browser' },
  'view.component': { label: 'Components', icon: 'tabler:components' },
}

export function entryGroupKey(e: RegistryEntry): string {
  const t = (e.meta?.type as string) || ''
  if (t && ENTRY_KIND_META[t]) return t
  return e.kind
}

export function entryName(e: RegistryEntry): string {
  return String(e.id).split(':').pop() || e.id
}

export function entryDesc(e: RegistryEntry): string {
  const m = e.meta || {}
  return String((m.comment as string) || (m.title as string) || '')
}

export function entryIcon(e: RegistryEntry, fallback: string): string {
  return String((e.meta?.icon as string) || fallback)
}

export function logError(context: string, err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err)
  console.error(`[${context}]`, msg, err)
}

export function notifyModulesChanged(): void {
  window.dispatchEvent(new CustomEvent('kickside:modules-changed'))
  window.dispatchEvent(new CustomEvent('kickside:nav-changed'))
}

export function normalizeDependencyRows(res: HubListDependenciesResponse): InstalledRow[] {
  const byComponent = new Map<string, InstalledRow>()
  for (const dep of res.dependencies || []) {
    const component = String(dep.component || dep.name || dep.id || '')
    if (!component) continue
    byComponent.set(component, {
      ...dep,
      dependencyId: dep.id,
      component,
      is_root: dep.is_root ?? true,
      used_by: dep.used_by || [],
      used_by_count: dep.used_by_count || 0,
      source: dep.source || 'hub',
    } as InstalledRow)
  }
  for (const mod of res.modules || []) {
    const component = String(mod.name || '')
    if (!component) continue
    const existing = byComponent.get(component)
    if (existing) {
      byComponent.set(component, {
        ...existing,
        version: existing.version || mod.version || '',
        is_root: existing.is_root ?? mod.is_root ?? !mod.transitive,
        used_by: existing.used_by || mod.used_by || [],
        used_by_count: existing.used_by_count ?? mod.used_by_count ?? 0,
        source: existing.source || mod.source || 'hub',
      })
    } else {
      const usedBy = mod.used_by || []
      const usedByCount = mod.used_by_count || usedBy.length || 0
      if (mod.is_root !== true && mod.transitive === true && usedByCount === 0) continue
      const parts = component.split('/')
      byComponent.set(component, {
        id: component,
        namespace: parts.length > 1 ? parts[0] : '',
        name: parts[parts.length - 1] || component,
        component,
        version: mod.version || '',
        is_root: mod.is_root ?? !mod.transitive,
        used_by: usedBy,
        used_by_count: usedByCount,
        source: mod.source || 'local',
      })
    }
  }
  return Array.from(byComponent.values()).filter(dep => dep.installed !== false)
}

export function installedMigrationSummary(dep: InstalledRow): string {
  const migs = dep.migrations || []
  if (migs.length === 0) return ''
  const applied = migs.filter(m => m.status === 'applied').length
  const pending = migs.filter(m => m.status === 'pending').length
  const parts: string[] = []
  if (applied > 0) parts.push(`${applied} applied`)
  if (pending > 0) parts.push(`${pending} pending`)
  return parts.join(', ') || `${migs.length} migrations`
}

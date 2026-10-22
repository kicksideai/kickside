import type { HubDependency, HubModuleListItem, HubMigrationsEntry } from '../keeper-hub.ts'

export interface PluginDetail {
  component: string
  label: string
  description: string
  version: string
  installed: boolean
  installedId?: string
}

export interface RegistryEntry { id: string; kind: string; meta?: Record<string, unknown> }
export interface InstalledRow extends HubDependency {
  dependencyId?: string
  entries?: unknown[]
  migrations?: HubMigrationsEntry[]
  is_root?: boolean
  installed?: boolean
  used_by?: string[]
  used_by_count?: number
  source?: 'hub' | 'local' | string
}
// What opening the install/update dialog needs; the dialog owns the rest.
export interface InstallTarget {
  mode: 'install' | 'update'
  component: string
  version: string
  currentId: string | null
  catalogItem: HubModuleListItem | null
  installedDep: InstalledRow | null
}
export interface Phase { until: number; label: string }
export interface HubVersionItem {
  version?: string
  create_time?: string
  download_count?: number
  size_bytes?: number
  entry_count?: number
  entry_kinds?: string[]
  lua_modules?: string[]
  requirements?: { name?: string; description?: string; default?: string }[]
  dependencies?: { org?: string; name?: string; version_constraint?: string }[]
}

export type InstalledFilterMode = 'all' | 'root' | 'transitive' | 'local'
export type UpdateStatus = 'available' | 'current' | 'planning' | 'updating' | 'updated' | 'blocked' | 'failed'

export interface UpdateInfo {
  component: string
  currentVersion: string
  latestVersion: string
  status: UpdateStatus
  message?: string
}

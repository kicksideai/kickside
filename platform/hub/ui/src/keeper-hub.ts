// Minimal shape of the authenticated axios client supplied by the `api` import
// from @wippy-fe/proxy. The hub client only needs get/post/delete; typing it
// locally keeps this module standalone (no SPA composables / app types).
import { moduleIdentityKeys } from './moduleIdentity.ts'

export interface Api {
  get: <T = unknown>(url: string, config?: { params?: Record<string, unknown> }) => Promise<{ data: T; status?: number }>
  post: <T = unknown>(url: string, body?: unknown) => Promise<{ data: T; status?: number }>
  delete: <T = unknown>(url: string) => Promise<{ data: T; status?: number }>
}

export type MigrationInstallPolicy = 'none' | 'up'
export type MigrationUninstallPolicy = 'block' | 'leave' | 'down'

export interface HubDependency {
  id: string
  namespace: string
  name: string
  component: string
  version: string
  parameters?: Record<string, unknown> | HubParameter[]
  meta?: Record<string, unknown>
}

export interface HubModuleListItem {
  id?: string
  org?: string
  organization?: string | { name?: string; slug?: string }
  namespace?: string
  name?: string
  full_name?: string
  component?: string
  display_name?: string
  description?: string
  latest_version?: string
  visibility?: string
  type?: string
  keywords?: string[]
  total_downloads?: number
  favorites_count?: number
  update_time?: string
  license?: string
  deprecated?: boolean
  [k: string]: unknown
}

export interface HubBrowseResponse {
  success: boolean
  items: HubModuleListItem[]
  total: number
  page: number
  page_size: number
  // True when the request resolved a connected Hub identity; false (with
  // not_connected) when the user has not signed in to the Hub.
  connected?: boolean
  not_connected?: boolean
}

// One Wippy Hub organization the active token grants access to.
export interface HubOrg {
  id?: string
  name?: string
  display_name?: string
  role?: string
}

// Status of the manually-entered Hub registry token, from /hub/auth. Never
// carries the token value — only whether one is stored, who it belongs to, and
// which orgs it grants.
export interface HubAuthStatus {
  success: boolean
  authenticated: boolean
  registry?: string
  username?: string
  user_id?: string
  scope?: string
  expires_at?: string
  expired?: boolean
  orgs?: HubOrg[]
  [k: string]: unknown
}

export interface HubVersionsResponse {
  success: boolean
  items: { version: string; created_at?: string; [k: string]: unknown }[]
  total?: number
  page?: number
  page_size?: number
}

export interface HubMigrationsEntry {
  id: string
  component?: string
  status: 'applied' | 'pending' | string
  [k: string]: unknown
}

export interface HubRequiredSetupStatus {
  success: boolean
  descriptor: string
  contract: string
  ready: boolean
  status: string
  phase?: string
  retryable?: boolean
  reason?: string
  error?: string
  detail?: string
  remediation?: string
  checked_at?: string
  title?: string
  pending_label?: string
  ready_label?: string
  [k: string]: unknown
}

export interface HubListDependenciesResponse {
  success: boolean
  count?: number
  module_count?: number
  dependencies: (HubDependency & {
    entries?: unknown[]
    migrations?: HubMigrationsEntry[]
    is_root?: boolean
    installed?: boolean
    used_by?: string[]
    used_by_count?: number
    source?: 'hub' | 'local' | string
  })[]
  modules?: {
    name: string
    version?: string
    installed?: boolean
    is_root?: boolean
    transitive?: boolean
    source?: 'hub' | 'local' | string
    used_by?: string[]
    used_by_count?: number
  }[]
}

export interface HubMigrationListResponse {
  success: boolean
  migrations: HubMigrationsEntry[]
}

export type HubParameterValue = string | number | boolean | unknown[] | Record<string, unknown>

export interface HubParameter {
  name: string
  value: HubParameterValue
}

export interface HubPlanInstallArgs {
  component: string
  version?: string
  id?: string
  namespace?: string
  name?: string
  parameters?: HubParameter[]
  requirement_bindings?: HubParameter[]
  run_migrations?: boolean
  meta?: Record<string, unknown>
}

export interface HubInstallArgs extends HubPlanInstallArgs {
  dry_run?: boolean
  migration_policy?: MigrationInstallPolicy
}

export interface HubInstallBatchArgs {
  dependencies: HubPlanInstallArgs[]
  dry_run?: boolean
  run_migrations?: boolean
  migration_policy?: MigrationInstallPolicy
}

// One node of the resolved install graph: the module plus every transitive
// dependency it pulls in. `direct` marks the requested root.
export interface HubPlanGraphNode {
  module: string
  org?: string
  name?: string
  namespace?: string
  version?: string
  constraint?: string
  depth?: number
  parent?: string
  path?: string
  direct?: boolean
  installed?: boolean
  shared?: boolean
  entry_count?: number
  entry_kinds?: string[]
  size_bytes?: number
}

// A single host-resource seam the install must bind. `missing` (no default and
// no provided value) blocks the install until the operator supplies a value.
export interface HubPlanRequirement {
  id?: string
  name?: string
  short_name?: string
  parameter_name?: string
  full_id?: string
  module?: string
  namespace?: string
  version?: string
  depth?: number
  description?: string
  default?: HubParameterValue
  value?: HubParameterValue
  value_source?: string
  expected_type?: 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array'
  choice_reason?: string
  resolution_error?: { kind?: string; code?: string; message: string; details?: unknown }
  expected_kind?: string
  required?: boolean
  missing?: boolean
  invalid?: boolean
  invalid_reason?: string
  transitive?: boolean
  targets?: unknown[]
  suggestions?: {
    value?: HubParameterValue
    label?: string
    description?: string
    source?: string
    dependency_id?: string
    kind?: string
  }[]
}

// The plan endpoint returns these fields at the TOP level (not under `plan`).
export interface HubInstallPlan {
  success: boolean
  applicable?: boolean
  dependency?: HubDependency
  graph?: HubPlanGraphNode[]
  module_count?: number
  requirements?: HubPlanRequirement[]
  requirement_count?: number
  missing_requirements?: string[]
  parameter_values?: Record<string, HubParameterValue>
  recommended_parameters?: HubParameter[]
  migration_policy?: string
  migrations?: HubMigrationsEntry[]
  install_payload?: Record<string, unknown>
}

export interface HubUninstallArgs {
  id?: string
  component?: string
  dry_run?: boolean
  migration_policy?: MigrationUninstallPolicy
}

export interface HubExecutionStep {
  step: string
  status: 'ok' | 'failed' | 'rolled_back' | 'rollback_failed' | string
  message?: string
  [k: string]: unknown
}

export interface HubUninstallPreview {
  removed?: { name?: string; component?: string; version?: string }[]
  kept?: { name?: string; component?: string; version?: string; used_by?: string[] }[]
  kept_under_uncertainty?: { name?: string; component?: string; version?: string; reason?: string }[]
  warnings?: string[]
}

export interface HubApplyResult {
  ok?: boolean
  stage?: string
  version?: string | number
  message?: string
  [k: string]: unknown
}

export interface HubPlanResponse {
  success: boolean
  plan: {
    component?: string
    version?: string
    requires?: { id: string; component: string; version?: string }[]
    missing_requirements?: { id?: string; component?: string; version?: string; reason?: string }[]
    migrations?: HubMigrationsEntry[]
    [k: string]: unknown
  }
}

export interface HubMutationResponse {
  success: boolean
  dependency?: HubDependency
  plan?: HubPlanResponse['plan']
  patches?: unknown[]
  apply?: HubApplyResult
  lock?: { changed?: boolean; [k: string]: unknown }
  migrations?: { operation?: string; entry_ids?: string[]; count?: number; result?: unknown }
  operation_id?: string
  baseline_version?: string | number
  dry_run?: boolean
  warning?: string
  migration_policy?: string
  preview?: HubUninstallPreview
  payload?: {
    preview?: HubUninstallPreview
    execution?: HubExecutionStep[]
    [k: string]: unknown
  }
  execution?: HubExecutionStep[]
}

// ── Security scan (keeper agent backend) ────────────────────────────────────
export interface HubScanFinding {
  severity: 'info' | 'warning' | 'critical'
  title: string
  detail?: string
  location?: string
}
export interface HubScanModule {
  module: string
  version?: string
  status: string
  summary?: string
  findings: HubScanFinding[]
}
export interface HubScanResponse {
  success: boolean
  overall_status: string
  overall_summary?: string
  modules: HubScanModule[]
  scanned: number
  total: number
}

export interface HubErrorBody {
  success: false
  code: string
  error: string
  details?: unknown
}

export class KeeperHubError extends Error {
  code: string
  status?: number
  details?: unknown

  constructor(code: string, message: string, status?: number, details?: unknown) {
    super(message)
    this.name = 'KeeperHubError'
    this.code = code
    this.status = status
    this.details = details
  }
}

function unwrap<T>(promise: Promise<{ data: T | HubErrorBody; status?: number }>): Promise<T> {
  return promise
    .then(({ data, status }) => {
      if (!data || typeof data !== 'object') {
        throw new KeeperHubError('UNKNOWN', 'empty or malformed response body', status)
      }
      const body = data as { success?: boolean } & Record<string, unknown>
      if (body.success === false) {
        const err = data as HubErrorBody
        throw new KeeperHubError(err.code || 'UNKNOWN', err.error || 'request failed', status, err.details)
      }
      return data as T
    })
    .catch((e: unknown) => {
      if (e instanceof KeeperHubError) throw e
      const ax = e as { response?: { status?: number; data?: HubErrorBody } }
      const body = ax?.response?.data
      if (body && body.success === false) {
        throw new KeeperHubError(body.code || 'UNKNOWN', body.error || 'request failed', ax.response?.status, body.details)
      }
      const status = ax?.response?.status
      const message = (e instanceof Error && e.message) || 'network error'
      throw new KeeperHubError(status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : 'NETWORK', message, status)
    })
}

export function keeperHub(api: Api) {
  return {
    securityProjectionStatus() {
      return unwrap<{ current: boolean; scope_name: string }>(api.get('/api/v1/security/projection'))
    },

    listDependencies(opts?: { component?: string; includeEntries?: boolean; includeMigrations?: boolean }) {
      const params: Record<string, string> = {}
      if (opts?.component) params.component = opts.component
      if (opts?.includeEntries === false) params.entries = '0'
      if (opts?.includeMigrations === false) params.migrations = '0'
      return unwrap<HubListDependenciesResponse>(api.get('/api/v1/keeper/hub/dependencies', { params }))
    },

    browseModules(opts?: { query?: string; page?: number; pageSize?: number; visibility?: string; type?: string; sort?: string }) {
      const params: Record<string, string | number> = {}
      if (opts?.query) params.q = opts.query
      if (opts?.page) params.page = opts.page
      if (opts?.pageSize) params.page_size = opts.pageSize
      if (opts?.visibility) params.visibility = opts.visibility
      if (opts?.type) params.type = opts.type
      if (opts?.sort) params.sort = opts.sort
      return unwrap<HubBrowseResponse>(api.get('/api/v1/keeper/hub/browse', { params }))
    },

    listVersions(component: string) {
      return unwrap<HubVersionsResponse>(api.get('/api/v1/keeper/hub/versions', { params: { module: component } }))
    },

    getReadme(component: string, version?: string) {
      const params: Record<string, string> = { module: component }
      if (version) params.version = version
      return unwrap<{ success: boolean; content: string; filename?: string; version?: string }>(api.get('/api/v1/keeper/hub/readme', { params }))
    },

    listMigrations(component?: string) {
      const params: Record<string, string> = {}
      if (component) params.component = component
      return unwrap<HubMigrationListResponse>(api.get('/api/v1/keeper/hub/migrations', { params }))
    },

    planInstall(args: HubPlanInstallArgs) {
      return unwrap<HubInstallPlan>(api.post('/api/v1/keeper/hub/dependencies/plan', args))
    },

    install(args: HubInstallArgs | HubInstallBatchArgs) {
      return unwrap<HubMutationResponse>(api.post('/api/v1/keeper/hub/dependencies/install', args))
    },

    uninstall(args: HubUninstallArgs) {
      return unwrap<HubMutationResponse>(api.post('/api/v1/keeper/hub/dependencies/uninstall', args))
    },

    runMigrations(args: { component?: string; entry_ids?: string[]; operation: 'up' | 'down'; dry_run?: boolean }) {
      return unwrap<HubMutationResponse>(api.post('/api/v1/keeper/hub/migrations/run', args))
    },

    requiredSetupStatus(descriptor: string) {
      return unwrap<HubRequiredSetupStatus>(api.get('/api/v1/hub/required-setup', { params: { descriptor } }))
    },

    applyRequiredSetup(descriptor: string) {
      return unwrap<HubRequiredSetupStatus>(api.post('/api/v1/hub/required-setup', { descriptor }))
    },

    scan(args: { component: string; version?: string }) {
      return unwrap<HubScanResponse>(api.post('/api/v1/keeper/hub/scan', args))
    },

    // ── Hub token (manual, native hub.auth seam, admin-set) ──────────────
    authStatus() {
      return unwrap<HubAuthStatus>(api.get('/api/v1/hub/auth'))
    },

    authenticate(token: string) {
      return unwrap<HubAuthStatus>(api.post('/api/v1/hub/auth', { token }))
    },

    logout() {
      return unwrap<{ success: boolean }>(api.delete('/api/v1/hub/auth'))
    },

    async fetchAllByKeyword(keyword: string | string[], pageSize = 100): Promise<HubModuleListItem[]> {
      const targets = (Array.isArray(keyword) ? keyword : [keyword])
        .map(k => k.trim().toLowerCase())
        .filter(Boolean)
      if (targets.length === 0) return []
      const targetSet = new Set(targets)
      const out: HubModuleListItem[] = []
      const seen = new Set<string>()
      const MAX_PAGES = 50
      async function* pages(params: Record<string, unknown>) {
        for (let page = 1; page <= MAX_PAGES; page++) {
          const res = await unwrap<HubBrowseResponse>(api.get('/api/v1/keeper/hub/browse', {
            params: { ...params, page, page_size: pageSize },
          }))
          const items = res.items || []
          yield items
          if (typeof res.total === 'number' && page * pageSize >= res.total) return
          if (items.length < pageSize) return
        }
      }
      // Query each keyword as its own server-side text search; a single q only
      // matches that one term, so distinct tags (e.g. kickside vs agent-tools)
      // must be fetched separately, then unioned and filtered by keyword.
      for (const q of targets) {
        for await (const items of pages({ q })) {
          for (const item of items) {
            const keys = (item.keywords || []).map(k => String(k).trim().toLowerCase())
            const organization = typeof item.org === 'string'
              ? item.org
              : typeof item.organization === 'string'
                ? item.organization
                : item.organization?.slug || item.organization?.name || String(item.full_name || '').split('/')[0]
            const orgKey = String(organization || '').trim().toLowerCase()
            // Some older Hub rows have no version keywords even though their
            // organization is itself one of the requested discovery scopes.
            // Keep those modules discoverable (for example kickside/sso and
            // kickside/self-reflection) while retaining keyword filtering for
            // cross-organization capability tags such as agent-tools.
            if (!keys.some(k => targetSet.has(k)) && !targetSet.has(orgKey)) continue
            const dedupeKey = moduleIdentityKeys(item)[0] || String(item.full_name || item.id || '').trim().toLowerCase()
            if (!dedupeKey || seen.has(dedupeKey)) continue
            seen.add(dedupeKey)
            out.push(item)
          }
        }
      }
      const privateKeys = new Set<string>()
      for await (const items of pages({ visibility: 'private' })) {
        for (const item of items) {
          for (const key of moduleIdentityKeys(item)) privateKeys.add(key)
        }
      }
      for (const item of out) {
        if (moduleIdentityKeys(item).some(key => privateKeys.has(key))) item.visibility = 'private'
      }
      return out
    },
  }
}

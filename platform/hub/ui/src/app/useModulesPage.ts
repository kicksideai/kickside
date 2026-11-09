import { computed, onMounted, ref } from 'vue'
import { api, host, loadByTagName } from '@wippy-fe/proxy'
import { useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'
import {
  keeperHub,
  KeeperHubError,
  type HubModuleListItem,
} from '../keeper-hub.ts'
import {
  dependencyRoleLabel,
  dependencyUsedByLabel,
  errorMessage,
  executionStepLabel,
  filterCatalog,
  isRootDependency,
  isInstallableCatalogModule,
  moduleAccent,
  moduleComponent,
  moduleIsPrivate,
  moduleIdentityKeys,
  moduleIcon,
  moduleKey,
  moduleMatchesComponent,
  resolvedDependencyVersion,
  sortCatalog,
  sortInstalled,
} from '../lib.ts'
import { entryIcon, entryName, entryDesc, installedMigrationSummary, logError, normalizeDependencyRows, notifyModulesChanged } from './modules-page-utils.ts'
import type { InstalledFilterMode, InstalledRow, InstallTarget } from './modules-page.types.ts'
import { useModuleDetails } from './useModuleDetails.ts'
import { useModuleUninstall } from './useModuleUninstall.ts'
import { useModuleUpdates } from './useModuleUpdates.ts'
import { useModuleHubAuth } from './useModuleHubAuth.ts'

const TAGS = ['kickside', 'kickside-plugin']
const LABEL = 'kickside'
const HUB_PORTAL = 'https://portal.wippy.ai/account/tokens'

const UNINSTALL_MIGRATION_OPTIONS = [
  { label: 'Block if any applied', value: 'block' },
  { label: 'Leave applied migrations', value: 'leave' },
  { label: 'Revert (down) - may lose data', value: 'down' },
]

export function useModulesPage() {
  const hub = keeperHub(api)
  const initialLoading = ref(true)

  const statusBanner = ref<{ kind: 'ok' | 'error'; message: string } | null>(null)
  const hubAuth = useModuleHubAuth({ hub, loadCatalog })
  const {
    isAdmin, authLoaded, hubConnected, hubUsable, hubStatus, hubToken, showTokenPanel,
    hubConnecting, hubError, hubOrgs, hubIdentity, hubTokenStored, hubTokenExpired,
    hubTokenIcon, hubTokenButtonLabel, hubExpiry, loadAuth, loadHubAuth, saveHubToken,
    clearHubToken,
  } = hubAuth

  const installed = ref<InstalledRow[]>([])
  const installedFilter = ref('')
  const installedKindFilter = ref<InstalledFilterMode>('all')
  const installedLoading = ref(false)
  const installedError = ref<string | null>(null)
  const installedOpen = ref(true)
  const catalog = ref<HubModuleListItem[]>([])
  const catalogLoading = ref(false)
  const catalogError = ref<string | null>(null)
  const browseFilter = ref('')
  const sortBy = ref<'downloads' | 'name' | 'recent'>('downloads')

  const details = useModuleDetails({
    hub, installed, catalog, installedDepFor, installedCanUpdate, installedUpdateDisabledReason,
    installedCanUninstall, installedIsPrivate,
  })
  const {
    selected, selectedModule, detailReadme, detailEntries, detailLoading, detailTab, detailVersions,
    envVars, requirements, detailGroups, versionMeta, selectedInstalledDep, selectedCanUpdate,
    selectedUpdateDisabledReason, selectedCanUninstall, selectedIsPrivate,
    openDetail, closeDetail, refreshSelectedDetail,
  } = details
  const uninstallState = useModuleUninstall({
    hub, selected, selectedInstalledDep, installedIsRoot, installedUninstallDisabledReason,
    installedCanUninstall, refreshAll, refreshSelectedDetail, showToast, notifyModulesChanged,
  })
  const {
    uninstallDialogOpen, uninstallDep, uninstallPolicy, uninstallRunning, uninstallPreviewLoading,
    uninstallPreview, uninstallExecution, uninstallCode, uninstallError, uninstallRequiredBy,
    uninstallPhase, uninstallElapsedSec, selectedUninstallBlockedReason, uninstallBlockedReason,
    uninstallActionBlockedReason, openUninstallDialog, previewUninstall, runUninstall,
  } = uninstallState
  const updateState = useModuleUpdates({
    hub, installed, installedError, installedCanUpdate, installedIsRoot, showToast, notifyModulesChanged,
    refreshAll, refreshSelectedDetail,
  })
  const {
    updateScan, updateScanLoading, updateAllRunning, availableUpdates, updateInfoForDep,
    updateStatusLabel, updateStatusIcon, updateStatusBusy, scanInstalledUpdates,
    updateInstalledDependency, updateAllAvailable,
  } = updateState

  const installedComponents = computed(() => {
    const set = new Set<string>()
    for (const d of installed.value) {
      if (d.installed === false) continue
      for (const key of moduleIdentityKeys(d)) set.add(key)
    }
    return set
  })
  const browseItems = computed(() => filterCatalog(catalog.value, browseFilter.value))
  const availableItems = computed(() => browseItems.value.filter(m => !isInstalled(m)))
  const featured = computed(() => {
    if (browseFilter.value.trim() || availableItems.value.length < 7) return []
    return [...availableItems.value]
      .sort((a, b) => (b.total_downloads || 0) - (a.total_downloads || 0))
      .slice(0, 6)
  })
  const featuredKeys = computed(() => new Set(featured.value.map(moduleKey)))
  const sortedItems = computed(() =>
    sortCatalog(availableItems.value.filter(m => !featuredKeys.value.has(moduleKey(m))), sortBy.value))
  const installedTotal = computed(() => installed.value.filter(dep => dep.installed !== false).length)
  const visibleInstalled = computed<InstalledRow[]>(() => {
    const q = installedFilter.value.trim().toLowerCase()
    const mode = installedKindFilter.value
    const rows = installed.value.filter(dep => {
      if (dep.installed === false) return false
      if (mode === 'root' && !installedIsRoot(dep)) return false
      if (mode === 'transitive' && installedIsRoot(dep)) return false
      if (mode === 'local' && dep.source !== 'local') return false
      if (!q) return true
      const haystack = [
        dep.component,
        dep.id,
        dep.name,
        dep.namespace,
        dep.version,
        dep.source,
        installedRole(dep),
        installedUsedBy(dep),
        installedMigrationSummary(dep),
        resolvedDependencyVersion(dep),
      ].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(q)
    })
    return sortInstalled(rows, catalogItemFor) as InstalledRow[]
  })
  const catalogInstalledTotal = computed(() =>
    installed.value.filter(dep => dep.installed !== false && Boolean(catalogItemFor(dep.component))).length)
  const visibleCatalogInstalled = computed(() =>
    visibleInstalled.value.filter(dep => Boolean(catalogItemFor(dep.component))).length)
  const accessDenied = computed(() => authLoaded.value && !isAdmin.value)

  // Trigger state only — the two-pane InstallDialog owns plan/requirements/scan.
  const installTarget = ref<InstallTarget | null>(null)
  const installDialogOpen = computed(() => installTarget.value !== null)

  function catalogItemFor(component: string): HubModuleListItem | undefined {
    return catalog.value.find(c => moduleMatchesComponent(c, component))
  }

  function installedAccent(dep: InstalledRow): string {
    return moduleAccent({ full_name: dep.component } as HubModuleListItem)
  }

  function installedIcon(dep: InstalledRow): string {
    const it = catalogItemFor(dep.component)
    return it ? moduleIcon(it) : 'tabler:package'
  }

  function installedIsPrivate(dep: InstalledRow): boolean {
    return moduleIsPrivate(catalogItemFor(dep.component)) || moduleIsPrivate(dep)
  }

  function installedIsRoot(dep?: InstalledRow | null): boolean {
    return isRootDependency(dep || {})
  }

  function installedRole(dep: InstalledRow): string {
    return dependencyRoleLabel(dep)
  }

  function installedUsedBy(dep: InstalledRow): string {
    return dependencyUsedByLabel(dep)
  }

  function installedUninstallDisabledReason(dep: InstalledRow): string {
    if (installedIsRoot(dep)) return ''
    const usedBy = installedUsedBy(dep)
    return usedBy
      ? `Installed as a dependency; ${usedBy}`
      : 'Installed as a dependency of another module'
  }

  function installedCanUpdate(dep?: InstalledRow | null): boolean {
    return Boolean(dep?.component && dep.source !== 'local')
  }

  function installedUpdateDisabledReason(dep: InstalledRow): string {
    if (dep.source === 'local') return 'Local replacement; update from source'
    return 'No Hub dependency update action available'
  }

  function installedCanUninstall(dep?: InstalledRow | null): boolean {
    return Boolean(dep && installedIsRoot(dep))
  }

  function isInstalled(m: HubModuleListItem): boolean {
    return moduleIdentityKeys(m).some(key => installedComponents.value.has(key))
  }

  function installedDepFor(component: string): InstalledRow | undefined {
    return installed.value.find(d => moduleMatchesComponent(d, component))
  }

  function showToast(kind: 'ok' | 'error', message: string): void {
    const t = host?.toast
    if (typeof t === 'function') {
      t({ severity: kind === 'ok' ? 'success' : 'error', summary: message })
    } else {
      statusBanner.value = { kind, message }
      setTimeout(() => { if (statusBanner.value?.message === message) statusBanner.value = null }, 5000)
    }
  }

  function detailInstall() {
    if (!selected.value) return
    openInstallDialog({
      full_name: selected.value.component,
      latest_version: selected.value.version,
      description: selected.value.description,
    } as HubModuleListItem)
  }

  function detailUpdate() {
    const dep = selected.value && installedDepFor(selected.value.component)
    if (dep && installedCanUpdate(dep)) openUpdateDialog(dep)
  }

  function detailUninstall() {
    const dep = selected.value && installedDepFor(selected.value.component)
    if (dep && installedCanUninstall(dep)) openUninstallDialog(dep)
  }

  async function loadInstalled() {
    installedLoading.value = true
    installedError.value = null
    try {
      installed.value = normalizeDependencyRows(await hub.listDependencies())
    } catch (e: unknown) {
      installed.value = []
      logError('modules:listDependencies', e)
      installedError.value = errorMessage(e, 'dependency graph unavailable')
    }
    installedLoading.value = false
  }

  async function loadCatalog() {
    catalogLoading.value = true
    catalogError.value = null
    try {
      catalog.value = (await hub.fetchAllByKeyword(TAGS)).filter(isInstallableCatalogModule)
    } catch (e: unknown) {
      logError('modules:catalog', e)
      if (e instanceof KeeperHubError && (e.code === 'UNAUTHORIZED' || e.code === 'FORBIDDEN')) {
        // The not-connected notice already prompts for a token; stacking an error
        // banner here would render a second, redundant "set a Hub token" message.
        hubUsable.value = false
      } else {
        catalogError.value = errorMessage(e, `failed to load ${LABEL} catalog`)
      }
    } finally {
      catalogLoading.value = false
    }
  }

  async function refreshAll() {
    await Promise.all([loadInstalled(), loadCatalog()])
  }

  function openInstallDialog(m: HubModuleListItem) {
    const component = moduleComponent(m)
    installTarget.value = {
      mode: 'install',
      component,
      version: m.latest_version ? String(m.latest_version) : '',
      currentId: null,
      catalogItem: catalogItemFor(component) || m,
      installedDep: null,
    }
  }

  function openUpdateDialog(dep: InstalledRow) {
    if (!installedCanUpdate(dep)) return
    installTarget.value = {
      mode: 'update',
      component: dep.component,
      // Let the dialog load and select the newest published release. Seeding
      // this with the resolved version re-submits the current package while
      // presenting the operation as an update.
      version: '',
      currentId: dep.dependencyId || null,
      catalogItem: catalogItemFor(dep.component) || null,
      installedDep: dep,
    }
  }

  function closeInstallDialog() {
    installTarget.value = null
  }

  // The dialog owns the install; the page just refreshes its lists + open detail.
  async function onInstallChanged() {
    await refreshAll()
    await refreshSelectedDetail()
    closeInstallDialog()
  }


  onMounted(() => {
    void loadByTagName('wc-render-markdown', { timeoutMs: 8000 }).catch(() => {})
  })
  useHostVisibilityRefresh(async () => {
    try {
      await loadAuth()
      if (!isAdmin.value) return
      await loadHubAuth()
      await refreshAll()
    } finally {
      initialLoading.value = false
    }
  })

  return {
    LABEL,
    HUB_PORTAL,
    UNINSTALL_MIGRATION_OPTIONS,
    initialLoading,
    accessDenied,
    statusBanner,
    hubConnected,
    hubStatus,
    hubToken,
    showTokenPanel,
    hubConnecting,
    hubError,
    hubOrgs,
    hubIdentity,
    hubTokenStored,
    hubTokenExpired,
    hubTokenIcon,
    hubTokenButtonLabel,
    hubExpiry,
    selected,
    selectedModule,
    detailReadme,
    detailEntries,
    detailLoading,
    detailTab,
    detailVersions,
    envVars,
    requirements,
    detailGroups,
    versionMeta,
    selectedCanUpdate,
    selectedUpdateDisabledReason,
    selectedCanUninstall,
    selectedIsPrivate,
    selectedUninstallBlockedReason,
    entryName,
    entryDesc,
    entryIcon,
    installed,
    installedFilter,
    installedKindFilter,
    installedTotal,
    updateScanLoading,
    updateAllRunning,
    availableUpdates,
    installedLoading,
    installedError,
    installedOpen,
    catalog,
    catalogLoading,
    catalogError,
    catalogInstalledTotal,
    visibleCatalogInstalled,
    browseFilter,
    sortBy,
    availableItems,
    featured,
    sortedItems,
    visibleInstalled,
    catalogItemFor,
    installedAccent,
    installedIcon,
    installedIsPrivate,
    installedIsRoot,
    installedRole,
    installedUsedBy,
    installedCanUpdate,
    installedUpdateDisabledReason,
    installedCanUninstall,
    installedMigrationSummary,
    updateInfoForDep,
    updateStatusLabel,
    updateStatusIcon,
    updateStatusBusy,
    scanInstalledUpdates,
    updateInstalledDependency,
    updateAllAvailable,
    installDialogOpen,
    installTarget,
    closeInstallDialog,
    onInstallChanged,
    uninstallDialogOpen,
    uninstallDep,
    uninstallPolicy,
    uninstallRunning,
    uninstallPreviewLoading,
    uninstallPreview,
    uninstallExecution,
    uninstallCode,
    uninstallError,
    uninstallRequiredBy,
    uninstallBlockedReason,
    uninstallActionBlockedReason,
    uninstallPhase,
    uninstallElapsedSec,
    previewUninstall,
    executionStepLabel,
    openDetail,
    closeDetail,
    detailInstall,
    detailUpdate,
    detailUninstall,
    refreshAll,
    saveHubToken,
    clearHubToken,
    openUpdateDialog,
    openUninstallDialog,
    installedUninstallDisabledReason,
    runUninstall,
  }
}

import { computed, ref, type Ref } from 'vue'
import { keeperHub } from '../keeper-hub.ts'
import { errorMessage, resolvedDependencyVersion } from '../lib.ts'
import type { InstalledRow, UpdateInfo, UpdateStatus } from './modules-page.types.ts'

interface ModuleUpdatesOptions {
  hub: ReturnType<typeof keeperHub>
  installed: Ref<InstalledRow[]>
  installedError: Ref<string | null>
  installedCanUpdate: (dep?: InstalledRow | null) => boolean
  installedIsRoot: (dep?: InstalledRow | null) => boolean
  showToast: (kind: 'ok' | 'error', message: string) => void
  notifyModulesChanged: () => void
  refreshAll: () => Promise<void>
  refreshSelectedDetail: () => Promise<void>
}

export function useModuleUpdates({ hub, installed, installedError, installedCanUpdate, installedIsRoot, showToast, notifyModulesChanged, refreshAll, refreshSelectedDetail }: ModuleUpdatesOptions) {
  const updateScan = ref<Record<string, UpdateInfo>>({})
  const updateScanLoading = ref(false)
  const updateAllRunning = ref(false)
  const availableUpdates = computed(() => installed.value.filter(dep => {
    const info = updateInfoForDep(dep)
    return installedCanUpdate(dep) && installedIsRoot(dep) && info
      && ['available', 'failed', 'blocked'].includes(info.status)
      && isNewerVersion(info.latestVersion, resolvedDependencyVersion(dep))
  }))

function versionParts(v: string): number[] {
  const cleaned = String(v || '').trim().replace(/^[^\d]*/, '')
  const match = cleaned.match(/\d+(?:\.\d+)*/)
  return (match?.[0] || '').split('.').filter(Boolean).map(Number)
}

function compareVersions(a: string, b: string): number {
  const aa = versionParts(a)
  const bb = versionParts(b)
  const n = Math.max(aa.length, bb.length)
  for (let i = 0; i < n; i++) {
    const av = aa[i] || 0
    const bv = bb[i] || 0
    if (av !== bv) return av > bv ? 1 : -1
  }
  return String(a || '').localeCompare(String(b || ''))
}

function latestVersionFrom(items: { version?: string; is_latest?: boolean }[] = []): string {
  const latest = items.find(v => v.is_latest) || items[0]
  return String(latest?.version || '')
}

function isNewerVersion(latest: string, current: string): boolean {
  return Boolean(latest && current && latest !== current && compareVersions(latest, current) > 0)
}

// Updating must never turn a tracking root into an exact pin. The Hub
// planner resolves this lower-bound constraint to the selected release now,
// while subsequent resolves remain eligible for newer releases.
function trackingConstraint(version: string): string {
  const normalized = String(version || '').trim().replace(/^[>=<~^]+v?/, '')
  return normalized ? `>=${normalized}` : '>=v0.0.0'
}

function updateInfoForDep(dep?: InstalledRow | null): UpdateInfo | null {
  if (!dep?.component) return null
  return updateScan.value[dep.component] || null
}

function setUpdateInfo(component: string, patch: Partial<UpdateInfo>) {
  const current = updateScan.value[component]
  updateScan.value = {
    ...updateScan.value,
    [component]: {
      component,
      currentVersion: patch.currentVersion ?? current?.currentVersion ?? '',
      latestVersion: patch.latestVersion ?? current?.latestVersion ?? '',
      status: patch.status ?? current?.status ?? 'current',
      message: patch.message,
    },
  }
}

function updateStatusLabel(dep: InstalledRow): string {
  const info = updateInfoForDep(dep)
  if (!info) return ''
  if (info.status === 'available') return `${info.currentVersion || '?'} → ${info.latestVersion || '?'}`
  if (info.status === 'planning') return 'planning'
  if (info.status === 'updating') return 'updating'
  if (info.status === 'updated') return 'updated'
  if (info.status === 'blocked') return 'blocked'
  if (info.status === 'failed') return 'failed'
  return ''
}

function updateStatusIcon(dep: InstalledRow): string {
  const status = updateInfoForDep(dep)?.status
  if (status === 'planning' || status === 'updating') return 'tabler:loader-2'
  if (status === 'updated') return 'tabler:check'
  if (status === 'blocked') return 'tabler:lock'
  if (status === 'failed') return 'tabler:alert-triangle'
  return 'tabler:arrow-up-circle'
}

function updateStatusBusy(dep: InstalledRow): boolean {
  const status = updateInfoForDep(dep)?.status
  return status === 'planning' || status === 'updating'
}

async function scanInstalledUpdates() {
  if (!hub || updateScanLoading.value) return
  updateScanLoading.value = true
  installedError.value = null
  const next: Record<string, UpdateInfo> = {}
  let found = 0
  let failed = 0
  try {
    for (const dep of installed.value) {
      if (!installedCanUpdate(dep) || !installedIsRoot(dep)) continue
      const currentVersion = resolvedDependencyVersion(dep)
      try {
        const versions = await hub.listVersions(dep.component)
        const latestVersion = latestVersionFrom(versions.items)
        const status: UpdateStatus = isNewerVersion(latestVersion, currentVersion) ? 'available' : 'current'
        if (status === 'available') found++
        next[dep.component] = { component: dep.component, currentVersion, latestVersion, status }
        updateScan.value = { ...next }
      } catch (e: unknown) {
        failed++
        next[dep.component] = {
          component: dep.component,
          currentVersion,
          latestVersion: '',
          status: 'failed',
          message: errorMessage(e, 'version scan failed'),
        }
        updateScan.value = { ...next }
      }
    }
    showToast('ok', `Found ${found} update${found === 1 ? '' : 's'}${failed ? `, ${failed} failed` : ''}`)
  } finally {
    updateScanLoading.value = false
  }
}

type PlannedRootUpdate =
  | { ok: true; version: string }
  | { ok: false; reason: 'blocked' | 'failed'; message: string }

// Plan one installed root's update to `version`. Marks the row planning while
// the planner runs and records why it cannot proceed; the caller decides what
// a refusal means for the rest of its batch.
async function planRootUpdate(component: string, version: string): Promise<PlannedRootUpdate> {
  setUpdateInfo(component, { status: 'planning', message: undefined })
  try {
    const plan = await hub!.planInstall({ component, version, run_migrations: true })
    const missing = plan.missing_requirements || []
    if (missing.length) {
      const message = `Missing required settings: ${missing.join(', ')}`
      setUpdateInfo(component, { status: 'blocked', message })
      return { ok: false, reason: 'blocked', message }
    }
    return { ok: true, version }
  } catch (e: unknown) {
    const message = errorMessage(e, 'update plan failed')
    setUpdateInfo(component, { status: 'failed', message })
    return { ok: false, reason: 'failed', message }
  }
}

// A row whose update never started must not keep a spinner: planning and
// updating are transient, and only this call ends them.
function clearTransientUpdates(rows: InstalledRow[]): void {
  for (const dep of rows) {
    const status = updateInfoForDep(dep)?.status
    if (status === 'planning' || status === 'updating') {
      setUpdateInfo(dep.component, { status: 'available', message: undefined })
    }
  }
}

async function updateInstalledDependency(dep: InstalledRow): Promise<boolean> {
  if (!hub || !dep.component) return false
  let info = updateInfoForDep(dep)
  if (!info) {
    const currentVersion = resolvedDependencyVersion(dep)
    try {
      const versions = await hub.listVersions(dep.component)
      const latestVersion = latestVersionFrom(versions.items)
      info = {
        component: dep.component,
        currentVersion,
        latestVersion,
        status: isNewerVersion(latestVersion, currentVersion) ? 'available' : 'current',
      }
      setUpdateInfo(dep.component, info)
    } catch (e: unknown) {
      setUpdateInfo(dep.component, { status: 'failed', message: errorMessage(e, 'version scan failed') })
      return false
    }
  }
  if (!info.latestVersion || !isNewerVersion(info.latestVersion, resolvedDependencyVersion(dep))) return true
  try {
    const version = trackingConstraint(info.latestVersion)
    const planned = await planRootUpdate(dep.component, version)
    if (!planned.ok) return false
    setUpdateInfo(dep.component, { status: 'updating' })
    await hub.install({
      component: dep.component,
      version,
      run_migrations: true,
      migration_policy: 'up',
    })
    setUpdateInfo(dep.component, {
      status: 'updated',
      currentVersion: info.latestVersion,
      latestVersion: info.latestVersion,
      message: undefined,
    })
    notifyModulesChanged()
    return true
  } catch (e: unknown) {
    setUpdateInfo(dep.component, { status: 'failed', message: errorMessage(e, 'update failed') })
    return false
  }
}

async function updateAllAvailable() {
  if (updateAllRunning.value || availableUpdates.value.length === 0) return
  updateAllRunning.value = true
  const pending = [...availableUpdates.value]
  try {
    const dependencies = []
    let refusal: 'blocked' | 'failed' | null = null
    for (const dep of pending) {
      const info = updateInfoForDep(dep)
      if (!info?.latestVersion) continue
      const planned = await planRootUpdate(dep.component, trackingConstraint(info.latestVersion))
      if (!planned.ok) {
        // One root that cannot be planned ends the batch: this install is
        // atomic, so a partial set is not an outcome worth sending.
        refusal = planned.reason
        continue
      }
      dependencies.push({ component: dep.component, version: planned.version, run_migrations: true })
      setUpdateInfo(dep.component, { status: 'updating', message: undefined })
    }

    if (refusal) {
      clearTransientUpdates(pending)
      showToast('error', refusal === 'blocked'
        ? 'Update all is blocked by required settings'
        : 'Update all stopped: a module could not be planned')
      return
    }

    if (dependencies.length === 0) {
      showToast('error', 'No updates could be applied')
      return
    }

    await hub!.install({ dependencies, run_migrations: true, migration_policy: 'up' })
    for (const dep of pending) {
      const info = updateInfoForDep(dep)
      if (info?.status !== 'updating') continue
      setUpdateInfo(dep.component, {
        status: 'updated',
        currentVersion: info.latestVersion,
        latestVersion: info.latestVersion,
        message: undefined,
      })
    }
    notifyModulesChanged()
    showToast('ok', `Updated ${dependencies.length} module${dependencies.length === 1 ? '' : 's'}`)
    await refreshAll()
    await refreshSelectedDetail()
  } catch (e: unknown) {
    const message = errorMessage(e, 'update failed')
    for (const dep of pending) {
      if (updateInfoForDep(dep)?.status === 'updating') {
        setUpdateInfo(dep.component, { status: 'failed', message })
      }
    }
    clearTransientUpdates(pending)
    showToast('error', message)
  } finally {
    updateAllRunning.value = false
  }
}


  return {
    updateScan, updateScanLoading, updateAllRunning, availableUpdates,
    updateInfoForDep, updateStatusLabel, updateStatusIcon, updateStatusBusy,
    scanInstalledUpdates, updateInstalledDependency, updateAllAvailable,
  }
}

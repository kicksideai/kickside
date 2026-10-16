import { computed, ref, watch, onUnmounted, type Ref } from 'vue'
import { keeperHub, KeeperHubError, type HubExecutionStep, type HubMutationResponse, type HubUninstallPreview, type MigrationUninstallPolicy } from '../keeper-hub.ts'
import { errorMessage, executionSteps, requiredByList } from '../lib.ts'
import { logError } from './modules-page-utils.ts'
import type { InstalledRow, Phase, PluginDetail } from './modules-page.types.ts'

interface ModuleUninstallOptions {
  hub: ReturnType<typeof keeperHub>
  selected: Ref<PluginDetail | null>
  selectedInstalledDep: Ref<InstalledRow | undefined>
  installedIsRoot: (dep?: InstalledRow | null) => boolean
  installedUninstallDisabledReason: (dep: InstalledRow) => string
  installedCanUninstall: (dep?: InstalledRow | null) => boolean
  refreshAll: () => Promise<void>
  refreshSelectedDetail: () => Promise<void>
  showToast: (kind: 'ok' | 'error', message: string) => void
  notifyModulesChanged: () => void
}

const UNINSTALL_PHASES: Phase[] = [
  { until: 1000, label: 'Planning uninstall' },
  { until: 4000, label: 'Stopping services' },
  { until: 6000, label: 'Removing entries' },
  { until: 8000, label: 'Updating lock' },
  { until: Infinity, label: 'Finalizing' },
]

function useProgress(runningRef: Ref<boolean>, phases: Phase[]) {
  const elapsedMs = ref(0)
  let startedAt = 0
  let interval: ReturnType<typeof setInterval> | null = null
  function stop() {
    if (interval) { clearInterval(interval); interval = null }
  }
  watch(runningRef, (running) => {
    stop()
    if (running) {
      startedAt = Date.now()
      elapsedMs.value = 0
      interval = setInterval(() => { elapsedMs.value = Date.now() - startedAt }, 200)
    } else {
      elapsedMs.value = 0
    }
  })
  onUnmounted(stop)
  const phase = computed(() => phases.find(p => elapsedMs.value < p.until)?.label || phases[phases.length - 1].label)
  const elapsedSec = computed(() => Math.floor(elapsedMs.value / 1000))
  return { phase, elapsedSec }
}


export function useModuleUninstall({ hub, selected, selectedInstalledDep, installedIsRoot, installedUninstallDisabledReason, installedCanUninstall, refreshAll, refreshSelectedDetail, showToast, notifyModulesChanged }: ModuleUninstallOptions) {
const uninstallDialogOpen = ref(false)
const uninstallDep = ref<InstalledRow | null>(null)
const uninstallPolicy = ref<MigrationUninstallPolicy>('block')
const uninstallRunning = ref(false)
const uninstallPreviewLoading = ref(false)
const uninstallPreview = ref<HubUninstallPreview | null>(null)
const uninstallExecution = ref<HubExecutionStep[]>([])
const uninstallCode = ref<string | null>(null)
const uninstallError = ref<string | null>(null)
const uninstallRequiredBy = ref<string[]>([])
const { phase: uninstallPhase, elapsedSec: uninstallElapsedSec } = useProgress(uninstallRunning, UNINSTALL_PHASES)
const selectedUninstallBlockedReason = computed(() => {
  const dep = selectedInstalledDep.value
  if (!selected.value?.installed || !dep || installedIsRoot(dep)) return ''
  return installedUninstallDisabledReason(dep)
})
const uninstallBlockedReason = computed(() => {
  if (!uninstallDep.value) return ''
  if (uninstallRunning.value) return 'Uninstall is running.'
  if (uninstallPreviewLoading.value) return 'Waiting for uninstall preview to finish.'
  if (uninstallRequiredBy.value.length > 0) {
    return `Still required by: ${uninstallRequiredBy.value.join(', ')}. Uninstall those root modules first.`
  }
  if (uninstallCode.value === 'MIGRATIONS_APPLIED') {
    return 'Applied migrations exist. Choose "Leave applied migrations" or "Revert (down)", then preview again.'
  }
  if (uninstallError.value && !uninstallPreview.value) return uninstallError.value
  if (!uninstallPreview.value) return 'Run Preview first so Keeper can show what will be removed.'
  return ''
})
const uninstallActionBlockedReason = computed(() => {
  if (!uninstallDep.value) return 'No module selected.'
  if (uninstallRunning.value) return 'Uninstall is running.'
  if (uninstallPreviewLoading.value) return 'Waiting for uninstall preview to finish.'
  if (uninstallRequiredBy.value.length > 0) {
    return `Still required by: ${uninstallRequiredBy.value.join(', ')}. Uninstall those root modules first.`
  }
  if (uninstallCode.value === 'MIGRATIONS_APPLIED') {
    return 'Applied migrations exist. Choose "Leave applied migrations" or "Revert (down)", then preview again.'
  }
  return ''
})

async function openUninstallDialog(dep: InstalledRow) {
  if (!installedCanUninstall(dep)) return
  uninstallDep.value = dep
  uninstallPolicy.value = 'block'
  uninstallCode.value = null
  uninstallError.value = null
  uninstallRequiredBy.value = []
  uninstallPreview.value = null
  uninstallExecution.value = []
  uninstallDialogOpen.value = true
  void previewUninstall()
}

async function previewUninstall() {
  const dep = uninstallDep.value
  if (!dep) return
  uninstallPreviewLoading.value = true
  uninstallCode.value = null
  uninstallError.value = null
  uninstallRequiredBy.value = []
  uninstallPreview.value = null
  uninstallExecution.value = []
  try {
    const res = await hub.uninstall({ id: dep.id, component: dep.component, dry_run: true, migration_policy: uninstallPolicy.value })
    uninstallPreview.value = res.preview || res.payload?.preview || null
    if (!uninstallPreview.value) {
      uninstallError.value = 'Uninstall preview returned no preview data.'
    }
  } catch (e: unknown) {
    logError('modules:uninstall-preview', e)
    if (e instanceof KeeperHubError) {
      uninstallCode.value = e.code
      uninstallRequiredBy.value = requiredByList(e.details)
      if (e.code === 'NOT_FOUND') {
        uninstallDialogOpen.value = false
        uninstallDep.value = null
        showToast('ok', 'Module already removed; refreshed installed modules')
        await refreshAll()
        await refreshSelectedDetail()
        return
      }
    }
    uninstallError.value = errorMessage(e, 'uninstall preview failed')
  } finally {
    uninstallPreviewLoading.value = false
  }
}

async function runUninstall() {
  const dep = uninstallDep.value
  if (!dep || uninstallActionBlockedReason.value) return
  uninstallRunning.value = true
  uninstallCode.value = null
  uninstallError.value = null
  uninstallExecution.value = []
  try {
    const res: HubMutationResponse = await hub.uninstall({ id: dep.id, component: dep.component, migration_policy: uninstallPolicy.value })
    uninstallExecution.value = executionSteps(res)
    showToast('ok', `Module uninstalled: ${dep.id}`)
    notifyModulesChanged()
    await refreshAll()
    await refreshSelectedDetail()
  } catch (e: unknown) {
    logError('modules:uninstall', e)
    if (e instanceof KeeperHubError) {
      uninstallCode.value = e.code
      uninstallRequiredBy.value = requiredByList(e.details)
      uninstallExecution.value = executionSteps(e.details)
      if (e.code === 'NOT_FOUND') {
        uninstallDialogOpen.value = false
        uninstallDep.value = null
        showToast('ok', 'Module already removed; refreshed installed modules')
        await refreshAll()
        await refreshSelectedDetail()
        return
      }
    }
    uninstallError.value = errorMessage(e, 'uninstall failed')
  } finally {
    uninstallRunning.value = false
  }
}

watch(uninstallPolicy, () => {
  if (uninstallDialogOpen.value && uninstallDep.value && !uninstallRunning.value) void previewUninstall()
})


  return {
    uninstallDialogOpen, uninstallDep, uninstallPolicy, uninstallRunning, uninstallPreviewLoading,
    uninstallPreview, uninstallExecution, uninstallCode, uninstallError, uninstallRequiredBy,
    uninstallPhase, uninstallElapsedSec, selectedUninstallBlockedReason, uninstallBlockedReason,
    uninstallActionBlockedReason, openUninstallDialog, previewUninstall, runUninstall,
  }
}

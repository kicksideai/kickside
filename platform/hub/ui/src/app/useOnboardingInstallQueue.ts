import { ref, type Ref } from 'vue'
import { keeperHub, type HubModuleListItem, type HubParameter } from '../keeper-hub.ts'
import { moduleComponent } from '../lib.ts'
import { KeeperHubError } from '../keeper-hub.ts'
import { requiredSetupDescriptors, runRequiredSetups } from './requiredSetup.ts'

export type QueueLedgerStatus = 'pending' | 'installing' | 'installed' | 'failed'
export interface QueueLedgerItem { component: string; label: string; status: QueueLedgerStatus; message?: string }

interface OnboardingInstallQueueOptions {
  hub: ReturnType<typeof keeperHub>
  installed: Ref<Set<string>>
  installedCount: Ref<number>
  error: Ref<string>
  selectableCandidates: () => HubModuleListItem[]
  candidateKey: (module: HubModuleListItem) => string
  candidateById: (id: string) => HubModuleListItem | null
  queuedLabel: (id: string) => string
  profileParameters: (id: string) => HubParameter[] | undefined
  loadInstalled: () => Promise<void>
  apiMessage: (cause: unknown, fallback: string) => string
}

export function useOnboardingInstallQueue({ hub, installed, installedCount, error, selectableCandidates, candidateKey, candidateById, queuedLabel, profileParameters, loadInstalled, apiMessage }: OnboardingInstallQueueOptions) {
  const queue = ref<string[]>([])
  const advancing = ref(false)
  const queueCompleted = ref(0)
  const queueTotal = ref(0)
  const queueLedger = ref<QueueLedgerItem[]>([])
  const pendingSetups = new Map<string, string[]>()

  function isQueued(module: HubModuleListItem): boolean {
    return queue.value.some(id => id.toLowerCase() === candidateKey(module))
  }

function toggleQueued(module: HubModuleListItem) {
  const id = moduleComponent(module).trim()
  const key = id.toLowerCase()
  if (!id || !candidateById(id) || advancing.value) return
  queue.value = isQueued(module)
    ? queue.value.filter(existing => existing.toLowerCase() !== key)
    : [...queue.value, id]
  resetRunProgress()
}

function addQueued(ids: string[]) {
  const next = [...queue.value]
  const seen = new Set(next.map(id => id.toLowerCase()))
  for (const id of ids) {
    const module = candidateById(id)
    if (!module) continue
    const canonical = moduleComponent(module).trim()
    const key = canonical.toLowerCase()
    if (!canonical || seen.has(key)) continue
    seen.add(key)
    next.push(canonical)
  }
  queue.value = next
  resetRunProgress()
}

  function resetRunProgress() {
  queueCompleted.value = 0
  queueTotal.value = 0
  queueLedger.value = []
}

function setLedgerStatus(component: string, status: QueueLedgerStatus, message?: string) {
  const key = component.toLowerCase()
  queueLedger.value = queueLedger.value.map(item => item.component.toLowerCase() === key
    ? { ...item, status, message }
    : item)
}

function reconcileLedgerWithInstalled() {
  if (!queueLedger.value.length) return
  queueLedger.value = queueLedger.value.map(item => installed.value.has(item.component.toLowerCase()) && !pendingSetups.has(item.component.toLowerCase())
    ? { ...item, status: 'installed' }
    : item)
  queueCompleted.value = queueLedger.value.filter(item => item.status === 'installed').length
}

async function startQueue() {
  if (advancing.value || !queue.value.length) return
  advancing.value = true
  error.value = ''
  try {
    await loadInstalled()
    reconcileLedgerWithInstalled()
    pruneInstalledQueue()
    if (!queue.value.length) return
    if (!queueTotal.value || !queueLedger.value.length) {
      queueCompleted.value = 0
      queueTotal.value = queue.value.length
      queueLedger.value = queue.value.map(component => ({
        component,
        label: queuedLabel(component),
        status: 'pending',
      }))
    }
    const pending = [...queue.value]
    const failed: string[] = []
    let refreshFailed = false
    queue.value = []
    for (const component of pending) {
      setLedgerStatus(component, 'installing')
      try {
        const key = component.toLowerCase()
        let descriptors = pendingSetups.get(key)
        if (!installed.value.has(key) || !descriptors) {
          const parameters = profileParameters(component)
          const planArgs = {
            component, run_migrations: true,
            ...(parameters?.length ? { parameters } : {}),
          }
          const deadline = Date.now() + 15_000
          while (!(await hub.securityProjectionStatus()).current) {
            const remaining = deadline - Date.now()
            if (remaining <= 0) throw new Error('Security permissions do not become current after installation.')
            await new Promise(resolve => setTimeout(resolve, Math.min(250, remaining)))
          }
          const plan = await hub.planInstall(planArgs)
          descriptors = requiredSetupDescriptors(plan.requirements || [])
          const blocked = (plan.requirements || [])
            .filter(requirement => requirement.missing || requirement.invalid)
            .map(requirement => requirement.full_id || requirement.parameter_name || requirement.name || 'unknown requirement')
          const blockerNames = Array.from(new Set([...(plan.missing_requirements || []), ...blocked]))
          if (blockerNames.length) {
            throw new Error(`Missing or invalid package settings: ${blockerNames.join(', ')}`)
          }
          if (descriptors.length) pendingSetups.set(key, descriptors)
          const result = await hub.install({
            component, migration_policy: 'up',
            ...(parameters?.length ? { parameters } : {}),
          })
          if (result.success !== true) throw new KeeperHubError('INSTALL_INCOMPLETE', 'Keeper does not confirm a successful install.', undefined, result)
        }
        await runRequiredSetups(hub, descriptors)
        pendingSetups.delete(key)
      } catch (cause) {
        const message = apiMessage(cause, 'Install failed.')
        setLedgerStatus(component, 'failed', message)
        failed.push(component)
        continue
      }
      setLedgerStatus(component, 'installed')
      installedCount.value++
      queueCompleted.value++
      window.dispatchEvent(new CustomEvent('kickside:modules-changed'))
      window.dispatchEvent(new CustomEvent('kickside:nav-changed'))
      try {
        await loadInstalled()
        reconcileLedgerWithInstalled()
      } catch {
        // The install already succeeded. A stale graph refresh must not turn it
        // into a failed package that the user could accidentally reinstall.
        refreshFailed = true
      }
    }
    queue.value = failed
    if (failed.length) {
      error.value = `${failed.length} package${failed.length === 1 ? '' : 's'} could not be installed. Review the failed item${failed.length === 1 ? '' : 's'} below and retry.`
    } else if (refreshFailed) {
      error.value = 'Packages were installed, but the installed-module list could not be refreshed. Refresh the page before continuing.'
    }
  } catch (cause) {
    error.value = apiMessage(cause, 'Could not refresh installed modules before starting the queue.')
  } finally {
    advancing.value = false
  }

  function pruneInstalledQueue() {
    const availableKeys = new Set(selectableCandidates().map(candidateKey))
    queue.value = queue.value.filter((id, index, rows) => {
      const key = id.toLowerCase()
      return (availableKeys.has(key) || pendingSetups.has(key)) && rows.findIndex(value => value.toLowerCase() === key) === index
    })
  }
}

  return { queue, advancing, queueCompleted, queueTotal, queueLedger, toggleQueued, addQueued, isQueued, resetRunProgress, setLedgerStatus, reconcileLedgerWithInstalled, startQueue }
}

import { computed, ref, watch, onUnmounted } from 'vue'
import { api, host, on } from '@wippy-fe/proxy'
import {
  keeperHub,
  KeeperHubError,
  type HubDependency,
  type HubModuleListItem,
  type HubInstallPlan,
  type HubPlanGraphNode,
  type HubParameter,
  type HubParameterValue,
  type HubMutationResponse,
  type MigrationInstallPolicy,
} from '../keeper-hub.ts'
import {
  buildPlanTree,
  errorMessage,
  executionSteps,
  executionStepLabel,
  planNodeBadges,
  requirementConfiguredBy,
  requirementKey,
  isTransitiveRequirement,
  resolvedDependencyVersion,
} from '../lib.ts'
import { emptyScan } from '../scan.ts'
import { logError, notifyModulesChanged } from './modules-page-utils.ts'
import { useInstallRequirements } from './useInstallRequirements.ts'
import { useInstallSecurityScan } from './useInstallSecurityScan.ts'
import { requiredSetupDescriptors, runRequiredSetups } from './requiredSetup.ts'

export type SectionKey = 'overview' | 'modules' | 'requirements' | 'scan' | 'review'
export type VersionMode = 'pin' | 'track'
export type SectionTone = 'none' | 'ok' | 'warn' | 'danger' | 'loading'

export interface InstallDialogProps {
  open: boolean
  mode: 'install' | 'update'
  component: string
  version: string
  currentId?: string | null
  catalogItem?: HubModuleListItem | null
  installedDep?: HubDependency | null
}

export interface HubVersionItem {
  version?: string
  create_time?: string
  download_count?: number
  size_bytes?: number
  entry_count?: number
  entry_kinds?: string[]
  requirements?: { name?: string; description?: string; default?: HubParameterValue }[]
}

const PROGRESS_LABELS: Record<string, string> = {
  'hub.install.started': 'Publishing changeset',
  'hub.install.finished': 'Finalizing',
  'hub.migrations.started': 'Running migrations',
  'hub.migrations.finished': 'Migrations applied',
  'hub.uninstall.started': 'Removing entries',
}

export const INSTALL_MIGRATION_OPTIONS = [
  { label: 'Run migrations (up)', value: 'up' as const },
  { label: 'Skip migrations (none)', value: 'none' as const },
]

function eventName(msg: unknown): string {
  if (!msg || typeof msg !== 'object') return ''
  const roots = [msg, (msg as Record<string, unknown>).data, (msg as Record<string, unknown>).payload, (msg as Record<string, unknown>).detail]
  for (const r of roots) {
    if (r && typeof r === 'object' && typeof (r as Record<string, unknown>).event === 'string') {
      return String((r as Record<string, unknown>).event)
    }
  }
  return ''
}

export function useInstallDialog(props: InstallDialogProps, emit: { (e: 'close'): void; (e: 'changed'): void }) {
  const hub = keeperHub(api)

  const activeSection = ref<SectionKey>('overview')

  // ── Version ────────────────────────────────────────────────────────────────
  const version = ref('')
  const versionMode = ref<VersionMode>('pin')
  const versions = ref<HubVersionItem[]>([])
  const versionsLoading = ref(false)
  const versionOptions = computed(() => [
    { label: 'latest', value: '' },
    ...versions.value.map(v => String(v.version || '')).filter(Boolean).map(v => ({ label: v, value: v })),
  ])
  const versionMeta = computed<HubVersionItem | undefined>(() =>
    versions.value.find(v => v.version === version.value) || versions.value[0])
  // What actually gets stored on the ns.dependency: a pin (exact) or a tracking
  // constraint (>=X). Empty = latest → backend default constraint.
  function versionArg(): string | undefined {
    const v = version.value.trim().replace(/^>=?/, '')
    if (!v) return undefined
    return versionMode.value === 'track' ? `>=${v}` : v
  }
  const currentVersion = computed(() => props.installedDep ? resolvedDependencyVersion(props.installedDep) : '')

  // ── Overview (readme) ────────────────────────────────────────────────────
  const readme = ref('')
  const readmeLoading = ref(false)

  // ── Plan ─────────────────────────────────────────────────────────────────
  const plan = ref<HubInstallPlan | null>(null)
  const planLoading = ref(false)
  const planCurrent = ref(false)
  const planError = ref<string | null>(null)
  const planCode = ref<string | null>(null)
  const planErrorDetails = ref<unknown>(null)
  const directModules = computed<HubPlanGraphNode[]>(() =>
    (plan.value?.graph || []).filter(n => n.direct || n.module === props.component))
  const transitiveModules = computed<HubPlanGraphNode[]>(() =>
    (plan.value?.graph || []).filter(n => !n.direct && n.module !== props.component))
  const planTree = computed(() => buildPlanTree(plan.value?.graph || []))
  const planRows = computed(() => {
    const out: (HubPlanGraphNode & { level: number })[] = []
    const visit = (nodes: typeof planTree.value, level: number) => {
      for (const node of nodes) {
        out.push({ ...node, level })
        visit(node.children, level + 1)
      }
    }
    visit(planTree.value, 0)
    return out
  })
  const moduleCount = computed(() => plan.value?.module_count || plan.value?.graph?.length || 0)
  const totalSize = computed(() => (plan.value?.graph || []).reduce((sum, n) => sum + (n.size_bytes || 0), 0))
  function badgesForNode(n: HubPlanGraphNode) {
    return planNodeBadges(n, { currentVersion: currentVersion.value, targetModule: props.component })
  }

  const requirementState = useInstallRequirements({ props, hub, plan, activeSection, versionArg, requirementPayload, invalidatePlan, refreshPlan, planCurrent })
  const {
    pendingSuggestions, pendingCount, acceptSuggestions, rejectSuggestions, editSuggestions, displayValue,
    requirements, requirementGroups, rootRequirements, transitiveRequirementCount, parameterValues, installedParameterHints, editableRequirements,
    missingRequirements, boundRequirementCount, autoFitCount, aiResolvableCount,
    aiResolving, aiResolutionNotice, resolveRequirementsWithAI, highlightTick,
    setParameter, requirementValue, requirementMissing, requirementReadOnly,
    requirementOptions, typeInvalidRequirements, requirementTypeInvalid, requirementTypeHint,
    canAutoFitRequirement, autoFitRequirement, autoFitRequirements,
    loadInstalledParameterHints, applyPlan, resetRequirements, abortAI,
  } = requirementState
  // ── Options (Review) ───────────────────────────────────────────────────────
  const requestedMigrationPolicy = ref<MigrationInstallPolicy>('up')
  const setupDescriptors = ref<string[]>([])
  const requiredSetup = computed(() => setupDescriptors.value.length > 0)
  const migrationPolicy = computed<MigrationInstallPolicy>({
    get: () => requiredSetup.value ? 'up' : requestedMigrationPolicy.value,
    set: value => { requestedMigrationPolicy.value = value },
  })
  const migrationOptions = computed(() => requiredSetup.value ? [INSTALL_MIGRATION_OPTIONS[0]] : INSTALL_MIGRATION_OPTIONS)
  const migrations = computed(() => plan.value?.migrations || [])
  const destinationId = computed(() =>
    plan.value?.dependency?.id || plan.value?.install_payload?.id as string | undefined || '')

  const securityScan = useInstallSecurityScan({ props, hub, plan, planCurrent, versionArg })
  const {
    scan, acknowledged, criticalConfirmed, softFindings, unacknowledgedSoft,
    acknowledge, acknowledgeAllSoft, resetScanForPlan, runScanNow, skipScan, cancelScan,
  } = securityScan

  // ── Section status (drives the left-nav indicators) ────────────────────────
  const sectionStatus = computed<Record<SectionKey, { tone: SectionTone; badge?: string }>>(() => {
    const req: { tone: SectionTone; badge?: string } = planLoading.value || aiResolving.value
      ? { tone: 'loading' }
      : pendingCount.value ? { tone: 'warn', badge: String(pendingCount.value) }
      : missingRequirements.value.length || typeInvalidRequirements.value.length
        ? { tone: 'danger', badge: String(missingRequirements.value.length + typeInvalidRequirements.value.length) }
        : requirements.value.length ? { tone: 'ok' } : { tone: 'none' }
    const scanTone: SectionTone = ({
      scanning: 'loading', clean: 'ok', warnings: 'warn', critical: 'danger', error: 'danger', unavailable: 'none', idle: 'none', skipped: 'none',
    } as Record<string, SectionTone>)[scan.value.status] || 'none'
    return {
      overview: { tone: 'none' },
      modules: planLoading.value ? { tone: 'loading' } : plan.value ? { tone: 'none', badge: String(moduleCount.value) } : { tone: 'none' },
      requirements: req,
      scan: { tone: scanTone, badge: scan.value.findings.length ? String(scan.value.findings.length) : undefined },
      review: migrations.value.length ? { tone: 'none', badge: String(migrations.value.length) } : { tone: 'none' },
    }
  })

  // ── Install execution ──────────────────────────────────────────────────────
  const running = ref(false)
  const dryRunning = ref(false)
  const result = ref<HubMutationResponse | null>(null)
  const resultError = ref<string | null>(null)
  const resultCode = ref<string | null>(null)
  const resultErrorDetails = ref<unknown>(null)
  const resultExecution = computed(() => executionSteps(result.value || resultErrorDetails.value))
  const progressPhase = ref('')
  const elapsedSec = ref(0)
  let elapsedTimer: ReturnType<typeof setInterval> | null = null
  let unsubProgress: (() => void) | null = null
  let planGen = 0
  let openGen = 0
  let installGen = 0

  function startProgress() {
    progressPhase.value = ''
    elapsedSec.value = 0
    const startedAt = Date.now()
    elapsedTimer = setInterval(() => { elapsedSec.value = Math.floor((Date.now() - startedAt) / 1000) }, 250)
    try {
      const off = on('keeper.hub', (msg: unknown) => {
        const label = PROGRESS_LABELS[eventName(msg)]
        if (label) progressPhase.value = label
      })
      unsubProgress = typeof off === 'function' ? off : null
    } catch { unsubProgress = null }
  }
  function stopProgress() {
    if (elapsedTimer) { clearInterval(elapsedTimer); elapsedTimer = null }
    if (unsubProgress) { try { unsubProgress() } catch { /* ignore */ } unsubProgress = null }
  }

  function requirementPayload(): { parameters?: HubParameter[]; requirement_bindings?: HubParameter[] } {
    const parameters: HubParameter[] = []
    const requirement_bindings: HubParameter[] = []
    for (const req of editableRequirements.value) {
      const name = requirementKey(req)
      if (!name) continue
      const raw = parameterValues.value[name]
      const value = typeof raw === 'string' ? raw.trim() : raw
      if (value == null || value === '') continue
      const target = isTransitiveRequirement(req, props.component) ? requirement_bindings : parameters
      target.push({ name, value })
    }
    return { parameters: parameters.length ? parameters : undefined,
      requirement_bindings: requirement_bindings.length ? requirement_bindings : undefined }
  }

  function showToast(kind: 'ok' | 'error', message: string) {
    const t = host?.toast
    if (typeof t === 'function') t({ severity: kind === 'ok' ? 'success' : 'error', summary: message })
  }

  async function doInstall(dryRun: boolean) {
    if (!hub || !props.component || !planCurrent.value || plan.value?.applicable === false || pendingCount.value || aiResolving.value) return
    const gen = ++installGen
    const isCurrent = () => gen === installGen && props.open
    if (dryRun) dryRunning.value = true; else running.value = true
    result.value = null
    resultCode.value = null
    resultError.value = null
    resultErrorDetails.value = null
    if (!dryRun) startProgress()
    let changed = false
    try {
      const res = await hub.install({
        component: props.component,
        version: versionArg(),
        id: props.mode === 'update' && props.currentId ? props.currentId : undefined,
        dry_run: dryRun || undefined,
        migration_policy: migrationPolicy.value,
        ...requirementPayload(),
      })
      if (!isCurrent()) return
      if (res.success !== true) throw new KeeperHubError('INSTALL_INCOMPLETE', 'Keeper does not confirm a successful install.', undefined, res)
      if (!dryRun) await runRequiredSetups(hub, setupDescriptors.value, {
        isCurrent, onPhase: phase => { progressPhase.value = phase },
      })
      if (!isCurrent()) return
      result.value = res
      if (!dryRun) {
        const verb = props.mode === 'update' ? 'updated' : 'installed'
        showToast('ok', `Module ${verb}: ${res.dependency?.id || props.component}`)
        notifyModulesChanged()
        changed = true
      }
    } catch (e) {
      if (!isCurrent()) return
      logError('install:run', e)
      if (e instanceof KeeperHubError) { resultCode.value = e.code; resultErrorDetails.value = e.details }
      resultError.value = errorMessage(e, dryRun ? 'preview failed' : 'install failed')
      showToast('error', resultError.value)
    } finally {
      if (gen === installGen) {
        if (dryRun) dryRunning.value = false; else { running.value = false; stopProgress() }
      }
    }
    // Let the running state and progress subscription settle before a parent
    // swaps this dialog for the next item in a sequential onboarding queue.
    if (changed) emit('changed')
  }

  // The one blocking section (hard→soft), or null when ready to install.
  const blockingSection = computed<SectionKey | null>(() => {
    if (!plan.value || planError.value) return 'modules'
    if (pendingCount.value || aiResolving.value) return 'requirements'
    if (missingRequirements.value.length || typeInvalidRequirements.value.length) return 'requirements'
    if (!planCurrent.value || plan.value.applicable === false || requirements.value.some(req => req.invalid)) return 'requirements'
    if (scan.value.status === 'idle') return 'scan'
    if (scan.value.status === 'scanning') return 'scan'
    if (scan.value.status === 'critical' && !criticalConfirmed.value) return 'scan'
    if (unacknowledgedSoft.value.length) return 'scan'
    return null
  })

  const primaryDisabled = computed(() =>
    running.value || dryRunning.value || planLoading.value || !plan.value || !!planError.value || !planCurrent.value || pendingCount.value > 0 || aiResolving.value || scan.value.status === 'scanning'
    || (activeSection.value === 'scan' && scan.value.status === 'idle'))

  const requirementStatusMessage = computed(() => {
    if (pendingCount.value) return `Review ${pendingCount.value} AI suggestion${pendingCount.value === 1 ? '' : 's'}`
    if (aiResolving.value) return 'Resolving settings…'
    if (!planCurrent.value) return 'Validating settings…'
    const missing = missingRequirements.value.length
    if (missing) return `${missing} required setting${missing === 1 ? '' : 's'} missing`
    return 'Review requirement errors'
  })

  const previewDisabled = computed(() =>
    running.value || dryRunning.value || planLoading.value || !plan.value || !!planError.value || !planCurrent.value || pendingCount.value > 0 || aiResolving.value)

  const primaryLabel = computed(() => {
    if (running.value) return props.mode === 'update' ? 'Updating…' : 'Installing…'
    if (blockingSection.value === 'scan' && scan.value.status === 'idle') {
      return activeSection.value === 'scan' ? 'Choose scan option' : 'Review scan choice'
    }
    const onScanBlock = blockingSection.value === 'scan' && activeSection.value === 'scan'
      && (scan.value.status === 'warnings' || scan.value.status === 'critical')
    if (onScanBlock) return 'Install anyway'
    return props.mode === 'update' ? 'Update' : 'Install'
  })

  // Footer primary: walk the operator to the first problem; once they're on the
  // (soft) scan block, a click acknowledges and proceeds.
  function primaryAction() {
    if (primaryDisabled.value) return
    const block = blockingSection.value
    if (block === 'requirements') {
      activeSection.value = 'requirements'
      highlightTick.value++
      return
    }
    if (block === 'scan') {
      if (activeSection.value !== 'scan') { activeSection.value = 'scan'; return }
      if (scan.value.status === 'idle') return
      if (scan.value.status === 'scanning') return
      if (scan.value.status === 'critical' && !criticalConfirmed.value) return
      acknowledgeAllSoft()
      // fall through to install now that soft findings are acknowledged
      if (blockingSection.value) return
    }
    if (block === 'modules') { activeSection.value = 'modules'; return }
    void doInstall(false)
  }

  function preview() {
    if (!planCurrent.value || plan.value?.applicable === false || pendingCount.value || aiResolving.value || requirements.value.some(req => req.invalid) || missingRequirements.value.length || typeInvalidRequirements.value.length) { activeSection.value = 'requirements'; highlightTick.value++; return }
    activeSection.value = 'review'
    void doInstall(true)
  }

  // ── Plan fetch (debounced on version/mode change) ──────────────────────────
  async function refreshPlan() {
    if (!hub || !props.component) return
    if (planTimer) { clearTimeout(planTimer); planTimer = null }
    const gen = ++planGen
    planCurrent.value = false
    planLoading.value = true
    planError.value = null
    planCode.value = null
    planErrorDetails.value = null
    const previous = { ...parameterValues.value }
    try {
      const p = await hub.planInstall({
        component: props.component,
        version: versionArg(),
        id: props.mode === 'update' && props.currentId ? props.currentId : undefined,
        run_migrations: migrationPolicy.value === 'up',
        ...requirementPayload(),
      })
      if (gen !== planGen || !props.open) return
      const descriptors = requiredSetupDescriptors(p.requirements || [])
      setupDescriptors.value = descriptors
      applyPlan(p, previous)
      planCurrent.value = true
      resetScanForPlan(p.graph || [])
    } catch (e) {
      if (gen !== planGen || !props.open) return
      logError('install:plan', e)
      plan.value = null
      scan.value = emptyScan()
      planError.value = errorMessage(e, 'failed to plan install')
      if (e instanceof KeeperHubError) { planCode.value = e.code; planErrorDetails.value = e.details }
    } finally {
      if (gen === planGen) planLoading.value = false
    }
  }

  let planTimer: ReturnType<typeof setTimeout> | null = null
  function invalidatePlan() {
    planGen++
    planCurrent.value = false
    abortAI()
    schedulePlan()
  }
  function schedulePlan() {
    if (planTimer) clearTimeout(planTimer)
    planTimer = setTimeout(() => { void refreshPlan() }, 350)
  }

  async function loadVersions() {
    versions.value = []
    if (!hub || !props.component) return
    versionsLoading.value = true
    try {
      const res = await hub.listVersions(props.component)
      versions.value = (res.items || []) as HubVersionItem[]
    } catch (e) { logError('install:versions', e) } finally { versionsLoading.value = false }
  }

  async function loadReadme() {
    readme.value = ''
    if (!hub || !props.component) return
    readmeLoading.value = true
    try {
      const r = await hub.getReadme(props.component)
      readme.value = r.content || ''
    } catch { /* README is optional */ } finally { readmeLoading.value = false }
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  function resetState() {
    planGen++
    activeSection.value = 'overview'
    plan.value = null
    planCurrent.value = false
    setupDescriptors.value = []
    running.value = false
    dryRunning.value = false
    planError.value = null
    planCode.value = null
    planErrorDetails.value = null
    migrationPolicy.value = 'up'
    result.value = null
    resultError.value = null
    resultCode.value = null
    resultErrorDetails.value = null
    resetRequirements()
    resetScanForPlan()
    readme.value = ''
    versions.value = []
  }

  async function open() {
    const gen = ++openGen
    resetState()
    // Tracking is the safe default for both install and update. Pinning remains
    // an explicit operator choice. Updates with no requested version select the
    // newest release after metadata loads instead of re-submitting the current
    // resolved version.
    version.value = props.mode === 'update' ? '' : (props.version || '')
    versionMode.value = 'track'
    await Promise.all([loadVersions(), loadReadme(), loadInstalledParameterHints()])
    if (!props.open || gen !== openGen) return
    if (props.mode === 'update' && !version.value && versions.value.length) {
      version.value = String(versions.value[0].version || '')
    }
    await refreshPlan()
  }

  // immediate: the dialog mounts via v-if with a constant :open, so there is no
  // false→true transition to react to — seed on the first (mount-time) run.
  watch(() => props.open, (isOpen) => {
    if (isOpen) {
      void open()
      return
    }
    abortAI()
    stopProgress()
    installGen++
    running.value = false
    dryRunning.value = false
    openGen++
    planGen++
    cancelScan()
    if (planTimer) { clearTimeout(planTimer); planTimer = null }
  }, { immediate: true })
  // Re-plan (and re-scan) when the pinned version or pin/track mode changes.
  watch([version, versionMode], () => { if (props.open && hub) invalidatePlan() }, { flush: 'sync' })
  // Re-plan when migration policy flips (affects the run_migrations plan hint).
  watch(migrationPolicy, () => { if (props.open && hub && plan.value) invalidatePlan() }, { flush: 'sync' })

  onUnmounted(() => {
    installGen++
    abortAI()
    stopProgress()
    openGen++
    planGen++
    cancelScan()
    if (planTimer) clearTimeout(planTimer)
  })

  function close() { abortAI(); installGen++; running.value = false; dryRunning.value = false; stopProgress(); emit('close') }

  return {
    // nav
    activeSection, sectionStatus, blockingSection,
    // version
    version, versionMode, versionOptions, versionsLoading, versionMeta, currentVersion,
    // overview
    readme, readmeLoading,
    // plan
    plan, planCurrent, planLoading, planError, planCode, planErrorDetails,
    directModules, transitiveModules, planTree, planRows, moduleCount, totalSize, badgesForNode,
    // requirements
    requirements, requirementGroups, rootRequirements, editableRequirements, transitiveRequirementCount, parameterValues, missingRequirements, boundRequirementCount, autoFitCount,
    aiResolvableCount, aiResolving, aiResolutionNotice, resolveRequirementsWithAI,
    pendingSuggestions, pendingCount, acceptSuggestions, rejectSuggestions, editSuggestions, displayValue,
    highlightTick, setParameter, requirementValue, requirementMissing, requirementReadOnly, requirementOptions, requirementConfiguredBy,
    typeInvalidRequirements, requirementTypeInvalid, requirementTypeHint,
    canAutoFitRequirement, autoFitRequirement, autoFitRequirements,
    // review / options
    requiredSetup, migrationPolicy, migrationOptions, migrations, destinationId, INSTALL_MIGRATION_OPTIONS,
    // scan
    scan, acknowledged, criticalConfirmed, softFindings, unacknowledgedSoft, acknowledge, acknowledgeAllSoft, runScanNow, skipScan,
    // execution
    running, dryRunning, result, resultError, resultCode, resultErrorDetails, resultExecution, executionStepLabel, progressPhase, elapsedSec,
    requirementStatusMessage, primaryDisabled, previewDisabled, primaryLabel, primaryAction, preview, refreshPlan,
    close,
  }
}
export type { HubPlanRequirement, HubPlanGraphNode } from '../keeper-hub.ts'

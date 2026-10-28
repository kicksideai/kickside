import { computed, ref, type Ref } from 'vue'
import { KeeperHubError } from '../keeper-hub.ts'
import { errorMessage } from '../lib.ts'
import { emptyScan, parseScanResponse, isSoftFinding, type ScanResult, type ScanFinding } from '../scan.ts'
import type { InstallDialogProps } from './useInstallDialog.ts'

interface InstallSecurityScanOptions {
  props: InstallDialogProps
  hub: ReturnType<typeof import('../keeper-hub.ts').keeperHub>
  plan: Ref<{ graph?: unknown[] } | null>
  planCurrent: Ref<boolean>
  versionArg: () => string | undefined
}

function planArtifactFingerprint(graph: unknown[]): string {
  return graph.map(node => {
    const item = node as Record<string, unknown>
    return [item.module, item.version || '', item.constraint || ''].join('\u0000')
  }).sort().join('\u0001')
}

export function useInstallSecurityScan({ props, hub, plan, planCurrent, versionArg }: InstallSecurityScanOptions) {
  // ── Security scan ────────────────────────────────────────────────────────
  const scan = ref<ScanResult>(emptyScan())
  const acknowledged = ref<Set<string>>(new Set())
  const criticalConfirmed = ref(false)
  let scanGen = 0
  let scanPlanFingerprint: string | null = null
  const softFindings = computed(() => scan.value.findings.filter(isSoftFinding))
  const unacknowledgedSoft = computed(() => softFindings.value.filter(f => !acknowledged.value.has(f.id)))
  function acknowledge(f: ScanFinding) {
    const next = new Set(acknowledged.value); next.add(f.id); acknowledged.value = next
  }
  function acknowledgeAllSoft() {
    const next = new Set(acknowledged.value)
    for (const f of softFindings.value) next.add(f.id)
    acknowledged.value = next
  }

  function resetScanForPlan(graph?: unknown[]) {
    const fingerprint = graph ? planArtifactFingerprint(graph) : null
    if (fingerprint === scanPlanFingerprint) return
    scanGen++
    scanPlanFingerprint = fingerprint
    scan.value = { ...emptyScan(), total: graph?.length || 0 }
    acknowledged.value = new Set()
    criticalConfirmed.value = false
  }

  async function runScanNow() {
    if (!hub || !props.component || !planCurrent.value) return
    const graph = plan.value?.graph || []
    const gen = ++scanGen
    acknowledged.value = new Set()
    criticalConfirmed.value = false
    scan.value = { status: 'scanning', modules: [], findings: [], scanned: 0, total: graph.length }
    try {
      const res = await hub.scan({ component: props.component, version: versionArg() })
      if (gen === scanGen) scan.value = parseScanResponse(res)
    } catch (e) {
      if (gen === scanGen) {
        const unavailable = e instanceof KeeperHubError && (e.status === 404 || e.code === 'UNKNOWN' || e.code === 'NETWORK')
        scan.value = unavailable
          ? { status: 'unavailable', modules: [], findings: [], scanned: 0, total: graph.length, error: 'Security scan unavailable' }
          : { status: 'error', modules: [], findings: [], scanned: 0, total: graph.length, error: errorMessage(e, 'scan failed') }
      }
    }
  }

  function skipScan() {
    const graph = plan.value?.graph || []
    scanGen++
    scan.value = {
      status: 'skipped',
      modules: [],
      findings: [],
      scanned: 0,
      total: graph.length,
      summary: 'Security scan skipped by operator.',
    }
    acknowledged.value = new Set()
    criticalConfirmed.value = false
  }


  function cancelScan() {
    scanGen++
  }

  return { scan, acknowledged, criticalConfirmed, softFindings, unacknowledgedSoft, acknowledge, acknowledgeAllSoft, resetScanForPlan, runScanNow, skipScan, cancelScan }
}

import { KeeperHubError, type HubPlanRequirement, type HubRequiredSetupStatus } from '../keeper-hub.ts'

const PREFIX = 'registry:v1:'
const SETUP_DESCRIPTOR_TIMEOUT_MS = 30_000
const SETUP_DESCRIPTOR_POLL_MS = 250

interface RequiredSetupClient {
  requiredSetupStatus(descriptor: string): Promise<HubRequiredSetupStatus>
  applyRequiredSetup(descriptor: string): Promise<HubRequiredSetupStatus>
}

interface SetupOptions {
  isCurrent?: () => boolean
  onPhase?: (phase: string) => void
}

export function requiredSetupDescriptors(requirements: HubPlanRequirement[]): string[] {
  const descriptors = new Set<string>()
  for (const requirement of requirements) {
    if (requirement.name !== 'required_setup' && requirement.short_name !== 'required_setup') continue
    const value = String(requirement.value ?? '').trim() || String(requirement.default ?? '').trim()
    const id = value.startsWith(PREFIX) ? value.slice(PREFIX.length) : ''
    if (!/^[A-Za-z0-9_.-]+:[A-Za-z0-9_.-]+$/.test(id)) {
      throw new KeeperHubError('INVALID_SETUP_DESCRIPTOR', 'The module declares an invalid required setup descriptor.')
    }
    descriptors.add(id)
  }
  return [...descriptors]
}

export async function runRequiredSetups(client: RequiredSetupClient, descriptors: string[], options: SetupOptions = {}): Promise<void> {
  const ensureCurrent = () => {
    if (options.isCurrent && !options.isCurrent()) {
      throw new KeeperHubError('INSTALL_SUPERSEDED', 'Installation is closed or superseded.')
    }
  }
  for (const descriptor of descriptors) {
    ensureCurrent()
    options.onPhase?.('Checking required setup…')
    const deadline = Date.now() + SETUP_DESCRIPTOR_TIMEOUT_MS
    let status: HubRequiredSetupStatus | undefined
    while (!status) {
      ensureCurrent()
      try {
        const result = await client.requiredSetupStatus(descriptor)
        ensureCurrent()
        if (result.status !== 'building') status = result
      } catch (error) {
        if (!(error instanceof KeeperHubError) || error.status !== 404) throw error
      }
      if (status) break
      const remaining = deadline - Date.now()
      if (remaining <= 0) {
        throw new KeeperHubError('SETUP_DESCRIPTOR_NOT_VISIBLE', 'Required setup does not become available after installation.')
      }
      await new Promise(resolve => setTimeout(resolve, Math.min(SETUP_DESCRIPTOR_POLL_MS, remaining)))
    }
    if (status.success && status.ready && status.status === 'ready') continue
    ensureCurrent()
    options.onPhase?.(status.pending_label || 'Running required setup…')
    const result = await client.applyRequiredSetup(descriptor)
    ensureCurrent()
    if (!result.success || !result.ready || result.status !== 'ready') {
      throw new KeeperHubError('SETUP_INCOMPLETE', result.error || result.detail || 'Required setup fails.', undefined, result)
    }
    options.onPhase?.('Verifying required setup…')
    const verified = await client.requiredSetupStatus(descriptor)
    ensureCurrent()
    if (!verified.success || !verified.ready || verified.status !== 'ready') {
      throw new KeeperHubError('SETUP_POSTCONDITION_FAILED', verified.error || verified.detail || 'Required setup fails verification.', undefined, verified)
    }
  }
}

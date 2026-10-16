import { computed, ref, type Ref } from 'vue'
import { api } from '@wippy-fe/proxy'
import { keeperHub, type HubAuthStatus, type HubDependency, type HubListDependenciesResponse, type HubModuleListItem, type HubOrg } from '../keeper-hub.ts'
import { moduleComponent, moduleLabel } from '../lib.ts'
import { availableRecommendationModules, configuredComponentContext, groupRecommendations, installedModuleKeys, searchTokens } from '../recommendations.ts'
import { ONBOARDING_PROFILE_TYPE, normalizeOnboardingProfiles, selectProfilePackages, type OnboardingProfile } from '../onboardingProfiles.ts'

interface OnboardingCatalogOptions {
  hub: ReturnType<typeof keeperHub>
  prompt: Ref<string>
  browseQuery: Ref<string>
  initializeProfileSelection: () => void
}

export function useOnboardingCatalog({ hub, prompt, browseQuery, initializeProfileSelection }: OnboardingCatalogOptions) {
  const loading = ref(true)
  const error = ref('')
  const profileError = ref('')
  const profiles = ref<OnboardingProfile[]>([])
  const selectedProfileIds = ref(new Set<string>())
  const candidates = ref<HubModuleListItem[]>([])
  const installed = ref(new Set<string>())
  const installedDependencies = ref<HubListDependenciesResponse['dependencies']>([])
  const installedModules = ref<NonNullable<HubListDependenciesResponse['modules']>>([])
  const organizations = ref<HubOrg[]>([])
  const installedCount = ref(0)

  const tokens = computed(() => searchTokens(prompt.value, new Set()))
  const browseTokens = computed(() => searchTokens(browseQuery.value, new Set()))
  const available = computed(() => availableRecommendationModules(candidates.value, installed.value))
  const availableIds = computed(() => new Set(available.value.map(candidateKey)))
  const declaredProfileComponentIds = computed(() => new Set(profiles.value.flatMap(profile =>
    profile.packages.map(pkg => pkg.component.toLowerCase()))))
  // Generic discovery excludes application catalog rows. A declarative profile is
  // a separate, application-owned contract: its exact package roots remain
  // selectable even when an older catalog row carries stale type metadata.
  const selectableCandidates = computed(() => candidates.value.filter(module => {
    const key = candidateKey(module)
    return availableIds.value.has(key) || declaredProfileComponentIds.value.has(key)
  }))
  const catalogGroups = computed(() => groupRecommendations(available.value, [], organizations.value))
  const matchingGroups = computed(() => groupRecommendations(available.value, tokens.value, organizations.value))
  const browseGroups = computed(() => groupRecommendations(available.value, browseTokens.value, organizations.value))
  const browseResultCount = computed(() => browseGroups.value.reduce((total, group) => total + group.modules.length, 0))
  const workspaceComponents = computed(() => configuredComponentContext(
    installedDependencies.value,
    installedModules.value,
    candidates.value,
  ))
  const availableComponentIds = computed(() => new Set(selectableCandidates.value.map(candidateKey)))
  const selectedProfiles = computed(() => profiles.value.filter(profile => selectedProfileIds.value.has(profile.id)))
  const requiredProfiles = computed(() => profiles.value.filter(profile => profile.required))
  const optionalProfiles = computed(() => profiles.value.filter(profile => !profile.required))
  const optionalProfileCount = computed(() => optionalProfiles.value.filter(profile => selectedProfileIds.value.has(profile.id)).length)

function apiMessage(cause: unknown, fallback: string): string {
  const body = (cause as { response?: { data?: { error?: unknown } } })?.response?.data
  if (typeof body?.error === 'string' && body.error) return body.error
  if (cause instanceof Error && cause.message) return cause.message
  return fallback
}

function candidateKey(module: HubModuleListItem): string {
  return moduleComponent(module).toLowerCase()
}

function candidateById(id: string): HubModuleListItem | null {
  const key = id.toLowerCase()
  return selectableCandidates.value.find(module => candidateKey(module) === key) || null
}

function queuedLabel(id: string): string {
  const module = candidateById(id)
  return module ? moduleLabel(module) : id
}

function profilePackageLabels(profile: OnboardingProfile): string {
  return profile.packages.map(pkg => {
    const module = candidateById(pkg.component)
    return module ? moduleLabel(module) : pkg.component.split('/').pop() || pkg.component
  }).join(' · ')
}

function profileParameters(id: string) {
  const key = id.toLowerCase()
  for (const profile of selectedProfiles.value) {
    const parameters = profile.packages.find(pkg => pkg.component.toLowerCase() === key)?.parameters
    if (parameters?.length) return parameters
  }
  return undefined
}

function mergeCandidates(rows: HubModuleListItem[]) {
  const byKey = new Map(candidates.value.map(module => [candidateKey(module), module]))
  for (const module of rows) {
    const key = candidateKey(module)
    if (key && !byKey.has(key)) byKey.set(key, module)
  }
  candidates.value = Array.from(byKey.values())
}

async function loadInstalled() {
  const result = await hub.listDependencies({ includeEntries: false, includeMigrations: false })
  installedDependencies.value = result.dependencies || []
  installedModules.value = result.modules || []
  installed.value = installedModuleKeys(
    (result.dependencies || []) as (HubDependency & { installed?: boolean })[],
    result.modules || [],
  )
}

async function loadPrivateOrganizations(status: HubAuthStatus) {
  organizations.value = status.authenticated && status.expired !== true ? (status.orgs || []) : []
  const rows = await Promise.all(organizations.value
    .map(org => String(org.name || '').trim())
    .filter(Boolean)
    .map(org => hub.fetchAllByKeyword(org).catch(() => [])))
  for (const modules of rows) mergeCandidates(modules)
}

async function loadProfiles() {
  try {
    const { data } = await api.get<{ entries?: unknown[] }>('/api/v1/keeper/registry/entries', {
      params: { kind: 'registry.entry', 'meta.type': ONBOARDING_PROFILE_TYPE, limit: 100 },
    })
    const summaries: unknown[] = Array.isArray(data?.entries) ? data.entries : []
    const hydrated = await Promise.all(summaries.map(async raw => {
      const id = raw && typeof raw === 'object' && typeof (raw as { id?: unknown }).id === 'string'
        ? (raw as { id: string }).id
        : ''
      if (!id) return null
      try {
        const { data: detail } = await api.get<{ entry?: unknown }>('/api/v1/keeper/registry/entry', { params: { id } })
        return detail?.entry || null
      } catch {
        return null
      }
    }))
    profiles.value = normalizeOnboardingProfiles(hydrated.filter(Boolean))
    profileError.value = profiles.value.length ? '' : 'No capability bundles are declared. You can still choose packages yourself.'
  } catch (cause) {
    profiles.value = []
    profileError.value = apiMessage(cause, 'Capability bundles could not be loaded. You can still choose packages yourself.')
  }
}

// A profile may be contributed by a private or future module and can therefore
// name a package outside the initial KickSide keyword browse. Resolve only the
// missing declared identities, and still require an exact live-catalog match.
async function loadProfileCandidates() {
  const known = new Set(candidates.value.map(candidateKey))
  const missing = new Set<string>()
  for (const profile of profiles.value) {
    for (const pkg of profile.packages) {
      const key = pkg.component.toLowerCase()
      if (!known.has(key)) missing.add(pkg.component)
    }
  }
  const rows = await Promise.all(Array.from(missing).map(component => {
    const query = component.split('/').pop() || component
    return hub.browseModules({ query, pageSize: 100 })
      .then(result => (result.items || []).filter(module => candidateKey(module) === component.toLowerCase()))
      .catch(() => [])
  }))
  for (const modules of rows) mergeCandidates(modules)
}

async function load() {
  loading.value = true
  error.value = ''
  profileError.value = ''
  try {
    const [official] = await Promise.all([
      hub.fetchAllByKeyword(['kickside', 'kickside-plugin']),
      loadInstalled(),
      loadProfiles(),
    ])
    candidates.value = []
    mergeCandidates(official)
    const auth = await hub.authStatus().catch(() => ({ success: true, authenticated: false } as HubAuthStatus))
    await loadPrivateOrganizations(auth)
    await loadProfileCandidates()
    initializeProfileSelection()
  } catch (cause) {
    candidates.value = []
    error.value = apiMessage(cause, 'Could not load module recommendations.')
  } finally {
    loading.value = false
  }
}

function profileSelection(profile: OnboardingProfile) {
  return selectProfilePackages(profile, installed.value, availableComponentIds.value)
}

function profileUsable(profile: OnboardingProfile): boolean {
  return profileSelection(profile).unavailable.length === 0
}

  return {
    loading, error, profileError, prompt, browseQuery, profiles, selectedProfileIds, candidates,
    installed, installedDependencies, installedModules, organizations, installedCount,
    tokens, browseTokens, available, selectableCandidates, catalogGroups, matchingGroups,
    browseGroups, browseResultCount, workspaceComponents, availableComponentIds,
    selectedProfiles, requiredProfiles, optionalProfiles, optionalProfileCount,
    apiMessage, candidateKey, candidateById, queuedLabel, profilePackageLabels, profileParameters,
    mergeCandidates, loadInstalled, loadPrivateOrganizations, loadProfiles, loadProfileCandidates,
    load, profileSelection, profileUsable,
  }
}

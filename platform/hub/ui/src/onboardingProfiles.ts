export const ONBOARDING_PROFILE_TYPE = 'kickside.hub:onboarding_profile'

const MAX_PROFILES = 12
const MAX_PACKAGES = 24
const MAX_PARAMETERS = 24
const COMPONENT_ID = /^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*$/i

export interface OnboardingProfileParameter {
  name: string
  value: string | number | boolean
}

export interface OnboardingProfilePackage {
  component: string
  title?: string
  parameters?: OnboardingProfileParameter[]
}

export interface OnboardingProfile {
  id: string
  title: string
  description: string
  icon: string
  order: number
  required: boolean
  packages: OnboardingProfilePackage[]
}

export interface ProfilePackageSelection {
  selected: OnboardingProfilePackage[]
  installed: OnboardingProfilePackage[]
  unavailable: OnboardingProfilePackage[]
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function compareText(left: string, right: string): number {
  const a = left.trim().toLowerCase()
  const b = right.trim().toLowerCase()
  return a < b ? -1 : a > b ? 1 : 0
}

function profilePayload(entry: unknown): Record<string, unknown> {
  const row = record(entry)
  return { ...record(row.data), ...row }
}

// A host option a profile binds carries its own type: a retention count is a
// number and a switch is a boolean, and the install payload must keep them that
// way. Only a blank string is nothing to bind.
function parameterValue(value: unknown): string | number | boolean | null {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const str = text(value, 500)
  return str ? str : null
}

function normalizeParameters(value: unknown): OnboardingProfileParameter[] {
  if (!Array.isArray(value)) return []
  const out: OnboardingProfileParameter[] = []
  const seen = new Set<string>()
  for (const raw of value.slice(0, MAX_PARAMETERS)) {
    const row = record(raw)
    const name = text(row.name, 200)
    const typed = parameterValue(row.value)
    if (!name || typed === null || seen.has(name)) continue
    seen.add(name)
    out.push({ name, value: typed })
  }
  return out
}

function normalizePackages(value: unknown): OnboardingProfilePackage[] {
  if (!Array.isArray(value)) return []
  const out: OnboardingProfilePackage[] = []
  const seen = new Set<string>()
  for (const raw of value.slice(0, MAX_PACKAGES)) {
    const row = typeof raw === 'string' ? { component: raw } : record(raw)
    const component = text(row.component, 200)
    const key = component.toLowerCase()
    if (!COMPONENT_ID.test(component) || seen.has(key)) continue
    seen.add(key)
    const title = text(row.title, 100)
    const parameters = normalizeParameters(row.parameters)
    out.push({
      component,
      ...(title ? { title } : {}),
      ...(parameters.length ? { parameters } : {}),
    })
  }
  return out
}

// Profiles are registry declarations, not source-module metadata. `meta.type`
// is only the discovery discriminator; every user-facing field and package root
// lives in the entry payload so another module can contribute a profile without
// the Hub inferring ownership from a namespace or `meta.module`.
export function normalizeOnboardingProfiles(entries: unknown): OnboardingProfile[] {
  if (!Array.isArray(entries)) return []
  const normalized: OnboardingProfile[] = []
  for (const raw of entries) {
    const row = profilePayload(raw)
    const meta = record(row.meta)
    if (meta.type !== ONBOARDING_PROFILE_TYPE || meta.private === true || row.enabled === false) continue
    const id = text(row.profile, 80) || text(row.key, 80) || text(row.id, 160)
    const title = text(row.title, 100)
    if (!id || !title) continue
    normalized.push({
      id,
      title,
      description: text(row.description, 280),
      icon: text(row.icon, 100) || 'tabler:packages',
      order: Number.isFinite(Number(row.order)) ? Number(row.order) : 500,
      required: row.required === true,
      packages: normalizePackages(row.packages),
    })
  }
  // Registry list order is not authoritative. Sort duplicate declarations by
  // bounded normalized data before choosing one, then apply a locale-neutral
  // final order so the same snapshot always renders the same profile list.
  normalized.sort((left, right) =>
    compareText(left.id, right.id)
      || left.order - right.order
      || compareText(left.title, right.title)
      || compareText(left.description, right.description)
      || compareText(left.icon, right.icon)
      || Number(right.required) - Number(left.required)
      || compareText(
        left.packages.map(pkg => `${pkg.component}\u0000${pkg.title || ''}\u0000${JSON.stringify(pkg.parameters || [])}`).join('\u0001'),
        right.packages.map(pkg => `${pkg.component}\u0000${pkg.title || ''}\u0000${JSON.stringify(pkg.parameters || [])}`).join('\u0001'),
      ))
  const byId = new Map<string, OnboardingProfile>()
  for (const profile of normalized) {
    const key = profile.id.toLowerCase()
    if (!byId.has(key)) byId.set(key, profile)
  }
  return Array.from(byId.values())
    .sort((left, right) => left.order - right.order
      || compareText(left.title, right.title)
      || compareText(left.id, right.id))
    .slice(0, MAX_PROFILES)
}

export function selectProfilePackages(
  profile: OnboardingProfile,
  installedComponents: ReadonlySet<string>,
  availableComponents: ReadonlySet<string>,
): ProfilePackageSelection {
  const selected: OnboardingProfilePackage[] = []
  const installed: OnboardingProfilePackage[] = []
  const unavailable: OnboardingProfilePackage[] = []
  for (const pkg of profile.packages) {
    const key = pkg.component.toLowerCase()
    if (installedComponents.has(key)) installed.push(pkg)
    else if (availableComponents.has(key)) selected.push(pkg)
    else unavailable.push(pkg)
  }
  return { selected, installed, unavailable }
}

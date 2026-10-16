import type { Adapter, ModelCard, Preset, Profile } from '../types.ts'

// Pure presentation helpers shared across the models views: status / source severity
// mapping, label resolution against the adapter and profile catalogs, and the
// small format utilities the editors need.

// PrimeVue severities, so a status maps straight onto what the theme paints.
type Severity = 'secondary' | 'success' | 'danger' | 'warn' | 'info'

const COMPAT_PROVIDER = 'wippy.llm.openai_compat:provider'

export function statusSeverity(status?: string): Severity {
  if (status === 'healthy') return 'success'
  if (status === 'unhealthy') return 'danger'
  if (status === 'degraded') return 'warn'
  return 'secondary'
}

// Human labels for the profile status the discovery service sets (healthy /
// unhealthy / degraded). Kept alongside statusSeverity so both views share one map;
// unmapped or absent values read as Unknown rather than leaking a raw token.
const STATUS_LABELS: Record<string, string> = {
  healthy: 'Healthy',
  unhealthy: 'Unhealthy',
  degraded: 'Degraded',
}

export function statusLabel(status?: string): string {
  return (status && STATUS_LABELS[status]) || 'Unknown'
}

export function sourceSeverity(source?: string): Severity {
  if (source === 'registry') return 'info'
  if (source === 'discovered') return 'success'
  if (source === 'overlay') return 'warn'
  return 'secondary'
}

export function sourceLabel(source?: string): string {
  if (source === 'registry') return 'built-in'
  return source || 'model'
}

export function fmtTokens(value?: number): string {
  if (!value || value <= 0) return '—'
  if (value >= 1000) return `${Math.round(value / 1000)}k`
  return String(value)
}

export function presetIcon(preset: Preset): string {
  return preset.icon || 'tabler:plug'
}

const CAP_ICONS: Record<string, string> = {
  tools: 'tabler:tool',
  tool_use: 'tabler:tool',
  function_calling: 'tabler:tool',
  vision: 'tabler:eye',
  image: 'tabler:photo',
  images: 'tabler:photo',
  multimodal: 'tabler:photo',
  embed: 'tabler:vector',
  embedding: 'tabler:vector',
  embeddings: 'tabler:vector',
  audio: 'tabler:microphone',
  speech: 'tabler:microphone',
  reasoning: 'tabler:bulb',
  thinking: 'tabler:bulb',
}

export function capIcon(cap: string): string {
  return CAP_ICONS[cap.toLowerCase()] || ''
}

export function isCompatiblePreset(preset: Preset): boolean {
  return preset.provider_id === COMPAT_PROVIDER
}

export function profileEndpoint(profile: Profile): string {
  const cfg = profile.config || {}
  return cfg.base_url || cfg.region || cfg.location || 'default endpoint'
}

export function hasCredential(profile: Profile): boolean {
  return Boolean(profile.has_api_key || profile.has_api_key_env || profile.secret_fields?.length)
}

export function optionString(model: ModelCard, key: string): string {
  const value = model.options?.[key]
  if (value === undefined || value === null || value === '') return ''
  return String(value)
}

// Catalog lookups bound to the live adapter / profile / preset collections. The
// provider brand icon is sourced from the registry presets (each provider's preset
// declares its icon), so the UI stays fully driven by registry metadata rather
// than a hardcoded table.
export function makeLookups(
  adapters: () => Adapter[],
  profiles: () => Profile[],
  presets: () => Preset[] = () => [],
) {
  const adapterFor = (id?: string) => adapters().find(a => a.id === id)
  const profileFor = (id?: string) => profiles().find(p => p.id === id)
  const iconFor = (providerId?: string) => {
    if (!providerId) return 'tabler:cpu'
    for (const p of presets()) if (p.provider_id === providerId && p.icon) return p.icon
    return 'tabler:cpu'
  }
  return {
    adapterFor,
    profileFor,
    adapterTitle: (id?: string) => adapterFor(id)?.title || id || '',
    profileTitle: (id?: string) => profileFor(id)?.name || id || '',
    isDiscoverable: (profile: Profile) => adapterFor(profile.provider_id)?.discoverable === true,
    providerIcon: iconFor,
  }
}

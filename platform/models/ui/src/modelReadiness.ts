import type { ClassGroup, ModelCard, Profile } from './types.ts'

export interface UsableFastModelContext {
  class: 'fast'
  model: string
  title: string
  provider_id: string
}

// The app onboarding recommender resolves `model: class:fast`; readiness must
// prove that exact class is backed by an enabled persisted model/profile pair.
export function usableFastModelContext(
  profiles: Profile[],
  models: ModelCard[],
  classes: ClassGroup[],
): UsableFastModelContext | null {
  const enabledProfiles = profiles.filter(profile => profile.enabled !== false && profile.status !== 'unhealthy')
  if (!enabledProfiles.length) return null
  const fastName = classes.find(group => group.declared && group.name === 'fast')?.models?.[0]?.name
  if (!fastName) return null
  const model = models.find(row => row.name === fastName && row.enabled !== false && !isEmbedOnly(row))
  if (!model) return null
  const profile = model.provider_profile_id
    ? enabledProfiles.find(row => row.id === model.provider_profile_id)
    : enabledProfiles.find(row => !!model.provider_id && row.provider_id === model.provider_id)
  if (!profile) return null
  // A stale cross-provider binding cannot be the runtime configuration we tell
  // the next step about, even when both IDs independently exist.
  if (model.provider_id && model.provider_id !== profile.provider_id) return null
  return {
    class: 'fast',
    model: model.name,
    title: model.title || model.name,
    provider_id: model.provider_id || profile.provider_id,
  }
}

function isEmbedOnly(model: ModelCard): boolean {
  const caps = (model.capabilities ?? []).map(capability => capability.toLowerCase())
  return caps.length > 0 && caps.every(capability => capability === 'embed' || capability === 'embedding' || capability === 'embeddings')
}

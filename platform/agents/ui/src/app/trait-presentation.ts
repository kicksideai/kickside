import { ref } from 'vue'

type TraitAffects = { tools?: boolean; behavior?: boolean; memory?: boolean }
type TraitPresentationInput = { affects?: TraitAffects }
export type TraitTint = 'memory' | 'behavior' | 'tools' | 'plain'

const BADGES: { key: keyof TraitAffects; label: string }[] = [
  { key: 'tools', label: 'tools' },
  { key: 'behavior', label: 'behavior' },
  { key: 'memory', label: 'memory' },
]

export function useCollapsedTraits() {
  const collapsedTraits = ref<Set<string>>(new Set())
  const isTraitCollapsed = (id: string) => collapsedTraits.value.has(id)
  function toggleTraitCollapsed(id: string) {
    const next = new Set(collapsedTraits.value)
    next.has(id) ? next.delete(id) : next.add(id)
    collapsedTraits.value = next
  }
  return { collapsedTraits, isTraitCollapsed, toggleTraitCollapsed }
}

export function tintOf(trait: TraitPresentationInput): TraitTint {
  const affects = trait.affects || {}
  if (affects.memory) return 'memory'
  if (affects.behavior) return 'behavior'
  if (affects.tools) return 'tools'
  return 'plain'
}

export function badgesOf(trait: TraitPresentationInput) {
  const affects = trait.affects || {}
  return BADGES.filter(badge => affects[badge.key])
}

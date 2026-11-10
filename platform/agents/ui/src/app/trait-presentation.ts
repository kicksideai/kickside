import { ref, watch } from 'vue'
import type { Tool, Trait } from './agent-form.types'

type TraitAffects = { tools?: boolean; behavior?: boolean; memory?: boolean }
type TraitPresentationInput = { affects?: TraitAffects }
export type TraitTint = 'memory' | 'behavior' | 'tools' | 'plain'

const BADGES: { key: keyof TraitAffects; label: string }[] = [
  { key: 'tools', label: 'tools' },
  { key: 'behavior', label: 'behavior' },
  { key: 'memory', label: 'memory' },
]

export function useOpenedTraits(selected: () => string[]) {
  const openedTraits = ref<Set<string>>(new Set())
  const isTraitOpen = (id: string) => openedTraits.value.has(id)
  function toggleTraitOpen(id: string) {
    const next = new Set(openedTraits.value)
    next.has(id) ? next.delete(id) : next.add(id)
    openedTraits.value = next
  }
  watch(() => [...selected()], ids => {
    openedTraits.value = new Set([...openedTraits.value].filter(id => ids.includes(id)))
  })
  return { isTraitOpen, toggleTraitOpen }
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

interface DeclaredTool { id: string; tool?: Tool }
export function resolveTraitTools(trait: Trait, tools: Tool[]): DeclaredTool[] {
  const resolved = new Map<string, DeclaredTool>()
  const catalog = new Map(tools.map(tool => [tool.id, tool]))
  for (const tool of trait.tool_details || []) catalog.set(tool.id, tool)
  for (const declaration of trait.tools || []) {
    const pattern = new RegExp('^' + declaration.split('*')
      .map(part => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$')
    const matches = [...catalog.values()].filter(tool => pattern.test(tool.id))
    if (!matches.length) resolved.set(declaration, { id: declaration })
    for (const tool of matches) resolved.set(tool.id, { id: tool.id, tool })
  }
  return [...resolved.values()]
}

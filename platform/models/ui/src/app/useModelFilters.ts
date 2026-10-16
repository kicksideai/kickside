import { computed, reactive, type Ref } from 'vue'
import type { ModelCard } from '../types.ts'

// Filter + pagination state for the model pool. Capability / class / provider
// option lists are derived from the live catalog so they always reflect what is
// actually present. visible applies the running page limit on top of the filter.
interface ModelFilterState {
  search: string
  source: string
  capability: string
  klass: string
  profile: string
  provider: string
  limit: number
}

const PAGE = 120

export function useModelFilters(models: Ref<ModelCard[]>) {
  const state = reactive<ModelFilterState>({
    search: '',
    source: 'all',
    capability: 'all',
    klass: 'all',
    profile: 'all',
    provider: 'all',
    limit: PAGE,
  })

  const capabilityOptions = computed(() => {
    const values = new Set<string>()
    for (const model of models.value) for (const cap of model.capabilities ?? []) values.add(cap)
    return Array.from(values).sort()
  })
  const classOptions = computed(() => {
    const values = new Set<string>()
    for (const model of models.value) for (const cls of model.class ?? []) values.add(cls)
    return Array.from(values).sort()
  })
  const providerOptions = computed(() => {
    const values = new Set<string>()
    for (const model of models.value) if (model.provider_id) values.add(model.provider_id)
    return Array.from(values).sort()
  })

  const filtered = computed(() => {
    const q = state.search.trim().toLowerCase()
    return models.value.filter((model) => {
      if (state.source !== 'all' && model.source !== state.source) return false
      if (state.capability !== 'all' && !(model.capabilities ?? []).includes(state.capability)) return false
      if (state.klass !== 'all' && !(model.class ?? []).includes(state.klass)) return false
      if (state.profile !== 'all' && (model.provider_profile_id || '') !== state.profile) return false
      if (state.provider !== 'all' && (model.provider_id || '') !== state.provider) return false
      if (!q) return true
      return [
        model.name, model.title, model.provider_model, model.provider_id, model.provider_profile_id,
        ...(model.capabilities ?? []), ...(model.class ?? []),
      ].filter(Boolean).some(v => String(v).toLowerCase().includes(q))
    })
  })
  const visible = computed(() => filtered.value.slice(0, state.limit))
  const hasMore = computed(() => visible.value.length < filtered.value.length)
  const activeCount = computed(() =>
    (state.source !== 'all' ? 1 : 0) +
    (state.capability !== 'all' ? 1 : 0) +
    (state.klass !== 'all' ? 1 : 0) +
    (state.profile !== 'all' ? 1 : 0) +
    (state.provider !== 'all' ? 1 : 0) +
    (state.search.trim() ? 1 : 0),
  )

  function more() { state.limit += PAGE }
  function reset() {
    state.search = ''
    state.source = 'all'
    state.capability = 'all'
    state.klass = 'all'
    state.profile = 'all'
    state.provider = 'all'
    state.limit = PAGE
  }

  return {
    state,
    capabilityOptions, classOptions, providerOptions,
    filtered, visible, hasMore, activeCount,
    more, reset,
  }
}

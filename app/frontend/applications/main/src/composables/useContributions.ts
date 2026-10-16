import { ref } from 'vue'
import { useApi } from './useWippy'

// Generic UI-contribution discovery. A contribution is any registry.entry a module
// declares with a `ui.<kind>` meta.type; the backend normalizes the common fields
// (id, type, label, icon, order) and passes the kind-specific declarative fields
// (e.g. component_tag, hotkey) through. This is the single seam the shell uses to
// discover declarative UI contributions of any kind — fetched once per type and
// cached. Add a new kind by declaring entries with its meta.type and calling
// load([type]) from a consumer; no new endpoint or composable.
export interface Contribution {
  id: string
  type: string
  label?: string
  icon?: string
  order?: number
  // Kind-specific declarative fields (component_tag, hotkey, path, …).
  [key: string]: unknown
}

const cache = ref<Record<string, Contribution[]>>({})
const loaded = ref<Record<string, boolean>>({})
const error = ref('')

export function useContributions() {
  const api = useApi()

  // load fetches the requested types not already cached (force re-fetches all).
  async function load(types: string[], force = false): Promise<void> {
    const need = force ? types : types.filter(t => !loaded.value[t])
    if (!need.length) return
    try {
      const { data } = await api.get('/api/v1/ui/contributions', { params: { types: need.join(',') } })
      const groups = (data?.success && data.contributions) ? data.contributions : {}
      for (const t of need) {
        cache.value[t] = Array.isArray(groups[t]) ? groups[t] : []
        loaded.value[t] = true
      }
      error.value = ''
    } catch (e) {
      // Surface the failure instead of caching it as an empty result: the types stay
      // unloaded so a later load() retries, and error is exposed for the shell to show.
      // Otherwise a transient fetch failure is indistinguishable from "no contributions".
      error.value = e instanceof Error ? e.message : 'failed to load UI contributions'
    }
  }

  function get(type: string): Contribution[] {
    return cache.value[type] || []
  }

  return { contributions: cache, load, get, error }
}

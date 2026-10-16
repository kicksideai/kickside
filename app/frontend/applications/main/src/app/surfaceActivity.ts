import { computed, inject, provide, type ComputedRef, type InjectionKey, type Ref } from 'vue'

// Logical activity belongs to the owning surface slot, not to the DOM layer
// currently painted during the double-buffer handoff. App-owned renderers use
// this value to pause or refresh retained work without being remounted.
export const SURFACE_ACTIVITY: InjectionKey<ComputedRef<boolean>> = Symbol('kickside-surface-activity')

export function provideSurfaceActivity(active: Ref<boolean | undefined>) {
  provide(SURFACE_ACTIVITY, computed(() => active.value ?? true))
}

export function useSurfaceActivity(): ComputedRef<boolean> {
  return inject(SURFACE_ACTIVITY, computed(() => true))
}

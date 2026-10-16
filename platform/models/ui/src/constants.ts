import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps } from './types.ts'
import type { UsableFastModelContext } from './modelReadiness.ts'

export interface Events {
  load: undefined
  unload: undefined
  error: { message: string, error: unknown }
  // Emitted by the onboarding element to drive the host wizard: `done` when the
  // step is finished or skipped, `back` to return to the previous step.
  done: { status: 'completed' | 'skipped', model_configured: boolean, model?: UsableFastModelContext }
  back: undefined
}

// Events a provider_profile_editor web component emits to its host.
export interface ProviderEditorEvents {
  save: Record<string, unknown>
  cancel: undefined
  test: undefined
}

export const useComponentProps = () => useProps<ComponentProps>()
export const useComponentEvents = () => useEvents<Events>()

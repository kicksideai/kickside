import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps } from './types.ts'

export interface Events {
  load: undefined
  unload: undefined
  error: { message: string, error: unknown }
  invalid: { message: string }
  done: {
    status: 'completed' | 'skipped'
    installed_count?: number
    profile?: string
    profiles?: string[]
  }
  back: undefined
  instrumentRecommendations: {
    need: string
    candidate_ids: string[]
    candidates: Array<{
      component: string
      title: string
      description: string
      keywords: string[]
    }>
    workspace_context: {
      configured_components: Array<{
        component: string
        title?: string
        version?: string
        relationship: 'root' | 'transitive'
      }>
    }
    signal: AbortSignal
    accept: () => void
    respond: (ids: unknown) => void
  }
  instrumentRequirementResolution: {
    component: string
    version?: string
    current_id?: string
    parameters: Array<{ name: string; value: string }>
    requirements: Array<{
      name: string
      description: string
      expected_kind: string
      targets: Array<{ entry: string; path: string }>
      candidates: Array<{ value: string; label: string; kind: string; description: string }>
    }>
    signal: AbortSignal
    accept: () => void
    respond: (result: unknown) => void
  }
}

export const useComponentProps = () => useProps<ComponentProps>()
export const useComponentEvents = () => useEvents<Events>()

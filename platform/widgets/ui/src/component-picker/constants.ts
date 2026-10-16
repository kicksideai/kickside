import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps } from './types.ts'

export interface ComponentSelection {
  thread_id: string
}

export interface Events {
  // Emitted whenever the selection changes. Two surfaces are served: the poller
  // config form merges `config-changed`/`change` detail into its config, so both
  // carry {thread_id}.
  change: Record<string, unknown>
  'config-changed': Record<string, unknown>
  load: undefined
  created: ComponentSelection
  error: { message: string; error: unknown }
}

export const useComponentProps = () => useProps<ComponentProps>()
export const useComponentEvents = () => useEvents<Events>()

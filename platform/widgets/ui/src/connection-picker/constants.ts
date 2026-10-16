import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps } from './types.ts'

export interface ConnectionSelection {
  connection_id: string
}

export interface Events {
  // Emitted whenever the selection changes. Two surfaces are served: the poller
  // config form merges `config-changed`/`change` detail into its config, so both
  // carry {connection_id}.
  change: ConnectionSelection
  'config-changed': ConnectionSelection
  load: undefined
  error: { message: string; error: unknown }
}

export const useComponentProps = () => useProps<ComponentProps>()
export const useComponentEvents = () => useEvents<Events>()

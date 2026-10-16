import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps } from './types.ts'

export interface ChannelSelection {
  connection_id: string
  channel_id: string
  // Resolved channel display name, for surfaces that persist a human label
  // alongside the id. Optional: id-only consumers keep working.
  channel_name?: string
}

export interface Events {
  // Emitted whenever the selection changes. Consumers bind @change and read
  // $event.detail.{connection_id, channel_id, channel_name}.
  change: ChannelSelection
  load: undefined
  error: { message: string; error: unknown }
}

export const useComponentProps = () => useProps<ComponentProps>()
export const useComponentEvents = () => useEvents<Events>()

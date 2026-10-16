import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps } from './types.ts'

export interface Events {
  // Emitted when the user picks an icon (detail = icon name) or resets it
  // (detail = empty string). Consumers bind @select and read $event.detail.
  select: string
  load: undefined
  unload: undefined
  error: { message: string, error: unknown }
}

export const useComponentProps = () => useProps<ComponentProps>()
export const useComponentEvents = () => useEvents<Events>()

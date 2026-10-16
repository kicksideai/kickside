import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps } from './types.ts'

export interface Events {
  load: undefined
  unload: undefined
  close: undefined
  // Emitted whenever the selection changes, with the chosen component_ids.
  'selection-change': { component_ids: string[] }
  // Emitted after a successful export, with the archive filename.
  exported: { filename: string, count: number }
  error: { message: string, error: unknown }
}

export const useComponentProps = () => useProps<ComponentProps>()
export const useComponentEvents = () => useEvents<Events>()

import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps } from './types.ts'

export interface Events {
  // Emitted whenever the selection changes — always an array of ids (single
  // select emits 0 or 1). Consumers bind @change and read $event.detail.selected.
  // labels carries the resolved display label per id (same order), for surfaces
  // that need to persist a human name alongside the id.
  change: { selected: string[]; labels?: string[] }
  load: undefined
  error: { message: string; error: unknown }
}

export const useComponentProps = () => useProps<ComponentProps>()
export const useComponentEvents = () => useEvents<Events>()

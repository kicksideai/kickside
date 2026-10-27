import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps } from './types.ts'

export interface Events {
  navigate: { path: string }
  load: undefined
  unload: undefined
  error: { message: string, error: unknown }
  invalid: { message: string }
}

export const useComponentProps = () => useProps<ComponentProps>()
export const useComponentEvents = () => useEvents<Events>()

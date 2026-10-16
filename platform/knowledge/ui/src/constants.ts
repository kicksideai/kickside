import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps } from './types.ts'

export interface Events {
  load: undefined
  unload: undefined
  error: { message: string, error: unknown }
  invalid: { message: string }
  // The in-surface location as a sub-path under /knowledge ("" = list, "<kbId>" =
  // a KB, "<kbId>/<node>" = in-KB content). The shell reflects it into the URL.
  navigate: string
  // Emitted by the onboarding element to drive the host wizard.
  done: undefined
  back: undefined
}

export const useComponentProps = () => useProps<ComponentProps>()
export const useComponentEvents = () => useEvents<Events>()

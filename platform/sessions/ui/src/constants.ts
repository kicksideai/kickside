import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps } from './types.ts'

export interface Events {
  load: undefined
  unload: undefined
  error: { message: string, error: unknown }
  invalid: { message: string }
  'session-select': { sessionId: string }
  'artifact-select': { artifactId: string; sessionId: string }
  'artifacts-open': undefined
  'new-chat': undefined
  'kickside-chat-open': { kind: 'session', sessionId: string } | { kind: 'start', startToken: string }
}

export const useComponentProps = () => useProps<ComponentProps>()
export const useComponentEvents = () => useEvents<Events>()

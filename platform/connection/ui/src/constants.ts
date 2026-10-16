import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps } from './types.ts'

export interface Events {
  load: undefined
  unload: undefined
  error: { message: string, error: unknown }
  invalid: { message: string }
  // Emitted by the onboarding element to drive the host wizard.
  done: undefined
  back: undefined
}

export const useComponentProps = () => useProps<ComponentProps>()
export const useComponentEvents = () => useEvents<Events>()

// Surface the server's actual error from an axios-style failure: the API returns
// { success: false, error: "..." } and a non-2xx status makes axios throw, so the
// message lives on response.data.error. Without this, callers show a useless bare
// "Request failed with status code 400".
export function apiError(e: unknown): string {
  const data = (e as { response?: { data?: { error?: unknown, message?: unknown } } })?.response?.data
  if (data && typeof data === 'object') {
    if (typeof data.error === 'string' && data.error) return data.error
    if (typeof data.message === 'string' && data.message) return data.message
  }
  return e instanceof Error ? e.message : String(e)
}

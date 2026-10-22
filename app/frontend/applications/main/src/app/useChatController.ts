import { readonly, ref } from 'vue'
import type { HostApi } from '../types'

export interface ChatContext {
  source?: Parameters<HostApi['setContext']>[2]
  context: Record<string, unknown>
}

export type KicksideChatOpenDetail =
  | { kind: 'session', sessionId: string }
  | { kind: 'start', startToken: string }

export function isKicksideChatOpenDetail(value: unknown): value is KicksideChatOpenDetail {
  if (!value || typeof value !== 'object') return false
  const detail = value as Record<string, unknown>
  return (detail.kind === 'session' && typeof detail.sessionId === 'string' && detail.sessionId.length > 0)
    || (detail.kind === 'start' && typeof detail.startToken === 'string' && detail.startToken.length > 0)
}

export function useChatController(applyContext?: (sessionId: string, context: ChatContext) => void) {
  let startContext: ChatContext | undefined
  const sessionId = ref('')
  const startToken = ref('')
  const open = ref(false)
  const generation = ref(0)

  function openSession(id: string, context?: ChatContext) {
    startContext = undefined
    if (context) applyContext?.(id, context)
    sessionId.value = id
    startToken.value = ''
    open.value = true
  }

  function startChat(token: string, context?: ChatContext) {
    startContext = context
    sessionId.value = ''
    startToken.value = token
    generation.value++
    open.value = true
  }

  function newChat() {
    startContext = undefined
    sessionId.value = ''
    startToken.value = ''
    generation.value++
    open.value = true
  }

  function close() {
    open.value = false
  }

  // Re-open the current app-owned chat without changing its selected session or
  // pending start intent. The ordinary-route flap relies on this distinction.
  function show() {
    open.value = true
  }

  function recordStarted(id: string) {
    const context = startContext
    startContext = undefined
    if (context) applyContext?.(id, context)
    sessionId.value = id
    startToken.value = ''
  }

  return {
    sessionId: readonly(sessionId),
    startToken: readonly(startToken),
    open: readonly(open),
    generation: readonly(generation),
    openSession,
    startChat,
    newChat,
    close,
    show,
    recordStarted,
  }
}

import { readonly, ref } from 'vue'

export type KicksideChatOpenDetail =
  | { kind: 'session', sessionId: string }
  | { kind: 'start', startToken: string }

export function isKicksideChatOpenDetail(value: unknown): value is KicksideChatOpenDetail {
  if (!value || typeof value !== 'object') return false
  const detail = value as Record<string, unknown>
  return (detail.kind === 'session' && typeof detail.sessionId === 'string' && detail.sessionId.length > 0)
    || (detail.kind === 'start' && typeof detail.startToken === 'string' && detail.startToken.length > 0)
}

// The inline chat on /sessions. The chat everywhere else is the host's `chat`
// panel, driven by the host-side chat coordinator.
export function useChatController() {
  const sessionId = ref('')
  const startToken = ref('')
  const generation = ref(0)

  function openSession(id: string) {
    sessionId.value = id
    startToken.value = ''
  }

  function startChat(token: string) {
    sessionId.value = ''
    startToken.value = token
    generation.value++
  }

  function newChat() {
    sessionId.value = ''
    startToken.value = ''
    generation.value++
  }

  function recordStarted(id: string) {
    sessionId.value = id
    startToken.value = ''
  }

  return {
    sessionId: readonly(sessionId),
    startToken: readonly(startToken),
    generation: readonly(generation),
    openSession,
    startChat,
    newChat,
    recordStarted,
  }
}

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ChatEmptyState from './ChatEmptyState.vue'
import { CHAT_APPEARANCE_CSS } from './chatAppearance'
import { waitForCustomElement } from './chatRuntime'

const props = defineProps<{
  sessionId?: string
  startToken?: string
  generation: number
  closable?: boolean
  sessionsAppearance?: boolean
  /** Render the chat's own session selector in addition to the header one. */
  inChatSelector?: boolean
}>()

const emit = defineEmits<{
  ready: []
  error: [error: Error]
  sessionStarted: [sessionId: string]
  sessionSelect: [sessionId: string]
  close: []
}>()

function onSessionPick(event: Event) {
  const id = sessionIdFromEvent(event)
  if (id) emit('sessionSelect', id)
}

const host = ref<HTMLElement | null>(null)
/** Mount-time only: there is no chat to show, so replacing the body is right. */
const failure = ref('')
/**
 * A runtime problem reported by a chat that is still mounted and usable.
 * Kept apart from `failure` because tearing a live conversation down over a
 * recoverable error loses the transcript the reader was in the middle of.
 */
const notice = ref('')
const mounting = ref(true)
let element: HTMLElement | null = null
let attempt = 0
const initialMessage = ref('')
const blankChat = computed(() => !props.sessionId && !props.startToken)

function sessionIdFromEvent(event: Event): string {
  const detail = (event as CustomEvent).detail
  if (typeof detail === 'string') return detail
  if (detail && typeof detail === 'object') {
    const value = (detail as { sessionId?: unknown; session_id?: unknown }).sessionId
      ?? (detail as { session_id?: unknown }).session_id
    return typeof value === 'string' ? value : ''
  }
  return ''
}

function detachChat() {
  element?.removeEventListener('load', onLoad)
  element?.removeEventListener('error', onError)
  element?.removeEventListener('session-started', onSessionStarted)
  element = null
}

function detach() {
  detachChat()
}

function onLoad() {
  mounting.value = false
  failure.value = ''
  notice.value = ''
  emit('ready')
}

function onError(event: Event) {
  // The chat emits `error` for anything that goes wrong while it is running -
  // a start that failed, a send that was rejected - not only for a chat that
  // could not load. Report what actually happened and leave it mounted.
  const detail = (event as CustomEvent<{ message?: unknown }>).detail
  const message = typeof detail?.message === 'string' && detail.message
    ? detail.message
    : 'The chat reported an error.'
  mounting.value = false
  notice.value = message
  emit('error', new Error(message))
  console.error('[kickside-chat] component error', event)
}

function onSessionStarted(event: Event) {
  const id = sessionIdFromEvent(event)
  if (!id) return
  initialMessage.value = ''
  emit('sessionStarted', id)
}

function syncAttributes() {
  element?.setAttribute('initial-message', initialMessage.value)
  element?.setAttribute('session-id', props.sessionId ?? '')
  element?.setAttribute('start-token', props.startToken ?? '')
  // The panel header owns the session picker, so the chat's built-in one is
  // off by default - two pickers stacked is redundant. Both work, and both
  // drive the same shared session, so this can be turned on for a surface
  // that has no header of its own.
  element?.setAttribute('show-selector', props.inChatSelector ? 'true' : 'false')
  // Our own look, handed to the chat rather than reached in and injected. The
  // host appends it last in the shadow cascade, which is where the hand-rolled
  // <style> used to sit, so ordering is unchanged.
  if (props.sessionsAppearance)
    element?.setAttribute('custom-css', CHAT_APPEARANCE_CSS)
  else
    element?.removeAttribute('custom-css')
  // Ordering of the agent/model row is a layout choice the host exposes
  // generically, so it stays a prop.
  if (props.sessionsAppearance && !blankChat.value)
    element?.setAttribute('meta-placement', 'before-composer')
  else
    element?.removeAttribute('meta-placement')
}

function createChatElement(): HTMLElement {
  const chat = document.createElement('wippy-chat')
  chat.style.display = 'block'
  chat.style.width = '100%'
  chat.style.height = '100%'
  chat.addEventListener('load', onLoad)
  chat.addEventListener('error', onError)
  chat.addEventListener('session-started', onSessionStarted)
  return chat
}

function resetBlankChat() {
  if (!host.value) return
  mounting.value = true
  detachChat()
  element = createChatElement()
  syncAttributes()
  host.value.replaceChildren(element)
}

async function waitForChatDefinitions(): Promise<void> {
  // Both tags, not just the chat: the header renders <wippy-session-selector>
  // too, and an undefined custom element is an inert unknown tag rather than a
  // visible failure - the picker would simply never appear.
  await Promise.all([
    waitForCustomElement('wippy-chat', 5000),
    waitForCustomElement('wippy-session-selector', 5000),
  ])
}

async function mountChat() {
  const currentAttempt = ++attempt
  mounting.value = true
  failure.value = ''
  notice.value = ''
  await nextTick()
  if (currentAttempt !== attempt) return
  detach()
  host.value?.replaceChildren()
  try {
    await waitForChatDefinitions()
    if (currentAttempt !== attempt || !host.value) return
    const chat = createChatElement()
    element = chat
    syncAttributes()
    host.value.replaceChildren(chat)
  }
  catch (cause) {
    if (currentAttempt !== attempt) return
    mounting.value = false
    const error = cause instanceof Error ? cause : new Error(String(cause))
    failure.value = error.message
    emit('error', error)
    console.error('[kickside-chat] unavailable', error)
  }
}

onMounted(mountChat)
watch(
  () => [props.sessionId ?? '', props.startToken ?? '', props.generation] as const,
  ([sessionId, startToken, generation], [previousSessionId, previousStartToken, previousGeneration]) => {
    initialMessage.value = ''
    const repeatedBlankReset = generation !== previousGeneration
      && !sessionId && !startToken && !previousSessionId && !previousStartToken
    if (repeatedBlankReset) resetBlankChat()
    else syncAttributes()
  },
)
watch(initialMessage, syncAttributes)

watch(() => props.sessionsAppearance, syncAttributes)
onBeforeUnmount(() => { attempt++; detach() })
</script>

<template>
  <section class="chat-panel" aria-label="Chat">
    <header v-if="closable" class="chat-panel__header">
      <!--
        The host's own session picker, not a copy of it. It fetches the session
        list into the chat manager's shared store, which is the same store the
        chat's built-in selector reads - so mounting it here makes both work,
        and either one alone still does.
      -->
      <wippy-session-selector
        class="chat-panel__session-picker"
        :active-session-id="sessionId ?? ''"
        @select="onSessionPick"
      />
      <button v-if="closable" type="button" class="chat-panel__close" aria-label="Close chat" title="Close chat" @click="emit('close')">
        <Icon icon="tabler:x" aria-hidden="true" />
      </button>
    </header>
    <div class="chat-panel__body" :class="{ 'chat-panel__body--blank': sessionsAppearance && blankChat && !failure }">
      <ChatEmptyState v-if="sessionsAppearance && blankChat && !failure" v-model="initialMessage" />
      <div v-if="mounting && !blankChat && !failure" class="chat-panel__mounting" role="status">
        <Icon icon="tabler:loader-2" aria-hidden="true" />
        <span>Loading chat…</span>
      </div>
      <div v-if="failure" class="chat-panel__failure" role="alert">
        <strong>Chat unavailable</strong>
        <span>{{ failure }}</span>
        <button type="button" @click="mountChat">Retry</button>
      </div>
      <template v-else>
        <div v-if="notice" class="chat-panel__notice" role="alert">
          <span>{{ notice }}</span>
          <button type="button" aria-label="Dismiss" title="Dismiss" @click="notice = ''">
            <Icon icon="tabler:x" aria-hidden="true" />
          </button>
        </div>
        <div ref="host" class="chat-panel__host" />
      </template>
    </div>
  </section>
</template>

<style scoped>
.chat-panel { display: flex; flex-direction: column; width: 100%; height: 100%; min-width: 0; min-height: 0; overflow: hidden; background: var(--p-content-background); }
.chat-panel__body { position: relative; flex: 1 1 auto; width: 100%; min-width: 0; min-height: 0; overflow: hidden; }
.chat-panel__body--blank { display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 12px; padding: 24px; overflow-y: auto; }
.chat-panel__body--blank .chat-panel__host { width: min(760px, 100%); height: 80px; flex: 0 0 auto; }
.chat-panel__host { width: 100%; height: 100%; min-width: 0; min-height: 0; }
.chat-panel__session-picker {
  flex: 1 1 auto;
  min-width: 0;
}

.chat-panel__header { display: flex; flex: 0 0 auto; justify-content: flex-end; align-items: center; min-width: 0; padding: 4px 8px; background: var(--p-content-background); }
.chat-panel__close { display: grid; width: 30px; height: 30px; padding: 6px; place-items: center; border-radius: 6px; background: transparent; color: var(--p-text-muted-color); }
.chat-panel__close:hover { background: var(--p-content-hover-background); color: var(--p-text-color); }
.chat-panel__close :deep(svg) { width: 18px; height: 18px; }
.chat-panel__failure { height: 100%; display: grid; place-content: center; gap: .75rem; padding: 1.5rem; text-align: center; color: var(--p-text-muted-color); }
.chat-panel__failure strong { color: var(--p-text-color); }
.chat-panel__failure button { justify-self: center; padding: .5rem .9rem; border-radius: var(--kx-radius-8); background: var(--p-primary-color); color: var(--p-primary-contrast-color); }
.chat-panel__notice {
  position: absolute;
  z-index: 4;
  top: .5rem;
  right: .5rem;
  left: .5rem;
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .5rem .75rem;
  border: 1px solid var(--p-danger-500);
  border-radius: var(--kx-radius-8);
  background: var(--p-content-background);
  color: var(--p-text-color);
  font-size: .85rem;
  box-shadow: 0 6px 18px color-mix(in srgb, var(--p-text-color) 12%, transparent);
}
.chat-panel__notice span { flex: 1 1 auto; min-width: 0; }
.chat-panel__notice button { flex: 0 0 auto; display: flex; color: var(--p-text-muted-color); }
.chat-panel__notice button:hover { color: var(--p-text-color); }
.chat-panel__mounting { position: absolute; z-index: 3; inset: 0; display: flex; align-items: center; justify-content: center; gap: .6rem; color: var(--p-text-muted-color); background: var(--p-content-background); }
.chat-panel__mounting :deep(svg) { width: 18px; height: 18px; animation: chat-panel-spin 1s linear infinite; }
@keyframes chat-panel-spin { to { transform: rotate(360deg); } }
</style>

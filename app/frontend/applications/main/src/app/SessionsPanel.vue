<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { setWippyVisibility } from '@wippy-fe/shared'
import { useWippy } from '../composables/useWippy'

const props = withDefaults(defineProps<{
  activeSessionId?: string
  artifactsActive?: boolean
  mode?: 'sidebar' | 'navigation'
  visible?: boolean
}>(), {
  mode: 'sidebar',
  visible: false,
})
const emit = defineEmits<{
  sessionSelect: [sessionId: string]
  artifactSelect: [selection: { artifactId: string; sessionId: string }]
  artifactsOpen: []
  newChat: []
  error: [error: Error]
}>()

const wippy = useWippy()
const host = ref<HTMLElement | null>(null)
const failure = ref('')
const absent = ref(false)
let element: HTMLElement | null = null

function eventSessionId(event: Event): string {
  const detail = (event as CustomEvent).detail
  if (typeof detail === 'string') return detail
  if (detail && typeof detail === 'object') {
    const value = (detail as { sessionId?: unknown; session_id?: unknown }).sessionId
      ?? (detail as { session_id?: unknown }).session_id
    return typeof value === 'string' ? value : ''
  }
  return ''
}

function onSessionSelect(event: Event) {
  const id = eventSessionId(event)
  if (id) emit('sessionSelect', id)
}
function onArtifactSelect(event: Event) {
  const detail = (event as CustomEvent).detail
  if (!detail || typeof detail !== 'object') return
  const artifactId = (detail as { artifactId?: unknown }).artifactId
  const sessionId = (detail as { sessionId?: unknown }).sessionId
  if (typeof artifactId === 'string' && artifactId && typeof sessionId === 'string' && sessionId) {
    emit('artifactSelect', { artifactId, sessionId })
  }
}
function onArtifactsOpen() { emit('artifactsOpen') }
function onNewChat() { emit('newChat') }
function onError() {
  const error = new Error('The Sessions component failed to load.')
  failure.value = error.message
  emit('error', error)
}
function detach() {
  element?.removeEventListener('session-select', onSessionSelect)
  element?.removeEventListener('artifact-select', onArtifactSelect)
  element?.removeEventListener('artifacts-open', onArtifactsOpen)
  element?.removeEventListener('new-chat', onNewChat)
  element?.removeEventListener('error', onError)
  element = null
}

async function mountSessions() {
  failure.value = ''
  absent.value = false
  detach()
  try {
    await wippy.loadByTagName('kickside-sessions')
    if (!host.value) return
    const sessions = document.createElement('kickside-sessions')
    sessions.style.display = 'block'
    sessions.style.width = '100%'
    sessions.style.height = '100%'
    sessions.setAttribute('mode', props.mode)
    setWippyVisibility(sessions, props.visible)
    if (props.activeSessionId) sessions.setAttribute('active-session-id', props.activeSessionId)
    if (props.artifactsActive) sessions.setAttribute('artifacts-active', 'true')
    sessions.addEventListener('session-select', onSessionSelect)
    sessions.addEventListener('artifact-select', onArtifactSelect)
    sessions.addEventListener('artifacts-open', onArtifactsOpen)
    sessions.addEventListener('new-chat', onNewChat)
    sessions.addEventListener('error', onError)
    element = sessions
    host.value.replaceChildren(sessions)
  }
  catch (cause) {
    const error = cause instanceof Error ? cause : new Error(String(cause))
    // An app without the sessions module simply has no panel: absence is a
    // configuration, not a failure, so it renders nothing and stays silent.
    if (/404|not registered|No view\.component/i.test(error.message)) {
      absent.value = true
      return
    }
    failure.value = error.message
    emit('error', error)
    console.error('[kickside-sessions] unavailable', error)
  }
}

watch(() => props.activeSessionId, (id) => {
  if (!element) return
  if (id) element.setAttribute('active-session-id', id)
  else element.removeAttribute('active-session-id')
})
watch(() => props.artifactsActive, active => {
  if (!element) return
  if (active) element.setAttribute('artifacts-active', 'true')
  else element.removeAttribute('artifacts-active')
})
watch(() => props.mode, mode => { if (element) element.setAttribute('mode', mode) })
watch(() => props.visible, visible => { if (element) setWippyVisibility(element, visible) })
onMounted(mountSessions)
onBeforeUnmount(detach)
</script>

<template>
  <section v-if="!absent" class="sessions-panel" aria-label="Sessions">
    <div v-if="failure" class="sessions-panel__failure" role="alert">
      {{ failure }}
      <button type="button" @click="mountSessions">Retry</button>
    </div>
    <div v-else ref="host" class="sessions-panel__host" />
  </section>
</template>

<style scoped>
.sessions-panel, .sessions-panel__host { width: 100%; height: 100%; min-width: 0; min-height: 0; }
.sessions-panel { overflow: hidden; background: var(--p-content-background); }
.sessions-panel__failure { display: grid; place-content: center; gap: .75rem; height: 100%; padding: 1rem; text-align: center; color: var(--p-text-muted-color); }
.sessions-panel__failure button { justify-self: center; padding: .4rem .75rem; border-radius: var(--kx-radius-8); background: var(--p-primary-color); color: var(--p-primary-contrast-color); }
</style>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { on } from '@wippy-fe/proxy'
import { useHostVisibilityRefresh, useLayoutBus } from '@wippy-fe/webcomponent-vue'
import Select from 'primevue/select'
import type { ArtifactSummary } from '../types.ts'
import { artifactId } from './artifactPresentation.ts'
import { useSessionsApi } from './useSessionsApi.ts'

interface LayoutEvent {
  channel?: string
  payload?: unknown
}

interface ArtifactIntent {
  intent?: string
  uuid?: string
  artifactId?: string
}

interface SessionIntent {
  sessionId?: string
  session_id?: string
}

const api = useSessionsApi()
const bus = useLayoutBus()
const artifacts = ref<ArtifactSummary[]>([])
const selectedId = ref('')
const activeSessionId = ref(sessionIdFromPath(window.location.pathname))
const loading = ref(!!activeSessionId.value)
const action = ref<'copy' | 'save' | ''>('')
const error = ref('')
const copied = ref(false)
const stops: Array<() => void> = []
const pendingArtifactIds = new Set<string>()
let refreshTimer: ReturnType<typeof setTimeout> | null = null
let requestSequence = 0
let selectionSequence = 0
let pendingSelectionId = ''

const selected = computed(() => artifacts.value.find(item => artifactId(item) === selectedId.value))

function eventArtifactId(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return ''
  const intent = payload as ArtifactIntent
  return String(intent.uuid || intent.artifactId || '')
}

function eventSessionId(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return ''
  const intent = payload as SessionIntent
  return String(intent.sessionId || intent.session_id || '')
}

function sessionIdFromPath(path: string): string {
  if (!path.startsWith('/sessions/')) return ''
  const encoded = path.slice('/sessions/'.length).split('/')[0] || ''
  try { return decodeURIComponent(encoded) } catch { return '' }
}

async function loadCatalog() {
  const sessionId = activeSessionId.value
  const sequence = ++requestSequence
  if (!sessionId) {
    artifacts.value = []
    selectedId.value = ''
    loading.value = false
    error.value = ''
    return
  }
  loading.value = true
  error.value = ''
  try {
    const page = await api.artifacts({ sessionId, limit: 100 })
    if (sequence !== requestSequence || sessionId !== activeSessionId.value) return
    const current = selected.value
    const sessionArtifacts = page.artifacts.filter(item => !item.session_id || item.session_id === sessionId)
    const nextArtifacts = current?.session_id === sessionId
      && !sessionArtifacts.some(item => artifactId(item) === selectedId.value)
      ? [current, ...sessionArtifacts]
      : sessionArtifacts
    artifacts.value = nextArtifacts
    const selectionExists = nextArtifacts.some(item => artifactId(item) === selectedId.value)
    if (!selectionExists && !pendingSelectionId) {
      selectedId.value = nextArtifacts[0] ? artifactId(nextArtifacts[0]) : ''
    }
  } catch (cause) {
    if (sequence !== requestSequence || sessionId !== activeSessionId.value) return
    if (!selectedId.value) error.value = (cause as Error).message || 'Could not load artifacts'
  } finally {
    if (sequence === requestSequence) loading.value = false
  }
}

function queueRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => { void loadCatalog() }, 150)
}

async function selectArtifact(id: string) {
  if (!id) return
  const sessionId = activeSessionId.value
  // The panel only ever shows artifacts of the session in the URL. With no
  // active session there is nothing this artifact could belong to, so
  // refuse rather than render a foreign one.
  if (!sessionId) return
  copied.value = false
  error.value = ''
  if (artifacts.value.some(item => artifactId(item) === id)) {
    selectionSequence++
    pendingSelectionId = ''
    selectedId.value = id
    return
  }
  if (pendingArtifactIds.has(id)) return
  const sequence = ++selectionSequence
  pendingSelectionId = id
  // Remembered so a rejected or superseded lookup can put back what the reader
  // was already looking at. Blanking and then bailing dropped a perfectly valid
  // artifact to the empty state with no explanation.
  const previousId = selectedId.value
  selectedId.value = ''
  pendingArtifactIds.add(id)
  try {
    const detail = await api.artifact(id)
    if (sequence !== selectionSequence || sessionId !== activeSessionId.value) {
      if (!selectedId.value) selectedId.value = previousId
      return
    }
    if (detail.session_id && detail.session_id !== sessionId) {
      selectedId.value = previousId
      return
    }
    artifacts.value = [detail, ...artifacts.value.filter(item => artifactId(item) !== id)]
    selectedId.value = id
  } catch (cause) {
    if (sequence === selectionSequence) {
      // Put back what was on screen: a failed lookup is a reason to show an
      // error, not to take away the artifact the reader was already reading.
      if (!selectedId.value) selectedId.value = previousId
      error.value = (cause as Error).message || 'Could not load artifact details'
    }
  } finally {
    pendingArtifactIds.delete(id)
    if (pendingSelectionId === id) pendingSelectionId = ''
  }
}

function setActiveSession(sessionId: string) {
  if (sessionId === activeSessionId.value) return
  activeSessionId.value = sessionId
  requestSequence++
  selectionSequence++
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
  artifacts.value = []
  selectedId.value = ''
  pendingSelectionId = ''
  copied.value = false
  error.value = ''
  loading.value = !!sessionId
  if (sessionId) queueRefresh()
}

function onLayoutEvent(event: LayoutEvent) {
  if (event.channel === 'kickside:artifact-session') {
    setActiveSession(eventSessionId(event.payload))
    return
  }
  if (event.channel !== 'kickside:artifact-open') return
  const id = eventArtifactId(event.payload)
  if (id) {
    void selectArtifact(id)
    queueRefresh()
  }
}

function formatGenerated(value?: string): string {
  if (!value) return 'Generation time unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Generation time unavailable'
  return `Generated ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)}`
}

function fileExtension(contentType?: string): string {
  const mime = String(contentType || '').toLowerCase()
  if (mime.includes('markdown')) return 'md'
  if (mime.includes('html')) return 'html'
  if (mime.includes('json')) return 'json'
  if (mime.includes('javascript')) return 'js'
  if (mime.includes('css')) return 'css'
  return 'txt'
}

function safeFileName(title?: string): string {
  const base = String(title || 'artifact').trim().replace(/[<>:"/\\|?*\u0000-\u001f]+/g, '-').replace(/[. ]+$/g, '')
  return `${base || 'artifact'}.${fileExtension(selected.value?.content_type)}`
}

async function readContent(): Promise<string> {
  if (!selectedId.value) throw new Error('Select an artifact first')
  return api.artifactContent(selectedId.value)
}

async function copyArtifact() {
  action.value = 'copy'
  error.value = ''
  try {
    await navigator.clipboard.writeText(await readContent())
    copied.value = true
    window.setTimeout(() => { copied.value = false }, 1600)
  } catch (cause) {
    error.value = (cause as Error).message || 'Could not copy artifact'
  } finally {
    action.value = ''
  }
}

async function saveArtifact() {
  action.value = 'save'
  error.value = ''
  try {
    const content = await readContent()
    const blob = new Blob([content], { type: selected.value?.content_type || 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = safeFileName(selected.value?.title)
    link.click()
    URL.revokeObjectURL(url)
  } catch (cause) {
    error.value = (cause as Error).message || 'Could not save artifact'
  } finally {
    action.value = ''
  }
}

function closePanel() {
  bus?.broadcast('kickside:artifact-close', { panelId: 'artifact' })
}

const hostVisible = useHostVisibilityRefresh(queueRefresh)
onMounted(() => {
  const stop = bus?.subscribe(onLayoutEvent)
  if (stop) stops.push(stop)
  stops.push(on('artifact:*', queueRefresh))
  stops.push(on('session:*', queueRefresh))
})

onBeforeUnmount(() => {
  stops.forEach(stop => stop())
  requestSequence++
  selectionSequence++
  if (refreshTimer) clearTimeout(refreshTimer)
})
</script>

<template>
  <section v-show="hostVisible !== false" class="kx-artifact-panel" aria-label="Artifact preview">
    <header class="kx-artifact-panel-head">
      <div class="kx-artifact-panel-title">
        <label class="sr-only" for="artifact-panel-selector">Artifact</label>
        <Select
          input-id="artifact-panel-selector"
          v-model="selectedId"
          class="kx-artifact-panel-select"
          overlay-class="kx-artifact-panel-select-overlay"
          :options="artifacts"
          option-label="title"
          :option-value="artifactId"
          :placeholder="loading ? 'Loading artifacts…' : 'Select an artifact'"
          :disabled="loading"
          @update:model-value="(id: string) => selectArtifact(id)"
        >
          <template #value>
            <span class="kx-artifact-select-value" :class="{ 'is-placeholder': !selected }">
              {{ selected?.title || (loading ? 'Loading artifacts…' : 'Select an artifact') }}
            </span>
          </template>
          <template #option="{ option }">
            <span class="kx-artifact-select-option">
              <span class="kx-artifact-select-option-title">{{ option.title || 'Untitled artifact' }}</span>
              <span class="kx-artifact-select-option-sub">{{ formatGenerated(option.created_at) }}</span>
            </span>
          </template>
        </Select>
      </div>
      <div class="kx-artifact-panel-actions">
        <button type="button" class="kx-panel-action" :disabled="!selectedId || !!action" @click="copyArtifact">
          <Icon :icon="action === 'copy' ? 'tabler:loader-2' : copied ? 'tabler:check' : 'tabler:copy'" :class="{ spin: action === 'copy' }" aria-hidden="true" />
          {{ copied ? 'Copied' : 'Copy' }}
        </button>
        <button type="button" class="kx-panel-action" :disabled="!selectedId || !!action" @click="saveArtifact">
          <Icon :icon="action === 'save' ? 'tabler:loader-2' : 'tabler:download'" :class="{ spin: action === 'save' }" aria-hidden="true" />
          Save
        </button>
        <button type="button" class="kx-panel-close" aria-label="Close artifact panel" @click="closePanel">
          <Icon icon="tabler:x" aria-hidden="true" />
        </button>
      </div>
    </header>
    <div v-if="error" class="kx-artifact-panel-error" role="alert">
      <span>{{ error }}</span>
      <button v-if="!selectedId" type="button" class="kx-artifact-panel-retry" :disabled="loading" @click="loadCatalog">Retry</button>
    </div>
    <span class="sr-only" aria-live="polite">{{ copied ? 'Artifact copied to clipboard' : '' }}</span>
    <div v-if="selectedId" class="kx-artifact-panel-body">
      <w-artifact :id="selectedId" />
    </div>
    <div v-else class="kx-artifact-panel-empty">
      <Icon icon="tabler:file-description" aria-hidden="true" />
      <span>Select an artifact to preview it.</span>
    </div>
  </section>
</template>

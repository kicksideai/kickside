<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { setWippyVisibility } from '@wippy-fe/shared'
import { useWippy } from '../composables/useWippy'

const props = withDefaults(defineProps<{ visible?: boolean }>(), {
  visible: false,
})
const emit = defineEmits<{
  artifactSelect: [selection: { artifactId: string; sessionId: string }]
  error: [error: Error]
}>()

const wippy = useWippy()
const host = ref<HTMLElement | null>(null)
const failure = ref('')
const absent = ref(false)
let element: HTMLElement | null = null

function onArtifactSelect(event: Event) {
  const detail = (event as CustomEvent).detail
  if (!detail || typeof detail !== 'object') return
  const artifactId = (detail as { artifactId?: unknown }).artifactId
  const sessionId = (detail as { sessionId?: unknown }).sessionId
  if (typeof artifactId === 'string' && artifactId && typeof sessionId === 'string' && sessionId) {
    emit('artifactSelect', { artifactId, sessionId })
  }
}

function onError() {
  const error = new Error('The Artifacts component failed to load.')
  failure.value = error.message
  emit('error', error)
}

function detach() {
  element?.removeEventListener('artifact-select', onArtifactSelect)
  element?.removeEventListener('error', onError)
  element = null
}

async function mountArtifacts() {
  failure.value = ''
  absent.value = false
  detach()
  try {
    await wippy.loadByTagName('kickside-artifacts')
    if (!host.value) return
    const artifacts = document.createElement('kickside-artifacts')
    artifacts.style.display = 'block'
    artifacts.style.width = '100%'
    artifacts.style.height = '100%'
    setWippyVisibility(artifacts, props.visible)
    artifacts.addEventListener('artifact-select', onArtifactSelect)
    artifacts.addEventListener('error', onError)
    element = artifacts
    host.value.replaceChildren(artifacts)
  } catch (cause) {
    const error = cause instanceof Error ? cause : new Error(String(cause))
    if (/404|not registered|No view\.component/i.test(error.message)) {
      absent.value = true
      return
    }
    failure.value = error.message
    emit('error', error)
    console.error('[kickside-artifacts] unavailable', error)
  }
}

watch(() => props.visible, visible => { if (element) setWippyVisibility(element, visible) })
onMounted(mountArtifacts)
onBeforeUnmount(detach)
</script>

<template>
  <section v-if="!absent" class="artifacts-gallery-panel" aria-label="Artifacts">
    <div v-if="failure" class="artifacts-gallery-panel__failure" role="alert">
      {{ failure }}
      <button type="button" @click="mountArtifacts">Retry</button>
    </div>
    <div v-else ref="host" class="artifacts-gallery-panel__host" />
  </section>
</template>

<style scoped>
.artifacts-gallery-panel, .artifacts-gallery-panel__host { width: 100%; height: 100%; min-width: 0; min-height: 0; }
.artifacts-gallery-panel { overflow: hidden; background: var(--p-content-background); }
.artifacts-gallery-panel__failure { display: grid; place-content: center; gap: .75rem; height: 100%; padding: 1rem; text-align: center; color: var(--p-text-muted-color); }
.artifacts-gallery-panel__failure button { justify-self: center; padding: .4rem .75rem; border-radius: var(--kx-radius-8); background: var(--p-primary-color); color: var(--p-primary-contrast-color); }
</style>

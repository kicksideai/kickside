<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import { on } from '@wippy-fe/proxy'
import { useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'
import { useComponentEvents } from '../constants.ts'
import type { ArtifactSummary } from '../types.ts'
import { useSessionsApi } from './useSessionsApi.ts'
import { artifactId, artifactWhen } from './artifactPresentation.ts'

const api = useSessionsApi()
const emit = useComponentEvents()
const artifacts = ref<ArtifactSummary[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref('')
const actionError = ref('')
const cursor = ref('')
const hasMore = ref(false)
const search = ref('')
const display = ref<'all' | 'standalone' | 'inline'>('all')
const opening = ref('')
const unsubscribe: (() => void)[] = []
let refreshTimer: ReturnType<typeof setTimeout> | null = null
let requestSequence = 0

const filtered = computed(() => {
  const query = search.value.trim().toLowerCase()
  return artifacts.value.filter((artifact) => {
    if (display.value !== 'all' && artifact.display_type !== display.value) return false
    if (!query) return true
    return [artifact.title, artifact.preview, artifact.description, artifact.content_type, artifact.kind]
      .some(value => String(value || '').toLowerCase().includes(query))
  })
})

async function load(reset = true) {
  const sequence = ++requestSequence
  const requestCursor = reset ? '' : cursor.value
  if (reset) {
    loading.value = true
    error.value = ''
  } else {
    loadingMore.value = true
  }
  try {
    const page = await api.artifacts({ limit: 48, cursor: requestCursor })
    if (sequence !== requestSequence) return
    artifacts.value = reset ? page.artifacts : [...artifacts.value, ...page.artifacts]
    cursor.value = page.nextCursor
    hasMore.value = page.hasMore
  } catch (cause) {
    if (sequence !== requestSequence) return
    error.value = (cause as Error).message
  } finally {
    if (sequence === requestSequence) {
      loading.value = false
      loadingMore.value = false
    }
  }
}

function queueRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => { void load(true) }, 150)
}

async function openArtifact(artifact: ArtifactSummary) {
  const id = artifactId(artifact)
  if (!id) return
  opening.value = id
  actionError.value = ''
  try {
    if (!artifact.session_id) throw new Error('This artifact is not linked to a session.')
    emit('artifact-select', { artifactId: id, sessionId: artifact.session_id })
  } catch (cause) {
    actionError.value = (cause as Error).message || 'Could not open artifact'
  } finally {
    opening.value = ''
  }
}

useHostVisibilityRefresh(() => load(true))
onMounted(() => {
  unsubscribe.push(on('artifact:*', queueRefresh))
  unsubscribe.push(on('session:*', queueRefresh))
})
onBeforeUnmount(() => {
  unsubscribe.forEach(stop => stop())
  requestSequence++
  if (refreshTimer) clearTimeout(refreshTimer)
})
</script>

<template>
  <div class="kx kx-artifacts-page">
    <header class="kx-head">
      <div class="kx-head-text">
        <h1 class="kx-title">Artifacts</h1>
      </div>
      <div class="kx-head-actions">
        <label class="kx-search">
          <span class="sr-only">Search artifacts</span>
          <Icon icon="tabler:search" class="kx-search-ico" aria-hidden="true" />
          <input v-model="search" class="kx-search-input" type="search" placeholder="Search artifacts" />
          <button v-if="search" class="kx-search-clear" aria-label="Clear search" @click="search = ''">
            <Icon icon="tabler:x" aria-hidden="true" />
          </button>
        </label>
        <label class="kx-select-label">
          <span class="sr-only">Artifact placement</span>
          <select v-model="display" class="kx-select">
            <option value="all">All artifacts</option>
            <option value="standalone">Standalone</option>
            <option value="inline">Inline</option>
          </select>
        </label>
        <Button type="button" severity="secondary" outlined title="Refresh" aria-label="Refresh artifacts" :loading="loading" :disabled="loading" @click="load(true)">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:refresh" :class="iconClass" aria-hidden="true" /></template>
        </Button>
      </div>
    </header>

    <div class="kx-body kx-artifacts-body">
      <div v-if="actionError" class="kx-err" role="alert">
        <Icon icon="tabler:alert-triangle" aria-hidden="true" />
        <span>{{ actionError }}</span>
        <button class="kx-err-x" aria-label="Dismiss" @click="actionError = ''"><Icon icon="tabler:x" aria-hidden="true" /></button>
      </div>

      <div v-if="loading" class="kx-loading"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading artifacts…</div>
      <div v-else-if="error" class="kx-empty">
        <div class="kx-empty-ico"><Icon icon="tabler:alert-triangle" aria-hidden="true" /></div>
        <div class="kx-empty-title">Couldn’t load artifacts</div>
        <div class="kx-empty-sub">{{ error }}</div>
        <Button type="button" label="Retry" @click="load(true)">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:refresh" :class="iconClass" aria-hidden="true" /></template>
        </Button>
      </div>
      <div v-else-if="!artifacts.length" class="kx-empty">
        <div class="kx-empty-ico"><Icon icon="tabler:binary-tree-2" aria-hidden="true" /></div>
        <div class="kx-empty-title">No artifacts yet</div>
        <div class="kx-empty-sub">Enable the Artifacts capability on an agent, then ask it to create a document, component, or rich response.</div>
      </div>
      <div v-else-if="!filtered.length" class="kx-empty">
        <div class="kx-empty-title">No matches</div>
        <div class="kx-empty-sub">No loaded artifacts match the current search and placement filter.</div>
      </div>
      <template v-else>
        <div class="kx-artifact-grid" role="list" aria-label="Artifacts">
          <article v-for="artifact in filtered" :key="artifactId(artifact)" class="kx-artifact-card" role="listitem">
            <button type="button" class="kx-artifact-open" :disabled="opening === artifactId(artifact)" @click="openArtifact(artifact)">
              <span class="kx-artifact-preview" aria-hidden="true">
                <w-artifact :id="artifactId(artifact)" />
              </span>
              <span class="kx-artifact-copy">
                <strong :title="artifact.title || 'Untitled artifact'">{{ artifact.title || 'Untitled artifact' }}</strong>
                <span class="kx-artifact-meta">
                  <span>{{ artifact.display_type || 'artifact' }}</span>
                  <span v-if="artifactWhen(artifact)">{{ artifactWhen(artifact) }}</span>
                </span>
              </span>
              <Icon v-if="opening === artifactId(artifact)" icon="tabler:loader-2" class="spin kx-artifact-open-icon" aria-hidden="true" />
              <Icon v-else icon="tabler:arrow-up-right" class="kx-artifact-open-icon" aria-hidden="true" />
            </button>
          </article>
        </div>
      </template>
      <div v-if="!loading && !error && hasMore" class="kx-more">
        <Button
          type="button"
          severity="secondary"
          outlined
          :label="loadingMore ? 'Loading…' : 'Load more'"
          :loading="loadingMore"
          :disabled="loadingMore"
          @click="load(false)">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:chevron-down" :class="iconClass" aria-hidden="true" /></template>
        </Button>
      </div>
    </div>
  </div>
</template>

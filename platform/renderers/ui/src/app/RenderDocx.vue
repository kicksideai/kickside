<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import { useProps } from '@wippy-fe/webcomponent-vue'

// High-fidelity Word viewer: fetches the original .docx bytes through the authed
// proxy and renders the actual document layout (styles, tables, images) with
// docx-preview, instead of the flattened markdown extraction.
const props = useProps<{ sourceUrl?: string }>()

const loading = ref(false)
const error = ref('')
const host = ref<HTMLElement | null>(null)

async function load() {
  error.value = ''
  const url = props.value?.sourceUrl
  const target = host.value
  if (target) target.innerHTML = ''
  if (!url || !target) return
  loading.value = true
  try {
    // Loaded lazily so docx-preview (and its JSZip dependency, whose setImmediate
    // polyfill posts empty window messages on init) only initializes when a Word
    // document is actually rendered — not on every page that registers this element.
    const { renderAsync } = await import('docx-preview')
    const { data } = await api.get(url, { responseType: 'blob' })
    await renderAsync(data as Blob, target, undefined, {
      className: 'docx',
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false,
      breakPages: true,
      experimental: true,
    })
  } catch (e: any) {
    error.value = e?.response?.data?.error || e?.message || 'could not render document'
  } finally {
    loading.value = false
  }
}

// Render once the host element exists (an immediate watch fires during setup,
// before the template ref is bound), then re-render on source change.
onMounted(load)
watch(() => props.value?.sourceUrl, load)
onBeforeUnmount(() => { if (host.value) host.value.innerHTML = '' })
</script>

<template>
  <div class="docxv">
    <div v-if="loading" class="rv-state"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /><span>Rendering document…</span></div>
    <div v-else-if="error" class="rv-state err"><Icon icon="tabler:alert-circle" aria-hidden="true" /><span>{{ error }}</span></div>
    <div ref="host" class="docxv-host" />
  </div>
</template>

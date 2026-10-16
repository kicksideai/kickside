<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import { useProps } from '@wippy-fe/webcomponent-vue'

// Renders an HTML document in a sandboxed iframe (srcdoc). The sandbox blocks
// scripts/forms/popups; allow-same-origin is kept only so the iframe height can
// be measured from its content. Source is inline (source) or fetched (source-url)
// through the authed proxy.
const props = useProps<{ source?: string; sourceUrl?: string }>()

const loading = ref(false)
const error = ref('')
const doc = ref('')
const frame = ref<HTMLIFrameElement | null>(null)
const height = ref(420)

async function load() {
  error.value = ''
  const inline = props.value?.source
  if (typeof inline === 'string' && inline.trim()) { doc.value = inline; return }
  const url = props.value?.sourceUrl
  if (!url) { doc.value = ''; return }
  loading.value = true
  try {
    const { data } = await api.get(url, { responseType: 'text' })
    doc.value = typeof data === 'string' ? data : String(data ?? '')
  } catch (e: any) {
    error.value = e?.response?.data?.error || e?.message || 'could not load document'
  } finally {
    loading.value = false
  }
}

function fit() {
  const f = frame.value
  try {
    const h = f?.contentDocument?.body?.scrollHeight
    if (h && h > 0) height.value = Math.min(h + 24, 20000)
  } catch { /* cross-origin guard */ }
}

watch(() => [props.value?.source, props.value?.sourceUrl], load, { immediate: true })
onBeforeUnmount(() => { doc.value = '' })
</script>

<template>
  <div class="htmlv">
    <div v-if="loading" class="rv-state"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /><span>Loading…</span></div>
    <div v-else-if="error" class="rv-state err"><Icon icon="tabler:alert-circle" aria-hidden="true" /><span>{{ error }}</span></div>
    <iframe
      v-else-if="doc"
      ref="frame"
      class="htmlv-frame"
      sandbox="allow-same-origin"
      :srcdoc="doc"
      :style="{ height: height + 'px' }"
      title="HTML preview"
      @load="fit"
    />
  </div>
</template>

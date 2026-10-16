<script setup lang="ts">
import { ref } from 'vue'
import { api } from '@wippy-fe/proxy'
import { useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'

interface AboutInfo {
  version?: string | null
  runtime_version: string
  notices: string
}

const info = ref<AboutInfo | null>(null)
const error = ref('')
const loading = ref(true)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/api/v1/settings/about')
    if (!data?.success) throw new Error(data?.error || 'Failed to load application information')
    info.value = data as AboutInfo
  } catch (cause) {
    info.value = null
    error.value = cause instanceof Error ? cause.message : String(cause)
  } finally {
    loading.value = false
  }
}

useHostVisibilityRefresh(load)
</script>

<template>
  <div class="ks-about">
    <header class="ks-pane-head"><div class="ks-pane-head-text"><h1>About KickSide</h1></div></header>
    <p v-if="loading" class="ks-loading">Loading…</p>
    <p v-else-if="error" role="alert" class="ks-err">{{ error }}</p>
    <template v-else-if="info">
      <dl class="ks-about-facts">
        <div><dt>KickSide version</dt><dd>{{ info.version || 'Development build' }}</dd></div>
        <div><dt>Licence</dt><dd><a href="https://wippy.ai/license" target="_blank" rel="noopener noreferrer">KickSide Community License</a></dd></div>
      </dl>
      <p class="ks-about-runtime">Runs on the Wippy runtime (MPL-2.0) <span>{{ info.runtime_version }}</span></p>
      <section aria-labelledby="third-party-notices">
        <h2 id="third-party-notices">Third-party notices</h2>
        <pre class="ks-about-notices">{{ info.notices }}</pre>
      </section>
    </template>
  </div>
</template>

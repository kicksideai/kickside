<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import { useProps } from '@wippy-fe/webcomponent-vue'

// Fetches audio as a blob through the authed proxy and plays it via an object URL.
const props = useProps<{ sourceUrl?: string }>()

const loading = ref(false)
const error = ref('')
const objectUrl = ref('')

function revoke() { if (objectUrl.value) { URL.revokeObjectURL(objectUrl.value); objectUrl.value = '' } }

async function load() {
  error.value = ''
  revoke()
  const url = props.value?.sourceUrl
  if (!url) return
  loading.value = true
  try {
    const { data } = await api.get(url, { responseType: 'blob' })
    objectUrl.value = URL.createObjectURL(data as Blob)
  } catch (e: any) {
    error.value = e?.response?.data?.error || e?.message || 'could not load audio'
  } finally {
    loading.value = false
  }
}

watch(() => props.value?.sourceUrl, load, { immediate: true })
onBeforeUnmount(revoke)
</script>

<template>
  <div class="mediav">
    <div v-if="loading" class="rv-state"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /><span>Loading audio…</span></div>
    <div v-else-if="error" class="rv-state err"><Icon icon="tabler:alert-circle" aria-hidden="true" /><span>{{ error }}</span></div>
    <audio v-else-if="objectUrl" class="mediav-audio" :src="objectUrl" controls preload="metadata" />
  </div>
</template>

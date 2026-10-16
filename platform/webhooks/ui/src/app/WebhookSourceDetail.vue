<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { host } from '@wippy-fe/proxy'
import { useProps } from '@wippy-fe/webcomponent-vue'
import WebhookSchema from './WebhookSchema.vue'
import { fetchWebhook, ingressUrl, errMsg } from '../api'
import type { WebhookRow } from '../types'

// Compact detail surface for a selected webhook, mounted by a data-flow source that
// declares it (its port entry's `detail` view). Given the picked webhook id it shows
// the public ingress URL to hand the sender plus a readable view of the payload
// schema it validates, so the user knows the URL and the shape without leaving the
// create flow. Read-only: edits live on the webhook management page.
const props = useProps<{ value?: string; config?: string }>()

function selectedId(raw: unknown): string {
  if (typeof raw !== 'string' || !raw.trim()) return ''
  const s = raw.trim()
  if (s.startsWith('{')) {
    try {
      const o = JSON.parse(s) as Record<string, unknown>
      const v = o.thread_id ?? o.webhook_id ?? o.id
      return typeof v === 'string' ? v : ''
    } catch { return '' }
  }
  return s
}

const webhookId = computed(() => selectedId(props.value?.config) || selectedId(props.value?.value))
const row = ref<WebhookRow | null>(null)
const loading = ref(false)
const error = ref('')

const url = computed(() => (webhookId.value ? ingressUrl(webhookId.value) : ''))

async function load(id: string) {
  if (!id) { row.value = null; return }
  loading.value = true
  error.value = ''
  try {
    row.value = await fetchWebhook(id)
    if (!row.value) error.value = 'Webhook not found.'
  } catch (e) {
    error.value = errMsg(e, 'could not load webhook')
  } finally {
    loading.value = false
  }
}

watch(webhookId, (id) => load(id), { immediate: true })

async function copy(text: string, what: string) {
  try {
    await navigator.clipboard.writeText(text)
    host.toast({ severity: 'success', summary: 'Copied', detail: what })
  } catch {
    host.toast({ severity: 'warn', summary: 'Copy failed', detail: 'Select and copy manually.' })
  }
}
</script>

<template>
  <section v-if="webhookId" class="wh-detail" aria-live="polite">
    <div v-if="loading" class="wh-detail-note"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading webhook…</div>
    <div v-else-if="error" class="kx-err inline">{{ error }}</div>
    <template v-else-if="row">
      <div class="kx-field">
        <span class="kx-field-lbl">Send events to</span>
        <div class="wh-token">
          <code>{{ url }}</code>
          <button type="button" class="wh-copy" title="Copy URL" aria-label="Copy URL" @click="copy(url, 'endpoint URL')"><Icon icon="tabler:copy" aria-hidden="true" /></button>
        </div>
      </div>
      <div class="kx-field">
        <span class="kx-field-lbl">Payload schema <span class="kx-field-hint-inline">— what this webhook accepts</span></span>
        <WebhookSchema :schema="row.schema || {}" />
      </div>
    </template>
  </section>
</template>

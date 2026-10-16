<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import { host } from '@wippy-fe/proxy'
import { useComponentEvents } from '../constants'
import { createWebhook, ingressUrl, errMsg } from '../api'
import WebhookSchema from './WebhookSchema.vue'
import { DEFAULT_SCHEMA, parseSchemaText, prettySchema } from './schema'
import type { MintedWebhook } from '../types'

// The webhook create form. Mounted flush (no card chrome of its own) inside the
// management modal and inside the data-flow component picker's create panel. On
// success the secret is revealed ONCE — mirroring the MCP credential-mint UX.
// `created` fires only when the user presses Done so picker hosts do not close the
// form before the one-time URL/secret panel is readable.
//
// This component hosts two ways: as the picker's web-component host, where lifecycle
// events ride the DOM event bus (useComponentEvents), and as a plain Vue modal child of
// Webhooks.vue, which listens through Vue template listeners. Both channels fire so the
// same component works in either host.
const emit = useComponentEvents()
const vueEmit = defineEmits<{ created: [payload: Record<string, unknown>]; close: [] }>()

const label = ref('')
const schemaText = ref(prettySchema(DEFAULT_SCHEMA))
const saving = ref(false)
const error = ref('')
const minted = ref<MintedWebhook | null>(null)

const url = computed(() => minted.value ? (minted.value.url || ingressUrl(minted.value.webhook_id)) : '')
const previewSchema = computed(() => (parseSchemaText(schemaText.value).schema as Record<string, unknown>) || {})
const jsonOpen = ref(false)

async function submit() {
  const parsed = parseSchemaText(schemaText.value)
  if (parsed.error) { error.value = parsed.error; return }
  saving.value = true
  error.value = ''
  try {
    const result = await createWebhook({ label: label.value.trim(), schema: parsed.schema as Record<string, unknown> })
    minted.value = result
  } catch (e) {
    error.value = errMsg(e, 'create failed')
    emit('error', { message: error.value, error: e })
  } finally {
    saving.value = false
  }
}

async function copy(text: string, what: string) {
  try {
    await navigator.clipboard.writeText(text)
    host.toast({ severity: 'success', summary: 'Copied', detail: what })
  } catch {
    host.toast({ severity: 'warn', summary: 'Copy failed', detail: 'Select and copy manually.' })
  }
}

function finish() {
  if (minted.value) {
    const id = String(minted.value.webhook_id || minted.value.thread_id || '')
    const payload = { id, thread_id: id, webhook_id: id, title: minted.value.label || label.value.trim() || 'Webhook' }
    emit('created', payload)
    vueEmit('created', payload)
  }
  emit('close', {})
  vueEmit('close')
}

function close() {
  emit('close', {})
  vueEmit('close')
}
</script>

<template>
  <form class="kx-form" @submit.prevent="submit">
    <template v-if="!minted">
      <label class="kx-field">
        <span class="kx-field-lbl">Name <span class="kx-field-hint-inline">— shown in automation trigger pickers</span></span>
        <input v-model="label" class="kx-input" type="text" placeholder="Customer events" />
      </label>

      <div class="kx-field wh-schema">
        <span class="kx-field-lbl">Payload schema <span class="kx-field-hint-inline">— the fields each inbound request must carry</span></span>
        <WebhookSchema :schema="previewSchema" />
        <div class="wh-schema-edit">
          <button type="button" class="wh-toggle" :class="jsonOpen && 'is-open'" @click="jsonOpen = !jsonOpen">
            <Icon icon="tabler:chevron-right" aria-hidden="true" /> Edit as JSON Schema
          </button>
          <textarea v-if="jsonOpen" v-model="schemaText" class="kx-input kx-textarea" spellcheck="false" data-test="wh-schema" />
        </div>
      </div>

      <div v-if="error" class="kx-err inline">{{ error }}</div>

      <div class="kx-form-foot" style="border:0; padding:4px 0 0;">
        <Button type="button" label="Cancel" severity="secondary" outlined @click="close" />
        <Button type="submit" label="Create webhook" :loading="saving" :disabled="saving" data-test="wh-create">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:plus" :class="iconClass" aria-hidden="true" /></template>
        </Button>
      </div>
    </template>

    <!-- minted secret reveal — shown once, mirrors the MCP credential-mint panel -->
    <section v-else class="wh-secret" aria-live="polite">
      <div class="wh-secret-head">
        <Icon icon="tabler:shield-check" aria-hidden="true" />
        <div>
          <h3>Webhook created</h3>
          <p>Copy the secret now — it is shown once and won't be shown again.</p>
        </div>
      </div>
      <label class="kx-field">
        <span class="kx-field-lbl">Endpoint URL</span>
        <div class="wh-token">
          <code>{{ url }}</code>
          <button type="button" class="wh-copy" title="Copy URL" aria-label="Copy URL" @click="copy(url, 'endpoint URL')"><Icon icon="tabler:copy" aria-hidden="true" /></button>
        </div>
      </label>
      <label class="kx-field">
        <span class="kx-field-lbl">Secret <span class="kx-field-hint-inline">— shown once</span></span>
        <div class="wh-token">
          <code>{{ minted.secret }}</code>
          <button type="button" class="wh-copy" title="Copy secret" aria-label="Copy secret" @click="copy(minted!.secret, 'secret')"><Icon icon="tabler:copy" aria-hidden="true" /></button>
        </div>
      </label>
      <div class="kx-form-foot" style="border:0; padding:4px 0 0;">
        <Button type="button" label="Done" @click="finish">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:check" :class="iconClass" aria-hidden="true" /></template>
        </Button>
      </div>
    </section>
  </form>
</template>

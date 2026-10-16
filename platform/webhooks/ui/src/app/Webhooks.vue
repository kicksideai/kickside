<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { host } from '@wippy-fe/proxy'
import { useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'
import { relativeTime } from '@widgets/app/datetime'
import WebhookCreate from './WebhookCreate.vue'
import WebhookSchema from './WebhookSchema.vue'
import { webhookStatusLabel } from './labels'
import { fetchWebhooks, revokeWebhook, deleteWebhook, updateWebhook, ingressUrl, errMsg } from '../api'
import { parseSchemaText, prettySchema } from './schema'
import type { WebhookRow } from '../types'

const DIALOG_PT = {
  header: { class: 'kx-dialog-header' },
  content: { class: 'kx-dialog-content' },
  footer: { class: 'kx-dialog-footer' },
}

// Webhook management: the front door of the trigger system. Every webhook minted
// here becomes a data-flow trigger source, so its name drives picker quality and
// its payload schema is the output face downstream transforms consume. Cards open
// a detail modal to hand out the inbound contract (URL + secret prefix), rename,
// and refine the schema; revoke and remove confirm through host.confirm.
const rows = ref<WebhookRow[]>([])
const loading = ref(true)
const error = ref('')
const query = ref('')

const createOpen = ref(false)

const editing = ref<WebhookRow | null>(null)
const form = ref({ label: '', schemaText: '' })
const editError = ref('')
const saving = ref(false)
const jsonOpen = ref(false)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return rows.value
  return rows.value.filter(r => (r.label || r.webhook_id).toLowerCase().includes(q))
})

// Best-effort live parse of the schema editor so the readable field list previews
// what the user is typing; falls back to the saved schema until the JSON is valid.
const previewSchema = computed(() => {
  const parsed = parseSchemaText(form.value.schemaText)
  return (parsed.schema as Record<string, unknown>) || (editing.value?.schema ?? {})
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    rows.value = await fetchWebhooks()
  } catch (e) {
    rows.value = []
    error.value = errMsg(e, 'could not load webhooks')
  } finally {
    loading.value = false
  }
}

function endpointPath(id: string): string {
  return 'POST /api/public/hooks/' + id
}
function subscriberCount(row: WebhookRow): number {
  return row.subscriber_count || 0
}

function openCreate() { createOpen.value = true }
function closeCreate() { createOpen.value = false }
async function onCreated() { createOpen.value = false; await load() }

function openEdit(row: WebhookRow) {
  editing.value = row
  form.value = { label: row.label || '', schemaText: prettySchema(row.schema || {}) }
  editError.value = ''
  jsonOpen.value = false
}
function closeEdit() { editing.value = null }

// PrimeVue Dialog is visibility-driven; the detail dialog is open whenever a row
// is being edited. Closing via scrim/Escape/× all funnel through closeEdit.
const editOpen = computed({
  get: () => editing.value !== null,
  set: (v: boolean) => { if (!v) closeEdit() },
})

async function copy(text: string, what: string) {
  try {
    await navigator.clipboard.writeText(text)
    host.toast({ severity: 'success', summary: 'Copied', detail: what })
  } catch {
    host.toast({ severity: 'warn', summary: 'Copy failed', detail: 'Select and copy manually.' })
  }
}

async function saveEdit() {
  const row = editing.value
  if (!row) return
  const parsed = parseSchemaText(form.value.schemaText)
  if (parsed.error) { editError.value = parsed.error; return }
  saving.value = true
  editError.value = ''
  try {
    await updateWebhook(row.webhook_id, { label: form.value.label.trim(), schema: parsed.schema as Record<string, unknown> })
    host.toast({ severity: 'success', summary: 'Saved', detail: form.value.label.trim() || row.webhook_id })
    closeEdit()
    await load()
  } catch (e) {
    editError.value = errMsg(e, 'save failed')
  } finally {
    saving.value = false
  }
}

async function askRevoke(row: WebhookRow) {
  const ok = await host.confirm({
    message: `Revoke “${row.label || row.webhook_id}”? The secret stops working and subscribed automations receive no further events. This can't be undone.`,
    header: 'Revoke webhook', icon: 'tabler:ban',
    acceptLabel: 'Revoke', rejectLabel: 'Cancel', acceptClass: 'p-button-danger',
  })
  if (!ok) return
  try {
    await revokeWebhook(row.webhook_id)
    host.toast({ severity: 'success', summary: 'Revoked', detail: row.label || row.webhook_id })
    if (editing.value?.webhook_id === row.webhook_id) closeEdit()
    await load()
  } catch (e) {
    error.value = errMsg(e, 'revoke failed')
    host.toast({ severity: 'error', summary: 'Revoke failed', detail: error.value })
  }
}

async function askDelete(row: WebhookRow) {
  if (subscriberCount(row) > 0) {
    host.toast({
      severity: 'warn', summary: 'In use',
      detail: `Used by ${subscriberCount(row)} automation${subscriberCount(row) === 1 ? '' : 's'}. Remove those first.`,
    })
    return
  }
  const ok = await host.confirm({
    message: `Remove “${row.label || row.webhook_id}”? This deletes the webhook and its endpoint. This can't be undone.`,
    header: 'Remove webhook', icon: 'tabler:trash',
    acceptLabel: 'Remove', rejectLabel: 'Cancel', acceptClass: 'p-button-danger',
  })
  if (!ok) return
  try {
    await deleteWebhook(row.webhook_id)
    host.toast({ severity: 'success', summary: 'Removed', detail: row.label || row.webhook_id })
    if (editing.value?.webhook_id === row.webhook_id) closeEdit()
    await load()
  } catch (e) {
    error.value = errMsg(e, 'delete failed')
    host.toast({ severity: 'error', summary: 'Remove failed', detail: error.value })
  }
}

useHostVisibilityRefresh(load)
</script>

<template>
  <div class="kx">
    <div class="kx-bar">
      <span class="kx-count">{{ rows.length }} webhook{{ rows.length !== 1 ? 's' : '' }}</span>
      <div class="kx-bar-actions">
        <div v-if="rows.length" class="kx-search">
          <Icon icon="tabler:search" class="kx-search-ico" aria-hidden="true" />
          <input v-model="query" class="kx-search-input" type="text" placeholder="Search webhooks…" aria-label="Search webhooks" />
        </div>
        <Button type="button" label="New webhook" @click="openCreate">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:plus" :class="iconClass" aria-hidden="true" /></template>
        </Button>
      </div>
    </div>

    <div v-if="error" class="kx-err">{{ error }}</div>

    <div class="kx-body">
      <div v-if="loading && !rows.length" class="kx-loading">
        <Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading webhooks…
      </div>

      <div v-else-if="!rows.length" class="kx-empty">
        <div class="kx-empty-ico"><Icon icon="tabler:webhook" aria-hidden="true" /></div>
        <div class="kx-empty-title">No webhooks yet</div>
        <div class="kx-empty-sub">A webhook gives an external service a secret URL to POST to. Each request becomes a trigger event your automations can act on.</div>
        <div class="kx-empty-actions">
          <Button type="button" label="New webhook" @click="openCreate">
            <template #icon="{ class: iconClass }"><Icon icon="tabler:plus" :class="iconClass" aria-hidden="true" /></template>
          </Button>
        </div>
      </div>

      <div v-else-if="!filtered.length" class="kx-empty">
        <div class="kx-empty-ico"><Icon icon="tabler:mood-empty" aria-hidden="true" /></div>
        <div class="kx-empty-title">No matches</div>
        <div class="kx-empty-sub">Nothing matches “{{ query }}”. Try a different term or clear the search.</div>
        <div class="kx-empty-actions">
          <Button type="button" severity="secondary" outlined label="Clear search" @click="query = ''">
            <template #icon="{ class: iconClass }"><Icon icon="tabler:x" :class="iconClass" aria-hidden="true" /></template>
          </Button>
        </div>
      </div>

      <div v-else class="kx-grid">
        <div
          v-for="row in filtered" :key="row.webhook_id"
          class="kx-card" :class="row.status === 'revoked' && 'is-revoked'"
          tabindex="0" role="button" :aria-label="`Open ${row.label || 'webhook'}`"
          @click="openEdit(row)" @keydown.enter="openEdit(row)" @keydown.space.prevent="openEdit(row)"
        >
          <div class="kx-card-head">
            <span class="kx-ficon"><Icon icon="tabler:webhook" aria-hidden="true" /></span>
            <div class="kx-card-id">
              <div class="kx-card-name" :title="row.label || 'Webhook'">{{ row.label || 'Webhook' }}</div>
              <div class="kx-card-meta">
                <span class="kx-chip kx-tag-sm" :class="row.status === 'active' ? 'is-active' : 'is-revoked'">{{ webhookStatusLabel(row.status) }}</span>
                <span v-if="subscriberCount(row) > 0" class="kx-chip kx-tag-sm is-count" :title="`Used by ${subscriberCount(row)} automation(s)`">
                  <Icon icon="tabler:plug-connected" aria-hidden="true" /> {{ subscriberCount(row) }} automation{{ subscriberCount(row) === 1 ? '' : 's' }}
                </span>
              </div>
            </div>
            <div class="kx-card-actions" @click.stop>
              <Button type="button" severity="secondary" outlined size="small" title="Open" :aria-label="`Open ${row.label || 'webhook'}`" @click="openEdit(row)">
                <template #icon="{ class: iconClass }"><Icon icon="tabler:pencil" :class="iconClass" aria-hidden="true" /></template>
              </Button>
              <Button v-if="row.status === 'active'" type="button" severity="danger" outlined size="small" title="Revoke" :aria-label="`Revoke ${row.label || 'webhook'}`" @click="askRevoke(row)">
                <template #icon="{ class: iconClass }"><Icon icon="tabler:ban" :class="iconClass" aria-hidden="true" /></template>
              </Button>
              <Button type="button" severity="danger" outlined size="small" title="Remove" :aria-label="`Remove ${row.label || 'webhook'}`" :disabled="subscriberCount(row) > 0" @click="askDelete(row)">
                <template #icon="{ class: iconClass }"><Icon icon="tabler:trash" :class="iconClass" aria-hidden="true" /></template>
              </Button>
            </div>
          </div>
          <div class="kx-card-desc" :title="endpointPath(row.webhook_id)">{{ endpointPath(row.webhook_id) }}</div>
        </div>
      </div>
    </div>

    <!-- Create: mints a new webhook and reveals its secret once. -->
    <Dialog
      v-model:visible="createOpen" modal :dismissable-mask="true"
      class="kx-dialog" :pt="DIALOG_PT" aria-label="New webhook"
    >
      <template #header>
        <span class="kx-modal-head-icon"><Icon icon="tabler:webhook" aria-hidden="true" /></span>
        <span class="kx-modal-head-text">
          <span class="kx-modal-head-title">New webhook</span>
          <span class="kx-modal-head-sub">Name it and set the payload it accepts — the secret is shown once.</span>
        </span>
      </template>
      <div class="kx-modal-body">
        <WebhookCreate @created="onCreated" @close="closeCreate" />
      </div>
    </Dialog>

    <!-- Detail / edit: the inbound contract + rename + payload schema. -->
    <Dialog
      v-model:visible="editOpen" modal
      class="kx-dialog" :pt="DIALOG_PT" aria-label="Webhook detail"
    >
      <template v-if="editing" #header>
        <span class="kx-modal-head-icon"><Icon icon="tabler:webhook" aria-hidden="true" /></span>
        <span class="kx-modal-head-text">
          <span class="kx-modal-head-title">{{ editing.label || 'Webhook' }}</span>
          <span class="kx-modal-head-sub">{{ endpointPath(editing.webhook_id) }}</span>
        </span>
        <span class="kx-chip kx-tag-sm" :class="editing.status === 'active' ? 'is-active' : 'is-revoked'">{{ webhookStatusLabel(editing.status) }}</span>
      </template>

      <template v-if="editing">
        <div class="kx-modal-body">
          <div class="kx-field">
            <span class="kx-field-lbl">Endpoint URL <span class="kx-field-hint-inline">— hand this to the sender</span></span>
            <div class="wh-token">
              <code>{{ ingressUrl(editing.webhook_id) }}</code>
              <button type="button" class="wh-copy" title="Copy URL" aria-label="Copy URL" @click="copy(ingressUrl(editing.webhook_id), 'endpoint URL')"><Icon icon="tabler:copy" aria-hidden="true" /></button>
            </div>
          </div>

          <div class="kx-field">
            <span class="kx-field-lbl">Secret</span>
            <div class="wh-token">
              <code>{{ editing.secret_prefix || 'Not available' }}<span v-if="editing.secret_prefix">…</span></code>
            </div>
            <p class="wh-note"><Icon icon="tabler:info-circle" aria-hidden="true" /><span>The full secret is shown only when a webhook is created. To rotate it, revoke this webhook and create a new one.</span></p>
          </div>

          <dl class="wh-facts">
            <template v-if="editing.created_at"><dt>Created</dt><dd>{{ relativeTime(editing.created_at) }}</dd></template>
            <template v-if="editing.last_used_at"><dt>Last received</dt><dd>{{ relativeTime(editing.last_used_at) }}</dd></template>
            <template v-if="subscriberCount(editing) > 0"><dt>Used by</dt><dd>{{ subscriberCount(editing) }} automation{{ subscriberCount(editing) === 1 ? '' : 's' }}</dd></template>
          </dl>

          <label class="kx-field">
            <span class="kx-field-lbl">Name <span class="kx-field-hint-inline">— shown in automation trigger pickers</span></span>
            <input v-model="form.label" class="kx-input" type="text" placeholder="Customer events" :disabled="editing.status === 'revoked'" data-test="wh-name" />
          </label>

          <div class="kx-field wh-schema">
            <span class="kx-field-lbl">Payload schema <span class="kx-field-hint-inline">— the fields each inbound request must carry</span></span>
            <WebhookSchema :schema="previewSchema" />
            <div class="wh-schema-edit">
              <button type="button" class="wh-toggle" :class="jsonOpen && 'is-open'" @click="jsonOpen = !jsonOpen">
                <Icon icon="tabler:chevron-right" aria-hidden="true" /> Edit as JSON Schema
              </button>
              <textarea v-if="jsonOpen" v-model="form.schemaText" class="kx-input kx-textarea" spellcheck="false" :disabled="editing.status === 'revoked'" data-test="wh-schema" />
            </div>
          </div>

          <div v-if="editError" class="kx-err inline">{{ editError }}</div>
        </div>
      </template>

      <template v-if="editing" #footer>
        <Button v-if="editing.status === 'active'" type="button" severity="danger" size="small" class="kx-foot-spacer" label="Revoke" @click="askRevoke(editing)">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:ban" :class="iconClass" aria-hidden="true" /></template>
        </Button>
        <Button type="button" label="Close" severity="secondary" outlined @click="closeEdit" />
        <Button v-if="editing.status === 'active'" type="button" label="Save changes" :loading="saving" :disabled="saving" data-test="wh-save" @click="saveEdit">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:device-floppy" :class="iconClass" aria-hidden="true" /></template>
        </Button>
      </template>
    </Dialog>
  </div>
</template>

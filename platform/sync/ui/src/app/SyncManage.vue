<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import Button from 'primevue/button'
import { api, loadByTagName } from '@wippy-fe/proxy'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import { errMsg } from '@widgets/app/errMsg'
import SyncPipeline from './SyncPipeline.vue'
import { storedSyncInput } from './syncInput'
import { useSyncForm } from './useSyncForm'

// The settings view of an installed Data Sync, mounted by the automation manager
// with its config ({ id }). It loads the sync's stored install declaration, seeds
// every stage, and saves through the reconfigure endpoint; a changed name also
// renames the automation. Source selection, cadence, transform and name change
// in place; the destination and the reconcile declaration are shown locked.

interface Props { config?: unknown; value?: unknown }
const props = useProps<Props>()
const emit = useEvents<{
  change: { id: string }
  close: Record<string, never>
  error: { message: string; error: unknown }
}>()

const SCHEMA_FORM_TAG = 'wc-schema-form'
const TRANSFORM_ASSIST_TAG = 'kickside-transform-assist'

function objectOf(raw: unknown): Record<string, unknown> | null {
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw) } catch { return null }
  }
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, unknown> : null
}

// The first of config/value carrying an id names the sync.
const automationId = computed(() => {
  for (const raw of [props.value.config, props.value.value]) {
    const id = objectOf(raw)?.id
    if (typeof id === 'string' && id.trim()) return id.trim()
  }
  return ''
})

const form = useSyncForm({ managed: true })
const loading = ref(true)
const loaded = ref(false)
const saving = ref(false)
const error = ref('')
const storedTitle = ref('')

async function load() {
  loading.value = true
  loaded.value = false
  error.value = ''
  if (!automationId.value) {
    error.value = 'No data sync was given to manage.'
    loading.value = false
    return
  }
  const catalogError = await form.loadCatalog()
  if (catalogError) {
    error.value = catalogError
    loading.value = false
    return
  }
  try {
    const { data } = await api.get<{ success?: boolean; config?: unknown; error?: string | { message?: string } }>(
      `/api/v1/automations/${encodeURIComponent(automationId.value)}/config`,
    )
    if (!data?.success) {
      const apiError = typeof data?.error === 'string' ? data.error : data?.error?.message
      throw new Error(apiError || 'could not load the data sync configuration')
    }
    const stored = storedSyncInput(data.config)
    if (!stored) throw new Error('this data sync has no stored configuration to edit')
    form.seed(stored)
    storedTitle.value = stored.title
    loaded.value = true
  } catch (e) {
    error.value = errMsg(e, 'could not load this data sync')
  } finally {
    loading.value = false
  }
}

async function save() {
  if (!loaded.value) return
  const invalid = form.validationError.value
  if (invalid) { error.value = invalid; return }
  saving.value = true
  error.value = ''
  const id = automationId.value
  try {
    const input = form.currentInput()
    const { data } = await api.put<{ success?: boolean; error?: string | { message?: string } }>(
      `/api/v1/automations/${encodeURIComponent(id)}`, { input },
    )
    if (!data?.success) {
      const apiError = typeof data?.error === 'string' ? data.error : data?.error?.message
      throw new Error(apiError || 'save failed')
    }
    if (input.title !== storedTitle.value) {
      const { data: renamed } = await api.patch<{ success?: boolean; error?: string | { message?: string } }>(
        `/api/v1/automations/${encodeURIComponent(id)}`, { title: input.title },
      )
      if (!renamed?.success) {
        const apiError = typeof renamed?.error === 'string' ? renamed.error : renamed?.error?.message
        throw new Error(apiError || 'rename failed')
      }
      storedTitle.value = input.title
    }
    emit('change', { id })
    emit('close', {})
  } catch (e) {
    const msg = errMsg(e, 'save failed')
    error.value = msg
    emit('error', { message: msg, error: e })
  } finally {
    saving.value = false
  }
}

function cancel() { emit('close', {}) }

onMounted(() => {
  loadByTagName(SCHEMA_FORM_TAG, { timeoutMs: 8000 }).catch(() => {})
  loadByTagName(TRANSFORM_ASSIST_TAG, { timeoutMs: 8000 }).catch(() => {})
  void load()
})
watch(automationId, (next, prev) => { if (next !== prev) void load() })
</script>

<template>
  <div v-if="loading" class="kx-2p-r-note">Loading this data sync…</div>

  <!-- Saving without the stored declaration would submit a partial config over a
       live sync, so the form is withheld until the declaration is in hand. -->
  <div v-else-if="!loaded" class="kx-alert" role="alert" data-test="manage-error">{{ error }}</div>

  <form v-else class="kx-flow" data-test="sync-manage" @submit.prevent="save">
    <SyncPipeline :form="form" />
    <p v-if="error" class="kx-alert" role="alert">{{ error }}</p>
    <div class="kx-actions">
      <Button type="button" label="Cancel" severity="secondary" outlined :disabled="saving" @click="cancel" />
      <Button type="submit" label="Save" data-test="sync-manage-save" :loading="saving" :disabled="saving" />
    </div>
  </form>
</template>

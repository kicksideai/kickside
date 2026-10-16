<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { loadByTagName, api } from '@wippy-fe/proxy'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import { inputPreset } from '@widgets/app/inputPreset'
import { errMsg } from '@widgets/app/errMsg'
import { useParentId } from '@widgets/app/useParentId'
import { useSubmitNonce } from '@widgets/app/useSubmitNonce'
import SyncPipeline from './SyncPipeline.vue'
import { useSyncForm } from './useSyncForm'

// Data-flow builder: installs a Source -> Transform -> Destination pipeline as a
// Data Sync. The Source stage IS the embedded <kickside-trigger-config> editor;
// this form owns Transform, Destination and the reconcile opt-in. Mounted by the
// automation manager with `type-id`; reports completion via
// `automation-installed`. An installed sync is managed in kickside-sync-manage.

const CANONICAL_TYPE = 'kickside.sync:sync'
const SCHEMA_FORM_TAG = 'wc-schema-form'
// The reusable transform-negotiation web component the Transform stage mounts;
// preloaded here alongside the schema-form tag so both are ready by the time
// either stage needs them.
const TRANSFORM_ASSIST_TAG = 'kickside-transform-assist'

// `type-id` selects the installable type; `parent-id` is the workspace folder the
// "+" popup places the automation under (absent on the automations page = root).
const props = useProps<{
  input?: string
  typeId?: string
  parentId?: string
  submitNonce?: string
  generationPolicy?: string | Record<string, unknown>
}>()
// `automation-installed` drives the automations page; `created`/`close` are the
// workspace popup contract (close it + re-list, or dismiss).
const emit = useEvents<{
  'automation-installed': { success: boolean; id?: string; error?: string }
  'submit-state': { saving: boolean }
  created: { id?: string }
  close: Record<string, never>
}>()

const form = useSyncForm({ managed: false })
const loading = ref(true)
const saving = ref(false)
// Report submit progress so the shell footer button reflects it.
watch(saving, (s) => emit('submit-state', { saving: s }))
const error = ref('')
const initializationError = ref('')
const destinationLocked = ref(false)
// The automation manager submits this form by bumping the `submit-nonce`
// attribute (a clean inbound command instead of reaching into this shadow DOM);
// each new value runs the same path a native form submit would.
useSubmitNonce(props, submit, saving)

const typeId = computed(() => props.value.typeId || CANONICAL_TYPE)
// useProps exposes host attributes camelCased (parent-id -> parentId).
const parentId = useParentId(props)
const generationPolicy = computed(() => props.value.generationPolicy)

async function submit() {
  if (loading.value || saving.value) return
  if (initializationError.value) {
    emit('automation-installed', { success: false, error: initializationError.value })
    return
  }
  const invalid = form.validationError.value
  if (invalid) { error.value = invalid; emit('automation-installed', { success: false, error: invalid }); return }
  saving.value = true
  error.value = ''
  try {
    const { data } = await api.post<{ success?: boolean; id?: string; error?: string | { message?: string } }>(
      '/api/v1/automations', { type: typeId.value, parent_id: parentId.value || undefined, input: form.currentInput() },
    )
    if (!data?.success) {
      const apiError = typeof data?.error === 'string' ? data.error : data?.error?.message
      throw new Error(apiError || 'install failed')
    }
    emit('automation-installed', { success: true, id: data.id })
    emit('created', { id: data.id })
  } catch (e) {
    const msg = errMsg(e, 'install failed')
    error.value = msg
    emit('automation-installed', { success: false, error: msg })
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      loadByTagName(SCHEMA_FORM_TAG, { timeoutMs: 8000 }),
      loadByTagName(TRANSFORM_ASSIST_TAG, { timeoutMs: 8000 }),
    ])
    const catalogError = await form.loadCatalog()
    if (catalogError) throw new Error(catalogError)
    const preset = inputPreset(props.value.input)
    if (typeof preset.sink_port === 'string') {
      if (!form.sinks.value.some(sink => sink.id === preset.sink_port)) {
        throw new Error('The selected destination is unavailable.')
      }
      form.sinkId.value = preset.sink_port
      form.sinkConfig.value = inputPreset(preset.sink_config)
      destinationLocked.value = true
    }
  } catch (e) {
    initializationError.value = errMsg(e, 'Unable to initialize the sync form.')
    error.value = initializationError.value
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading" class="kx-2p-r-note">Loading catalog…</div>

  <form v-else class="kx-flow" @submit.prevent="submit">
    <p v-if="error" class="kx-alert" role="alert">{{ error }}</p>
    <SyncPipeline :form="form" :generation-policy="generationPolicy" :destination-locked="destinationLocked" />
  </form>
</template>

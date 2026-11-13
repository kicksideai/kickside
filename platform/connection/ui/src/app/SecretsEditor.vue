<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import {api} from '@wippy-fe/proxy'
import {apiError} from '../constants'

interface SecretField {path: string[]; type: 'string'}
interface PresenceResponse {success: boolean; context_revision: number; secret_fields: SecretField[]; secrets: unknown}
interface Edit {path: string[]; set: boolean; mode: 'keep' | 'replace' | 'clear'; value: string}
const props = defineProps<{connection: {component_id: string; name?: string}}>()
const emit = defineEmits<{close: []; saved: []}>()
const rows = ref<Edit[]>([])
const revision = ref(0)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const changed = computed(() => rows.value.some(row => row.mode !== 'keep'))

function presence(value: unknown, path: string[]): boolean {
  let current = value
  for (const part of path) {
    if (!current || typeof current !== 'object' || Array.isArray(current)) throw new Error('Credential presence is unavailable')
    current = (current as Record<string, unknown>)[part]
  }
  if (!current || typeof current !== 'object' || Array.isArray(current)
    || typeof (current as Record<string, unknown>).set !== 'boolean') throw new Error('Credential presence is unavailable')
  return (current as {set: boolean}).set
}
function forget() { for (const row of rows.value) row.value = '' }
onBeforeUnmount(forget)
onMounted(async () => {
  try {
    const response = await api.get(`/api/v1/connections/${encodeURIComponent(props.connection.component_id)}`)
    const data = response.data as PresenceResponse
    if (!data.success || !Number.isInteger(data.context_revision) || !Array.isArray(data.secret_fields)) throw new Error('Credential presence is unavailable')
    rows.value = data.secret_fields.map(field => {
      if (!field || field.type !== 'string' || !Array.isArray(field.path) || !field.path.length
        || field.path.some(part => typeof part !== 'string' || !part)) throw new Error('Credential presence is unavailable')
      return {path: field.path, set: presence(data.secrets, field.path), mode: 'keep', value: ''}
    })
    revision.value = data.context_revision
  } catch (err) { error.value = apiError(err) }
  finally { loading.value = false }
})
async function save() {
  if (saving.value || !changed.value) return
  error.value = ''
  if (rows.value.some(row => row.mode === 'replace' && !row.value)) {
    error.value = 'Enter a replacement or choose Clear.'
    return
  }
  const secrets = rows.value.filter(row => row.mode !== 'keep').map(row => row.mode === 'clear'
    ? {path: row.path, clear: true as const} : {path: row.path, value: row.value})
  saving.value = true
  try {
    const {data} = await api.put(`/api/v1/connections/${encodeURIComponent(props.connection.component_id)}`, {
      secrets, expected_revision: revision.value,
    })
    if (!data?.success) throw new Error('Credential update failed')
    forget()
    emit('saved')
    emit('close')
  } catch (err) { error.value = apiError(err) }
  finally { saving.value = false }
}
</script>

<template>
  <Dialog :visible="true" modal append-to="self" :draggable="false" class="kx-modal"
    :header="`${connection.name || 'Connection'} credentials`"
    :pt="{header: {class: 'kx-modal-head'}, content: {class: 'kx-dialog-content'}, footer: {class: 'kx-modal-foot'}}"
    @update:visible="emit('close')">
    <div class="credential-editor">
      <p v-if="loading" role="status">Loading credential status…</p>
      <p v-if="error" role="alert">{{ error }}</p>
      <p v-if="!loading && !error && !rows.length">This connection has no declared credentials.</p>
      <fieldset v-for="(row, index) in rows" :key="JSON.stringify(row.path)" class="kx-field" :disabled="saving">
        <legend class="kx-field-lbl">{{ row.path.join('.') }} — {{ row.set ? 'Set' : 'Not set' }}</legend>
        <div class="credential-editor-actions">
          <label><input v-model="row.mode" type="radio" :name="`secret-${index}`" value="keep"> Keep</label>
          <label><input v-model="row.mode" type="radio" :name="`secret-${index}`" value="replace"> Replace</label>
          <label><input v-model="row.mode" type="radio" :name="`secret-${index}`" value="clear"> Clear</label>
        </div>
        <input v-if="row.mode === 'replace'" v-model="row.value" type="password" autocomplete="new-password"
          class="kx-input" :aria-label="`Replace ${row.path.join('.')}`" @keydown.enter.prevent="save">
      </fieldset>
    </div>
    <template #footer>
      <Button label="Cancel" severity="secondary" :disabled="saving" @click="emit('close')" />
      <Button data-action="save-secrets" :label="saving ? 'Saving…' : 'Save credentials'"
        :disabled="loading || saving || !changed" @click="save" />
    </template>
  </Dialog>
</template>

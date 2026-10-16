<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { PROVIDER_SPECS } from '../providerSpecs.ts'
import type { ProviderEditorProps, ProviderEditorSpec, ProviderField } from '../types.ts'
import { Avatar, Button, FormField, TextInput, Toggle } from './shared'

// Spec-driven provider-profile form. One declarative field set per provider
// (providerSpecs) renders into identity / endpoint / authentication / advanced
// sections. Secret fields never echo a stored value and are only emitted when
// the operator types one. Callers pin it with a specKey resolved from the
// provider's profile_editor_tag (EDITOR_TAGS); the same editor backs every
// declared provider_profile_editor web component.
const props = defineProps<ProviderEditorProps & { specKey: string }>()
const emit = defineEmits<{
  save: [payload: Record<string, unknown>]
  cancel: []
  test: []
}>()

const spec = computed<ProviderEditorSpec>(() => PROVIDER_SPECS[props.specKey] ?? PROVIDER_SPECS.openai_compat)
const isEdit = computed(() => props.mode === 'edit')
// Connection testing is a saved-profile operation because secrets are resolved
// server-side from encrypted profile storage or explicit *_env references.
const canTest = computed(() => isEdit.value)
const testing = computed(() => props.testState?.status === 'testing')
const visibleFields = computed(() => spec.value.fields)
const sectionOf = (f: ProviderField) => f.section ?? 'endpoint'
const endpointFields = computed(() => visibleFields.value.filter(f => sectionOf(f) === 'endpoint'))
const authFields = computed(() => visibleFields.value.filter(f => sectionOf(f) === 'auth'))
const advancedFields = computed(() => visibleFields.value.filter(f => sectionOf(f) === 'advanced'))

// Advanced is collapsed by default: onboarding only needs the credential (and a
// base URL for compatible endpoints). Everything else lives behind the toggle.
const showAdvanced = ref(false)

const form = reactive<Record<string, any>>({
  id: '',
  name: '',
  provider_id: '',
  retry_attempts: 0,
  retry_backoff_ms: 0,
  enabled: true,
})

function fieldValue(field: ProviderField, config: Record<string, any>) {
  if (field.secret) return ''
  const value = config[field.key]
  if (field.type === 'number') return Number(value || 0)
  return value || ''
}

function reset() {
  const cfg = props.profile?.config || props.preset?.config || {}
  form.id = props.profile?.id || ''
  form.name = props.profile?.name || props.preset?.title || spec.value.title
  form.provider_id = props.profile?.provider_id || props.preset?.provider_id || props.adapter?.id || spec.value.defaultProviderId
  form.retry_attempts = Number((cfg.retry as any)?.attempts || 0)
  form.retry_backoff_ms = Number((cfg.retry as any)?.backoff_ms || 0)
  form.enabled = props.profile?.enabled !== false
  for (const field of visibleFields.value) form[field.key] = fieldValue(field, cfg)
}

watch(() => [props.profile, props.preset, props.adapter, props.mode, props.specKey], reset, { immediate: true })

function appendField(payload: Record<string, unknown>, field: ProviderField) {
  const value = form[field.key]
  if (field.secret) {
    if (typeof value === 'string' && value.trim()) payload[field.key] = value
    return
  }
  if (field.type === 'number') {
    const n = Number(value)
    if (Number.isFinite(n) && n > 0) payload[field.key] = n
    return
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed) payload[field.key] = trimmed
    return
  }
  if (value !== undefined && value !== null && value !== '') payload[field.key] = value
}

function submit() {
  const payload: Record<string, unknown> = {
    id: form.id || undefined,
    name: form.name,
    provider_id: form.provider_id,
    enabled: form.enabled,
  }
  for (const field of visibleFields.value) appendField(payload, field)
  payload.retry = {
    attempts: Math.max(0, Math.floor(Number(form.retry_attempts) || 0)),
    backoff_ms: Math.max(0, Math.floor(Number(form.retry_backoff_ms) || 0)),
  }
  emit('save', payload)
}
</script>

<template>
  <form class="km-form" @submit.prevent="submit">
    <div class="km-editor-head">
      <Avatar :icon="spec.icon" />
      <div class="km-editor-head-text">
        <div class="km-editor-head-title">{{ props.preset?.title || spec.title }}</div>
        <div class="km-editor-head-sub">{{ spec.subtitle }}</div>
      </div>
    </div>

    <section class="km-form-sec">
      <div class="km-form-sec-title">Identity</div>
      <div class="km-form-grid">
        <FormField label="Name">
          <TextInput v-model="form.name" :disabled="props.saving" />
        </FormField>
      </div>
    </section>

    <section v-if="endpointFields.length" class="km-form-sec">
      <div class="km-form-sec-title">Endpoint</div>
      <div class="km-form-grid">
        <FormField v-for="field in endpointFields" :key="field.key" :label="field.label" :help="field.help">
          <TextInput
            v-model="form[field.key]"
            :type="field.type === 'number' ? 'number' : 'text'"
            :placeholder="field.placeholder"
            :disabled="props.saving"
          />
        </FormField>
      </div>
    </section>

    <section v-if="authFields.length" class="km-form-sec">
      <div class="km-form-sec-title">Authentication</div>
      <div class="km-form-grid">
        <FormField v-for="field in authFields" :key="field.key" :label="field.label" :help="field.help">
          <TextInput
            v-model="form[field.key]"
            :type="field.type === 'password' ? 'password' : 'text'"
            :placeholder="field.placeholder"
            :autocomplete="field.secret ? 'new-password' : undefined"
            :disabled="props.saving"
          />
        </FormField>
      </div>
    </section>

    <button type="button" class="km-adv-toggle" :aria-expanded="showAdvanced" @click="showAdvanced = !showAdvanced">
      <Icon :icon="showAdvanced ? 'tabler:chevron-down' : 'tabler:chevron-right'" aria-hidden="true" />
      <span>Advanced settings</span>
    </button>

    <section v-if="showAdvanced" class="km-form-sec">
      <div class="km-form-grid">
        <FormField v-if="!isEdit" label="ID" help="Optional; generated when left blank.">
          <TextInput v-model="form.id" :disabled="props.saving" placeholder="auto" />
        </FormField>
        <FormField v-for="field in advancedFields" :key="field.key" :label="field.label" :help="field.help">
          <TextInput
            v-model="form[field.key]"
            :type="field.type === 'number' ? 'number' : (field.type === 'password' ? 'password' : 'text')"
            :placeholder="field.placeholder"
            :autocomplete="field.secret ? 'new-password' : undefined"
            :disabled="props.saving"
          />
        </FormField>
        <FormField label="Retry attempts">
          <TextInput v-model="form.retry_attempts" type="number" :min="0" :disabled="props.saving" />
        </FormField>
        <FormField label="Retry backoff (ms)">
          <TextInput v-model="form.retry_backoff_ms" type="number" :min="0" :disabled="props.saving" />
        </FormField>
      </div>
    </section>

    <Toggle v-if="isEdit" v-model="form.enabled" label="Enabled" :disabled="props.saving" />

    <div
      v-if="props.testState && props.testState.status !== 'idle'"
      class="km-test-result"
      :class="props.testState.status"
    >
      <span v-if="testing" class="km-spin" aria-hidden="true" />
      <Icon
        v-else
        :icon="props.testState.status === 'ok' ? 'tabler:circle-check' : 'tabler:circle-x'"
        aria-hidden="true"
      />
      <span>{{ testing ? 'Testing connection…' : props.testState.message }}</span>
    </div>

    <div class="km-form-foot">
      <Button v-if="canTest" variant="soft" icon="tabler:plug-connected" :loading="testing" :disabled="props.saving" @click="emit('test')">
        Test connection
      </Button>
      <span class="km-form-foot-sp" />
      <Button variant="ghost" :disabled="props.saving" @click="emit('cancel')">Cancel</Button>
      <Button type="submit" icon="tabler:device-floppy" :loading="props.saving">
        {{ props.saving ? 'Saving' : 'Save provider' }}
      </Button>
    </div>
  </form>
</template>

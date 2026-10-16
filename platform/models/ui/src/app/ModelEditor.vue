<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import type { ModelCard, Profile } from '../types.ts'
import { Button, FormField, Notice, SelectField, TagInput, TextInput, Toggle } from './shared'

// Overlay editor for a single model card. The common fields stay in view; raw
// and rarely-touched settings (provider id, dimensions, priority, source, and the
// escape-hatch options JSON) live under Advanced. Capabilities and classes use
// chip token-inputs with suggestions drawn from the live catalog. The friendly
// request controls (reasoning / thinking / temperature) merge into the options
// object on save, so the raw JSON is not duplicated in the primary view.
const props = defineProps<{
  model: ModelCard | null
  profiles: Profile[]
  saving: boolean
  capabilityOptions?: string[]
  classOptions?: string[]
}>()
const emit = defineEmits<{
  (e: 'save', payload: Record<string, unknown>): void
  (e: 'cancel'): void
}>()

const localError = ref('')
const showAdvanced = ref(false)
const form = reactive({
  name: '', title: '', description: '',
  provider_id: '', provider_profile_id: '', provider_model: '',
  capabilities: [] as string[], classes: [] as string[],
  priority: 10, max_tokens: 0, output_tokens: 0, dimensions: 0,
  reasoning_model_request: false, thinking_effort: '' as string | number, temperature: '',
  options_json: '{}', source: 'overlay', enabled: true,
})

watch(() => props.model, (model) => {
  localError.value = ''
  showAdvanced.value = false
  if (!model) return
  const options = model.options ?? {}
  form.name = model.name
  form.title = model.title || model.name
  form.description = model.description || ''
  form.provider_id = model.provider_id || ''
  form.provider_profile_id = model.provider_profile_id || ''
  form.provider_model = model.provider_model || model.name
  form.capabilities = [...(model.capabilities ?? [])]
  form.classes = [...(model.class ?? [])]
  form.priority = Number(model.priority ?? 10)
  form.max_tokens = Number(model.max_tokens ?? 0)
  form.output_tokens = Number(model.output_tokens ?? 0)
  form.dimensions = Number(model.dimensions ?? 0)
  form.reasoning_model_request = options.reasoning_model_request === true
  form.thinking_effort = typeof options.thinking_effort === 'string' || typeof options.thinking_effort === 'number'
    ? options.thinking_effort
    : ''
  form.temperature = options.temperature === undefined ? '' : String(options.temperature)
  form.options_json = JSON.stringify(options, null, 2)
  form.source = model.source === 'registry' ? 'overlay' : (model.source || 'overlay')
  form.enabled = model.enabled !== false
}, { immediate: true })

const capSuggestions = computed(() => props.capabilityOptions ?? [])
const classSuggestions = computed(() => props.classOptions ?? [])

const providerProfileOptions = computed(() => [
  { label: 'Registry default', value: '' },
  ...props.profiles.map(p => ({ label: p.name, value: p.id })),
])

function submit() {
  localError.value = ''
  let options: Record<string, unknown> = {}
  try {
    options = JSON.parse(form.options_json || '{}')
  } catch {
    localError.value = 'model options JSON is invalid'
    showAdvanced.value = true
    return
  }
  if (form.reasoning_model_request) options.reasoning_model_request = true
  else delete options.reasoning_model_request
  const thinkingEffort = String(form.thinking_effort).trim()
  const numericThinkingEffort = Number(thinkingEffort)
  if (thinkingEffort === '' || (Number.isFinite(numericThinkingEffort) && numericThinkingEffort <= 0)) {
    delete options.thinking_effort
  } else {
    options.thinking_effort = Number.isFinite(numericThinkingEffort) ? numericThinkingEffort : thinkingEffort
  }
  if (form.temperature !== '') {
    const temp = Number(form.temperature)
    if (!Number.isFinite(temp) || temp < 0 || temp > 2) {
      localError.value = 'temperature must be between 0 and 2'
      return
    }
    options.temperature = temp
  } else {
    delete options.temperature
  }

  emit('save', {
    name: form.name,
    title: form.title,
    description: form.description,
    provider_id: form.provider_id,
    provider_profile_id: form.provider_profile_id || undefined,
    provider_model: form.provider_model,
    capabilities: [...form.capabilities],
    classes: [...form.classes],
    priority: Number(form.priority),
    max_tokens: Number(form.max_tokens),
    output_tokens: Number(form.output_tokens),
    dimensions: Number(form.dimensions),
    options,
    source: form.source,
    enabled: form.enabled,
  })
}
</script>

<template>
  <form class="km-form" @submit.prevent="submit">
    <Notice v-if="localError" severity="danger" @dismiss="localError = ''">{{ localError }}</Notice>

    <section class="km-form-sec">
      <div class="km-form-sec-title">Identity</div>
      <FormField label="Title"><TextInput v-model="form.title" :disabled="saving" /></FormField>
      <FormField label="Description"><TextInput v-model="form.description" :disabled="saving" /></FormField>
      <div class="km-form-id">{{ form.name }}</div>
    </section>

    <section class="km-form-sec">
      <div class="km-form-sec-title">Routing</div>
      <div class="km-form-grid">
        <FormField label="Provider profile">
          <SelectField v-model="form.provider_profile_id" :options="providerProfileOptions" aria-label="Provider profile" />
        </FormField>
        <FormField label="Provider model"><TextInput v-model="form.provider_model" :disabled="saving" /></FormField>
      </div>
    </section>

    <section class="km-form-sec">
      <div class="km-form-sec-title">Capabilities &amp; classes</div>
      <FormField label="Capabilities">
        <TagInput v-model="form.capabilities" :suggestions="capSuggestions" placeholder="Add a capability…" :disabled="saving" />
      </FormField>
      <FormField label="Classes">
        <TagInput v-model="form.classes" :suggestions="classSuggestions" placeholder="Add a class…" :disabled="saving" />
      </FormField>
    </section>

    <section class="km-form-sec">
      <div class="km-form-sec-title">Request options</div>
      <Toggle v-model="form.reasoning_model_request" label="Reasoning model" :disabled="saving" />
      <div class="km-form-grid">
        <FormField label="Thinking effort"><TextInput v-model="form.thinking_effort" :disabled="saving" /></FormField>
        <FormField label="Temperature" help="0–2; blank to leave unset."><TextInput v-model="form.temperature" type="number" :min="0" :max="2" :step="0.1" :disabled="saving" /></FormField>
      </div>
      <div class="km-form-grid">
        <FormField label="Context"><TextInput v-model="form.max_tokens" type="number" :min="0" :disabled="saving" /></FormField>
        <FormField label="Output"><TextInput v-model="form.output_tokens" type="number" :min="0" :disabled="saving" /></FormField>
      </div>
    </section>

    <section class="km-form-sec">
      <button type="button" class="km-adv-toggle" :class="{ open: showAdvanced }" @click="showAdvanced = !showAdvanced">
        <Icon icon="tabler:chevron-right" class="km-adv-chev" aria-hidden="true" />
        Advanced
      </button>
      <div v-if="showAdvanced" class="km-adv-body">
        <div class="km-form-grid">
          <FormField label="Provider id"><TextInput v-model="form.provider_id" :disabled="saving" /></FormField>
          <FormField label="Source"><TextInput v-model="form.source" :disabled="saving" /></FormField>
          <FormField label="Priority"><TextInput v-model="form.priority" type="number" :disabled="saving" /></FormField>
          <FormField label="Dimensions"><TextInput v-model="form.dimensions" type="number" :min="0" :disabled="saving" /></FormField>
        </div>
        <FormField label="Options JSON" help="Raw provider options; merged with the controls above.">
          <textarea v-model="form.options_json" class="km-input mono km-textarea" :disabled="saving" />
        </FormField>
      </div>
    </section>

    <Toggle v-model="form.enabled" label="Enabled" :disabled="saving" />

    <div class="km-form-foot">
      <Button variant="ghost" :disabled="saving" @click="emit('cancel')">Cancel</Button>
      <Button type="submit" icon="tabler:device-floppy" :loading="saving">{{ saving ? 'Saving' : 'Save model' }}</Button>
    </div>
  </form>
</template>

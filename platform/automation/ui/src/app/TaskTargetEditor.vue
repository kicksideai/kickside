<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { api } from '@wippy-fe/proxy'
import WcMount from '@widgets/app/WcMount.vue'
import PickerSelect from '@widgets/app/PickerSelect.vue'
import { parseSchema, primaryPicker, schemaFormFields, schemaHasProps, type IoSchema } from '@widgets/app/ports'
import { errMsg } from '@widgets/app/errMsg'
import { pickerMetaOf } from '../trigger-config/source-instance'
import { validateInstall } from './install-form'
import type { InputSchema } from './automation-types'

export interface TaskTarget {
  kind: 'agent' | 'workflow' | 'action'
  agent_id?: string
  prompt?: string
  flow_ref?: { kind: 'flow'; id: string; version: number }
  port?: string
  config?: Record<string, unknown>
  input?: Record<string, unknown>
}
interface Destination {
  id: string
  title?: string
  name?: string
  description?: string
  icon?: string
  group?: string
  class?: string
  provider?: string
  component?: unknown
  config_schema?: IoSchema
  input_schema?: unknown
}
const props = defineProps<{ modelValue: TaskTarget; disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [TaskTarget]; validation: [string] }>()
const destinations = ref<Destination[]>([])
const catalogError = ref('')
const loading = ref(false)
const flowSchema = ref<unknown>(null)
const flowError = ref('')
const flowLoading = ref(false)
const kind = computed(() => props.modelValue.kind)
const selected = computed(() => destinations.value.find(row => row.id === props.modelValue.port) || null)
const items = computed(() => destinations.value.map(row => ({ id: row.id, title: row.title || row.name || row.id,
  icon: row.icon, group: row.group, subtitle: row.description })))
const primary = computed(() => primaryPicker(selected.value, 'TaskTarget'))
const optionsSchema = computed(() => schemaFormFields(selected.value, 'TaskTarget'))
const pickerMeta = computed(() => pickerMetaOf(selected.value, primary.value))
const agentSchema = { properties: { agent_id: { picker: 'wc-agent-picker', title: 'Agent', required: true } } }
const agentConfig = computed(() => props.modelValue.agent_id ? { agent_id: props.modelValue.agent_id } : {})
const inputSchema = computed(() => kind.value === 'workflow' ? flowSchema.value : selected.value?.input_schema)

function update(value: Partial<TaskTarget>) { emit('update:modelValue', { ...props.modelValue, ...value }) }
function changeKind(event: Event) {
  emit('update:modelValue', { kind: (event.target as HTMLSelectElement).value as TaskTarget['kind'] })
}
const workflowSchema = { properties: { flow_ref: { picker: 'wc-workflow-picker', title: 'Published workflow', required: true } } }
const workflowConfig = computed(() => props.modelValue.flow_ref ? { flow_ref: props.modelValue.flow_ref } : {})
function onFlow(raw: unknown) {
  const reference = record(raw).flow_ref as TaskTarget['flow_ref']
  emit('update:modelValue', { kind: 'workflow', flow_ref: reference, input: {} })
}
function record(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, unknown> : {}
}
function onAgent(raw: unknown) { update({ agent_id: String(record(raw).agent_id || '') }) }
function requiredError(schema: unknown, values: Record<string, unknown>): string {
  const parsed = parseSchema(schema) as InputSchema | null
  if (!parsed) return ''
  return validateInstall({ id: '', inputs: parsed }, values)
}
const validation = computed(() => {
  const target = props.modelValue
  if (kind.value === 'agent') {
    if (!target.agent_id?.trim()) return 'Choose an agent.'
    return target.prompt?.trim() ? '' : 'Enter a prompt.'
  }
  if (kind.value === 'workflow') {
    if (flowLoading.value) return 'Loading the published workflow…'
    if (flowError.value) return flowError.value
    if (!target.flow_ref?.id || !Number.isInteger(target.flow_ref.version) || target.flow_ref.version < 1) return 'Choose a published workflow.'
    return requiredError(flowSchema.value, target.input || {})
  }
  if (loading.value) return 'Loading destinations…'
  if (catalogError.value) return catalogError.value
  if (!selected.value) return 'Choose a writable action.'
  const fields = selected.value.config_schema || {}
  const configError = requiredError({ properties: fields, required: Object.keys(fields).filter(key => fields[key].required) }, target.config || {})
  return configError || requiredError(selected.value.input_schema, target.input || {})
})
watch(validation, value => emit('validation', value), { immediate: true })
watch(kind, async (next, _previous, onCleanup) => {
  if (next !== 'action') return
  let current = true
  onCleanup(() => { current = false })
  loading.value = true; catalogError.value = ''
  try {
    const { data } = await api.get<{ sinks?: Destination[] }>('/api/v1/automations/sinks')
    if (!Array.isArray(data.sinks)) throw new Error('The destination catalog is unavailable.')
    if (current) destinations.value = data.sinks
  } catch (error) {
    if (current) catalogError.value = errMsg(error, 'Could not load destinations.')
  } finally { if (current) loading.value = false }
}, { immediate: true })
watch(() => props.modelValue.flow_ref, async (reference, _previous, onCleanup) => {
  flowLoading.value = false; flowError.value = ''
  if (!reference) return
  let current = true
  onCleanup(() => { current = false })
  flowLoading.value = true; flowError.value = ''
  try {
    const { data } = await api.get<{ success: boolean; version?: {
      version: number; interface?: { input_schema?: unknown }; input_schema?: unknown
    }; error?: unknown }>(`/api/v1/workflows/${encodeURIComponent(reference.id)}/versions/${reference.version}`)
    if (!data.success || !data.version) throw new Error(errMsg(data.error, 'Could not read the published workflow.'))
    const version = data.version
    if (version.version !== reference.version) throw new Error('The published workflow version is unavailable.')
    if (current) {
      flowSchema.value = version.interface?.input_schema ?? version.input_schema
    }
  } catch (error) { if (current) flowError.value = errMsg(error, 'Could not read the published workflow.') }
  finally { if (current) flowLoading.value = false }
}, { immediate: true })
</script>

<template>
  <div class="task-target">
    <label class="task-field">Target
      <select :value="kind" aria-label="Target kind" :disabled="disabled" @change="changeKind">
        <option value="agent">Agent prompt</option>
        <option value="workflow">Published workflow</option>
        <option value="action">Writable action</option>
      </select>
    </label>
    <template v-if="kind === 'agent'">
      <WcMount tag="wc-agent-picker" :config="agentConfig" :schema="agentSchema" @change="onAgent" />
      <label class="task-field">Prompt
        <textarea :value="modelValue.prompt || ''" aria-label="Prompt" rows="4" :disabled="disabled"
          @input="update({ prompt: ($event.target as HTMLTextAreaElement).value })" />
      </label>
    </template>
    <template v-else-if="kind === 'workflow'">
      <WcMount tag="wc-workflow-picker" :config="workflowConfig" :schema="workflowSchema" @change="onFlow" />
      <p v-if="flowError" role="alert">{{ flowError }}</p>
    </template>
    <template v-else>
      <PickerSelect :items="items" :model-value="modelValue.port || ''" :loading="loading" :error="catalogError"
        :disabled="disabled" aria-label="Writable action" placeholder="Pick a writable action…"
        @update:model-value="emit('update:modelValue', { kind: 'action', port: $event, config: {}, input: {} })" />
      <template v-if="selected">
        <p v-if="selected.description" class="task-hint">{{ selected.description }}</p>
        <WcMount :key="selected.id" :tag="primary?.tag || 'wc-schema-form'" :schema="primary?.schema || optionsSchema"
          :config="modelValue.config || {}" :meta="pickerMeta" :provider="selected.provider"
          @change="update({ config: record($event) })" />
        <WcMount v-if="primary && schemaHasProps(optionsSchema)" tag="wc-schema-form" :schema="optionsSchema" :config="modelValue.config || {}"
          @change="update({ config: record($event) })" />
      </template>
    </template>
    <div v-if="kind !== 'agent' && schemaHasProps(inputSchema)" data-test="task-target-input" class="task-field">
      <span>Input</span>
      <WcMount tag="wc-schema-form" :schema="inputSchema" :config="modelValue.input || {}" @change="update({ input: record($event) })" />
    </div>
  </div>
</template>

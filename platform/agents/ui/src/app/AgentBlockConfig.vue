<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { loadByTagName } from '@wippy-fe/proxy'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import RadioButton from 'primevue/radiobutton'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import MultiSelectField from '@widgets/app/MultiSelectField.vue'
import type { AgentBlockConfigValue } from '../agent_block_config'

type AgentBlockProps = { config?: AgentBlockConfigValue | null }
type AgentBlockEvents = { 'config-changed': AgentBlockConfigValue }

const props = useProps<AgentBlockProps>()
const emit = useEvents<AgentBlockEvents>()

type Mode = 'existing' | 'inline'
const initialConfig = props.value.config
const mode = ref<Mode>(initialConfig?.agent_id ? 'existing' : 'inline')
const current = ref<AgentBlockConfigValue>({ ...(initialConfig || {}) })
const exitSchemaText = ref(initialConfig?.exit_schema ? JSON.stringify(initialConfig.exit_schema, null, 2) : '')
const contextText = ref(initialConfig?.context ? JSON.stringify(initialConfig.context, null, 2) : '')
const exitSchemaError = ref('')
const contextError = ref('')
const pickerReady = ref(false)
const pickerError = ref('')
const toolCallingOptions = [
  { label: 'Auto', value: 'auto' },
  { label: 'Require a tool', value: 'any' },
  { label: 'No tools', value: 'none' },
] satisfies Array<{ label: string; value: NonNullable<AgentBlockConfigValue['tool_calling']> }>

watch(() => props.value.config, value => {
  current.value = { ...(value || {}) }
  mode.value = current.value.agent_id ? 'existing' : 'inline'
  exitSchemaText.value = current.value.exit_schema ? JSON.stringify(current.value.exit_schema, null, 2) : ''
  contextText.value = current.value.context ? JSON.stringify(current.value.context, null, 2) : ''
})

const pickerValue = computed(() => JSON.stringify({ agent_id: current.value.agent_id || '' }))

function publish() {
  const next: AgentBlockConfigValue = { ...current.value }
  if (mode.value === 'existing') delete next.instructions
  else delete next.agent_id
  for (const key of Object.keys(next) as (keyof AgentBlockConfigValue)[]) {
    const value = next[key]
    if (value === '' || value == null || (Array.isArray(value) && value.length === 0)) delete next[key]
  }
  current.value = next
  emit('config-changed', next)
}

function selectMode(next: Mode) {
  mode.value = next
  if (next === 'existing') delete current.value.instructions
  else delete current.value.agent_id
  publish()
}

function onAgentChange(event: Event) {
  const detail = (event as CustomEvent).detail as { agent_id?: string; selected?: string[] } | undefined
  current.value.agent_id = detail?.agent_id || detail?.selected?.[0] || ''
  publish()
}

function setText(key: 'instructions' | 'name' | 'model', value: string | undefined) {
  current.value[key] = value || ''
  publish()
}

function setToolCalling(value: AgentBlockConfigValue['tool_calling']) {
  current.value.tool_calling = value
  if (current.value.tool_calling === 'none') {
    delete current.value.tools
    delete current.value.exit_schema
    exitSchemaText.value = ''
    exitSchemaError.value = ''
  }
  publish()
}

function setTools(ids: string[]) {
  current.value.tools = [...ids]
  publish()
}

function setObject(key: 'exit_schema' | 'context', raw: string | undefined) {
  raw ||= ''
  if (key === 'exit_schema') exitSchemaText.value = raw
  else contextText.value = raw
  const error = key === 'exit_schema' ? exitSchemaError : contextError
  if (!raw.trim()) {
    delete current.value[key]
    error.value = ''
    publish()
    return
  }
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Enter a JSON object.')
    if (key === 'exit_schema' && parsed.type !== 'object') throw new Error('Output shape must declare type: object.')
    if (key === 'exit_schema' && current.value.tool_calling === 'none') throw new Error('Output shape requires tool calling.')
    current.value[key] = parsed
    error.value = ''
    publish()
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : 'Enter a JSON object.'
  }
}

onMounted(async () => {
  pickerReady.value = false
  pickerError.value = ''
  try {
    await loadByTagName('wc-agent-picker', { timeoutMs: 8000 })
    pickerReady.value = true
  } catch {
    pickerError.value = 'Couldn’t load the Agent picker. Switch to inline instructions or try again.'
  }
})
</script>

<template>
  <div class="kx-agent-block">
    <fieldset class="kx-agent-block__modes">
      <legend>Agent source</legend>
      <label for="agent-source-existing"><RadioButton input-id="agent-source-existing" v-model="mode" name="agent-source" value="existing" @change="selectMode('existing')" /> Existing agent</label>
      <label for="agent-source-inline"><RadioButton input-id="agent-source-inline" v-model="mode" name="agent-source" value="inline" @change="selectMode('inline')" /> Inline instructions</label>
    </fieldset>

    <div v-if="mode === 'existing'" class="kx-agent-block__field">
      <span>Agent</span>
      <Message v-if="pickerError" severity="error" size="small" :closable="false">{{ pickerError }}</Message>
      <div v-else-if="!pickerReady" class="kx-agent-block__loading" role="status">
        <ProgressSpinner class="kx-agent-block__spinner" stroke-width="4" aria-label="Loading Agent picker" />
        <span>Loading Agent picker…</span>
      </div>
      <wc-agent-picker v-else :value="pickerValue" @change="onAgentChange"></wc-agent-picker>
      <small v-if="pickerReady">Select one exact installed Agent.</small>
    </div>
    <label v-else class="kx-agent-block__field">
      <span>Instructions</span>
      <Textarea class="kx-agent-block__control" :model-value="current.instructions || ''" rows="5" placeholder="What should this step do?" @update:model-value="setText('instructions', $event)" />
      <small>The upstream Block output is provided as this Agent’s input.</small>
    </label>

    <label class="kx-agent-block__field"><span>Name</span><InputText class="kx-agent-block__control" :model-value="current.name || ''" placeholder="Agent step" @update:model-value="setText('name', $event)" /></label>
    <label class="kx-agent-block__field"><span>Model or class</span><InputText class="kx-agent-block__control" :model-value="current.model || ''" placeholder="Use the Agent or system default" @update:model-value="setText('model', $event)" /></label>
    <label class="kx-agent-block__field"><span>Tool calling</span><Select class="kx-agent-block__control" :model-value="current.tool_calling || 'auto'" :options="toolCallingOptions" option-label="label" option-value="value" @update:model-value="setToolCalling" /></label>
    <div v-if="current.tool_calling !== 'none'" class="kx-agent-block__field"><span>Tools</span><MultiSelectField source="/api/v1/agents/tools" response-key="tools" label-key="title" desc-key="llm_description" meta-key="llm_alias" icon-key="icon" placeholder="Search tools to add…" :selected="current.tools || []" @change="setTools" /><small>Select exact installed tools.</small></div>
    <label class="kx-agent-block__field"><span>Output shape</span><Textarea class="kx-agent-block__control" :model-value="exitSchemaText" rows="4" placeholder="JSON Schema object" :invalid="!!exitSchemaError" @update:model-value="setObject('exit_schema', $event)" /><Message v-if="exitSchemaError" severity="error" size="small" :closable="false">{{ exitSchemaError }}</Message></label>
    <label class="kx-agent-block__field"><span>Context</span><Textarea class="kx-agent-block__control" :model-value="contextText" rows="3" placeholder="JSON object" :invalid="!!contextError" @update:model-value="setObject('context', $event)" /><Message v-if="contextError" severity="error" size="small" :closable="false">{{ contextError }}</Message></label>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import MultiSelectField from '@widgets/app/MultiSelectField.vue'
import { parseSelectedId, parseSelectedIds } from '@widgets/app/pickerValue'
import { parseSchema } from '@widgets/app/ports'

interface AgentPickerProps {
  selected?: string | string[]
  multi?: boolean
  placeholder?: string
  config?: string
  schema?: string
}
interface AgentPickerEvents {
  change: { selected: string[]; labels?: string[] } | Record<string, string>
}

const props = useProps<AgentPickerProps>()
const emit = useEvents<AgentPickerEvents>()

// Config hosts pass the current object and the primary field's schema as JSON.
const configMode = computed(() => {
  const config = props.value?.config
  return typeof config === 'string' && config.trim() !== ''
})
const configKey = computed(() => Object.keys(parseSchema(props.value?.schema)?.properties || {})[0] || 'agent_id')
const selected = computed(() => {
  if (!configMode.value) return parseSelectedIds(props.value?.selected)
  const id = parseSelectedId(props.value?.config, configKey.value)
  return id ? [id] : []
})
const multi = computed(() => (configMode.value ? false : props.value?.multi !== false))
const placeholder = computed(() => props.value?.placeholder || 'Search agents…')

function onChange(ids: string[], labels?: string[]) {
  if (configMode.value) {
    emit('change', { [configKey.value]: ids[0] || '' })
    return
  }
  emit('change', { selected: ids, labels })
}
</script>

<template>
  <MultiSelectField
    source="/api/v1/agents/list"
    response-key="agents"
    id-key="name"
    label-key="title"
    desc-key="comment"
    icon-key="icon"
    :multi="multi"
    :placeholder="placeholder"
    :selected="selected"
    @change="onChange"
  />
</template>

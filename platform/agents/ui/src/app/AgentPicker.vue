<script setup lang="ts">
import { computed } from 'vue'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import MultiSelectField from '@widgets/app/MultiSelectField.vue'

// Canonical agent picker, declared by the agents module as <wc-agent-picker>.
// Binds the shared multi-select to /api/v1/agents/list with the agent field
// mapping, so any surface selects agents by their canonical ref ("user_agent:<id>"
// or a registry id) without repeating the endpoint or key wiring. Contract mirrors
// wc-multiselect: `selected` in (JSON array, csv, or single id), `change` out with
// detail.selected as a string[] (single-select emits 0 or 1).
//
// Config hosts (WcMount mounting a schema-declared `picker: wc-agent-picker` field)
// drive it through `value` instead: a JSON object string whose agent_id names the
// selection, or a bare agent ref. A present value attribute switches the picker to
// single-select and the change detail additionally carries agent_id, so the host
// stores it under the schema field key.
interface AgentPickerProps {
  selected?: string | string[]
  multi?: boolean
  placeholder?: string
  value?: string
}
interface AgentPickerEvents {
  change: { selected: string[]; labels?: string[]; agent_id?: string }
}

const props = useProps<AgentPickerProps>()
const emit = useEvents<AgentPickerEvents>()

function toIds(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).filter(Boolean)
  if (typeof v === 'string') {
    const s = v.trim()
    if (!s) return []
    if (s.startsWith('[')) {
      try {
        const arr = JSON.parse(s)
        if (Array.isArray(arr)) return arr.map(String).filter(Boolean)
      } catch { /* fall through to csv */ }
    }
    return s.split(',').map(x => x.trim()).filter(Boolean)
  }
  return []
}

// The agent ref named by the config-host `value` attribute: a JSON object's agent_id,
// or the raw string as a bare ref. Empty when the attribute is absent/blank.
function valueAgentId(v: unknown): string {
  if (typeof v !== 'string') return ''
  const s = v.trim()
  if (!s) return ''
  if (s.startsWith('{')) {
    try {
      const o = JSON.parse(s)
      if (o && typeof o === 'object' && typeof o.agent_id === 'string') return o.agent_id
      return ''
    } catch { return '' }
  }
  if (s.startsWith('[')) return ''
  return s
}

const configMode = computed(() => {
  const v = props.value?.value
  return typeof v === 'string' && v.trim() !== ''
})
const configAgentId = computed(() => valueAgentId(props.value?.value))
const selected = computed(() => {
  const explicit = toIds(props.value?.selected)
  if (explicit.length) return explicit
  return configAgentId.value ? [configAgentId.value] : []
})
const multi = computed(() => (configMode.value ? false : props.value?.multi !== false))
const placeholder = computed(() => props.value?.placeholder || 'Search agents…')

function onChange(ids: string[], labels?: string[]) {
  if (configMode.value) {
    emit('change', { selected: ids, labels, agent_id: ids[0] || '' })
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

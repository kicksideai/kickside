<script setup lang="ts">
import { computed } from 'vue'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import MultiSelectField from '@widgets/app/MultiSelectField.vue'

// KB picker serves both trait contexts (many `kb_ids`) and the embed sink's
// declared destination field (one `kb_id`). The host supplies the latter's
// field schema, which is the ownership contract for the persisted key.
interface PickerSchema { properties?: Record<string, unknown> }
interface PickerConfig { kb_id?: string; kb_ids?: string[] }
interface PickerProps { config?: PickerConfig | string[] | null; schema?: PickerSchema | null }
interface PickerEvents { 'config-changed': { kb_id: string } | { kb_ids: string[] } }
const props = useProps<PickerProps>()
const emit = useEvents<PickerEvents>()

const single = computed(() => !!props.value.schema?.properties?.kb_id)

function readIds(cfg: PickerProps['config'], singleValue: boolean): string[] {
  if (Array.isArray(cfg)) return [...cfg]
  if (singleValue && cfg && typeof cfg.kb_id === 'string' && cfg.kb_id) return [cfg.kb_id]
  if (cfg && Array.isArray(cfg.kb_ids)) return [...cfg.kb_ids]
  return []
}

const selected = computed(() => readIds(props.value.config, single.value))

function report(ids: string[]) {
  if (single.value) emit('config-changed', { kb_id: ids[0] || '' })
  else emit('config-changed', { kb_ids: ids })
}
</script>

<template>
  <div class="kp">
    <MultiSelectField
      source="/api/v1/knowledge/list"
      id-key="id"
      label-key="name"
      desc-key="description"
      icon-key="icon"
      meta-key="kb_type"
      placeholder="Search knowledge bases…"
      :multi="!single"
      :selected="selected"
      @change="report"
    />
    <p class="kp-hint">{{ single ? 'Choose the knowledge base that receives this content.' : 'The agent\'s read/write tools are scoped to the selected knowledge bases. With none selected, the agent may pick a base per call.' }}</p>
  </div>
</template>

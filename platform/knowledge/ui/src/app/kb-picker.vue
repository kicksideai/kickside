<script setup lang="ts">
import { computed } from 'vue'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import MultiSelectField from '@widgets/app/MultiSelectField.vue'

// KB picker — the Knowledge trait's config web component (kb_reader / kb_writer),
// mounted in the agent editor when the trait is enabled. The host passes the trait
// context as `config` ({ kb_ids }) and this reports the chosen bases via the
// `config-changed` event the agent form folds into trait_contexts. It is a thin
// binding of the shared MultiSelectField to the KB list endpoint; the widget does
// the chip/typeahead work and scales to large catalogs.
interface PickerProps { config?: { kb_ids?: string[] } | string[] | null }
interface PickerEvents { 'config-changed': { kb_ids: string[] } }
const props = useProps<PickerProps>()
const emit = useEvents<PickerEvents>()

function readIds(cfg: PickerProps['config']): string[] {
  if (Array.isArray(cfg)) return [...cfg]
  if (cfg && Array.isArray(cfg.kb_ids)) return [...cfg.kb_ids]
  return []
}

const selected = computed(() => readIds(props.value.config))
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
      :selected="selected"
      @change="(ids: string[]) => emit('config-changed', { kb_ids: ids })"
    />
    <p class="kp-hint">The agent's read/write tools are scoped to the selected knowledge bases. With none selected, the agent may pick a base per call.</p>
  </div>
</template>

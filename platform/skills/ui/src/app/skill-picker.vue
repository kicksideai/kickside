<script setup lang="ts">
import { computed } from 'vue'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import type { PickerProps, PickerEvents } from '../picker-types.ts'
import MultiSelectField from '@widgets/app/MultiSelectField.vue'

// Skill picker — the Skills trait's config web component, mounted in the agent
// editor when the trait is enabled. The host passes the trait context as `config`
// ({ skill_ids }) and this reports the pinned skills via the `config-changed`
// event the agent form folds into trait_contexts. It is a thin binding of the
// shared MultiSelectField to the skills list endpoint; the widget does the
// chip/typeahead work and scales to large catalogs.
const props = useProps<PickerProps>()
const emit = useEvents<PickerEvents>()

function readIds(cfg: PickerProps['config']): string[] {
  if (Array.isArray(cfg)) return [...cfg]
  if (cfg && Array.isArray(cfg.skill_ids)) return [...cfg.skill_ids]
  return []
}

const selected = computed(() => readIds(props.value.config))
</script>

<template>
  <div class="sp">
    <MultiSelectField
      source="/api/v1/skills"
      response-key="skills"
      id-key="skill_id"
      label-key="name"
      desc-key="description"
      icon-key="icon"
      placeholder="Search skills to pin…"
      :selected="selected"
      @change="(ids: string[]) => emit('config-changed', { skill_ids: ids })"
    />
    <p class="sp-hint">Pinned skills are loaded into the agent's prompt automatically. It can still discover and load others on demand.</p>
  </div>
</template>

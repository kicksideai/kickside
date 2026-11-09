<script setup lang="ts">
import { computed, ref } from 'vue'
import Checkbox from 'primevue/checkbox'
import type { Tool } from './agent-form.types'

const props = defineProps<{
  tools: Tool[]
  selected: string[]
}>()
const emit = defineEmits<{
  change: [ids: string[]]
}>()
const query = ref('')
const term = computed(() => query.value.trim().toLowerCase())
function matches(tool: Tool): boolean {
  return [tool.id, tool.title, tool.llm_alias, tool.llm_description].some(value => value?.toLowerCase().includes(term.value))
}
const filteredTools = computed(() => props.tools.filter(matches))
function select(id: string, checked: boolean) {
  emit('change', checked ? [...props.selected, id] : props.selected.filter(selected => selected !== id))
}
</script>

<template>
  <section class="tool-reference" aria-label="Tool reference">
    <label class="kx-field">
      <span class="kx-field-lbl">Search tools</span>
      <input v-model="query" class="kx-input" type="search" aria-label="Search tool reference" placeholder="Search names, descriptions or aliases…" />
    </label>
    <p class="kx-sec-foot">Descriptions below come from the installed tools.</p>
    <ul class="tool-reference__list">
      <li v-for="tool in filteredTools" :key="tool.id" :data-tool-id="tool.id" class="tool-reference__item">
        <div class="tool-reference__title">
          <Checkbox :model-value="selected.includes(tool.id)" binary :aria-label="`Select ${tool.title || tool.id}`" @update:model-value="select(tool.id, $event === true)" />
          <strong>{{ tool.title || tool.id }}</strong>
          <code v-if="tool.llm_alias">{{ tool.llm_alias }}</code>
        </div>
        <p class="tool-reference__description">{{ tool.llm_description || 'No description declared.' }}</p>
        <details v-if="tool.input_schema">
          <summary>Declared inputs</summary>
          <pre>{{ JSON.stringify(tool.input_schema, null, 2) }}</pre>
        </details>
      </li>
    </ul>
    <p v-if="!filteredTools.length" class="kx-sec-foot">No matching tools.</p>
  </section>
</template>

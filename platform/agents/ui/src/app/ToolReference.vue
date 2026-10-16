<script setup lang="ts">
import { computed, ref } from 'vue'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import type { Tool, Trait } from './agent-form.types'

const props = defineProps<{
  tools: Tool[]
  traits: Trait[]
  selected: string[]
  activeTraits: string[]
  selectableIds?: string[]
}>()
const emit = defineEmits<{
  change: [ids: string[]]
  addCapability: [id: string]
}>()
const query = ref('')
const term = computed(() => query.value.trim().toLowerCase())
function matches(tool: Tool): boolean {
  return [tool.id, tool.title, tool.llm_alias, tool.llm_description].some(value => value?.toLowerCase().includes(term.value))
}
const filteredTools = computed(() => props.tools.filter(matches))
const selectableIds = computed(() => new Set(props.selectableIds ?? props.traits.map(trait => trait.id)))
interface DeclaredTool { id: string; tool?: Tool }
function declaredTools(trait: Trait): DeclaredTool[] {
  const resolved = new Map<string, DeclaredTool>()
  for (const declaration of trait.tools || []) {
    const pattern = new RegExp('^' + declaration.split('*')
      .map(part => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$')
    const matches = props.tools.filter(tool => pattern.test(tool.id))
    if (!matches.length) resolved.set(declaration, { id: declaration })
    for (const tool of matches) resolved.set(tool.id, { id: tool.id, tool })
  }
  return [...resolved.values()]
}
const combinations = computed(() => props.traits
  .filter(trait => trait.tools?.length)
  .map(trait => ({ trait, tools: declaredTools(trait) }))
  .filter(({ trait, tools }) => !term.value
    || [trait.id, trait.title, trait.description, trait.prompt].some(value => value?.toLowerCase().includes(term.value))
    || tools.some(({ id, tool }) => tool ? matches(tool) : id.toLowerCase().includes(term.value))))

function select(id: string, checked: boolean) {
  emit('change', checked ? [...props.selected, id] : props.selected.filter(selected => selected !== id))
}
</script>

<template>
  <section class="tool-reference" aria-label="Tool reference">
    <label class="kx-field">
      <span class="kx-field-lbl">Search tools and combinations</span>
      <input v-model="query" class="kx-input" type="search" aria-label="Search tool reference" placeholder="Search names, descriptions or aliases…" />
    </label>
    <p class="kx-sec-foot">Descriptions and guidance below come from the installed tools and capabilities.</p>
    <h3 class="kx-group-title">Tools</h3>
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
    <section aria-label="Tool combinations">
      <h3 class="kx-group-title">Tool combinations</h3>
      <p class="kx-sec-foot">Adding a capability includes its declared tools automatically.</p>
      <details v-for="{ trait, tools: declared } in combinations" :key="trait.id" :data-trait-id="trait.id" class="tool-reference__item">
        <summary>{{ trait.title || trait.id }}</summary>
        <p v-if="trait.description" class="tool-reference__description">{{ trait.description }}</p>
        <p v-if="trait.prompt" class="tool-reference__description">{{ trait.prompt }}</p>
        <ul class="tool-reference__list">
          <li v-for="{ id, tool } in declared" :key="id">
            <strong>{{ tool?.title || id }}</strong>
            <p class="tool-reference__description">{{ tool?.llm_description || (tool ? 'No description declared.' : 'This tool is not in the available catalog.') }}</p>
          </li>
        </ul>
        <Button :label="activeTraits.includes(trait.id) ? 'Capability added' : selectableIds.has(trait.id) ? 'Add capability' : 'Managed in agent settings'"
          :disabled="activeTraits.includes(trait.id) || !selectableIds.has(trait.id)" severity="secondary" outlined @click="emit('addCapability', trait.id)" />
      </details>
      <p v-if="!combinations.length" class="kx-sec-foot">No matching declared tool combinations.</p>
    </section>
  </section>
</template>

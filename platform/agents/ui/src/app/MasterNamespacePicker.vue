<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import CapabilityPicker from './CapabilityPicker.vue'
import type { Tool, Trait } from './agent-form.types'
import { loadToolCatalog } from './toolCatalog'
import AnchoredPanel from '@widgets/app/AnchoredPanel.vue'

interface Config {
  namespaces?: string[]
  trait_ids?: string[]
  inject_trait_catalog?: boolean
}
interface Ns { id: string; label: string; kind: string }

const props = useProps<{ config?: Config | string[] | null; schema?: Trait['context_schema'] }>()
const emit = useEvents<{ 'config-changed': Config }>()
function supports(field: keyof Config): boolean {
  return !props.value.schema || Object.prototype.hasOwnProperty.call(props.value.schema.properties || {}, field)
}

function list(v: any): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x !== '') : []
}
function read(cfg: Config | string[] | null | undefined): Config {
  if (Array.isArray(cfg)) return { namespaces: list(cfg), trait_ids: [], inject_trait_catalog: false }
  return {
    namespaces: list(cfg?.namespaces),
    trait_ids: list(cfg?.trait_ids),
    inject_trait_catalog: cfg?.inject_trait_catalog === true,
  }
}

const current = read(props.value.config)
const namespaces = ref<string[]>(current.namespaces || [])
const traitIds = ref<string[]>(current.trait_ids || [])
const injectTraitCatalog = ref(!!current.inject_trait_catalog)
const options = ref<Ns[]>([])
const traits = ref<Trait[]>([])
const tools = ref<Tool[]>([])
const nsOpen = ref(false)
const nsAnchorEl = ref<HTMLElement | null>(null)

watch(() => props.value.config, (c) => {
  const next = read(c)
  namespaces.value = next.namespaces || []
  traitIds.value = next.trait_ids || []
  injectTraitCatalog.value = !!next.inject_trait_catalog
})

onMounted(async () => {
  const [scopeResponse, traitResponse, catalog] = await Promise.all([
    api.get('/api/v1/agents/namespaces'),
    api.get('/api/v1/agents/traits'),
    loadToolCatalog(),
  ])
  options.value = scopeResponse.data.namespaces
  traits.value = traitResponse.data.traits
  tools.value = catalog
})

const KIND_LABEL: Record<string, string> = { agent: 'Agents', trait: 'Capabilities' }
const groups = computed(() =>
  ['agent', 'trait']
    .map(k => ({ kind: k, label: KIND_LABEL[k] || k, items: options.value.filter(o => o.kind === k) }))
    .filter(g => g.items.length)
)

function namespaceOf(id: string): string {
  const i = id.lastIndexOf(':')
  return i > 0 ? id.slice(0, i) : ''
}
function namespaceAllows(id: string): boolean {
  if (!namespaces.value.length || namespaces.value.includes('*')) return true
  const ns = namespaceOf(id)
  if (!ns) return false
  return namespaces.value.some(n => ns === n || ns.startsWith(`${n}.`))
}
const visibleTraits = computed(() => [
  ...traits.value.filter(trait => namespaceAllows(trait.id) || traitIds.value.includes(trait.id)),
  ...traitIds.value.filter(id => !traits.value.some(trait => trait.id === id)).map(id => ({ id })),
])

const labelOfNs = (id: string) => options.value.find(o => o.id === id)?.label || id
const nsHas = (id: string) => namespaces.value.includes(id)

function publish() {
  emit('config-changed', {
    ...(supports('namespaces') ? { namespaces: [...namespaces.value] } : {}),
    ...(supports('trait_ids') ? { trait_ids: [...traitIds.value] } : {}),
    ...(supports('inject_trait_catalog') ? { inject_trait_catalog: injectTraitCatalog.value } : {}),
  })
}
function toggleNs(id: string) {
  const i = namespaces.value.indexOf(id)
  if (i >= 0) namespaces.value.splice(i, 1)
  else namespaces.value.push(id)
  publish()
}
function setTraits(ids: string[]) {
  traitIds.value = ids
  publish()
}
function removeNs(i: number) { namespaces.value.splice(i, 1); publish() }
function toggleCatalog() { injectTraitCatalog.value = !injectTraitCatalog.value; publish() }
</script>

<template>
  <div class="kx-ns">
    <label v-if="supports('inject_trait_catalog')" class="kx-ns-toggle">
      <input class="kx-ns-switch-input" type="checkbox" :checked="injectTraitCatalog" @change="toggleCatalog" />
      <span class="kx-ns-switch" aria-hidden="true"></span>
      <span>Show available capabilities in the prompt</span>
    </label>

    <div v-if="supports('namespaces')" class="kx-ns-section">
      <div class="kx-ns-label">Limit which packages it can use</div>
      <div class="kx-ns-chips">
        <span v-for="(ns, i) in namespaces" :key="ns" class="kx-ns-chip">
          {{ labelOfNs(ns) }}
          <button type="button" class="kx-ns-x" :aria-label="`Remove ${labelOfNs(ns)} package limit`" @click="removeNs(i)"><Icon icon="tabler:x" aria-hidden="true" /></button>
        </span>
        <span v-if="namespaces.length === 0" class="kx-ns-empty">All packages</span>
      </div>

      <div class="kx-ns-add">
        <button ref="nsAnchorEl" type="button" class="kx-ns-btn" aria-haspopup="listbox" :aria-expanded="nsOpen" @click="nsOpen = !nsOpen">
          <Icon icon="tabler:plus" aria-hidden="true" />
          <span>Choose packages</span>
          <Icon icon="tabler:chevron-down" class="kx-ns-caret" aria-hidden="true" />
        </button>
        <AnchoredPanel v-model:open="nsOpen" :anchor="nsAnchorEl" :min-width="240">
          <div class="kx-ns-menu" role="listbox">
            <template v-for="g in groups" :key="g.kind">
              <div class="kx-ns-group">{{ g.label }}</div>
              <button
                v-for="o in g.items"
                :key="o.id"
                type="button"
                class="kx-ns-opt"
                :class="nsHas(o.id) && 'kx-ns-opt-on'"
                role="option"
                :aria-selected="nsHas(o.id)"
                @click="toggleNs(o.id)"
              >
                <Icon :icon="nsHas(o.id) ? 'tabler:square-check-filled' : 'tabler:square'" class="kx-ns-check" aria-hidden="true" />
                <span class="kx-ns-opt-label">{{ o.label }}</span>
              </button>
            </template>
            <div v-if="!groups.length" class="kx-ns-menu-empty">No packages available.</div>
          </div>
        </AnchoredPanel>
      </div>
    </div>

    <CapabilityPicker v-if="supports('trait_ids')" :traits="visibleTraits" :tools="tools" :selected="traitIds"
      label="Limit which capabilities it can turn on" empty-message="All available capabilities are allowed."
      @change="setTraits" />
    <p v-if="supports('trait_ids')" class="kx-ns-hint">Leave the limits empty to allow all available capabilities.</p>
  </div>
</template>

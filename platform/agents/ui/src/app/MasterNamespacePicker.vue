<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import AnchoredPanel from '@widgets/app/AnchoredPanel.vue'

// Config editor for master capabilities. The same component backs Capability
// Manager and Agent Roster. Curator-specific options are harmless for Roster and ignored by
// its runtime.

interface Config {
  namespaces?: string[]
  trait_ids?: string[]
  inject_trait_catalog?: boolean
}
interface Ns { id: string; label: string; kind: string }
interface Trait { id: string; title?: string; description?: string; icon?: string; web_component?: string; provider?: string }

const props = defineProps<{ config?: Config | string[] | null }>()
const emit = defineEmits<{ (e: 'config-changed', value: Config): void }>()

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

const current = read(props.config)
const namespaces = ref<string[]>(current.namespaces || [])
const traitIds = ref<string[]>(current.trait_ids || [])
const injectTraitCatalog = ref(!!current.inject_trait_catalog)
const options = ref<Ns[]>([])
const traits = ref<Trait[]>([])
const nsOpen = ref(false)
const traitOpen = ref(false)
const nsAnchorEl = ref<HTMLElement | null>(null)
const traitAnchorEl = ref<HTMLElement | null>(null)

watch(() => props.config, (c) => {
  const next = read(c)
  namespaces.value = next.namespaces || []
  traitIds.value = next.trait_ids || []
  injectTraitCatalog.value = !!next.inject_trait_catalog
})

onMounted(async () => {
  try {
    const { data } = await api.get('/api/v1/agents/namespaces')
    options.value = (data?.success && Array.isArray(data.namespaces)) ? data.namespaces : []
  } catch { options.value = [] }

  try {
    const { data } = await api.get('/api/v1/agents/traits')
    traits.value = (data?.success && Array.isArray(data.traits)) ? data.traits : []
  } catch { traits.value = [] }
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
const visibleTraits = computed(() => traits.value.filter(t => namespaceAllows(t.id)))

const labelOfNs = (id: string) => options.value.find(o => o.id === id)?.label || id
const labelOfTrait = (id: string) => traits.value.find(t => t.id === id)?.title || id
const nsHas = (id: string) => namespaces.value.includes(id)
const traitHas = (id: string) => traitIds.value.includes(id)

function publish() {
  emit('config-changed', {
    namespaces: [...namespaces.value],
    trait_ids: [...traitIds.value],
    inject_trait_catalog: injectTraitCatalog.value,
  })
}
function toggleNs(id: string) {
  const i = namespaces.value.indexOf(id)
  if (i >= 0) namespaces.value.splice(i, 1)
  else namespaces.value.push(id)
  publish()
}
function toggleTrait(id: string) {
  const i = traitIds.value.indexOf(id)
  if (i >= 0) traitIds.value.splice(i, 1)
  else traitIds.value.push(id)
  publish()
}
function removeNs(i: number) { namespaces.value.splice(i, 1); publish() }
function removeTrait(i: number) { traitIds.value.splice(i, 1); publish() }
function toggleCatalog() { injectTraitCatalog.value = !injectTraitCatalog.value; publish() }
</script>

<template>
  <div class="kx-ns">
    <label class="kx-ns-toggle">
      <input class="kx-ns-switch-input" type="checkbox" :checked="injectTraitCatalog" @change="toggleCatalog" />
      <span class="kx-ns-switch" aria-hidden="true"></span>
      <span>Show available capabilities in the prompt</span>
    </label>

    <div class="kx-ns-section">
      <div class="kx-ns-label">Namespace scope</div>
      <div class="kx-ns-chips">
        <span v-for="(ns, i) in namespaces" :key="ns" class="kx-ns-chip">
          {{ labelOfNs(ns) }}
          <button type="button" class="kx-ns-x" aria-label="Remove" @click="removeNs(i)"><Icon icon="tabler:x" aria-hidden="true" /></button>
        </span>
        <span v-if="namespaces.length === 0" class="kx-ns-empty">All namespaces</span>
      </div>

      <div class="kx-ns-add">
        <button ref="nsAnchorEl" type="button" class="kx-ns-btn" aria-haspopup="listbox" :aria-expanded="nsOpen" @click="nsOpen = !nsOpen">
          <Icon icon="tabler:plus" aria-hidden="true" />
          <span>Add namespace</span>
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
            <div v-if="!groups.length" class="kx-ns-menu-empty">No namespaces visible to you.</div>
          </div>
        </AnchoredPanel>
      </div>
    </div>

    <div class="kx-ns-section">
      <div class="kx-ns-label">Capability allow-list</div>
      <div class="kx-ns-chips">
        <span v-for="(id, i) in traitIds" :key="id" class="kx-ns-chip">
          {{ labelOfTrait(id) }}
          <button type="button" class="kx-ns-x" aria-label="Remove" @click="removeTrait(i)"><Icon icon="tabler:x" aria-hidden="true" /></button>
        </span>
        <span v-if="traitIds.length === 0" class="kx-ns-empty">All public capabilities in scope</span>
      </div>

      <div class="kx-ns-add">
        <button ref="traitAnchorEl" type="button" class="kx-ns-btn" aria-haspopup="listbox" :aria-expanded="traitOpen" @click="traitOpen = !traitOpen">
          <Icon icon="tabler:puzzle" aria-hidden="true" />
          <span>Add capability</span>
          <Icon icon="tabler:chevron-down" class="kx-ns-caret" aria-hidden="true" />
        </button>
        <AnchoredPanel v-model:open="traitOpen" :anchor="traitAnchorEl" :min-width="300">
          <div class="kx-ns-menu" role="listbox">
            <button
              v-for="t in visibleTraits"
              :key="t.id"
              type="button"
              class="kx-ns-opt kx-ns-opt-rich"
              :class="traitHas(t.id) && 'kx-ns-opt-on'"
              role="option"
              :aria-selected="traitHas(t.id)"
              @click="toggleTrait(t.id)"
            >
              <Icon :icon="traitHas(t.id) ? 'tabler:square-check-filled' : 'tabler:square'" class="kx-ns-check" aria-hidden="true" />
              <span class="kx-ns-opt-text">
                <span class="kx-ns-opt-label">{{ t.title || t.id }}</span>
                <span v-if="t.description" class="kx-ns-opt-desc">{{ t.description }}</span>
              </span>
            </button>
            <div v-if="!visibleTraits.length" class="kx-ns-menu-empty">No capabilities visible in this scope.</div>
          </div>
        </AnchoredPanel>
      </div>
    </div>

    <p class="kx-ns-hint">Namespace and capability limits bound what this agent can activate. Context-bearing capabilities can be activated with a context object.</p>
  </div>
</template>

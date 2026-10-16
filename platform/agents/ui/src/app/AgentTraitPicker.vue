<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import WcMount from '@widgets/app/WcMount.vue'
import AnchoredPanel from '@widgets/app/AnchoredPanel.vue'
import type { Trait } from './agent-form.types.ts'
import { badgesOf, tintOf, useCollapsedTraits } from './trait-presentation.ts'

export interface AgentTraitPickerValue {
  traits: string[]
  trait_contexts: Record<string, unknown>
}

interface Props { value?: string; refreshKey?: number; keepMenuOpenOnAdd?: boolean }
interface Events { change: AgentTraitPickerValue }

const props = useProps<Props>()
const emit = useEvents<Events>()
const traits = ref<Trait[]>([])
const selected = ref(normalizeValue(props.value.value))
const { collapsedTraits, isTraitCollapsed, toggleTraitCollapsed } = useCollapsedTraits()

const activeTraits = computed(() => traits.value.filter(trait => selected.value.traits.includes(trait.id)))
const traitOn = (id: string) => selected.value.traits.includes(id)
const traitQuery = ref('')
const traitMenuOpen = ref(false)
const traitAddRoot = ref<HTMLElement | null>(null)
const traitSearchInput = ref<HTMLInputElement | null>(null)
const traitOptionEls = ref<HTMLElement[]>([])
const traitActiveIndex = ref(-1)
const traitListboxId = 'agent-trait-picker-listbox'
let traitLoadSequence = 0
const addableTraits = computed(() => {
  const q = traitQuery.value.trim().toLowerCase()
  return traits.value
    .filter(trait => !traitOn(trait.id))
    .filter(trait => !q || (trait.title || trait.id).toLowerCase().includes(q) || (trait.description || '').toLowerCase().includes(q))
})
const activeTraitOptionId = computed(() => traitActiveIndex.value >= 0
  ? `agent-trait-picker-option-${traitActiveIndex.value}`
  : undefined)

watch([traitMenuOpen, addableTraits], ([open, options]) => {
  traitOptionEls.value = []
  traitActiveIndex.value = open && options.length ? 0 : -1
})
watch(() => props.value.value, value => {
  selected.value = normalizeValue(value)
  collapsedTraits.value = new Set([...collapsedTraits.value].filter(id => selected.value.traits.includes(id)))
})
watch(() => props.value.refreshKey, (value, previous) => {
  if (value !== previous) void loadTraits()
})

function normalizeValue(value?: string): AgentTraitPickerValue {
  if (typeof value !== 'string' || value === '') return { traits: [], trait_contexts: {} }
  try {
    const raw = JSON.parse(value)
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { traits: [], trait_contexts: {} }
    const traits = Array.isArray(raw.traits) ? raw.traits.filter((id: unknown): id is string => typeof id === 'string') : []
    const traitContexts = raw.trait_contexts && typeof raw.trait_contexts === 'object' && !Array.isArray(raw.trait_contexts)
      ? raw.trait_contexts
      : {}
    return { traits, trait_contexts: { ...traitContexts } }
  } catch {
    return { traits: [], trait_contexts: {} }
  }
}

function publish(value: AgentTraitPickerValue) {
  selected.value = value
  emit('change', {
    traits: [...value.traits],
    trait_contexts: { ...value.trait_contexts },
  })
}

function setTraitOptionRef(element: unknown, index: number) {
  if (element instanceof HTMLElement) traitOptionEls.value[index] = element
}

function setTraitActiveIndex(index: number, ensureVisible = false) {
  traitActiveIndex.value = index
  if (!ensureVisible || index < 0) return
  void nextTick(() => traitOptionEls.value[index]?.scrollIntoView?.({ block: 'nearest' }))
}

function addTrait(id: string) {
  if (!traitOn(id)) publish({ ...selected.value, traits: [...selected.value.traits, id] })
  traitQuery.value = ''
  if (!props.value.keepMenuOpenOnAdd) {
    traitMenuOpen.value = false
    traitActiveIndex.value = -1
  }
  void nextTick(() => traitSearchInput.value?.focus({ preventScroll: true }))
}

function toggleTrait(id: string) {
  const traits = selected.value.traits.filter(value => value !== id)
  if (!traitOn(id)) traits.push(id)
  const traitContexts = { ...selected.value.trait_contexts }
  if (!traitOn(id)) {
    publish({ ...selected.value, traits, trait_contexts: traitContexts })
    return
  }
  delete traitContexts[id]
  if (collapsedTraits.value.has(id)) toggleTraitCollapsed(id)
  publish({ traits, trait_contexts: traitContexts })
}

function onTraitConfig(id: string, config: unknown) {
  publish({
    ...selected.value,
    trait_contexts: { ...selected.value.trait_contexts, [id]: config },
  })
}

function onTraitQueryInput() {
  traitMenuOpen.value = true
  setTraitActiveIndex(addableTraits.value.length ? 0 : -1, true)
}

function onTraitQueryKeydown(event: KeyboardEvent) {
  const count = addableTraits.value.length
  if (event.key === 'Escape' || event.key === 'Tab') {
    traitMenuOpen.value = false
    return
  }
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    traitMenuOpen.value = true
    if (!count) return
    const delta = event.key === 'ArrowDown' ? 1 : -1
    const current = traitActiveIndex.value < 0 ? (delta > 0 ? -1 : 0) : traitActiveIndex.value
    setTraitActiveIndex((current + delta + count) % count, true)
    return
  }
  if (event.key === 'Home' || event.key === 'End') {
    if (!traitMenuOpen.value || !count) return
    event.preventDefault()
    setTraitActiveIndex(event.key === 'Home' ? 0 : count - 1, true)
    return
  }
  if (event.key === 'Enter' && traitMenuOpen.value && traitActiveIndex.value >= 0) {
    event.preventDefault()
    const trait = addableTraits.value[traitActiveIndex.value]
    if (trait) addTrait(trait.id)
  }
}

function traitLabel(trait: Trait) {
  return typeof trait.title === 'string' && trait.title.trim() ? trait.title : 'Unknown capability'
}

async function loadTraits() {
  const sequence = ++traitLoadSequence
  try {
    const { data } = await api.get('/api/v1/agents/traits')
    if (sequence === traitLoadSequence) {
      traits.value = data?.success === true && Array.isArray(data.traits) ? data.traits as Trait[] : []
    }
  } catch {
    if (sequence === traitLoadSequence) traits.value = []
  }
}

onMounted(() => { void loadTraits() })
</script>

<template>
  <div class="kx-agent-trait-picker" data-testid="agent-trait-picker">
    <div class="kx-group-head">
      <span class="kx-group-title">Capabilities</span>
      <span class="kx-group-meta">{{ activeTraits.length }} active</span>
    </div>

    <div ref="traitAddRoot" class="kx-tadd">
      <input
        ref="traitSearchInput"
        v-model="traitQuery"
        class="kx-trait-search kx-focus-halo"
        type="text"
        role="combobox"
        aria-label="Search capabilities to add"
        aria-autocomplete="list"
        :aria-expanded="traitMenuOpen"
        :aria-controls="traitListboxId"
        :aria-activedescendant="traitMenuOpen ? activeTraitOptionId : undefined"
        placeholder="Search capabilities to add…"
        @focus="traitMenuOpen = true"
        @input="onTraitQueryInput"
        @keydown="onTraitQueryKeydown"
      />
      <AnchoredPanel v-model:open="traitMenuOpen" :anchor="traitAddRoot">
        <div :id="traitListboxId" class="kx-trait-menu" role="listbox" aria-label="Available capabilities">
          <button
            v-for="(trait, index) in addableTraits"
            :key="trait.id"
            :id="`agent-trait-picker-option-${index}`"
            :ref="element => setTraitOptionRef(element, index)"
            type="button"
            class="kx-trait-option"
            :class="index === traitActiveIndex && 'kx-trait-option-active'"
            tabindex="-1"
            role="option"
            :aria-selected="false"
            @mouseenter="traitActiveIndex = index"
            @click="addTrait(trait.id)"
          >
            <span class="kx-trait-icon" :class="`kx-tint-${tintOf(trait)}`"><Icon :icon="trait.icon || 'tabler:puzzle'" aria-hidden="true" /></span>
            <span class="kx-trait-option-text">
              <span class="kx-trait-name">{{ trait.title || trait.id }}</span>
              <span v-if="trait.description" class="kx-trait-description">{{ trait.description }}</span>
            </span>
            <span class="kx-trait-badges">
              <span v-for="badge in badgesOf(trait)" :key="badge.key" class="kx-trait-badge" :class="`kx-badge-${badge.key}`">{{ badge.label }}</span>
            </span>
          </button>
          <div v-if="!addableTraits.length" class="kx-trait-empty">No matching capabilities.</div>
        </div>
      </AnchoredPanel>
    </div>

    <ul v-if="activeTraits.length" class="kx-trait-list">
      <li v-for="trait in activeTraits" :key="trait.id" class="kx-trait-row-wrap">
        <div class="kx-trait-row">
          <span class="kx-trait-icon" :class="`kx-tint-${tintOf(trait)}`"><Icon :icon="trait.icon || 'tabler:puzzle'" aria-hidden="true" /></span>
          <span class="kx-trait-text">
            <span class="kx-trait-name">{{ traitLabel(trait) }}<span v-if="!trait.title?.trim()" class="kx-trait-id"> {{ trait.id }}</span></span>
            <span v-if="trait.description" class="kx-trait-description">{{ trait.description }}</span>
          </span>
          <span class="kx-trait-badges">
            <span v-for="badge in badgesOf(trait)" :key="badge.key" class="kx-trait-badge" :class="`kx-badge-${badge.key}`">{{ badge.label }}</span>
          </span>
          <span class="kx-trait-actions">
            <button
              v-if="trait.web_component"
              type="button"
              class="kx-trait-fold kx-focus-outline"
              :aria-expanded="!isTraitCollapsed(trait.id)"
              :aria-label="isTraitCollapsed(trait.id) ? 'Show settings' : 'Hide settings'"
              @click="toggleTraitCollapsed(trait.id)"
            >
              <Icon :icon="isTraitCollapsed(trait.id) ? 'tabler:chevron-right' : 'tabler:chevron-down'" aria-hidden="true" />
            </button>
            <button type="button" class="kx-trait-remove kx-focus-outline" :aria-label="`Remove ${trait.title || trait.id} capability`" @click="toggleTrait(trait.id)">
              <Icon icon="tabler:x" aria-hidden="true" />
            </button>
          </span>
        </div>
        <div v-if="trait.web_component && !isTraitCollapsed(trait.id)" class="kx-trait-config">
          <WcMount
            :tag="trait.web_component"
            :config="selected.trait_contexts[trait.id] || {}"
            :provider="trait.provider"
            @change="(config: unknown) => onTraitConfig(trait.id, config)"
          />
        </div>
      </li>
    </ul>
    <p v-else class="kx-trait-empty-state">No capabilities yet.</p>
  </div>
</template>

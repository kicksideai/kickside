<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import { Icon } from '@iconify/vue'
import AnchoredPanel from '@widgets/app/AnchoredPanel.vue'
import type { Tool, Trait } from './agent-form.types'
import { badgesOf, resolveTraitTools, tintOf, useOpenedTraits } from './trait-presentation'

const props = withDefaults(defineProps<{
  traits: Trait[]
  tools: Tool[]
  selected: string[]
  label?: string
  emptyMessage?: string
}>(), { label: 'Capabilities', emptyMessage: 'No capabilities yet. Add one above to give this agent what it can do.' })
const emit = defineEmits<{ change: [ids: string[]] }>()
const { isTraitOpen, toggleTraitOpen } = useOpenedTraits(() => props.selected)
const activeTraits = computed(() => props.traits.filter(trait => props.selected.includes(trait.id)))
const traitTools = computed(() => new Map(props.traits.map(trait => [trait.id, resolveTraitTools(trait, props.tools)])))
const traitPreviewId = ref<string | null>(null)
function toggleTraitPreview(id: string) {
  traitPreviewId.value = traitPreviewId.value === id ? null : id
}
const traitQuery = ref('')
const traitMenuOpen = ref(false)
const traitAddRoot = ref<HTMLElement | null>(null)
const traitSearchInput = ref<HTMLInputElement | null>(null)
const traitOptionEls = ref<HTMLElement[]>([])
const traitActiveIndex = ref(-1)
const traitListboxId = `capabilities-${useId()}`
const addableTraits = computed(() => {
  const q = traitQuery.value.trim().toLowerCase()
  return props.traits
    .filter(trait => !props.selected.includes(trait.id))
    .filter(trait => !q || (trait.title || trait.id).toLowerCase().includes(q) || (trait.description || '').toLowerCase().includes(q))
})
const activeTraitOptionId = computed(() => traitActiveIndex.value >= 0
  ? `${traitListboxId}-option-${traitActiveIndex.value}`
  : undefined)
watch([traitMenuOpen, addableTraits], ([open, options]) => {
  traitOptionEls.value = []
  traitActiveIndex.value = open && options.length ? 0 : -1
})
function setTraitOptionRef(element: unknown, index: number) {
  if (element instanceof HTMLElement) traitOptionEls.value[index] = element
}
function setTraitActiveIndex(index: number, ensureVisible = false) {
  traitActiveIndex.value = index
  if (!ensureVisible || index < 0) return
  void nextTick(() => traitOptionEls.value[index]?.scrollIntoView?.({ block: 'nearest' }))
}
function onTraitQueryInput() {
  traitMenuOpen.value = true
  setTraitActiveIndex(addableTraits.value.length ? 0 : -1, true)
}
function onTraitQueryKeydown(event: KeyboardEvent) {
  const count = addableTraits.value.length
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    const trait = addableTraits.value[traitActiveIndex.value]
    if (traitMenuOpen.value && trait) {
      event.preventDefault()
      traitPreviewId.value = event.key === 'ArrowRight' ? trait.id : null
    }
    return
  }
  if (event.key === 'Escape') {
    if (traitMenuOpen.value) {
      event.preventDefault()
      event.stopPropagation()
    }
    traitMenuOpen.value = false
    return
  }
  if (event.key === 'Tab') {
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
function addTrait(id: string) {
  if (!props.selected.includes(id)) emit('change', [...props.selected, id])
  traitPreviewId.value = null
  traitQuery.value = ''
  traitActiveIndex.value = -1
  void nextTick(() => {
    traitSearchInput.value?.focus({ preventScroll: true })
    traitMenuOpen.value = false
  })
}
function toggleTrait(id: string) {
  emit('change', props.selected.filter(selected => selected !== id))
}
</script>

<template>
  <div class="kx-group kx-capability-picker">
    <div class="kx-group-head">
      <span class="kx-group-title">{{ label }}</span>
      <span class="kx-group-meta">{{ activeTraits.length }} active</span>
    </div>

    <div ref="traitAddRoot" class="kx-tadd">
      <input
        ref="traitSearchInput"
        v-model="traitQuery"
        class="kx-input kx-tadd-input"
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
        <div :id="traitListboxId" class="kx-tadd-menu" role="listbox" aria-label="Available capabilities">
          <div
            v-for="(t, index) in addableTraits"
            :key="t.id"
            :id="`${traitListboxId}-option-${index}`"
            :ref="el => setTraitOptionRef(el, index)"
            class="kx-tadd-option"
            :class="index === traitActiveIndex && 'kx-tadd-opt-active'"
            tabindex="-1"
            role="option"
            :aria-selected="false"
            @mouseenter="traitActiveIndex = index"
            @click="addTrait(t.id)"
          >
            <div class="kx-tadd-opt">
              <span class="kx-trait-ico" :class="`kx-tint-${tintOf(t)}`"><Icon :icon="t.icon || 'tabler:puzzle'" aria-hidden="true" /></span>
              <span class="kx-tadd-opt-text">
                <span class="kx-trait-name">{{ t.title || t.id }}</span>
              </span>
              <span class="kx-trait-badges">
                <span v-for="b in badgesOf(t)" :key="b.key" class="kx-badge kx-tag-caps" :class="`kx-badge-${b.key}`">{{ b.label }}</span>
              </span>
              <button v-if="t.description || t.prompt || t.tools?.length" type="button" class="kx-trait-fold"
                :aria-expanded="traitPreviewId === t.id" :aria-label="`${traitPreviewId === t.id ? 'Hide' : 'Show'} ${t.title || t.id} details`"
                @click.stop="toggleTraitPreview(t.id)" @keydown.stop>
                <Icon :icon="traitPreviewId === t.id ? 'tabler:chevron-down' : 'tabler:chevron-right'" aria-hidden="true" />
              </button>
            </div>
            <div v-if="traitPreviewId === t.id" class="kx-trait-cfg">
              <p v-if="t.description" class="kx-trait-description">{{ t.description }}</p>
              <p v-if="t.prompt" class="kx-trait-description">{{ t.prompt }}</p>
              <ul v-if="t.tools?.length" class="kx-trait-tools" aria-label="Declared tools">
                <li v-for="{ id, tool } in traitTools.get(t.id)" :key="id" :data-declared-tool-id="id">
                  <strong>{{ tool?.title || id }}</strong>
                  <p class="kx-trait-description">{{ tool?.llm_description || (tool ? 'No description declared.' : 'This tool is not in the available catalog.') }}</p>
                </li>
              </ul>
            </div>
          </div>
          <div v-if="!addableTraits.length" class="kx-tadd-empty">No matching capabilities.</div>
        </div>
      </AnchoredPanel>
    </div>

    <ul v-if="activeTraits.length" class="kx-traits">
      <li v-for="t in activeTraits" :key="t.id" :data-trait-id="t.id" class="kx-trait">
        <div class="kx-trait-row">
          <span class="kx-trait-ico" :class="`kx-tint-${tintOf(t)}`"><Icon :icon="t.icon || 'tabler:puzzle'" aria-hidden="true" /></span>
          <span class="kx-trait-text">
            <span class="kx-trait-name">{{ t.title || t.id }}</span>
          </span>
          <span class="kx-trait-badges">
            <span v-for="b in badgesOf(t)" :key="b.key" class="kx-badge kx-tag-caps" :class="`kx-badge-${b.key}`">{{ b.label }}</span>
          </span>
          <span class="kx-trait-actions">
            <button
              v-if="t.description || t.prompt || t.tools?.length"
              type="button"
              class="kx-trait-fold"
              :aria-expanded="isTraitOpen(t.id)"
              :title="!isTraitOpen(t.id) ? 'Show details' : 'Hide details'"
              :aria-label="!isTraitOpen(t.id) ? 'Show details' : 'Hide details'"
              @click="toggleTraitOpen(t.id)"
            >
              <Icon :icon="!isTraitOpen(t.id) ? 'tabler:chevron-right' : 'tabler:chevron-down'" aria-hidden="true" />
            </button>
            <button type="button" class="kx-trait-x" :aria-label="`Remove ${t.title || t.id} capability`" @click="toggleTrait(t.id)"><Icon icon="tabler:x" aria-hidden="true" /></button>
          </span>
        </div>
        <div v-if="isTraitOpen(t.id)" class="kx-trait-cfg">
          <p v-if="t.description" class="kx-trait-description">{{ t.description }}</p>
          <p v-if="t.prompt" class="kx-trait-description">{{ t.prompt }}</p>
          <ul v-if="t.tools?.length" class="kx-trait-tools" aria-label="Declared tools">
            <li v-for="{ id, tool } in traitTools.get(t.id)" :key="id" :data-declared-tool-id="id">
              <strong>{{ tool?.title || id }}</strong>
              <p class="kx-trait-description">{{ tool?.llm_description || (tool ? 'No description declared.' : 'This tool is not in the available catalog.') }}</p>
            </li>
          </ul>
        </div>
        <div v-if="$slots.config && t.web_component" class="kx-trait-cfg">
          <slot name="config" :trait="t" />
        </div>
      </li>
    </ul>
    <p v-else class="kx-sec-foot">{{ emptyMessage }}</p>
  </div>
</template>

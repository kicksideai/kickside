import { computed, nextTick, ref, watch, type Ref } from 'vue'
import type { Form, Trait } from './agent-form.types.ts'
import { badgesOf, tintOf, useCollapsedTraits } from './trait-presentation.ts'

interface AgentCapabilitiesOptions {
  form: Ref<Form>
  traits: () => Trait[]
  redirectTrait: string
}

export function useAgentCapabilities({ form, traits, redirectTrait }: AgentCapabilitiesOptions) {
  const { collapsedTraits, isTraitCollapsed, toggleTraitCollapsed } = useCollapsedTraits()

  const showAdvancedTools = ref(true)
  const selectableTraits = computed(() => traits().filter(t => t.id !== redirectTrait))
  const traitOn = (trait: Trait) => form.value.traits.includes(trait.id)
  const activeTraits = computed(() => selectableTraits.value.filter(traitOn))

  function plainObject(value: any): value is Record<string, any> {
    return !!value && typeof value === 'object' && !Array.isArray(value)
  }
  function traitMountConfig(id: string) {
    const context = plainObject(form.value.trait_contexts[id]) ? form.value.trait_contexts[id] : {}
    const agentOptions = plainObject(form.value.trait_agent_options[id]) ? form.value.trait_agent_options[id] : null
    return agentOptions ? { ...context, agent_options: agentOptions } : context
  }
  function onTraitConfig(id: string, cfg: any) {
    if (plainObject(cfg) && (Object.prototype.hasOwnProperty.call(cfg, 'context') || Object.prototype.hasOwnProperty.call(cfg, 'agent_options'))) {
      form.value.trait_contexts = { ...form.value.trait_contexts, [id]: plainObject(cfg.context) ? cfg.context : {} }
      const nextOptions = { ...form.value.trait_agent_options }
      if (plainObject(cfg.agent_options) && Object.keys(cfg.agent_options).length) nextOptions[id] = cfg.agent_options
      else delete nextOptions[id]
      form.value.trait_agent_options = nextOptions
      return
    }
    form.value.trait_contexts = { ...form.value.trait_contexts, [id]: cfg }
    const nextOptions = { ...form.value.trait_agent_options }
    delete nextOptions[id]
    form.value.trait_agent_options = nextOptions
  }

  const traitQuery = ref('')
  const traitMenuOpen = ref(false)
  const traitAddRoot = ref<HTMLElement | null>(null)
  const traitSearchInput = ref<HTMLInputElement | null>(null)
  const traitOptionEls = ref<HTMLElement[]>([])
  const traitActiveIndex = ref(-1)
  const traitListboxId = 'agent-capabilities-listbox'
  const addableTraits = computed(() => {
    const q = traitQuery.value.trim().toLowerCase()
    return selectableTraits.value
      .filter(trait => !traitOn(trait))
      .filter(trait => !q || (trait.title || trait.id).toLowerCase().includes(q) || (trait.description || '').toLowerCase().includes(q))
  })
  const activeTraitOptionId = computed(() => traitActiveIndex.value >= 0
    ? `agent-capability-option-${traitActiveIndex.value}`
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
    if (event.key === 'Escape') {
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
    if (!form.value.traits.includes(id)) toggleTrait(id)
    traitQuery.value = ''
    traitMenuOpen.value = false
    traitActiveIndex.value = -1
    void nextTick(() => traitSearchInput.value?.focus({ preventScroll: true }))
  }
  function toggleTrait(id: string) {
    const index = form.value.traits.indexOf(id)
    if (index >= 0) {
      form.value.traits.splice(index, 1)
      if (collapsedTraits.value.has(id)) toggleTraitCollapsed(id)
    } else {
      form.value.traits.push(id)
    }
  }

  function onToolsChange(ids: string[]) { form.value.tools = [...ids] }

  return {
    collapsedTraits, isTraitCollapsed, toggleTraitCollapsed, showAdvancedTools,
    selectableTraits, traitOn, activeTraits, traitMountConfig, onTraitConfig,
    tintOf, badgesOf, traitQuery, traitMenuOpen, traitAddRoot, traitSearchInput,
    traitActiveIndex, traitListboxId, addableTraits, activeTraitOptionId,
    setTraitOptionRef, onTraitQueryInput, onTraitQueryKeydown, addTrait,
    toggleTrait, onToolsChange,
  }
}

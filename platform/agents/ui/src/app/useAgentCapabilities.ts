import { computed, ref, type Ref } from 'vue'
import type { Form, Trait } from './agent-form.types.ts'

interface AgentCapabilitiesOptions {
  form: Ref<Form>
  traits: () => Trait[]
  redirectTrait: string
}

export function useAgentCapabilities({ form, traits, redirectTrait }: AgentCapabilitiesOptions) {
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

  const selectedCapabilities = computed(() => form.value.traits.filter(id => id !== redirectTrait))
  function onCapabilitiesChange(ids: string[]) {
    form.value.traits = [...form.value.traits.filter(id => id === redirectTrait), ...ids]
  }

  function onToolsChange(ids: string[]) { form.value.tools = [...ids] }

  return {
    showAdvancedTools, selectableTraits, selectedCapabilities, activeTraits,
    traitMountConfig, onTraitConfig, onCapabilitiesChange, onToolsChange,
  }
}

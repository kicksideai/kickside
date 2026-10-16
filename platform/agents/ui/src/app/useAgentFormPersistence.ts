import { ref, type ComputedRef, type Ref } from 'vue'
import { api } from '@wippy-fe/proxy'
import { errMsg } from '@widgets/app/errMsg'
import type { Form, Model } from './agent-form.types.ts'

interface AgentFormPersistenceOptions {
  form: Ref<Form>
  valid: ComputedRef<boolean>
  tab: Ref<string>
  blank: (includeCreateDefaults?: boolean) => Form
  agentId: () => string | null
  parentId: () => string | null | undefined
  models: () => Model[]
  redirectTrait: string
  emitSaved: (id: string) => void
}

export function useAgentFormPersistence({ form, valid, tab, blank, agentId, parentId, models, redirectTrait, emitSaved }: AgentFormPersistenceOptions) {
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')

  async function loadAgent(id: string) {
    loading.value = true
    form.value = blank(false)
    try {
      const { data } = await api.get(`/api/v1/user-agents/${id}`)
      if (data?.success && data.agent) {
        const d = data.agent
        form.value = {
          title: d.title || '', description: d.description || '', icon: d.icon || 'tabler:robot', public: d.public === true,
          prompt: d.prompt || '', model: d.model || models()[0]?.name || '',
          temperature: typeof d.temperature === 'number' ? d.temperature : null,
          max_tokens: typeof d.max_tokens === 'number' ? d.max_tokens : 8000,
          thinking_effort: typeof d.thinking_effort === 'number' ? d.thinking_effort : null,
          traits: Array.isArray(d.traits) ? [...d.traits] : [],
          trait_contexts: d.trait_contexts && typeof d.trait_contexts === 'object' ? { ...d.trait_contexts } : {},
          trait_agent_options: d.trait_agent_options && typeof d.trait_agent_options === 'object' ? { ...d.trait_agent_options } : {},
          tools: Array.isArray(d.tools) ? [...d.tools] : [],
          delegates: Array.isArray(d.delegates) ? [...d.delegates] : [],
          memory_target_id: d.memory_target_id || '',
          memory_provider_id: d.memory_provider_id || '',
        }
      }
    } catch (e) {
      error.value = errMsg(e, 'could not load agent')
    } finally {
      loading.value = false
    }
  }

  function selectedMap(source: Record<string, any>) {
    const out: Record<string, any> = {}
    for (const id of form.value.traits) {
      if (Object.prototype.hasOwnProperty.call(source, id)) out[id] = source[id]
    }
    return out
  }

  async function save() {
    if (!valid.value) {
      error.value = !form.value.title.trim() ? 'Name is required.' : 'Check the model and token limits.'
      if (form.value.title.trim()) tab.value = 'model'
      return
    }
    saving.value = true
    error.value = ''
    const payload: Record<string, any> = {
      title: form.value.title.trim(),
      description: form.value.description,
      icon: form.value.icon,
      public: form.value.public,
      prompt: form.value.prompt,
      model: form.value.model,
      temperature: form.value.temperature ?? false,
      max_tokens: form.value.max_tokens,
      thinking_effort: form.value.thinking_effort ?? false,
      traits: form.value.traits,
      trait_contexts: selectedMap(form.value.trait_contexts),
      trait_agent_options: selectedMap(form.value.trait_agent_options),
      tools: form.value.tools,
      delegates: form.value.delegates,
      memory_target_id: form.value.memory_target_id,
      memory_provider_id: form.value.memory_provider_id,
    }
    const currentId = agentId()
    if (currentId) {
      const selfRefs = new Set([currentId, `user_agent:${currentId}`])
      payload.delegates = (payload.delegates as string[]).filter((delegate: string) => !selfRefs.has(delegate))
      const redirectConfig = (payload.trait_contexts as Record<string, any>)?.[redirectTrait]
      if (redirectConfig && Array.isArray(redirectConfig.targets)) {
        const targets = redirectConfig.targets.filter((target: any) => !selfRefs.has(target.agent_id))
        payload.trait_contexts = { ...payload.trait_contexts, [redirectTrait]: { ...redirectConfig, targets } }
        if (!targets.length) payload.traits = (payload.traits as string[]).filter((trait: string) => trait !== redirectTrait)
      }
    }
    try {
      let savedId = currentId || ''
      if (currentId) {
        const { data } = await api.put(`/api/v1/user-agents/${currentId}`, payload)
        if (!data?.success) throw new Error(data?.error || 'save failed')
      } else {
        const { data } = await api.post('/api/v1/user-agents', { ...payload, parent_id: parentId() || undefined })
        if (!data?.success) throw new Error(data?.error || 'create failed')
        savedId = data.component_id || ''
      }
      emitSaved(savedId)
    } catch (e) {
      error.value = errMsg(e, 'save failed')
    } finally {
      saving.value = false
    }
  }

  return { loading, saving, error, loadAgent, save }
}

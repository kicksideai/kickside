import { computed, ref, type Ref } from 'vue'
import { REDIRECT_PREFIX, type Agent, type Form } from './agent-form.types.ts'

interface RedirectTarget { agent_id: string; comment: string }

interface AgentRoutingOptions {
  form: Ref<Form>
  agentId: () => string | null
  agents: () => Agent[]
  redirectTrait: string
}

export function useAgentRouting({ form, agentId, agents, redirectTrait }: AgentRoutingOptions) {
  const routeView = ref<'delegates' | 'redirects'>('delegates')
  function pickIds(event: Event): string[] {
    const detail = (event as CustomEvent).detail
    return detail && Array.isArray(detail.selected) ? detail.selected.map(String) : []
  }

  function onDelegatesChange(ids: string[]) {
    const self = new Set([agentId(), `${REDIRECT_PREFIX}${agentId()}`].filter(Boolean) as string[])
    form.value.delegates = ids.filter(id => !self.has(id))
  }

  const bareId = (ref: string) => ref.startsWith(REDIRECT_PREFIX) ? ref.slice(REDIRECT_PREFIX.length) : ref
  const redirectTargets = computed<RedirectTarget[]>(() => {
    const config = form.value.trait_contexts[redirectTrait]
    return config && Array.isArray(config.targets) ? config.targets : []
  })
  const redirectSelectedIds = computed(() => redirectTargets.value.map(target => target.agent_id))
  function setRedirects(targets: RedirectTarget[]) {
    form.value.trait_contexts = { ...form.value.trait_contexts, [redirectTrait]: { targets } }
    const index = form.value.traits.indexOf(redirectTrait)
    if (targets.length && index < 0) form.value.traits.push(redirectTrait)
    else if (!targets.length && index >= 0) form.value.traits.splice(index, 1)
  }
  function onRedirectsChange(ids: string[]) {
    const self = new Set([agentId(), `${REDIRECT_PREFIX}${agentId()}`].filter(Boolean) as string[])
    const keep = ids.filter(id => !self.has(id))
    const comments = new Map(redirectTargets.value.map(target => [target.agent_id, target.comment]))
    setRedirects(keep.map(id => ({ agent_id: id, comment: comments.get(id) || '' })))
  }
  function redirectLabel(ref: string): string {
    const id = bareId(ref)
    return agents().find(agent => agent.id === id)?.title || id
  }
  function setRedirectCommentById(ref: string, comment: string) {
    setRedirects(redirectTargets.value.map(target => target.agent_id === ref ? { ...target, comment } : target))
  }

  return { routeView, pickIds, onDelegatesChange, redirectTargets, redirectSelectedIds, setRedirects, onRedirectsChange, redirectLabel, setRedirectCommentById }
}

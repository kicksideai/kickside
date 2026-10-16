export interface TraitAffects { tools?: boolean; behavior?: boolean; memory?: boolean }
export interface Trait {
  id: string
  title?: string
  description?: string
  prompt?: string
  icon?: string
  tags?: string[]
  tools?: string[]
  web_component?: string
  provider?: string
  affects?: TraitAffects
}
export interface Tool { id: string; title?: string; icon?: string; llm_alias?: string; llm_description?: string; input_schema?: Record<string, unknown> }
export interface Model { name: string; title?: string; provider?: string; class?: string[]; capabilities?: string[]; output_tokens?: number }
export interface Agent { id: string; title?: string; icon?: string; description?: string }

export interface Form {
  title: string
  description: string
  icon: string
  prompt: string
  public: boolean
  model: string
  temperature: number | null
  max_tokens: number
  thinking_effort: number | null
  traits: string[]
  trait_contexts: Record<string, any>
  trait_agent_options: Record<string, any>
  tools: string[]
  delegates: string[]
  memory_target_id: string
  memory_provider_id: string
}

export const REDIRECT_TRAIT = 'kickside.agents.traits:redirect'
export const ARTIFACTS_TRAIT = 'kickside.agents.traits:artifacts'
export const FILE_MANAGER_TRAIT = 'kickside.uploads.traits:file_manager'
export const REDIRECT_PREFIX = 'user_agent:'

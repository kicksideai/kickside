export type KbType = string

export interface StatItem { icon?: string; value: number; label: string }
export interface StatSpec { path?: string; icon?: string; singular?: string; plural?: string; min?: number }
export interface Badge { label: string; icon: string; tone: string }

export interface KnowledgeBase {
  id: string
  name?: string
  description?: string
  icon?: string
  status?: string
  kb_type?: KbType
  badge?: Badge
  auto_summary?: string
  auto_description?: string
  stat_items?: StatItem[]
  document_count?: number
  embedding_count?: number
  claim_count?: number
}

export interface KbDetail extends KnowledgeBase { embedding_model?: string }

export interface EmbeddingModel {
  name: string
  title?: string
  provider?: string
  dimensions?: number
}

export type ConfigValue = string | number | boolean
export type ConfigOption = ConfigValue | { label?: string; value: ConfigValue }

export interface EngineConfigField {
  type?: 'string' | 'integer' | 'number' | 'boolean'
  label?: string
  description?: string
  default?: ConfigValue
  minimum?: number
  maximum?: number
  enum?: ConfigValue[]
  options?: ConfigOption[]
  order?: number
}

export interface EngineConfigSchema { properties?: Record<string, EngineConfigField> }
export interface ViewMode { id: string; label: string; icon?: string }

export type Engine = {
  kb_type: string
  label: string
  icon?: string
  badge?: Badge
  description?: string
  stats_spec?: StatSpec[]
  default_config?: Record<string, unknown>
  config_schema?: EngineConfigSchema
  manage_ui_id?: string
  manage_views?: ViewMode[]
  create_ui_id?: string
}

export interface DialogTarget {
  id: string
  name?: string
  description?: string
  icon?: string
  kb_type?: string
  embedding_model?: string
  config?: Record<string, unknown>
}

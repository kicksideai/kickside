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

export interface EngineConfigSchema {
  properties?: Record<string, EngineConfigField>
}

export interface Engine {
  kb_type: string
  label: string
  icon?: string
  description?: string
  default_config?: Record<string, unknown>
  config_schema?: EngineConfigSchema
  create_ui_id?: string
}

export interface EmbeddingModel {
  name: string
  title?: string
  provider?: string
  dimensions?: number
}

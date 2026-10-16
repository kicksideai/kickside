export interface ComponentProps {}

export type ProfileMode = 'create' | 'edit'

export interface Adapter {
  id: string
  name?: string
  title: string
  description?: string
  tags?: string[]
  discoverable?: boolean
  profile_editor_tag?: string
}

export interface Preset {
  id: string
  key: string
  title: string
  description?: string
  icon?: string
  provider_id: string
  config?: ProviderConfig
  profile_editor_tag?: string
  order?: number
  // false hides the preset from the onboarding picker (still available in full
  // Models settings) — used for niche variants that would otherwise duplicate a tile.
  onboarding?: boolean
}

export interface ProviderConfig {
  base_url?: string
  model_list_url?: string
  test_model?: string
  organization?: string
  api_key_env?: string
  api_version?: string
  region?: string
  region_env?: string
  access_key_env?: string
  secret_key_env?: string
  session_token_env?: string
  project?: string
  project_env?: string
  location?: string
  location_env?: string
  google_credentials_env?: string
  access_token_env?: string
  bedrock_provider?: string
  timeout?: number
  headers?: Record<string, string>
  retry?: { attempts?: number; backoff_ms?: number }
  [key: string]: unknown
}

export interface Profile {
  id: string
  name: string
  provider_id: string
  config?: ProviderConfig
  enabled: boolean
  status?: string
  message?: string
  has_api_key?: boolean
  has_api_key_env?: boolean
  secret_fields?: string[]
  last_discovered_at?: number
}

export interface ModelCard {
  name: string
  title?: string
  description?: string
  provider_id?: string
  provider_model?: string
  provider_profile_id?: string
  capabilities?: string[]
  class?: string[]
  priority?: number
  max_tokens?: number
  output_tokens?: number
  dimensions?: number
  pricing?: Record<string, unknown>
  source?: string
  enabled?: boolean
  options?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export interface ClassMember {
  name: string
  title?: string
  priority?: number
}

export interface ClassGroup {
  name: string
  title?: string
  description?: string
  icon?: string
  weight?: number
  declared?: boolean
  // Declared tier kind from the model_class entry: 'embed' tiers are configured
  // from embedding models, everything else ('generate') from generation models.
  capability?: string
  models: ClassMember[]
}

export interface TestState {
  status: 'idle' | 'testing' | 'ok' | 'fail'
  message?: string
}

export interface ModelProbeState extends TestState {
  model?: string
  data?: ModelProbeResult
}

export interface ModelProbeResult {
  success?: boolean
  model?: string
  provider_id?: string
  provider_profile_id?: string
  provider_model?: string
  reasoning?: boolean
  elapsed_ms?: number
  max_tokens?: number
  finish_reason?: string
  tokens?: Record<string, number>
  output?: string
  error?: string
}

export interface ProviderEditorProps {
  mode?: ProfileMode
  adapter?: Adapter
  preset?: Preset
  profile?: Profile | null
  saving?: boolean
  testState?: TestState
}

export interface ProviderField {
  key: string
  label: string
  type?: 'text' | 'password' | 'number'
  placeholder?: string
  help?: string
  section?: 'identity' | 'auth' | 'endpoint' | 'advanced'
  secret?: boolean
}

export interface ProviderEditorSpec {
  key: string
  title: string
  subtitle: string
  defaultProviderId: string
  icon: string
  fields: ProviderField[]
}

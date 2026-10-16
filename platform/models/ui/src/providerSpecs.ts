import type { ProviderEditorSpec } from './types.ts'

export const PROVIDER_SPECS: Record<string, ProviderEditorSpec> = {
  openai_compat: {
    key: 'openai_compat',
    title: 'OpenAI Compatible',
    subtitle: 'Chat Completions compatible endpoints, including local and hosted providers.',
    defaultProviderId: 'wippy.llm.openai_compat:provider',
    icon: 'tabler:plug',
    fields: [
      { key: 'base_url', label: 'Base URL', placeholder: 'http://localhost:11434/v1', section: 'endpoint', help: 'Your endpoint v1 root.' },
      { key: 'api_key', label: 'API key', type: 'password', section: 'auth', secret: true, help: 'Optional for local endpoints.' },
      { key: 'test_model', label: 'Test model', placeholder: 'gemma-4-12b', section: 'advanced', help: 'Probe model for Test connection; auto-picked from discovery when blank.' },
      { key: 'api_key_env', label: 'API key env', placeholder: 'OPENROUTER_API_KEY', section: 'advanced' },
      { key: 'organization', label: 'Organization', section: 'advanced' },
      { key: 'timeout', label: 'Timeout', type: 'number', section: 'advanced' },
    ],
  },
  openai: {
    key: 'openai',
    title: 'OpenAI',
    subtitle: 'Native OpenAI Responses and embeddings provider.',
    defaultProviderId: 'wippy.llm.openai:provider',
    icon: 'tabler:brand-openai',
    fields: [
      { key: 'api_key', label: 'API key', type: 'password', section: 'auth', secret: true },
      { key: 'base_url', label: 'Base URL', placeholder: 'https://api.openai.com/v1', section: 'advanced' },
      { key: 'test_model', label: 'Test model', placeholder: 'gpt-4o-mini', section: 'advanced', help: 'Probe model for Test connection; auto-picked when blank.' },
      { key: 'api_key_env', label: 'API key env', placeholder: 'OPENAI_API_KEY', section: 'advanced' },
      { key: 'organization', label: 'Organization', section: 'advanced' },
      { key: 'timeout', label: 'Timeout', type: 'number', section: 'advanced' },
    ],
  },
  anthropic: {
    key: 'anthropic',
    title: 'Anthropic',
    subtitle: 'Claude Messages API provider with model discovery.',
    defaultProviderId: 'wippy.llm.claude:provider',
    icon: 'tabler:hexagon-letter-c',
    fields: [
      { key: 'api_key', label: 'API key', type: 'password', section: 'auth', secret: true },
      { key: 'base_url', label: 'Base URL', placeholder: 'https://api.anthropic.com', section: 'advanced' },
      { key: 'api_key_env', label: 'API key env', placeholder: 'ANTHROPIC_API_KEY', section: 'advanced' },
      { key: 'api_version', label: 'API version', placeholder: '2023-06-01', section: 'advanced' },
      { key: 'timeout', label: 'Timeout', type: 'number', section: 'advanced' },
    ],
  },
  google_genai: {
    key: 'google_genai',
    title: 'Google Gemini',
    subtitle: 'Gemini Developer API using API-key auth and models.list discovery.',
    defaultProviderId: 'wippy.llm.google.generative_ai:provider',
    icon: 'tabler:brand-google',
    fields: [
      { key: 'api_key', label: 'API key', type: 'password', section: 'auth', secret: true },
      { key: 'base_url', label: 'Base URL', placeholder: 'https://generativelanguage.googleapis.com/v1beta/models', section: 'advanced' },
      { key: 'api_key_env', label: 'API key env', placeholder: 'GEMINI_API_KEY', section: 'advanced' },
      { key: 'timeout', label: 'Timeout', type: 'number', section: 'advanced' },
    ],
  },
  google_vertex: {
    key: 'google_vertex',
    title: 'Google Vertex AI',
    subtitle: 'Vertex context for explicit model overlays using project, location, and Google credentials.',
    defaultProviderId: 'wippy.llm.google.vertex:provider',
    icon: 'tabler:cloud',
    fields: [
      { key: 'project', label: 'Project', placeholder: 'my-gcp-project', section: 'endpoint', help: 'Required unless the service-account JSON has project_id.' },
      { key: 'location', label: 'Location', placeholder: 'us-central1', section: 'endpoint', help: 'Required for Vertex model calls.' },
      { key: 'google_credentials', label: 'Service account JSON/base64', type: 'password', section: 'auth', secret: true, help: 'Refreshable by the models token supervisor.' },
      { key: 'project_env', label: 'Project env', placeholder: 'GOOGLE_CLOUD_PROJECT', section: 'advanced' },
      { key: 'location_env', label: 'Location env', placeholder: 'VERTEX_AI_LOCATION', section: 'advanced' },
      { key: 'google_credentials_env', label: 'Credentials env', placeholder: 'GOOGLE_CREDENTIALS', section: 'advanced', help: 'Optional pointer to service-account JSON/base64.' },
      { key: 'access_token', label: 'Access token', type: 'password', section: 'advanced', secret: true, help: 'For externally rotated tokens only.' },
      { key: 'access_token_env', label: 'Access token env', placeholder: 'GOOGLE_ACCESS_TOKEN', section: 'advanced', help: 'The supervisor does not refresh direct access tokens.' },
      { key: 'base_url', label: 'Base URL override', placeholder: 'https://us-central1-aiplatform.googleapis.com/v1', section: 'advanced' },
      { key: 'timeout', label: 'Timeout', type: 'number', section: 'advanced' },
    ],
  },
  bedrock: {
    key: 'bedrock',
    title: 'AWS Bedrock',
    subtitle: 'Bedrock Converse and InvokeModel through AWS SigV4.',
    defaultProviderId: 'wippy.llm.bedrock:provider',
    icon: 'tabler:brand-aws',
    fields: [
      { key: 'region', label: 'Region', placeholder: 'us-east-1', section: 'endpoint' },
      { key: 'access_key', label: 'Access key', type: 'password', section: 'auth', secret: true },
      { key: 'secret_key', label: 'Secret key', type: 'password', section: 'auth', secret: true },
      { key: 'region_env', label: 'Region env', placeholder: 'AWS_REGION', section: 'advanced' },
      { key: 'access_key_env', label: 'Access key env', placeholder: 'AWS_ACCESS_KEY_ID', section: 'advanced' },
      { key: 'secret_key_env', label: 'Secret key env', placeholder: 'AWS_SECRET_ACCESS_KEY', section: 'advanced' },
      { key: 'session_token', label: 'Session token', type: 'password', section: 'advanced', secret: true },
      { key: 'session_token_env', label: 'Session token env', placeholder: 'AWS_SESSION_TOKEN', section: 'advanced' },
      { key: 'bedrock_provider', label: 'Discovery provider filter', placeholder: 'Anthropic', section: 'advanced' },
      { key: 'base_url', label: 'Base URL override', placeholder: 'https://bedrock.us-east-1.amazonaws.com', section: 'advanced' },
      { key: 'timeout', label: 'Timeout', type: 'number', section: 'advanced' },
    ],
  },
}

// The single source of truth mapping a provider's declared profile_editor_tag
// (registry kind provider_profile_editor) to its spec. Drives spec resolution in
// both surfaces and the web-component registration in index.ts. Unknown tags fall
// back to the generic OpenAI-compatible editor.
export const EDITOR_TAGS: Record<string, keyof typeof PROVIDER_SPECS> = {
  'kickside-model-provider-openai-compatible': 'openai_compat',
  'kickside-model-provider-openai': 'openai',
  'kickside-model-provider-anthropic': 'anthropic',
  'kickside-model-provider-google-generative-ai': 'google_genai',
  'kickside-model-provider-google-vertex': 'google_vertex',
  'kickside-model-provider-bedrock': 'bedrock',
}

export function specKeyForTag(tag?: string): keyof typeof PROVIDER_SPECS {
  return (tag && EDITOR_TAGS[tag]) || 'openai_compat'
}

export function isBuiltInEditorTag(tag?: string): boolean {
  return Boolean(tag && EDITOR_TAGS[tag])
}

export function specForProviderTag(tag?: string): ProviderEditorSpec {
  return PROVIDER_SPECS[specKeyForTag(tag)]
}

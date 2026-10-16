// No host-driven props: the MCP surface fetches its own data.
export interface ComponentProps {}

// A credential row as returned by GET /api/v1/mcp/credentials (never the token).
export interface Credential {
  credential_id: string
  token_prefix: string
  whitelist_component_ids?: string[]
  label?: string
  status: string
  expires_at?: number | null
  created_at?: number
  last_used_at?: number | null
  allowed_tool_ids?: string[]
  allowed_trait_ids?: string[]
  mcp_url?: string
}

// A tool the create form can allow, from GET /api/v1/mcp/tools.
export interface Tool {
  id: string
  name: string
  description?: string
  tags?: string[]
}

// A preset bundle, from GET /api/v1/mcp/presets.
export interface Preset {
  id: string
  name: string
  description?: string
  tool_ids?: string[]
}

// A node in the canonical component tree the scope picker browses, from
// GET /api/v1/mcp/components. Any accessible component (knowledge base, agent,
// folder, ...) is a valid scope target.
export interface Entry {
  id: string
  name?: string
  class?: string
  icon?: string
}

// The mint result returned ONCE by POST /api/v1/mcp/credentials.
export interface MintedCredential {
  credential_id: string
  token: string
  token_prefix: string
  actor_id: string
  whitelist_component_ids?: string[]
  label?: string
  expires_at?: number | null
  mcp_url?: string
}

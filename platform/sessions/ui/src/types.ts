export interface ComponentProps {
  /** Full manager is the default; sidebar owns the full compact rail; navigation renders only chat rows inside the app sidebar. */
  mode?: 'manager' | 'sidebar' | 'navigation'
  /** Session displayed by the app-owned chat panel. */
  activeSessionId?: string
  /** Whether the cross-session artifact gallery owns the adjacent workspace. */
  artifactsActive?: boolean
}

// A chat session row as returned by the wippy/session list API, with agent and
// model flattened from `config` by the backend (current_agent/current_model).
export interface Session {
  session_id: string
  title: string
  status?: string
  kind?: string
  current_agent: string
  current_model: string
  start_date?: string
  last_message_date?: string
  primary_context_id?: string
  // Per-session client-facing metadata; holds the favorite flag.
  public_meta?: { favorite?: boolean } & Record<string, unknown>
  // Session metadata; the runtime accumulates token usage here under `tokens`
  // (prompt_tokens / completion_tokens / thinking_tokens / total_tokens, …).
  meta?: { tokens?: Record<string, number> } & Record<string, unknown>
}

export interface ProviderBadge {
  icon: string
  label: string
}

export interface SessionMessage {
  message_id: string
  type: string
  data: string
  date?: string
}

export interface ArtifactSummary {
  uuid: string
  artifact_id: string
  session_id?: string
  kind: string
  type: string
  title: string
  created_at?: string
  updated_at?: string
  display_type?: 'standalone' | 'inline'
  content_type?: string
  description?: string
  preview?: string
  icon?: string
  status?: string
}

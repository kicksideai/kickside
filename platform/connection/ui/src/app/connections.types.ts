export interface Connection {
  component_id: string
  name?: string
  provider?: string
  icon?: string
  connection_state?: string
  reauth_reason?: string
  expires_at?: number | null
  refresh_expires_at?: number | null
  last_token_refresh?: string
  updated_at?: string
  scope_count?: number
  scopes_granted?: string[]
  oauth?: boolean
}

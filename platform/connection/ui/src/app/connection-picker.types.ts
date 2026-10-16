export interface Scope { scope: string; name?: string; description?: string }
export interface CredentialOption { label?: string; value?: string }
export interface CredentialField {
  key: string
  label?: string
  type?: 'text' | 'password' | 'url' | 'email' | 'select' | 'checkbox'
  required?: boolean
  placeholder?: string
  help?: string
  options?: Array<string | CredentialOption>
}
export interface CredentialSchema { fields?: CredentialField[]; submit_label?: string }
export interface Provider {
  id?: string
  impl_id?: string
  provider?: string
  name?: string
  title?: string
  description?: string
  icon?: string
  oauth_provider?: string
  auth_type?: string
  classes?: string[]
  group?: string
  available_scopes?: Scope[]
  default_scopes?: string[]
  credential_schema?: CredentialSchema
  create_ui_id?: string
}
export interface ConnectionSummary {
  component_id?: string
  updated_at?: string
  scopes_granted?: string[]
}

// The shapes the Automations manager reads off the generic API. Every field here
// is server-declared: the manager renders engine controls and type actions and never invents
// a descriptor for one.

import type { DriveStatus } from './drive-status'

export interface ActionRef {
  name: string
  contract?: string
  target?: string
}

export interface DriveControl {
  name: string
  request_id_required?: boolean
  keys_required?: boolean
}

export interface DeleteOption {
  key: string
  title?: string
  description?: string
  default?: boolean
}

export interface PublicStateField {
  key: string
  type?: string
  label?: string
  icon?: string
  hide_zero?: boolean
  // Machine-only fields (e.g. indexed routing keys) declared for the engine's
  // public_state merge but never rendered as card metrics.
  hidden?: boolean
  // subtitle: the field renders as the row's sub-line after the kind title.
  role?: 'subtitle'
}

export interface ViewComponentRef {
  id?: string
  tag_name?: string
  title?: string
  base_path?: string
  entry_point?: string
  url?: string
}

export interface AutomationTypeComponent {
  create_ui?: ViewComponentRef
  manage_ui?: ViewComponentRef
  create_ui_id?: string
  manage_ui_id?: string
}

export interface InputField {
  type?: string
  title?: string
  description?: string
  enum?: string[]
  enum_labels?: Record<string, string>
  format?: string
  sensitive?: boolean
  default?: unknown
  minLength?: number
}

export interface InputSchema {
  type?: string
  required?: string[]
  properties?: Record<string, InputField>
}

export interface AutomationType {
  id: string
  name?: string
  title?: string
  description?: string
  icon?: string
  category?: string
  class?: string | string[]
  inputs?: InputSchema
  component?: AutomationTypeComponent
  actions?: ActionRef[]
  controls?: DriveControl[]
  delete_options?: DeleteOption[]
  public_state_schema?: { fields?: PublicStateField[] }
  exportable?: boolean
  // The install catalog may offer this type. Kinds that exist only as rows on a
  // control surface are delivered with installable = false so their rows still
  // render from server truth.
  installable?: boolean
}

// Status reported by an installed automation's `status` action. The shape is
// type-specific, so only the few common fields are read; everything else is
// surfaced opaquely.
export interface AutomationStatus {
  enabled?: boolean
  status?: string
  last_run_at?: number | string
  next_run_at?: number | string
  last_error?: string | null
}

export interface AutomationAvailability { code: 'unavailable'; message: string; details?: Record<string, unknown> }

export interface Automation {
  id: string
  access_level?: number
  type?: string
  class?: string | string[]
  title?: string
  icon?: string
  description?: string
  created_at?: number | string
  updated_at?: number | string
  // Materialized public state projected server-side from the type's
  // public_state_schema and delivered with the list row, so the card renders
  // status without a per-row status fetch. Realtime component.meta.changed
  // re-projects the changed fields into it live.
  public_state?: AutomationStatus
  // The generic drive status of an automation the round drives: the same
  // projection its status action answers, read for the whole list.
  drive_status?: DriveStatus
  availability?: AutomationAvailability
}

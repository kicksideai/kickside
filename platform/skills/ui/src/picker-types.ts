// Single source of truth for the Skills trait config component contract, shared
// by the element wrapper (picker.ts) and the Vue root (skill-picker.vue).
//
// The runtime tolerates either a { skill_ids } context or a bare id array (and an
// empty/absent context), so the looser shape is the canonical one both sides use.
export interface PickerProps {
  config?: { skill_ids?: string[] } | string[] | null
}

export interface PickerEvents {
  'config-changed': { skill_ids: string[] }
  load: undefined
  error: { message: string; error: unknown }
}

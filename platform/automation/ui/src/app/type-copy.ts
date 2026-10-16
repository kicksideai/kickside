export interface AutomationTypeCopySource {
  description?: string
}

// Domain modules own their own product vocabulary. The generic manager displays it
// verbatim instead of recognizing, renaming, or normalizing provider-specific types.
export function automationTypeDescription(type: AutomationTypeCopySource): string {
  return String(type.description || '').trim()
}

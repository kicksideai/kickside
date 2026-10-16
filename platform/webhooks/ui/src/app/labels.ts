// Human labels for the server-declared webhook status enum. Keys mirror
// kickside.webhooks consts.lua STATUS; an unknown value falls back to its raw
// token rather than rendering blank.
const WEBHOOK_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  revoked: 'Revoked',
}

export function webhookStatusLabel(status?: string): string {
  if (!status) return ''
  return WEBHOOK_STATUS_LABELS[status] ?? status
}

// Backend error strings that read as internal wording get replaced with user-facing
// copy. The component-delete gate reports a missing or inaccessible component with a
// fixed internal phrase; surface it as a plain "already removed" instead of leaking it.
const BACKEND_ERROR_LABELS: Record<string, string> = {
  'Component not found or insufficient access to delete':
    'This webhook could not be found — it may already have been removed. Refresh the list.',
}

export function friendlyError(message: string): string {
  return BACKEND_ERROR_LABELS[message] ?? message
}

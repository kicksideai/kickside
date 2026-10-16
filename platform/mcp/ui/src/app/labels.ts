// Human labels for the server-declared MCP credential status enum. Keys mirror
// kickside.mcp consts.lua STATUS; an unknown value falls back to its raw token
// rather than rendering blank.
const CREDENTIAL_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  revoked: 'Revoked',
}

export function credentialStatusLabel(status?: string): string {
  if (!status) return ''
  return CREDENTIAL_STATUS_LABELS[status] ?? status
}

// A component-tree entry's declared name (from GET /api/v1/mcp/components) is
// optional; the primary label is never the bare component id.
export function entryLabel(e: { name?: string }): string {
  return (e.name || '').trim() || 'Unknown component'
}

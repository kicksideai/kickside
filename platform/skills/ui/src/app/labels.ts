// Human labels for the server-declared skill enums, so raw enum tokens never reach
// the surface. Keys mirror kickside.skills types.lua (STATUS, FILE_KIND); an unknown
// value falls back to its raw token rather than rendering blank.
const SKILL_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  archived: 'Archived',
}

export function skillStatusLabel(status?: string): string {
  if (!status) return ''
  return SKILL_STATUS_LABELS[status] ?? status
}

const FILE_KIND_LABELS: Record<string, string> = {
  reference: 'Reference',
  asset: 'Asset',
  script: 'Script',
}

export function fileKindLabel(kind?: string): string {
  if (!kind) return ''
  return FILE_KIND_LABELS[kind] ?? kind
}

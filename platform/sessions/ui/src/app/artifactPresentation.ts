import type { ArtifactSummary } from '../types.ts'

export function artifactId(artifact: ArtifactSummary): string {
  return artifact.uuid || artifact.artifact_id
}

export function artifactWhen(artifact: ArtifactSummary): string {
  const raw = artifact.updated_at || artifact.created_at
  if (!raw) return ''
  const timestamp = new Date(raw).getTime()
  if (Number.isNaN(timestamp)) return ''
  const diff = Math.max(0, Date.now() - timestamp)
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return 'just now'
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`
  if (diff < day) return `${Math.floor(diff / hour)}h ago`
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`
  return new Date(raw).toLocaleDateString()
}

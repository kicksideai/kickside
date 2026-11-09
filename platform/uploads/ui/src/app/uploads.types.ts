export interface UploadsMeta {
  status?: string
  file_count?: number
  pending_count?: number
  total_bytes?: number
  last_completed_at?: string
  last_upload_id?: string
}

export interface Upload {
  raw_url?: string | null
  view_url?: string | null
  uuid: string
  filename: string
  size: number
  mime_type: string
  status: string
  error?: string
  created_at: number | string
  updated_at?: number | string
  meta?: Record<string, unknown>
}

export interface UploadArtifact {
  artifact_id: string
  upload_id: string
  parent_artifact_id?: string | null
  kind: string
  role?: string | null
  mime_type: string
  label?: string | null
  ordinal?: number
  checksum?: string | null
  size?: number | null
  occurrence_count?: number | null
  duplicate_count?: number | null
  occurrence_labels?: string[] | null
  raw_url?: string | null
  locator?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export interface ArtifactState {
  loaded: boolean
  loading: boolean
  error: string
  primary: UploadArtifact | null
  parts: UploadArtifact[]
  total: number
  page: number
}

export interface PreviewSource {
  contentType: string
  sourceUrl: string
  filename: string
}

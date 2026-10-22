import type { Upload, UploadArtifact } from './uploads.types.ts'

export function normStatus(status: string): string {
  return status === 'failed' ? 'error' : (status || 'uploaded')
}

export function isFailed(upload: Upload): boolean {
  return normStatus(upload.status) === 'error'
}

// The badge is a PrimeVue Tag, so the state maps to a severity the theme
// already paints - no KickSide colour class in between.
export function statusSeverity(status: string): string {
  switch (normStatus(status)) {
    case 'completed': return 'success'
    case 'error': return 'danger'
    case 'processing': return 'info'
    default: return 'warn'
  }
}

export function statusLabel(status: string): string {
  const normalized = normStatus(status)
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

// An upload with no reported filename (in flight, or a source that never sent
// one) never shows its raw uuid as the primary name — the uuid rides as a
// secondary detail (.kx-uuid) wherever there's room for one instead.
export function uploadLabel(upload: Upload): string {
  return (upload.filename || '').trim() || 'Untitled upload'
}

export function typeIcon(mime: string): string {
  const value = mime || ''
  if (value.startsWith('image/')) return 'tabler:photo'
  if (value === 'application/pdf') return 'tabler:file-type-pdf'
  if (value.includes('word') || value.includes('opendocument.text') || value === 'application/rtf') return 'tabler:file-type-doc'
  if (value.includes('sheet') || value.includes('excel') || value.includes('spreadsheet') || value === 'text/csv') return 'tabler:file-type-xls'
  if (value.includes('presentation') || value.includes('powerpoint')) return 'tabler:file-type-ppt'
  if (value === 'application/epub+zip') return 'tabler:book'
  if (value.startsWith('text/') || value === 'application/json' || value === 'application/xml') return 'tabler:file-text'
  return 'tabler:file'
}

// Short, human label instead of the raw mime (e.g. the very long
// application/vnd.openxmlformats-...wordprocessingml.document).
export function typeLabel(upload: Upload): string {
  const mime = upload.mime_type || ''
  if (mime.startsWith('image/')) return mime.slice(6).toUpperCase() + ' image'
  if (mime === 'application/pdf') return 'PDF'
  if (mime.includes('word') || mime.includes('opendocument.text')) return 'Word'
  if (mime.includes('sheet') || mime.includes('excel') || mime.includes('spreadsheet')) return 'Spreadsheet'
  if (mime.includes('presentation') || mime.includes('powerpoint')) return 'Presentation'
  if (mime === 'application/rtf') return 'Rich text'
  if (mime === 'application/epub+zip') return 'EPUB'
  if (mime === 'text/markdown') return 'Markdown'
  if (mime === 'text/csv') return 'CSV'
  if (mime === 'application/json') return 'JSON'
  if (mime.startsWith('text/')) return 'Text'
  const extension = (upload.filename || '').split('.').pop()
  return extension && extension !== upload.filename ? extension.toUpperCase() : (mime || 'File')
}

export function formatSize(bytes: number): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / Math.pow(1024, index)).toFixed(index ? 1 : 0)} ${units[index]}`
}

// Present a pipeline error to the user: drop the internal "namespace:entry:line:"
// location prefix and humanize raw byte counts.
export function formatError(raw: string): string {
  let message = raw.trim().replace(/^[\w.]+:[\w.]+:\d+:\s*/, '')
  message = message.replace(/(\d{4,})\s*bytes/g, (_match, count) => formatSize(Number(count)))
  message = message.replace(/\(max\s+(\d{4,})\)/g, (_match, count) => `(max ${formatSize(Number(count))})`)
  return message ? message.charAt(0).toUpperCase() + message.slice(1) : message
}

const RAW_MIME_PREFIXES = ['image/', 'audio/', 'video/', 'text/']
const RAW_MIME_EXACT = new Set([
  'application/pdf',
  'application/json', 'application/xml', 'application/javascript', 'application/x-yaml', 'application/sql',
  'application/xhtml+xml',
])

export function isRawRenderable(mime: string): boolean {
  const normalized = (mime || '').toLowerCase()
  return RAW_MIME_PREFIXES.some((prefix) => normalized.startsWith(prefix)) || RAW_MIME_EXACT.has(normalized)
}

const TRANSCRIPTION_KEYS = ['ocr_error', 'asr_error', 'conversion_error']
const TRANSCRIPTION_MESSAGES: Record<string, string> = {
  transcription_failed: 'Text recognition failed.',
  persist_failed: 'The recognized text could not be saved.',
  storage_unavailable: 'The stored file could not be read.',
  storage_stat_failed: 'The stored file could not be read.',
  storage_read_failed: 'The stored file could not be read.',
  storage_pointer_missing: 'The stored file is missing.',
  no_text_detected: 'No text was found in this file.',
  too_large: 'The file is too large for transcription.',
  transcript_too_large: 'The transcript is too large to keep.',
}
const TRANSCRIPTION_OUTCOMES = new Set(['no_text_detected', 'too_large', 'transcript_too_large'])

export interface UploadNotice {
  tone: 'error' | 'info'
  text: string
}

export function transcriptionCode(upload: Upload): string {
  for (const key of TRANSCRIPTION_KEYS) {
    const code = upload.meta?.[key]
    if (typeof code === 'string' && code) return code
  }
  return ''
}

export function uploadNotice(upload: Upload): UploadNotice | null {
  const code = transcriptionCode(upload)
  if (isFailed(upload)) {
    const reason = TRANSCRIPTION_MESSAGES[code] || (code ? 'Text recognition failed.' : upload.error ? formatError(upload.error) : 'Upload processing failed.')
    return { tone: 'error', text: reason }
  }
  if (!code || normStatus(upload.status) !== 'completed') return null
  if (TRANSCRIPTION_OUTCOMES.has(code)) return { tone: 'info', text: TRANSCRIPTION_MESSAGES[code] }
  return { tone: 'info', text: `${TRANSCRIPTION_MESSAGES[code] || 'Text recognition did not complete.'} The extracted text is shown.` }
}

export function canPreview(upload: Upload): boolean {
  const status = normStatus(upload.status)
  return status === 'completed' || status === 'error'
}

const TERMINAL = new Set(['completed', 'error'])

export function isWorking(upload: Upload): boolean {
  return !TERMINAL.has(normStatus(upload.status))
}

export function isPrimaryMarkdown(artifact: UploadArtifact): boolean {
  return artifact.role === 'primary' && (artifact.kind === 'markdown' || artifact.mime_type === 'text/markdown')
}

export function artifactLabel(artifact: UploadArtifact): string {
  if (isPrimaryMarkdown(artifact)) return 'Markdown'
  if (artifact.role === 'extracted-image') return artifact.label || 'Image'
  return artifact.label || artifact.role || artifact.kind || artifact.artifact_id
}

export function artifactMeta(artifact: UploadArtifact): string {
  const dimensions = typeof artifact.metadata?.width === 'number' && typeof artifact.metadata?.height === 'number'
    ? `${artifact.metadata.width}×${artifact.metadata.height}`
    : null
  const bits = [
    isPrimaryMarkdown(artifact) ? 'Converted markdown' : (artifact.role === 'extracted-image' ? 'Extracted image' : artifact.kind),
    artifact.mime_type,
    artifact.size ? formatSize(artifact.size) : null,
    dimensions,
    artifact.occurrence_count && artifact.occurrence_count > 1 ? `${artifact.occurrence_count} occurrences` : null,
  ]
  return bits.filter(Boolean).join(' · ')
}

export function isTextualContent(contentType: string): boolean {
  const normalized = (contentType || '').toLowerCase()
  return normalized.startsWith('text/') || normalized.includes('markdown')
}

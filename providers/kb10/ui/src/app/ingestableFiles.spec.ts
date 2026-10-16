import { describe, expect, it } from 'vitest'
import { KNOWLEDGE_UPLOAD_ACCEPT, isKnowledgeIngestableFile } from './ingestableFiles'

describe('knowledge upload file support', () => {
  it('accepts files that the KB upload pipeline can extract into content', () => {
    expect(isKnowledgeIngestableFile(new File(['x'], 'note.md', { type: 'text/markdown' }))).toBe(true)
    expect(isKnowledgeIngestableFile(new File(['x'], 'data.json', { type: 'application/json' }))).toBe(true)
    expect(isKnowledgeIngestableFile(new File(['x'], 'report.pdf', { type: 'application/pdf' }))).toBe(true)
    expect(isKnowledgeIngestableFile(new File(['x'], 'slides.pptx', { type: '' }))).toBe(true)
  })

  it('rejects files outside the published accept list', () => {
    expect(isKnowledgeIngestableFile(new File(['x'], 'photo.png', { type: 'image/png' }))).toBe(false)
    expect(isKnowledgeIngestableFile(new File(['x'], 'vector.svg', { type: 'image/svg+xml' }))).toBe(false)
    expect(isKnowledgeIngestableFile(new File(['x'], 'archive.bin', { type: 'application/octet-stream' }))).toBe(false)
  })

  it('accepts extension-matched files when the browser does not report a MIME type', () => {
    expect(isKnowledgeIngestableFile(new File(['x'], 'meeting-notes.MD', { type: '' }))).toBe(true)
    expect(isKnowledgeIngestableFile(new File(['x'], '/tmp/export.CSV', { type: '' }))).toBe(true)
  })

  it('publishes an accept list for the KB file picker', () => {
    expect(KNOWLEDGE_UPLOAD_ACCEPT).toContain('.pdf')
    expect(KNOWLEDGE_UPLOAD_ACCEPT).toContain('text/*')
    expect(KNOWLEDGE_UPLOAD_ACCEPT).not.toContain('image/*')
  })
})

import { describe, it, expect } from 'vitest'
import { docBadge, docIcon, relativeTime, fullDate, chunkCount } from './docMeta'

const node = (o: any) => o as any

describe('docBadge', () => {
  it('maps known content types', () => {
    expect(docBadge(node({ content_type: 'application/pdf' }))).toBe('PDF')
    expect(docBadge(node({ content_type: 'text/markdown' }))).toBe('MD')
  })
  it('derives a badge from a filename extension', () => {
    expect(docBadge(node({ metadata: { filename: 'report.xlsx' } }))).toBe('XLSX')
    expect(docBadge(node({ metadata: { filename: 'data.weird' } }))).toBe('WEIRD')
  })
  it('falls back to URL / IMG / DOC', () => {
    expect(docBadge(node({ metadata: { source_url: 'http://x/y' } }))).toBe('URL')
    expect(docBadge(node({ content_type: 'image/png' }))).toBe('IMG')
    expect(docBadge(node({}))).toBe('DOC')
  })
})

describe('docIcon', () => {
  it('prefers source_url globe, then content-type icons', () => {
    expect(docIcon(node({ metadata: { source_url: 'x' } }))).toBe('tabler:world')
    expect(docIcon(node({ content_type: 'application/pdf' }))).toBe('tabler:file-type-pdf')
    expect(docIcon(node({ content_type: 'text/csv' }))).toBe('tabler:table')
    expect(docIcon(node({ content_type: 'image/jpeg' }))).toBe('tabler:photo')
    expect(docIcon(node({}))).toBe('tabler:file-text')
  })
})

describe('relativeTime', () => {
  it('returns empty for missing / invalid', () => {
    expect(relativeTime(undefined)).toBe('')
    expect(relativeTime('nope')).toBe('')
  })
  it('buckets recent times', () => {
    const now = Date.now()
    expect(relativeTime(new Date(now - 5000).toISOString())).toBe('just now')
    expect(relativeTime(new Date(now - 5 * 60_000).toISOString())).toBe('5m ago')
    expect(relativeTime(new Date(now - 3 * 3600_000).toISOString())).toBe('3h ago')
    expect(relativeTime(new Date(now - 2 * 86400_000).toISOString())).toBe('2d ago')
  })
})

describe('fullDate', () => {
  it('returns empty for missing / invalid, formats otherwise', () => {
    expect(fullDate(undefined)).toBe('')
    expect(fullDate('nope')).toBe('')
    expect(fullDate('2026-01-02T03:04:00Z').length).toBeGreaterThan(0)
  })
})

describe('chunkCount', () => {
  it('reads metadata.chunk_count or null', () => {
    expect(chunkCount(node({ metadata: { chunk_count: 12 } }))).toBe(12)
    expect(chunkCount(node({ metadata: {} }))).toBeNull()
    expect(chunkCount(node({}))).toBeNull()
  })
})

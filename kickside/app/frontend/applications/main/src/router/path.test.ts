import { describe, it, expect } from 'vitest'
import { normalizePath, resolveInitialPath } from './path'

describe('normalizePath', () => {
  it('empty / missing → /', () => {
    expect(normalizePath('')).toBe('/')
    expect(normalizePath(undefined)).toBe('/')
    expect(normalizePath(null)).toBe('/')
    expect(normalizePath('   ')).toBe('/')
  })
  it('adds a leading slash', () => {
    expect(normalizePath('system')).toBe('/system')
  })
  it('keeps an existing leading slash', () => {
    expect(normalizePath('/connections')).toBe('/connections')
  })
  it('trims surrounding whitespace', () => {
    expect(normalizePath('  /inbox  ')).toBe('/inbox')
  })
})

describe('resolveInitialPath (deep links)', () => {
  it('reads context.route (current Web Host)', () => {
    expect(resolveInitialPath({ context: { route: '/connections' } })).toBe('/connections')
  })
  it('normalizes a context.route without a leading slash', () => {
    expect(resolveInitialPath({ context: { route: 'system' } })).toBe('/system')
  })
  it('ignores retired config.path', () => {
    expect(resolveInitialPath({ path: '/inbox' })).toBe('/')
  })
  it('prefers context.route over path', () => {
    expect(resolveInitialPath({ context: { route: '/a' }, path: '/b' })).toBe('/a')
  })
  it('no route anywhere → home (not a reset surprise, the documented default)', () => {
    expect(resolveInitialPath({})).toBe('/')
    expect(resolveInitialPath(undefined)).toBe('/')
    expect(resolveInitialPath({ context: {} })).toBe('/')
  })
})

import { describe, expect, it } from 'vitest'
import { humanTitle, leafOf, looksLikeId, titleCase } from '../domain/labels'

describe('looksLikeId', () => {
  it('flags namespaced ids and dotted paths', () => {
    expect(looksLikeId('wippy.agent.tools:search_web')).toBe(true)
    expect(looksLikeId('app.views:main')).toBe(true)
    expect(looksLikeId('a.b.c')).toBe(true)
  })
  it('treats human titles as titles', () => {
    expect(looksLikeId('Search the web')).toBe(false)
    expect(looksLikeId('Send email')).toBe(false)
    expect(looksLikeId('v1.2')).toBe(false)
    expect(looksLikeId('')).toBe(false)
  })
})

describe('leafOf', () => {
  it('takes the last segment across : . and /', () => {
    expect(leafOf('wippy.agent.tools:search_web')).toBe('search_web')
    expect(leafOf('ns:group/leaf')).toBe('leaf')
    expect(leafOf('plain')).toBe('plain')
  })
})

describe('titleCase', () => {
  it('spaces and capitalizes machine leaves', () => {
    expect(titleCase('search_web')).toBe('Search Web')
    expect(titleCase('send-email-now')).toBe('Send Email Now')
    expect(titleCase('sendEmail')).toBe('Send Email')
  })
})

describe('humanTitle', () => {
  it('keeps a real title untouched', () => {
    expect(humanTitle('Search the web', 'wippy.agent.tools:search_web')).toBe('Search the web')
  })
  it('derives from the ref leaf when the title is empty', () => {
    expect(humanTitle('', 'wippy.agent.tools:search_web')).toBe('Search Web')
  })
  it('derives from the leaf when the title is itself an id', () => {
    expect(humanTitle('wippy.agent.tools:send_email', '')).toBe('Send Email')
  })
  it('never returns a raw ns:id', () => {
    const out = humanTitle('', 'some.deep.namespace:the_tool')
    expect(out).toBe('The Tool')
    expect(out).not.toContain(':')
    expect(out).not.toContain('.')
  })
  it('returns empty when nothing is available', () => {
    expect(humanTitle('', '')).toBe('')
  })
})

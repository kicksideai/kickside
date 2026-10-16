import { describe, expect, it } from 'vitest'
import { renderMarkdown } from './markdown'

describe('renderMarkdown', () => {
  it('returns empty for empty input', () => {
    expect(renderMarkdown('')).toBe('')
    expect(renderMarkdown(null)).toBe('')
  })

  it('escapes raw HTML so it cannot inject markup', () => {
    const out = renderMarkdown('<script>alert(1)</script>')
    expect(out).not.toContain('<script>')
    expect(out).toContain('&lt;script&gt;')
  })

  it('renders bold, italic and inline code', () => {
    expect(renderMarkdown('**b**')).toContain('<strong>b</strong>')
    expect(renderMarkdown('a *i* b')).toContain('<em>i</em>')
    expect(renderMarkdown('`code`')).toContain('<code>code</code>')
  })

  it('renders headings and lists', () => {
    expect(renderMarkdown('# Title')).toContain('<h1>Title</h1>')
    const list = renderMarkdown('- one\n- two')
    expect(list).toContain('<ul>')
    expect(list).toContain('<li>one</li>')
  })

  it('only allows http/https/mailto links', () => {
    expect(renderMarkdown('[x](https://a.com)')).toContain('href="https://a.com"')
    // javascript: URI is not matched by the link rule, so it stays inert text
    expect(renderMarkdown('[x](javascript:alert(1))')).not.toContain('href="javascript')
  })

  it('renders fenced code blocks with escaping', () => {
    const out = renderMarkdown('```\n<b>&\n```')
    expect(out).toContain('<pre><code>')
    expect(out).toContain('&lt;b&gt;&amp;')
  })
})

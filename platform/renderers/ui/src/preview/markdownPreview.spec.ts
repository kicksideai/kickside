import { describe, expect, it } from 'vitest'
import { MarkdownPreview } from './markdownPreview'

describe('paged markdown semantics', () => {
  it('keeps prose, multiple tables, inline markup and the sanitized trust boundary', () => {
    const preview = new MarkdownPreview('# Before\n\n| A | B |\n| --- | --- |\n| **bold** | [bad](javascript:alert(1)) |\n\nAfter\n\n| C |\n| --- |\n| <script>evil()</script> |')
    expect(preview.sizes).toEqual([
      { name: 'Table 1', rows: 1, columns: 2 }, { name: 'Table 2', rows: 1, columns: 1 },
    ])
    const html = preview.render()
    expect(html).toContain('<h1>Before</h1>')
    expect(html).toContain('<strong>bold</strong>')
    expect(html).toContain('<p>After</p>')
    expect(html).not.toContain('href="javascript:')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })
  it('supports a header-only table', () => {
    const preview = new MarkdownPreview('| Header |\n| --- |')
    expect(preview.sizes[0].rows).toBe(0)
    expect(preview.render()).toContain('Header')
  })
  it('clamps invalid page requests and keeps a last-page short row reachable', () => {
    const source = ['| A | B |', '| --- | --- |', ...Array.from({ length: 26 }, (_, i) => `| row${i} | |`)].join('\n')
    const preview = new MarkdownPreview(source)
    preview.setPage(0, { row: 100, column: -2 })
    expect(preview.pages[0]).toEqual({ row: 1, column: 0 })
    expect(preview.render()).toContain('row25')
    expect(preview.render()).not.toContain('row24')
  })
})


describe('large sheet rows', () => {
  it('preserves all 1121 rows and 289 columns beyond the parser cell limit', () => {
    const header = Array.from({ length: 289 }, (_, i) => `Header ${i}`)
    const rows = Array.from({ length: 1121 }, (_, i) =>
      Array.from({ length: 289 }, (_, c) => c < 220 ? `row-${i + 1}-col-${c}` : ''))
    rows[1120][288] = 'last physical cell'
    const source = [header.join(' | '), header.map(() => '---').join(' | '),
      ...rows.map(row => {
        const cells = [...row]
        while (cells.at(-1) === '') cells.pop()
        return '| ' + cells.join(' | ') + ' |'
      })].join('\n')
    const preview = new MarkdownPreview(source)
    expect(preview.sizes).toEqual([{ name: 'Table 1', rows: 1121, columns: 289 }])
    expect(preview.render()).not.toContain('row-1121')
    preview.setPage(0, { row: 44, column: 14 })
    const html = preview.render()
    expect(html).toContain('last physical cell')
    expect(html.match(/<tr>/g)).toHaveLength(22)
    expect(html).not.toContain('row-1-col-')
  })

  it('keeps escaped pipes, backslashes, empty cells and alignment while paging', () => {
    const preview = new MarkdownPreview(String.raw`| A | B | C |
| :--- | :---: | ---: |
| path\\\|leaf | **bold** | |
| | | last |`)
    expect(preview.sizes[0]).toEqual({ name: 'Table 1', rows: 2, columns: 3 })
    const html = preview.render()
    expect(html).toContain('path\\|leaf')
    expect(html).toContain('<strong>bold</strong>')
    expect(html).toContain('align="center"')
    expect(html).toContain('align="right"')
    expect(html.match(/<td/g)).toHaveLength(6)
  })
})


describe('sheet origin metadata', () => {
  it('hides origin comments without enabling raw HTML or hiding code examples', () => {
    const marker = '<!-- kickside:sheet header-row=4 column-start=3 -->'
    const preview = new MarkdownPreview(`## Products\n\n${marker}\n| SKU |\n| --- |\n| A-1 |\n\n<script>alert(1)</script>`)
    expect(preview.sizes).toEqual([{ name: 'Table 1', rows: 1, columns: 1 }])
    expect(preview.render()).not.toContain('kickside:sheet')
    expect(preview.render()).toContain('&lt;script&gt;')
    const example = new MarkdownPreview('```text\n' + marker + '\n```')
    expect(example.render()).toContain('kickside:sheet')
  })
})

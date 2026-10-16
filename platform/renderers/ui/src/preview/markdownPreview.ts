import type Token from 'markdown-it/lib/token.mjs'
import type StateBlock from 'markdown-it/lib/rules_block/state_block.mjs'
import { createMarkdownParser, sanitizeMarkdownHtml } from '../markdown'
import { COLUMNS_PER_PAGE, ROWS_PER_PAGE, pageNumber, type TablePage, type TableSize } from './protocol'

type Alignment = '' | 'left' | 'center' | 'right'
interface Table { header: string[]; rows: string[][]; aligns: Alignment[] }

function line(state: StateBlock, index: number): string {
  return state.src.slice(state.bMarks[index] + state.tShift[index], state.eMarks[index]).trim()
}

// Remove only the escape protecting a pipe; inline parsing handles the remaining
// backslashes. Outer pipes delimit the row rather than adding empty columns.
function cells(source: string): string[] {
  const result: string[] = []
  let cell = ''
  for (let i = 0; i < source.length; i++) {
    const ch = source[i]
    if (ch === '|' && source[i - 1] === '\\') cell = cell.slice(0, -1) + '|'
    else if (ch === '|') { result.push(cell.trim()); cell = '' }
    else cell += ch
  }
  result.push(cell.trim())
  if (source.startsWith('|')) result.shift()
  if (source.endsWith('|') && source.at(-2) !== '\\') result.pop()
  return result
}

// One structured token per table. No document-sized cell token expansion or
// inline parsing: only the requested page is rendered, inside the worker.
export class MarkdownPreview {
  private readonly md = createMarkdownParser()
  private readonly tokens: Token[]
  private readonly tables: Table[] = []
  readonly sizes: TableSize[] = []
  readonly pages: TablePage[] = []

  constructor(source: string) {
    this.md.block.ruler.at('table', (state, start, end, silent) => {
      if (start + 2 > end || state.sCount[start] - state.blkIndent >= 4 ||
          state.sCount[start + 1] < state.blkIndent || state.sCount[start + 1] - state.blkIndent >= 4) return false
      const divider = line(state, start + 1)
      if (!/^[-:|][-:| \t]*$/.test(divider) || /^-\s/.test(divider)) return false
      const separators = cells(divider)
      if (!separators.length || separators.some(cell => !/^:?-+:?$/.test(cell))) return false
      const title = line(state, start)
      const header = cells(title)
      if (!title.includes('|') || header.length !== separators.length) return false
      if (silent) return true
      const aligns: Alignment[] = separators.map(cell =>
        cell.endsWith(':') ? cell.startsWith(':') ? 'center' : 'right' : cell.startsWith(':') ? 'left' : '')
      const rows: string[][] = []
      const oldParent = state.parentType
      // Table continuation uses blockquote termination rules outside paragraph context.
      state.parentType = 'blockquote'
      const terminators = state.md.block.ruler.getRules('blockquote')
      let next = start + 2
      for (; next < end; next++) {
        if (state.sCount[next] < state.blkIndent || state.sCount[next] - state.blkIndent >= 4 ||
            terminators.some(rule => rule(state, next, end, true))) break
        const text = line(state, next)
        if (!text) break
        // Short rows stay sparse. Empty cells are materialized for one page only.
        rows.push(cells(text).slice(0, header.length))
      }
      state.parentType = oldParent
      const token = state.push('preview_table', 'table', 0)
      token.map = [start, next]
      token.content = String(this.tables.length)
      this.tables.push({ header, rows, aligns })
      this.sizes.push({ name: `Table ${this.tables.length}`, rows: rows.length, columns: header.length })
      this.pages.push({ row: 0, column: 0 })
      state.line = next
      return true
    }, { alt: ['paragraph', 'reference'] })
    this.md.renderer.rules.preview_table = (tokens, index) => this.renderTable(Number(tokens[index].content))
    this.tokens = this.md.parse(source, {})
  }

  setPage(table: number, page: TablePage): void {
    const size = this.sizes[table]
    if (!size) throw new Error('Unknown table')
    this.pages[table] = {
      row: pageNumber(page.row, size.rows, ROWS_PER_PAGE),
      column: pageNumber(page.column, size.columns, COLUMNS_PER_PAGE),
    }
  }

  private renderTable(index: number): string {
    const table = this.tables[index]
    const page = this.pages[index]
    const first = page.column * COLUMNS_PER_PAGE
    const last = Math.min(first + COLUMNS_PER_PAGE, table.header.length)
    const rowHtml = (row: string[], tag: 'th' | 'td') => {
      let html = '<tr>'
      for (let c = first; c < last; c++) {
        const align = table.aligns[c] ? ` align="${table.aligns[c]}"` : ''
        html += `<${tag}${align}>${this.md.renderInline(row[c] ?? '')}</${tag}>`
      }
      return html + '</tr>\n'
    }
    return `<table aria-label="Table ${index + 1}"><thead>${rowHtml(table.header, 'th')}</thead><tbody>` +
      table.rows.slice(page.row * ROWS_PER_PAGE, (page.row + 1) * ROWS_PER_PAGE)
        .map(row => rowHtml(row, 'td')).join('') + '</tbody></table>\n'
  }

  render(): string {
    return sanitizeMarkdownHtml(this.md.renderer.render(this.tokens, this.md.options, {}))
  }
}

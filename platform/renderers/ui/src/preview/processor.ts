import { COLUMNS_PER_PAGE, ROWS_PER_PAGE, pageNumber, type PreviewRequest, type PreviewResult, type TablePage, type TableSize } from './protocol'
import type { MarkdownPreview } from './markdownPreview'

export class PreviewProcessor {
  private markdown: MarkdownPreview | null = null
  private sheets: string[][][] = []
  private sizes: TableSize[] = []
  private pages: TablePage[] = []
  private active = 0

  async handle(request: PreviewRequest): Promise<PreviewResult> {
    if (request.action === 'markdown') {
      const { MarkdownPreview } = await import('./markdownPreview')
      this.markdown = new MarkdownPreview(request.source)
      this.sheets = []
    } else if (request.action === 'workbook') {
      const XLSX = await import('xlsx')
      const workbook = XLSX.read(request.bytes, { type: 'array' })
      this.markdown = null
      this.sheets = workbook.SheetNames.map(name =>
        XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[name], { header: 1, raw: false, defval: '', blankrows: true })
          .map(row => row.map(cell => String(cell ?? ''))))
      this.sizes = workbook.SheetNames.map((name, index) => ({
        name, rows: this.sheets[index].length,
        columns: this.sheets[index].reduce((max, row) => Math.max(max, row.length), 0),
      }))
      this.pages = this.sizes.map(() => ({ row: 0, column: 0 }))
      this.active = 0
    } else if (this.markdown) {
      this.markdown.setPage(request.table, request.page)
    } else {
      const size = this.sizes[request.table]
      if (!size) throw new Error('Unknown sheet')
      this.active = request.table
      this.pages[this.active] = {
        row: pageNumber(request.page.row, size.rows, ROWS_PER_PAGE),
        column: pageNumber(request.page.column, size.columns, COLUMNS_PER_PAGE),
      }
    }
    if (this.markdown) return {
      kind: 'markdown', tables: this.markdown.sizes, pages: this.markdown.pages, html: this.markdown.render(),
    }
    const page = this.pages[this.active] || { row: 0, column: 0 }
    const firstColumn = page.column * COLUMNS_PER_PAGE
    return {
      kind: 'workbook', tables: this.sizes, pages: this.pages, active: this.active,
      cells: (this.sheets[this.active] || []).slice(page.row * ROWS_PER_PAGE, (page.row + 1) * ROWS_PER_PAGE)
        .map(row => row.slice(firstColumn, firstColumn + COLUMNS_PER_PAGE)),
    }
  }
}

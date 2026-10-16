// Paging state behind wc-multiselect's result panel: the first page of a level
// (the top, or one container drilled into), then each following page by the
// cursor the previous page returned. Search text goes to the source when it
// searches server-side; otherwise it filters the rows loaded so far, and
// `filtersLocally` says so. A response to a request the user has since
// replaced (another level, query, or source) is dropped, so rows of an older
// request never mix into the current list.

export interface PickRow {
  // Selection value (the id-key field); empty for a row that carries none.
  value: string
  // Id sent as parent_id when the row is drilled into (the drill-key field).
  drillId: string
  label: string
  description: string
  icon: string
  meta: string
  selectable: boolean
  drillable: boolean
  raw: Record<string, unknown>
}

export interface PageRequest {
  q?: string
  cursor?: string
  parentId?: string
}

export interface Page {
  rows: PickRow[]
  nextCursor: string | null
  // The source's own declaration of server-side search, when it makes one.
  search?: boolean
}

export type FetchPage = (request: PageRequest) => Promise<Page>

export interface Level {
  id: string
  label: string
}

export type SearchMode = 'server' | 'local'

function rowKey(row: PickRow): string {
  return row.drillId || row.value
}

export class ResourcePager {
  rows: PickRow[] = []
  query = ''
  nextCursor: string | null = null
  loading = false
  loaded = false
  error: unknown = null
  serverSearch: boolean
  // The containers drilled into, outermost first.
  trail: Level[] = []
  private generation = 0
  private failedCursor: string | null = null

  constructor(private fetchPage: FetchPage, private declared: SearchMode = 'server') {
    this.serverSearch = declared === 'server'
  }

  get hasMore(): boolean {
    return this.nextCursor !== null
  }

  // The search text is applied to the loaded rows here, not by the source.
  get filtersLocally(): boolean {
    return !this.serverSearch && this.query !== ''
  }

  get visible(): PickRow[] {
    if (!this.filtersLocally) return this.rows
    const needle = this.query.toLowerCase()
    return this.rows.filter(r =>
      r.label.toLowerCase().includes(needle) ||
      r.value.toLowerCase().includes(needle) ||
      r.description.toLowerCase().includes(needle))
  }

  get parentId(): string {
    return this.trail.length ? this.trail[this.trail.length - 1].id : ''
  }

  // Point the pager at another source (or search mode) and forget everything
  // loaded from the previous one.
  configure(fetchPage: FetchPage, declared: SearchMode): void {
    this.fetchPage = fetchPage
    this.declared = declared
    this.serverSearch = declared === 'server'
    this.trail = []
    this.query = ''
    this.clear()
  }

  // Start over at the current level for a search text (empty lists
  // everything). A source that cannot search keeps its loaded rows and only
  // filters them.
  search(q: string): Promise<void> {
    this.query = q.trim()
    if (!this.serverSearch && this.loaded) return Promise.resolve()
    return this.restart()
  }

  drill(row: PickRow): Promise<void> {
    if (!row.drillable || !row.drillId) return Promise.resolve()
    this.trail = [...this.trail, { id: row.drillId, label: row.label }]
    return this.restart()
  }

  // Go back to the level at `depth` (0 is the top).
  up(depth: number): Promise<void> {
    if (depth < 0 || depth >= this.trail.length) return Promise.resolve()
    this.trail = this.trail.slice(0, depth)
    return this.restart()
  }

  loadMore(): Promise<void> {
    if (this.loading || this.nextCursor === null) return Promise.resolve()
    return this.load(this.nextCursor)
  }

  // Repeat the request that failed: the next page when rows are already
  // loaded, the first page of the level otherwise.
  retry(): Promise<void> {
    if (this.failedCursor !== null && this.rows.length) return this.load(this.failedCursor)
    return this.restart()
  }

  restart(): Promise<void> {
    this.clear()
    return this.load(null)
  }

  private clear(): void {
    this.generation++
    this.rows = []
    this.nextCursor = null
    this.loaded = false
    this.loading = false
    this.error = null
    this.failedCursor = null
  }

  private async load(cursor: string | null): Promise<void> {
    const generation = ++this.generation
    this.loading = true
    this.error = null
    const sentQuery = this.serverSearch && this.query ? this.query : ''
    const request: PageRequest = {}
    if (sentQuery) request.q = sentQuery
    if (cursor) request.cursor = cursor
    if (this.parentId) request.parentId = this.parentId
    try {
      const page = await this.fetchPage(request)
      if (generation !== this.generation) return
      const seen = new Set(this.rows.map(rowKey))
      const fresh = page.rows.filter(r => !seen.has(rowKey(r)))
      this.rows = [...this.rows, ...fresh]
      this.nextCursor = page.nextCursor || null
      this.loaded = true
      this.failedCursor = null
      this.loading = false
      if (typeof page.search === 'boolean' && page.search !== this.serverSearch) {
        this.serverSearch = page.search
        // The source searches after all: the rows answer no query, so ask again.
        if (page.search && this.query && !sentQuery) await this.restart()
      }
    } catch (cause) {
      if (generation !== this.generation) return
      this.error = cause
      this.failedCursor = cursor
      this.loading = false
    }
  }
}

export function toggleValue(selected: string[], value: string): string[] {
  return selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value]
}

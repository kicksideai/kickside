import { api } from '@wippy-fe/proxy'

export interface ToolCatalogRow { id: string; title?: string; icon?: string; llm_alias?: string; llm_description?: string }

interface ToolCatalogPage { success?: boolean; tools?: ToolCatalogRow[]; next_cursor?: string }

export async function loadToolCatalog(): Promise<ToolCatalogRow[]> {
  const rows: ToolCatalogRow[] = []
  const seen = new Set<string>()
  const cursors = new Set<string>()
  let cursor: string | undefined
  do {
    const query = new URLSearchParams({ limit: '100' })
    if (cursor) query.set('cursor', cursor)
    const { data } = await api.get(`/api/v1/agents/tools?${query.toString()}`)
    const page = data as ToolCatalogPage
    if (!page?.success) throw new Error('could not load tools')
    for (const row of page.tools || []) {
      if (row.id && !seen.has(row.id)) {
        seen.add(row.id)
        rows.push(row)
      }
    }
    const next = typeof page.next_cursor === 'string' && page.next_cursor ? page.next_cursor : undefined
    if (next && cursors.has(next)) throw new Error('tool catalog pagination did not advance')
    if (next) cursors.add(next)
    cursor = next
  } while (cursor)
  return rows
}

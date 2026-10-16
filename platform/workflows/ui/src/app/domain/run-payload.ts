export interface RunNodeDataRow {
  data_id: string
  node_id: string
  type: string
  content: unknown
  content_type?: string
  discriminator?: string
  created_at?: string
}

function decodeContent(raw: unknown, contentType: unknown): unknown {
  if (typeof raw === 'string' && String(contentType || '').includes('json')) {
    try {
      return JSON.parse(raw)
    } catch {
      return raw
    }
  }
  return raw
}

// Convert the transport representation once, before run inspection or samples
// interpret it. Consumers never need to know that JSON payloads arrived as strings.
export function decodeRunNodeRows(rows: Record<string, unknown>[]): RunNodeDataRow[] {
  return rows.map((row) => ({
    data_id: String(row.data_id || ''),
    node_id: String(row.node_id || ''),
    type: String(row.type || row.data_type || ''),
    content: decodeContent(row.content, row.content_type),
    content_type: row.content_type != null ? String(row.content_type) : undefined,
    discriminator: row.discriminator != null ? String(row.discriminator) : undefined,
    created_at: row.created_at != null ? String(row.created_at) : undefined,
  }))
}

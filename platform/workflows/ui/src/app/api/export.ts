// Flow artifacts are source only, never compiled commands. Export is READ-gated and
// published-only; import sends the immutable artifact unchanged and creates a new draft.

import { api } from '@wippy-fe/proxy'
import { asRecord, get, serverMessage } from './http'

export interface FlowArtifact {
  api_version: 'kickside.flow/v1'
  key: string
  kind: 'flow'
  title: string
  version: number
  refs: unknown[]
  document: Record<string, unknown>
  checksum: string
}

function importRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function flowArtifact(value: unknown): FlowArtifact {
  const flow = importRecord(value)
  const document = importRecord(flow.document)
  if (
    flow.api_version !== 'kickside.flow/v1'
    || flow.kind !== 'flow'
    || typeof flow.key !== 'string' || !flow.key.trim()
    || typeof flow.title !== 'string' || !flow.title.trim()
    || !Number.isInteger(flow.version) || Number(flow.version) < 1
    || !Array.isArray(flow.refs)
    || !Object.keys(document).length
    || typeof flow.checksum !== 'string' || !/^[0-9a-f]{64}$/.test(flow.checksum)
  ) throw new Error('The server returned an invalid Workflow artifact.')
  return {
    api_version: 'kickside.flow/v1',
    key: flow.key,
    kind: 'flow',
    title: flow.title,
    version: Number(flow.version),
    refs: flow.refs,
    document,
    checksum: flow.checksum,
  }
}

export async function exportWorkflow(id: string): Promise<FlowArtifact> {
  const data = await get(`/api/v1/workflows/${encodeURIComponent(id)}/export`)
  return flowArtifact(data.flow)
}

// POST the exact exported artifact. The server verifies its checksum, resolves declared
// refs, and chooses the distinct draft title; the client never rewrites signed source.
export async function importWorkflow(flow: unknown): Promise<{ flowId: string; title: string }> {
  let data: unknown
  try {
    data = (await api.post('/api/v1/workflows/import', { flow, bindings: {} })).data
  } catch (e) {
    const msg = serverMessage(e)
    if (msg) throw new Error(msg)
    throw e
  }
  const d = asRecord(data)
  if (d.success === false) throw new Error(String(d.error || 'import failed'))
  const imported = asRecord(d.flow)
  const flowId = String(imported.flow_id || '')
  if (!flowId) throw new Error('the server did not return a flow id')
  return { flowId, title: String(imported.title || 'Imported Workflow') }
}

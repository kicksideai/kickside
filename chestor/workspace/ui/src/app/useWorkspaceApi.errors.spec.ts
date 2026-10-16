import { describe, expect, it } from 'vitest'
import { useWorkspaceApi } from './useWorkspaceApi'
describe('workspace transport errors', () => {
  it('preserves the public server sentence when folder loading rejects', async () => {
    ;(globalThis as any).__host_api__.get.mockRejectedValueOnce(Object.assign(new Error('Request failed with status code 503'), { response: { data: { error: 'Northwind folder is temporarily unavailable.' } } }))
    await expect(useWorkspaceApi().list(null)).rejects.toThrow('Northwind folder is temporarily unavailable.')
  })
})
describe('workspace delete outcome', () => {
  it('reports accepted cleanup progress for a delete still in progress', async () => {
    ;(globalThis as any).__host_api__.delete.mockResolvedValueOnce({ data: { success: true, deleted: true, in_progress: true, status: 'in_progress' } })
    await expect(useWorkspaceApi().remove('entry-1')).resolves.toEqual({ inProgress: true })
  })

  it('reports a completed delete as finished', async () => {
    ;(globalThis as any).__host_api__.delete.mockResolvedValueOnce({ data: { success: true, deleted: true, in_progress: false } })
    await expect(useWorkspaceApi().remove('entry-1')).resolves.toEqual({ inProgress: false })
  })
})

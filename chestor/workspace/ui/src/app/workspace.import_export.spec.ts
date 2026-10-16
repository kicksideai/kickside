import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Workspace from './Workspace.vue'
import { useWorkspaceApi } from './useWorkspaceApi'

const stubs = {
  Icon: { template: '<span />' },
  IconField: { template: '<span />' },
  ShareHost: { template: '<div />' },
  EntryRenderer: { template: '<div />' },
  ComponentView: { template: '<div />' },
}

function resetApi() {
  ;(globalThis as any).__props__ = { route: '' }
  ;(globalThis as any).__events__ = []
  ;(globalThis as any).__calls__ = []
  ;(globalThis as any).__api__ = {
    '/api/v1/workspace/entries/types': { success: true, types: [] },
    '/api/v1/workspace/entries': { success: true, entries: [] },
    '/api/v1/uploads': { success: true, uuid: 'upload-1' },
  }
}

describe('workspace import/export surface', () => {
  beforeEach(resetApi)

  it('does not render a separate import-bundle button or input', async () => {
    const w = mount(Workspace, { global: { stubs } })
    await flushPromises()

    expect(w.text().toLowerCase()).not.toContain('import')
    expect(w.find('input[accept=".kxb"]').exists()).toBe(false)
    expect(w.find('button[aria-label="Upload files"]').exists()).toBe(true)
    w.unmount()
  })

  it('sends .kxb drops through the shared uploads path with workspace placement metadata', async () => {
    const w = mount(Workspace, { global: { stubs } })
    await flushPromises()

    await w.find('.ws-list-pane').trigger('drop', {
      dataTransfer: { files: [new File(['bundle'], 'export.kxb', { type: 'application/octet-stream' })] },
    })
    await flushPromises()

    const calls = (globalThis as any).__calls__ as any[]
    const upload = calls.find((c) => c.method === 'post' && c.url === '/api/v1/uploads')
    expect(upload).toBeTruthy()
    expect(calls.some((c) => String(c.url).includes('/api/v1/transfer/import'))).toBe(false)
    const metadata = JSON.parse((upload.body as FormData).get('metadata') as string)
    expect(metadata).toEqual({ target_parent_id: '', filename: 'export.kxb' })
    w.unmount()
  })

  it('keeps export as a transfer download operation only from selected entries', async () => {
    ;(globalThis as any).__api__['/api/v1/transfer/export'] = new Blob(['kxb'])
    const api = useWorkspaceApi()

    await api.exportEntry('entry-1')

    const calls = (globalThis as any).__calls__ as any[]
    expect(calls).toContainEqual(expect.objectContaining({
      method: 'post',
      url: '/api/v1/transfer/export',
      body: { component_ids: ['entry-1'] },
    }))
  })
})

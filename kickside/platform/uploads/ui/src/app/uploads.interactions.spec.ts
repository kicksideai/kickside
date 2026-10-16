import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Uploads from './uploads.vue'
beforeEach(() => {
  ;(globalThis as any).__uploadHandlers__ = []
  ;(globalThis as any).__calls__ = []
  ;(globalThis as any).__api__ = {
    '/uploads/list': { success: true, uploads: [
      { uuid: 'u1', filename: 'a.pdf', status: 'completed', size: 1024, mime_type: 'application/pdf' },
      { uuid: 'u2', filename: 'b.txt', status: 'processing', size: 50, mime_type: 'text/plain' },
    ], component_id: 'uploads-u1' },
    '/uploads/u1/artifacts': { success: true, artifacts: [
      {
        artifact_id: 'src',
        upload_id: 'u1',
        kind: 'file',
        role: 'source',
        mime_type: 'application/pdf',
        label: 'a.pdf',
        size: 1024,
        raw_url: '/api/v1/uploads/u1/artifacts/src/raw',
        locator: { type: 'upload.original' },
      },
      {
        artifact_id: 'md',
        upload_id: 'u1',
        kind: 'markdown',
        role: 'primary',
        mime_type: 'text/markdown',
        label: 'a.md',
        size: 80,
        raw_url: '/api/v1/uploads/u1/artifacts/md/raw',
      },
      {
        artifact_id: 'a1',
        upload_id: 'u1',
        kind: 'image',
        role: 'extracted-image',
        mime_type: 'image/png',
        label: 'figure-1.png',
        size: 42,
        raw_url: '/api/v1/uploads/u1/artifacts/a1/raw',
      },
    ] },
  }
})
describe('uploads.vue interactions', () => {
  it('uses PrimeVue for the header and empty-state upload actions', async () => {
    const pickerClick = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {})
    const populated = mount(Uploads)
    await flushPromises()
    const header = populated.find('[data-testid="uploads-header-upload"]')
    expect(header.classes()).toContain('p-button')
    expect(header.text()).toContain('Upload')
    await header.trigger('click')
    expect(pickerClick).toHaveBeenCalledTimes(1)
    populated.unmount()

    ;(globalThis as any).__api__['/uploads/list'] = {
      success: true,
      component_id: 'uploads-u1',
      uploads: [],
    }
    const empty = mount(Uploads)
    await flushPromises()
    const emptyAction = empty.find('[data-testid="uploads-empty-upload"]')
    expect(emptyAction.classes()).toContain('p-button')
    expect(emptyAction.text()).toContain('Upload files')
    await emptyAction.trigger('click')
    expect(pickerClick).toHaveBeenCalledTimes(2)
    empty.unmount()
    pickerClick.mockRestore()
  })

  it('uses PrimeVue search and debounces query and clear requests', async () => {
    const { api } = await import('@wippy-fe/proxy') as any
    const w = mount(Uploads)
    await flushPromises()
    expect(w.html()).toContain('a.pdf')
    const input = w.find('[data-testid="uploads-search-input"]')
    expect(input.classes()).toContain('p-inputtext')
    expect(input.classes()).not.toContain('p-inputtext-sm')
    expect(input.attributes('aria-label')).toBe('Search files')
    expect(w.find('[data-testid="uploads-search-clear"]').exists()).toBe(false)

    api.get.mockClear()
    await input.setValue('  a.pdf  ')
    const clear = w.find('[data-testid="uploads-search-clear"]')
    expect(clear.classes()).toContain('p-button')
    expect(clear.attributes('aria-label')).toBe('Clear search')
    await vi.advanceTimersByTimeAsync(299)
    expect(api.get).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    await flushPromises()
    expect(api.get).toHaveBeenCalledTimes(1)
    expect(api.get).toHaveBeenLastCalledWith('/api/v1/uploads/list', {
      params: { limit: 30, offset: 0, q: 'a.pdf' },
    })

    await clear.trigger('click')
    expect((input.element as HTMLInputElement).value).toBe('')
    expect(w.find('[data-testid="uploads-search-clear"]').exists()).toBe(false)
    await vi.advanceTimersByTimeAsync(300)
    await flushPromises()
    expect(api.get).toHaveBeenCalledTimes(2)
    expect(api.get).toHaveBeenLastCalledWith('/api/v1/uploads/list', {
      params: { limit: 30, offset: 0 },
    })
    w.unmount()
  })

  it('uses PrimeVue pagination and requests exact page offsets', async () => {
    const { api } = await import('@wippy-fe/proxy') as any
    const upload = (index: number) => ({
      uuid: `page-${index}`,
      filename: `page-${index}.txt`,
      status: 'completed',
      size: index,
      mime_type: 'text/plain',
    })
    api.get.mockClear()
    api.get
      .mockImplementationOnce(() => Promise.resolve({
        data: { success: true, uploads: Array.from({ length: 30 }, (_, i) => upload(i + 1)), meta: { total: 61 } },
      }))
      .mockImplementationOnce(() => Promise.resolve({
        data: { success: true, uploads: Array.from({ length: 30 }, (_, i) => upload(i + 31)), meta: { total: 61 } },
      }))
      .mockImplementationOnce(() => Promise.resolve({
        data: { success: true, uploads: [upload(61)], meta: { total: 61 } },
      }))

    const w = mount(Uploads)
    await flushPromises()
    const pager = w.find('[data-testid="uploads-pager"]')
    expect(pager.find('.p-paginator').exists()).toBe(true)
    const previous = w.find('[data-testid="uploads-pager-previous"]')
    const next = w.find('[data-testid="uploads-pager-next"]')
    expect(pager.find('.p-paginator-current').text()).toBe('1–30 of 61')
    expect(pager.find('[aria-current="page"]').text()).toBe('1')
    expect(previous.attributes('disabled')).toBeDefined()
    expect(next.attributes('disabled')).toBeUndefined()

    await next.trigger('click')
    await flushPromises()
    expect(api.get).toHaveBeenLastCalledWith('/api/v1/uploads/list', {
      params: { limit: 30, offset: 30 },
    })
    expect(pager.find('.p-paginator-current').text()).toBe('31–60 of 61')
    expect(pager.find('[aria-current="page"]').text()).toBe('2')
    expect(previous.attributes('disabled')).toBeUndefined()
    expect(next.attributes('disabled')).toBeUndefined()

    await next.trigger('click')
    await flushPromises()
    expect(api.get).toHaveBeenLastCalledWith('/api/v1/uploads/list', {
      params: { limit: 30, offset: 60 },
    })
    expect(pager.find('.p-paginator-current').text()).toBe('61–61 of 61')
    expect(pager.find('[aria-current="page"]').text()).toBe('3')
    expect(previous.attributes('disabled')).toBeUndefined()
    expect(next.attributes('disabled')).toBeDefined()
    expect(api.get).toHaveBeenCalledTimes(3)
    w.unmount()
  })

  it('loads extracted parts and previews one on click in the side panel', async () => {
    ;(globalThis as any).__api__['/uploads/u1/artifacts'].artifacts.push({
      artifact_id: 'a2',
      upload_id: 'u1',
      kind: 'image',
      role: 'extracted-image',
      mime_type: 'image/png',
      label: 'unavailable-part.png',
      size: 42,
      raw_url: null,
    })
    const w = mount(Uploads)
    await flushPromises()
    await w.find('[data-testid="uploads-row-preview"]').trigger('click')
    await flushPromises()
    // Parts auto-load into a chip strip (no hidden tab); the part chip is present.
    expect(w.findAll('.kx-part').some((b) => b.text().includes('a.pdf'))).toBe(false)
    expect(w.findAll('.kx-part').some((b) => b.text().includes('Markdown'))).toBe(true)
    const file = w.find('[data-testid="uploads-view-file"]')
    const markdown = w.find('[data-testid="uploads-view-markdown"]')
    expect(file.classes()).toContain('p-button')
    expect(file.classes()).not.toContain('p-button-outlined')
    expect(file.attributes('aria-pressed')).toBe('true')
    expect(markdown.classes()).toContain('p-button')
    expect(markdown.classes()).toContain('p-button-outlined')
    await markdown.trigger('click')
    await flushPromises()
    expect(w.find('.kx-pv-rv').attributes('source-url')).toBe('/api/v1/uploads/u1/artifacts/md/raw')
    expect(markdown.attributes('aria-pressed')).toBe('true')
    const chip = w.findAll('.kx-part').find((b) => b.text().includes('figure-1.png'))
    expect(chip).toBeTruthy()
    expect(chip!.classes()).toContain('p-button')
    expect(chip!.classes()).toContain('p-button-outlined')
    const unavailable = w.find('[data-artifact-id="a2"]')
    expect(unavailable.classes()).toContain('p-button')
    expect(unavailable.attributes('disabled')).toBeDefined()
    await chip!.trigger('click')
    await flushPromises()
    // Clicking the chip points the (always-visible) viewer at the part's raw URL.
    expect(w.find('.kx-pv-rv').attributes('source-url')).toBe('/api/v1/uploads/u1/artifacts/a1/raw')
    expect(chip!.attributes('aria-pressed')).toBe('true')
    expect(chip!.classes()).not.toContain('p-button-outlined')
    await file.trigger('click')
    await flushPromises()
    expect(w.find('.kx-pv-rv').attributes('source-url')).toBe('/api/v1/uploads/u1/raw')
    expect(file.attributes('aria-pressed')).toBe('true')
    w.unmount()
  })

  it('uses PrimeVue for every shared icon action', async () => {
    const extracted = Array.from({ length: 51 }, (_, i) => ({
      artifact_id: `part-${i + 1}`,
      upload_id: 'u1',
      kind: 'image',
      role: 'extracted-image',
      mime_type: 'image/png',
      label: `figure-${i + 1}.png`,
      size: 42,
      raw_url: `/api/v1/uploads/u1/artifacts/part-${i + 1}/raw`,
    }))
    ;(globalThis as any).__api__['/uploads/u1/artifacts'] = {
      success: true,
      artifacts: extracted,
      meta: { total: extracted.length },
    }

    const w = mount(Uploads)
    await flushPromises()
    const rowPreview = w.find('[data-testid="uploads-row-preview"]')
    const rowDelete = w.find('[data-testid="uploads-row-delete"]')
    expect(rowPreview.classes()).toContain('p-button')
    expect(rowDelete.classes()).toContain('p-button')
    expect(rowDelete.classes()).toContain('p-button-danger')
    for (const row of w.findAll('.kx-row')) {
      expect(row.attributes('role')).toBeUndefined()
      expect(row.attributes('tabindex')).toBeUndefined()
      expect(row.attributes('aria-label')).toBeUndefined()
    }
    expect(w.findAll('.kx-row')[0].findAll('button')).toHaveLength(2)
    expect(w.findAll('.kx-row')[1].findAll('button')).toHaveLength(1)

    await w.findAll('.kx-row')[0].trigger('click')
    await flushPromises()
    expect(w.find('[data-testid="uploads-preview-close"]').exists()).toBe(false)

    await rowPreview.trigger('click')
    await flushPromises()
    for (const testId of [
      'uploads-preview-download',
      'uploads-preview-open',
      'uploads-preview-close',
    ]) {
      expect(w.find(`[data-testid="${testId}"]`).classes()).toContain('p-button')
    }

    const disclosure = w.find('[data-testid="uploads-parts-toggle"]')
    const region = w.find('#uploads-extracted-parts')
    expect(disclosure.classes()).toContain('p-button')
    expect(disclosure.find('.p-badge').text()).toBe('51')
    expect(disclosure.attributes('aria-expanded')).toBe('false')
    expect(disclosure.attributes('aria-controls')).toBe('uploads-extracted-parts')
    expect(region.attributes('role')).toBe('region')
    expect(region.attributes('aria-label')).toBe('Extracted parts')
    expect(region.attributes('style')).toContain('display: none')
    await disclosure.trigger('click')
    await flushPromises()
    expect(disclosure.attributes('aria-expanded')).toBe('true')
    expect(region.attributes('style') || '').not.toContain('display: none')
    const previous = w.find('[data-testid="uploads-parts-previous"]')
    const next = w.find('[data-testid="uploads-parts-next"]')
    expect(previous.classes()).toContain('p-button')
    expect(previous.attributes('disabled')).toBeDefined()
    expect(next.classes()).toContain('p-button')
    expect(next.attributes('disabled')).toBeUndefined()
    await next.trigger('click')
    await flushPromises()
    expect(w.find('.kx-parts-pageno').text()).toBe('2 / 2')
    expect(previous.attributes('disabled')).toBeUndefined()
    expect(next.attributes('disabled')).toBeDefined()
    w.unmount()
  })

  it('renders an error-status upload as an error row with its reason', async () => {
    ;(globalThis as any).__api__['/uploads/list'] = {
      success: true,
      component_id: 'uploads-u1',
      uploads: [
        { uuid: 'u1', filename: 'a.pdf', status: 'error', size: 1024, mime_type: 'application/pdf', error: 'boom' },
      ],
    }
    const w = mount(Uploads)
    await flushPromises()
    const row = w.find('.kx-row')
    expect(row.text()).toContain('Error')
    expect(row.find('.p-tag-danger').exists()).toBe(true)
    expect(row.find('.kx-err-reason').text().toLowerCase()).toContain('boom')
    w.unmount()
  })

  it('renders a stored failed status through the canonical error label', async () => {
    ;(globalThis as any).__api__['/uploads/list'] = {
      success: true,
      component_id: 'uploads-u1',
      uploads: [
        { uuid: 'u1', filename: 'a.pdf', status: 'failed', size: 1024, mime_type: 'application/pdf', error: 'boom' },
      ],
    }
    const w = mount(Uploads)
    await flushPromises()
    const row = w.find('.kx-row')
    expect(row.text()).toContain('Error')
    expect(row.text()).not.toContain('Failed')
    expect(row.find('.p-tag-danger').exists()).toBe(true)
    w.unmount()
  })

  it('refreshes pending rows on the canonical component.meta.changed event', async () => {
    const w = mount(Uploads)
    await flushPromises()
    expect(w.html()).toContain('Processing')
    ;(globalThis as any).__api__['/uploads/list'] = {
      success: true,
      component_id: 'uploads-u1',
      uploads: [
        { uuid: 'u1', filename: 'a.pdf', status: 'completed', size: 1024, mime_type: 'application/pdf' },
        { uuid: 'u2', filename: 'b.txt', status: 'completed', size: 50, mime_type: 'text/plain' },
      ],
    }
    ;(globalThis as any).__uploadEmit__({
      topic: 'component.uploads-u1',
      data: { event: 'component.meta.changed', component_id: 'uploads-u1', meta: { status: 'ready', file_count: 2, pending_count: 0 } },
    })
    await flushPromises()
    expect(w.findAll('.kx-row')[1].text()).toContain('Completed')
    w.unmount()
  })

  it('states that upload delete removes workspace links', async () => {
    const { host } = await import('@wippy-fe/proxy') as any
    host.confirm.mockClear()
    const w = mount(Uploads)
    await flushPromises()
    await w.find('[data-testid="uploads-row-delete"]').trigger('click')
    await flushPromises()
    // Delete confirmation runs through the host confirm dialog; assert it was asked
    // with the workspace-links warning as its message.
    expect(host.confirm).toHaveBeenCalled()
    expect(host.confirm.mock.calls[0][0].message).toContain('Deletes the file everywhere; workspace links are removed.')
    expect((globalThis as any).__calls__).toContainEqual({ method: 'delete', url: '/api/v1/uploads/u1' })
    w.unmount()
  })

  it('does not delete when upload removal is canceled', async () => {
    const { host } = await import('@wippy-fe/proxy') as any
    host.confirm.mockResolvedValueOnce(false)
    const w = mount(Uploads)
    await flushPromises()
    await w.find('[data-testid="uploads-row-delete"]').trigger('click')
    await flushPromises()
    expect((globalThis as any).__calls__.some((call: any) => call.method === 'delete')).toBe(false)
    expect(w.text()).toContain('a.pdf')
    w.unmount()
  })

  it('sends transfer bundles through the shared upload pipeline', async () => {
    const w = mount(Uploads)
    await flushPromises()

    await w.find('.kx-drop').trigger('drop', {
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
})

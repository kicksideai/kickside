// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { api } from '@wippy-fe/proxy'
import { useUploadArtifacts } from './useUploadArtifacts'
import type { Upload, UploadArtifact } from './uploads.types'
vi.mock('@wippy-fe/proxy', () => ({ api: { get: vi.fn() } }))
const get = vi.mocked(api.get)
const original = { uuid: 'file', filename: 'report.pdf', mime_type: 'application/pdf', status: 'completed', size: 9, created_at: 0,
  raw_url: 'https://objects.example/file?signature=original' } as Upload
const part = { artifact_id: 'page', upload_id: 'file', kind: 'image', role: 'part', mime_type: 'image/png', label: 'page.png',
  raw_url: 'https://objects.example/page?signature=part' } as UploadArtifact

afterEach(() => { vi.restoreAllMocks(); get.mockReset() })
describe('upload delivery URLs', () => {
  it('previews the original and artifacts using their API delivery URLs', () => {
    const state = useUploadArtifacts(ref(''))
    state.preview.value = original
    expect(state.activePreviewSource(original).sourceUrl).toBe(original.raw_url)
    state.viewArtifact(part)
    expect(state.activePreviewSource(original).sourceUrl).toBe(part.raw_url)
    state.viewOriginal()
    expect(state.activePreviewSource(original).sourceUrl).toBe(original.raw_url)
    const local = { ...original, raw_url: '/api/v1/uploads/file/raw' }
    expect(state.activePreviewSource(local).sourceUrl).toBe(local.raw_url)
  })
  it('downloads derived content with the artifact record label', async () => {
    const state = useUploadArtifacts(ref(''))
    state.preview.value = original
    state.viewArtifact({ ...part, kind: 'markdown', role: 'primary', mime_type: 'text/markdown', label: 'report.md' })
    get.mockResolvedValue({data: new Blob(['markdown'])} as never)
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:markdown')
    let filename = ''
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function(this: HTMLAnchorElement) {
      filename = this.download
    })
    await state.downloadActive()
    expect(filename).toBe('report.md')
    expect(get).toHaveBeenLastCalledWith(part.raw_url, {responseType: 'blob'})
  })
  it('downloads and opens the API URL with the record filename', async () => {
    const state = useUploadArtifacts(ref(''))
    state.preview.value = original
    get.mockResolvedValue({data: new Blob(['bytes'])} as never)
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function(this: HTMLAnchorElement) {
      expect(this.download).toBe('report.pdf')
      expect(this.href).toBe('blob:test')
    })
    await state.downloadActive()
    expect(get).toHaveBeenLastCalledWith(original.raw_url, {responseType: 'blob'})
    expect(click).toHaveBeenCalledOnce()
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    await state.openActive()
    expect(get).toHaveBeenLastCalledWith(original.raw_url, {responseType: 'blob'})
    expect(open).toHaveBeenCalledWith('blob:test', '_blank', 'noopener')
    state.viewArtifact(part)
    await state.openActive()
    expect(get).toHaveBeenLastCalledWith(part.raw_url, {responseType: 'blob'})
  })
})

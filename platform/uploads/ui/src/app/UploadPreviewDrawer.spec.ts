// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UploadPreviewDrawer from './UploadPreviewDrawer.vue'
import type { Upload } from './uploads.types'

const views: ReturnType<typeof mount>[] = []
afterEach(() => { for (const view of views.splice(0)) view.unmount() })

function preview(overrides: Partial<Upload>) {
  const upload: Upload = {
    uuid: 'document', filename: 'scan.pdf', size: 24, mime_type: 'application/pdf',
    status: 'completed', created_at: '2026-10-14', raw_url: '/document', ...overrides,
  }
  const action = async () => {}
  const retryUpload = vi.fn(async (_upload: Upload) => {})
  const wrapper = mount(UploadPreviewDrawer, {
    props: {
      preview: upload,
      artifactView: null, busyAction: false, partsExpanded: false, currentArtifacts: [],
      partsTotal: 0, partsPage: 1, partsPages: 1, partsRangeStart: 0, partsRangeEnd: 0,
      hasPrimary: false, artifactsLoading: false,
      activePreviewSource: () => ({ contentType: upload.mime_type, sourceUrl: upload.raw_url || '', filename: upload.filename }),
      downloadActive: action, openActive: action, closePreview() {}, viewOriginal() {},
      viewPrimary() {}, viewArtifact() {}, gotoPartsPage() {}, retrying: false, retryUpload,
    },
    global: {
      stubs: { Drawer: { template: '<div><slot /></div>' }, Icon: true, 'wc-resource-view': true },
    },
  })
  views.push(wrapper)
  return { wrapper, upload, retryUpload }
}

describe('document transcription notices', () => {
  it('shows a failed transcription code and retries only on request while retaining the original', async () => {
    const { wrapper, upload, retryUpload } = preview({ status: 'error', meta: { ocr_error: 'transcription_failed' } })
    expect(wrapper.get('[role="alert"]').text()).toContain('Text recognition failed.')
    expect(wrapper.get('[data-testid="uploads-view-file"]').text()).toContain('File')
    expect(wrapper.get('.kx-pv-rv').attributes('source-url')).toBe('/document')
    expect(retryUpload).not.toHaveBeenCalled()
    await wrapper.get('[data-testid="uploads-preview-retry"]').trigger('click')
    expect(retryUpload).toHaveBeenCalledExactlyOnceWith(upload)
  })

  it('keeps partial extraction informative without exposing arbitrary provider text', () => {
    const providerText = 'Page 2: vision provider rejected <script>request</script>'
    const { wrapper } = preview({ meta: { ocr_error: providerText } })
    expect(wrapper.get('[role="status"]').text()).toBe('Text recognition did not complete. The extracted text is shown.')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="uploads-preview-retry"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain(providerText)
    expect(wrapper.find('script').exists()).toBe(false)
    expect(wrapper.get('.kx-pv-rv').attributes('source-url')).toBe('/document')
  })

  it('clears the whole notice after successful transcription', () => {
    const { wrapper } = preview({ meta: { ocr_error: false } })
    expect(wrapper.find('[data-testid="uploads-preview-error"]').exists()).toBe(false)
    expect(wrapper.get('.kx-pv-rv').attributes('source-url')).toBe('/document')
  })
})

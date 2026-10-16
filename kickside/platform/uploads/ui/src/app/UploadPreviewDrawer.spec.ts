// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PrimeVue from 'primevue/config'
import UploadPreviewDrawer from './UploadPreviewDrawer.vue'

function preview(error: string | false) {
  const action = async () => {}
  return mount(UploadPreviewDrawer, {
    props: {
      preview: { uuid: 'document', filename: 'scan.pdf', size: 24, mime_type: 'application/pdf',
        status: 'completed', created_at: '2026-10-14', meta: { ocr_error: error } },
      artifactView: null, busyAction: false, partsExpanded: false, currentArtifacts: [],
      partsTotal: 0, partsPage: 1, partsPages: 1, partsRangeStart: 0, partsRangeEnd: 0,
      hasPrimary: false, artifactsLoading: false,
      activePreviewSource: () => ({ contentType: 'application/pdf', sourceUrl: '/document', filename: 'scan.pdf' }),
      downloadActive: action, openActive: action, closePreview() {}, viewOriginal() {},
      viewPrimary() {}, viewArtifact() {}, gotoPartsPage() {},
    },
    global: {
      plugins: [[PrimeVue, { unstyled: true }]],
      stubs: { Drawer: { template: '<div><slot /></div>' }, Icon: true, 'wc-resource-view': true },
    },
  })
}

describe('document OCR failure', () => {
  it('shows the stored error while keeping the original file available', () => {
    const error = 'Page 2: vision provider rejected <script>request</script>'
    const wrapper = preview(error)
    expect(wrapper.get('[role="alert"]').text()).toContain(error)
    expect(wrapper.find('script').exists()).toBe(false)
    expect(wrapper.get('[data-testid="uploads-view-file"]').text()).toContain("File")
    wrapper.unmount()
  })

  it('clears the warning after successful transcription', () => {
    const wrapper = preview(false)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    wrapper.unmount()
  })
})

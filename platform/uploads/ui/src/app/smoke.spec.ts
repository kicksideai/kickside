// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { describe, it, expect } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { Component } from 'vue'
import UploadPreviewDrawer from './UploadPreviewDrawer.vue'

const mods = import.meta.glob<{ default: Component }>('./*.vue', { eager: true })
const noAction = () => {}
const asyncAction = async () => {}
const drawerProps = {
  preview: {
    uuid: 'document', filename: 'scan.pdf', size: 24, mime_type: 'application/pdf',
    status: 'completed', created_at: 0, raw_url: '/document',
  },
  artifactView: null, busyAction: false, partsExpanded: false, currentArtifacts: [],
  partsTotal: 0, partsPage: 1, partsPages: 1, partsRangeStart: 0, partsRangeEnd: 0,
  hasPrimary: false, artifactsLoading: false, retrying: false,
  activePreviewSource: () => ({ contentType: 'application/pdf', sourceUrl: '/document', filename: 'scan.pdf' }),
  downloadActive: asyncAction, openActive: asyncAction, retryUpload: asyncAction,
  closePreview: noAction, viewOriginal: noAction, viewPrimary: noAction,
  viewArtifact: noAction, gotoPartsPage: noAction,
} satisfies InstanceType<typeof UploadPreviewDrawer>['$props']

describe('component smoke mounts', () => {
  for (const [path, mod] of Object.entries(mods)) {
    it(`mounts ${path}`, async () => {
      const drawer = path === './UploadPreviewDrawer.vue'
      const wrapper = drawer ? mount(UploadPreviewDrawer, { props: drawerProps }) : mount(mod.default)
      try {
        await flushPromises()
        expect(wrapper.exists()).toBe(true)
        if (drawer) {
          expect(wrapper.get('.kx-pv-name').text()).toContain('scan.pdf')
          expect(wrapper.get('.kx-pv-rv').attributes('source-url')).toBe('/document')
        }
      } finally {
        wrapper.unmount()
      }
    })
  }
})

// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import KnowledgeStats from './KnowledgeStats.vue'

vi.mock('@iconify/vue', () => ({ Icon: { template: '<svg />' } }))

describe('Knowledge header statistics', () => {
  it('renders normalized engine statistics including zero counts', async () => {
    const wrapper = mount(KnowledgeStats, {
      props: { items: [
        { value: 0, label: 'files' },
        { value: 3, label: 'clusters' },
        { value: 0, label: 'need review' },
      ] },
    })
    expect(wrapper.text()).toBe('0 files · 3 clusters · 0 need review')

    await wrapper.setProps({ items: [{ value: 12, label: 'documents', icon: 'tabler:files' }] })
    expect(wrapper.text()).toBe('12 documents')
    expect(wrapper.findAll('svg')).toHaveLength(1)
  })

  it('renders no empty statistic container', () => {
    const wrapper = mount(KnowledgeStats, { props: { items: [] } })
    expect(wrapper.find('[aria-label="Knowledge statistics"]').exists()).toBe(false)
  })
})

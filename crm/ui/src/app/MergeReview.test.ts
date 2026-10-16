// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

const props = ref({
  itemId: 'crm-merge-review:df-1:sig-1',
  content: 'Possible duplicate person',
  dataMeta: JSON.stringify({
    crm_id: 'crm-1',
    object_type: 'person',
    left_id: 'p1',
    right_id: 'p2',
    actions: ['skip'],
  }),
})
const emit = vi.fn()

vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => props,
  useEvents: () => emit,
}))

const MergeReview = (await import('./MergeReview.vue')).default

describe('CRM merge-review action ownership', () => {
  beforeEach(() => emit.mockReset())

  it('renders its three canonical decisions and ignores item metadata action config', () => {
    const wrapper = mount(MergeReview)
    const buttons = wrapper.findAll('.cm-actions button')
    expect(buttons).toHaveLength(3)
    expect(buttons.map((button) => button.text())).toEqual([
      'Merge records',
      'Keep separate',
      'Skip',
    ])
  })

  it('emits the exact merged action with the selected winner and loser', async () => {
    const wrapper = mount(MergeReview)
    await wrapper.findAll('.cm-actions button')[0].trigger('click')
    const radios = wrapper.findAll('input[type="radio"]')
    await radios[1].setValue(true)
    await wrapper.get('.cm-primary-confirm .cm-btn-primary').trigger('click')
    expect(emit).toHaveBeenCalledWith('inbox-resolve', {
      id: 'crm-merge-review:df-1:sig-1',
      action: 'merged',
      form: { winner_id: 'p2', loser_id: 'p1' },
    })
  })

  it('emits the exact do_not_merge action without person-specific vocabulary', async () => {
    const wrapper = mount(MergeReview)
    await wrapper.findAll('.cm-actions button')[1].trigger('click')
    expect(wrapper.text()).not.toContain('person stops')
    await wrapper.get('.cm-warn .cm-btn-danger').trigger('click')
    expect(emit).toHaveBeenCalledWith('inbox-resolve', {
      id: 'crm-merge-review:df-1:sig-1',
      action: 'do_not_merge',
      form: {},
    })
  })
})

// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { CrmAttribute } from '../crm-types'
import type { FilterCondition } from '../crm-filter'

vi.mock('@iconify/vue', () => ({ Icon: { props: ['icon'], template: '<i :data-icon="icon" />' } }))
vi.mock('./RecordPickerControl.vue', () => ({ default: { props: ['crmId', 'objectType', 'modelValue', 'placeholder'], template: '<div data-test="relation-picker" />' } }))

const CrmFilterBar = (await import('./CrmFilterBar.vue')).default

const fields: CrmAttribute[] = [
  { object_type: 'person', attr: 'name', data_type: 'text', label: 'Name' },
  { object_type: 'person', attr: 'status', data_type: 'select', label: 'Status', config: { choices: ['hot', 'cold'] } },
]
const hot: FilterCondition = { id: 'c1', attr: 'status', op: 'eq', value: 'hot' }

function make(modelValue: FilterCondition[] = []) {
  return mount(CrmFilterBar, { props: { crmId: 'crm-1', fields, modelValue } })
}
function buttonByText(wrapper: ReturnType<typeof make>, text: string) {
  return wrapper.findAll('button').find((node) => node.text().includes(text))!
}

describe('CRM filter bar', () => {
  it('renders each complete condition as a removable chip with humanized parts', () => {
    const wrapper = make([hot])
    const chip = wrapper.get('.crm-filter-chip')
    expect(chip.text()).toContain('Status')
    expect(chip.text()).toContain('is')
    expect(chip.text()).toContain('hot')
  })

  it('removes a condition when its chip is clicked', async () => {
    const wrapper = make([hot])
    await wrapper.get('.crm-filter-chip').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual([])
  })

  it('appends a fresh condition from the object schema on add', async () => {
    const wrapper = make([])
    await buttonByText(wrapper, 'Filter').trigger('click')
    await buttonByText(wrapper, 'Add condition').trigger('click')
    const next = wrapper.emitted('update:modelValue')?.[0]?.[0] as FilterCondition[]
    expect(next).toHaveLength(1)
    expect(next[0].attr).toBe('name')
    expect(next[0].op).toBe('contains')
  })
})

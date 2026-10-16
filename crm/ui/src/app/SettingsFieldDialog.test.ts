// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { CrmAttribute, CrmObject } from '../crm-types'

vi.mock('@iconify/vue', () => ({ Icon: { props: ['icon'], template: '<i :data-icon="icon" />' } }))

const SettingsFieldDialog = (await import('./SettingsFieldDialog.vue')).default
const objects: CrmObject[] = [{ type: 'person', label: 'People' }, { type: 'company', label: 'Companies' }]

function make(field: CrmAttribute | null = null) {
  return mount(SettingsFieldDialog, {
    props: { field, objects, selected: 'person' },
    global: { stubs: { teleport: true } },
  })
}
function save(wrapper: ReturnType<typeof make>) {
  return wrapper.findAll('button').find((node) => node.text().includes('Save'))!.trigger('click')
}

describe('settings field dialog', () => {
  it('builds a currency payload with a derived api name and numeric range', async () => {
    const wrapper = make()
    await flushPromises()
    const selects = wrapper.findAll('select')
    await wrapper.findAll('input')[0]!.setValue('Deal size')
    await selects[0]!.setValue('currency')
    const numbers = wrapper.findAll('input[type="number"]')
    await numbers[0]!.setValue('100')
    await numbers[1]!.setValue('5000')
    await save(wrapper)
    expect(wrapper.emitted('save')?.[0]?.[0]).toEqual({
      label: 'Deal size', attr: 'deal_size', data_type: 'currency', sort_order: 10,
      config: { min: 100, max: 5000, ui: { section: 'main', form: true, list: true, span: 2 } },
    })
  })

  it('builds a relation payload with the derived relation key and cardinality', async () => {
    const wrapper = make()
    await flushPromises()
    await wrapper.findAll('input')[0]!.setValue('Employer')
    await wrapper.findAll('select')[0]!.setValue('relation')
    expect(wrapper.text()).not.toContain('Unique')
    await wrapper.findAll('select').find((node) => node.findAll('option').some((option) => option.text() === 'Companies'))!.setValue('company')
    await save(wrapper)
    expect(wrapper.emitted('save')?.[0]?.[0]).toEqual({
      label: 'Employer', attr: 'employer', data_type: 'relation',
      sort_order: 10,
      config: { target: { kind: 'record', object_type: 'company' }, relation: 'person_employer', cardinality: 'one', ui: { section: 'main', form: true, list: true, span: 2 } },
    })
  })

  it('uses the normalized API name in the relation key', async () => {
    const wrapper = make()
    await flushPromises()
    const inputs = wrapper.findAll('input')
    await inputs[0]!.setValue('Employer')
    await inputs[1]!.setValue('Employer ID')
    await wrapper.findAll('select')[0]!.setValue('relation')
    await wrapper.findAll('select').find((node) => node.findAll('option').some((option) => option.text() === 'Companies'))!.setValue('company')
    await save(wrapper)
    const payload = wrapper.emitted('save')?.[0]?.[0]
    expect(payload).toMatchObject({ attr: 'employer_id', config: { relation: 'person_employer_id' } })
  })
})

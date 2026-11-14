// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Select from 'primevue/select'
import PredicateComposer from './PredicateComposer.vue'

vi.mock('@iconify/vue', () => ({ Icon: { name: 'Icon', props: ['icon'], template: '<i class="ic" :data-icon="icon" />' } }))

const schema = { type: 'object', properties: { score: { type: 'number', title: 'Score' }, approved: { type: 'boolean' } } }

describe('PredicateComposer', () => {
  it('serializes field-first controls without exposing raw expr-lang by default', async () => {
    const wrapper = mount(PredicateComposer, { props: { modelValue: '', schema } })
    expect(wrapper.get('.p-panel-toggle-button').attributes('aria-expanded')).toBe('false')
    wrapper.findAllComponents(Select)[0].vm.$emit('update:modelValue', 'score')
    await wrapper.vm.$nextTick()
    wrapper.findAllComponents(Select)[1].vm.$emit('update:modelValue', 'gte')
    await wrapper.vm.$nextTick()
    await flushPromises()
    const valueInput = wrapper.get('[aria-label="Condition value"]')
    await valueInput.trigger('focus')
    await valueInput.setValue('80')
    expect((valueInput.element as HTMLInputElement).value).toBe('80')
    await valueInput.trigger('blur')
    const updates = wrapper.emitted('update:modelValue') ?? []
    expect(updates[updates.length - 1]).toEqual(['output.score >= 80'])
    wrapper.unmount()
  })

  it('offers boolean operators without a meaningless value input', async () => {
    const wrapper = mount(PredicateComposer, { props: { modelValue: '', schema } })
    wrapper.findAllComponents(Select)[0].vm.$emit('update:modelValue', 'approved')
    await wrapper.vm.$nextTick()
    expect(wrapper.get('[aria-label="Condition operator"]').text()).toContain('is true')
    expect(wrapper.find('[aria-label="Condition value"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('keeps arbitrary existing expr-lang intact under Advanced', () => {
    const wrapper = mount(PredicateComposer, { props: { modelValue: 'len(output.rows) > 0', schema } })
    expect(wrapper.get('[aria-label="Condition expression"]').element).toHaveProperty('value', 'len(output.rows) > 0')
    wrapper.unmount()
  })
})

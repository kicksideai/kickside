import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import StructuredValueField from './StructuredValueField.vue'

describe('StructuredValueField', () => {
  it('renders an existing object as readable formatted JSON', () => {
    const wrapper = mount(StructuredValueField, {
      props: { kind: 'object', value: { type: 'object', required: ['answer'] } },
    })
    const text = (wrapper.get('textarea').element as HTMLTextAreaElement).value
    expect(text).toContain('\n  "type": "object"')
    expect(text).not.toContain('[object Object]')
  })

  it('emits a structured object after a valid edit', async () => {
    const wrapper = mount(StructuredValueField, { props: { kind: 'object', value: {} } })
    await wrapper.get('textarea').setValue('{"type":"object","properties":{"note":{"type":"string"}}}')
    const changes = wrapper.emitted('change') ?? []
    expect(changes[changes.length - 1]?.[0]).toEqual({
      type: 'object', properties: { note: { type: 'string' } },
    })
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('shows a directed error and does not corrupt the last valid value', async () => {
    const wrapper = mount(StructuredValueField, { props: { kind: 'object', value: { kept: true } } })
    const input = wrapper.get('textarea')
    await input.setValue('{"kept":false}')
    expect(wrapper.emitted('change')).toHaveLength(1)
    await input.setValue('{"kept":')
    expect(wrapper.get('[role="alert"]').text()).toContain('isn’t valid JSON')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(wrapper.emitted('change')).toHaveLength(1)
    expect(wrapper.emitted('change')?.[0]?.[0]).toEqual({ kept: false })
  })

  it('rejects the wrong structured kind and remains compact-width safe', async () => {
    const wrapper = mount(StructuredValueField, { props: { kind: 'array', value: [] } })
    const input = wrapper.get('textarea')
    expect(input.classes()).toContain('sf-structured')
    await input.setValue('{"not":"an array"}')
    expect(wrapper.get('[role="alert"]').text()).toBe('Enter a JSON array.')
    expect(wrapper.emitted('change')).toBeUndefined()
  })
})

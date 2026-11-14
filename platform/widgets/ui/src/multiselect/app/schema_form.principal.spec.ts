import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

const emit = vi.fn()
vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => ({ value: {
    schema: { type: 'object', properties: { assignee: { type: 'string', title: 'Assignee', picker: 'wc-principal-picker', kinds: 'user' } } },
    config: { assignee: 'u-old', priority: 'normal' },
  } }),
  useEvents: () => emit,
}))
vi.mock('@wippy-fe/proxy', () => ({ loadByTagName: vi.fn(() => Promise.resolve()) }))
import SchemaForm from './SchemaForm.vue'

describe('SchemaForm principal picker integration', () => {
  it('mounts the declared element and folds config-changed into the scalar field', async () => {
    if (!customElements.get('wc-principal-picker')) customElements.define('wc-principal-picker', class extends HTMLElement {})
    emit.mockReset()
    const wrapper = mount(SchemaForm, { attachTo: document.body })
    await flushPromises()
    const element = wrapper.element.querySelector('wc-principal-picker') as HTMLElement
    expect(element).toBeTruthy()
    expect(element.getAttribute('schema')).toContain('"assignee"')
    expect(element.getAttribute('config')).toContain('"thread_id":"u-old"')
    element.dispatchEvent(new CustomEvent('config-changed', { bubbles: true, detail: { assignee: 'u-ada', id: 'u-ada' } }))
    await flushPromises()
    expect(emit).toHaveBeenCalledWith('config-changed', { assignee: 'u-ada', priority: 'normal' })
    expect(emit).toHaveBeenCalledTimes(1)
    element.dispatchEvent(new CustomEvent('config-changed', { bubbles: true, detail: { assignee: '', id: '' } }))
    await flushPromises()
    expect(emit).toHaveBeenLastCalledWith('config-changed', { assignee: '', priority: 'normal' })
    expect(emit).toHaveBeenCalledTimes(2)
    wrapper.unmount()
  })
})

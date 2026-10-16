// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
const load = vi.fn().mockResolvedValue(undefined)
const get = vi.fn().mockResolvedValue({ data: { success: true, entry: { id: 'folder', name: 'Northwind', container: true } } })
vi.mock('@wippy-fe/proxy', () => ({ loadByTagName: (...args: unknown[]) => load(...args), api: { get: (...args: unknown[]) => get(...args) } }))
import ComponentPicker from './ComponentPicker.vue'
describe('component reference shared widget', () => {
  it('uses the public picker contract and keeps folder browsing', async () => {
    const view = mount(ComponentPicker, { props: { modelValue: '' } })
    await flushPromises()
    expect(load).toHaveBeenCalledWith('wc-component-picker', { timeoutMs: 8000 })
    const picker = view.get('wc-component-picker').element
    expect(picker.getAttribute('source')).toBe('/api/v1/workspace/entries')
    expect(picker.getAttribute('placeholder')).toBe('Select a component…')
    picker.dispatchEvent(new CustomEvent('change', { detail: { thread_id: 'folder' } }))
    await flushPromises()
    expect(view.emitted('update:modelValue')).toEqual([['folder']])
    await view.get('button[aria-label="Browse Northwind"]').trigger('click')
    expect(picker.getAttribute('source')).toBe('/api/v1/workspace/entries?parent_id=folder')
    expect(view.find('input').exists()).toBe(false)
    view.unmount()
  })
  it('shows widget loading failures and supports retry', async () => {
    load.mockRejectedValueOnce(new Error('Catalog unavailable'))
    const view = mount(ComponentPicker)
    await flushPromises()
    expect(view.get('[role="alert"]').text()).toContain('Catalog unavailable')
    await view.get('[role="alert"] button').trigger('click')
    await flushPromises()
    expect(view.find('wc-component-picker').exists()).toBe(true)
    view.unmount()
  })
})

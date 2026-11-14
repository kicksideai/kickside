import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { h } from 'vue'
import NativeDialog from './NativeDialog.vue'
import PickerSelect from './PickerSelect.vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'

const global = { plugins: [PrimeVuePlugin] }

describe('NativeDialog', () => {
  it('opens a named native modal and blocks dismissal while busy', async () => {
    const w = mount(NativeDialog, { global, props: { visible: true, busy: true, label: 'Install' } })
    await flushPromises()
    expect((w.element as HTMLDialogElement).open).toBe(true)
    expect(w.attributes('aria-label')).toBe('Install')
    await w.trigger('cancel')
    expect(w.emitted('close')).toBeUndefined()
    await w.setProps({ busy: false })
    await w.trigger('cancel')
    expect(w.emitted('close')).toHaveLength(1)
    await w.setProps({ visible: false }); await flushPromises()
    expect((w.element as HTMLDialogElement).open).toBe(false)
  })
  it('consumes picker Escape before the native modal handles it', async () => {
    const close = vi.fn()
    const w = mount(NativeDialog, { global, props: { visible: true, label: 'Review', onClose: close },
      slots: { default: () => h(PickerSelect, { modelValue: '', ariaLabel: 'Version', items: [{ id: '1', title: 'One' }] }) } })
    await flushPromises()
    await w.get('[role="combobox"]').trigger('click'); await flushPromises()
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    w.get('input[type="search"]').element.dispatchEvent(event)
    await flushPromises()
    expect(event.defaultPrevented).toBe(true)
    expect(w.get('[role="combobox"]').attributes('aria-expanded')).toBe('false')
    expect(close).not.toHaveBeenCalled()
    expect((w.element as HTMLDialogElement).open).toBe(true)
  })
})

import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { flushPromises, mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import PickerSelect from './PickerSelect.vue'
import type { PickerItem } from './ports'

const ITEMS: PickerItem[] = [
  { id: 'a', title: 'Alpha Source', subtitle: 'First origin', group: 'Channels', icon: 'tabler:message' },
  { id: 'b', title: 'Beta Source', subtitle: 'Second origin', group: 'Knowledge', icon: 'tabler:database' },
]

async function openOverlay() {
  const wrapper = mount(PickerSelect, {
    props: { items: ITEMS, modelValue: 'a' },
    global: { plugins: [PrimeVue] },
    attachTo: document.body,
  })
  await wrapper.find('.p-select').trigger('click')
  await flushPromises()
  return wrapper
}

describe('picker select visual contract', () => {
  it('renders option rows without a checkmark slot', async () => {
    const wrapper = await openOverlay()
    const options = document.querySelectorAll('.p-select-option')
    expect(options.length).toBe(ITEMS.length)
    expect(document.querySelector('.p-select-option-blank-icon')).toBeNull()
    expect(document.querySelector('.p-select-option-check-icon')).toBeNull()
    wrapper.unmount()
  })

  it('uses the shared picker rhythm for option-row children', () => {
    const css = fs.readFileSync(path.resolve(process.cwd(), 'src/app/pickerselect.css'), 'utf8')
    expect(css).toMatch(/\.kx-ps-option\s*\{[^}]*gap:\s*var\(--kx-picker-option-icon-gap\)/s)
  })
})

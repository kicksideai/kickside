// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import KbPicker from './kb-picker.vue'

declare global {
  var __props__: unknown
  var __events__: Array<[string, unknown]>
}

vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => ({ value: globalThis.__props__ }),
  useEvents: () => (name: string, detail: unknown) => {
    ;(globalThis.__events__ ||= []).push([name, detail])
  },
}))

vi.mock('@widgets/app/MultiSelectField.vue', () => ({
  default: {
    name: 'MultiSelectField',
    props: { selected: Array, multi: { type: Boolean, default: true } },
    template: '<div />',
  },
}))

const MultiSelectField = {
  name: 'MultiSelectField',
  props: { selected: Array, multi: { type: Boolean, default: true } },
  template: '<div />',
}

function events() {
  return globalThis.__events__
}

describe('KB picker configuration ownership', () => {
  beforeEach(() => {
    globalThis.__events__ = []
  })

  it('keeps the trait multi-select contract', async () => {
    globalThis.__props__ = { config: { kb_ids: ['kb-a'] } }
    const wrapper = mount(KbPicker, { global: { stubs: { MultiSelectField } } })
    const picker = wrapper.getComponent(MultiSelectField)

    expect(picker.props('selected')).toEqual(['kb-a'])
    expect(picker.props('multi')).toBe(true)
    picker.vm.$emit('change', ['kb-a', 'kb-b'])
    await nextTick()
    expect(events()).toEqual([['config-changed', { kb_ids: ['kb-a', 'kb-b'] }]])
  })

  it('uses the declared singular sink key for an embed destination', async () => {
    globalThis.__props__ = {
      config: { kb_id: 'kb-a' }, schema: { properties: { kb_id: { picker: 'wc-kb-picker', required: true } } },
    }
    const wrapper = mount(KbPicker, { global: { stubs: { MultiSelectField } } })
    const picker = wrapper.getComponent(MultiSelectField)

    expect(picker.props('selected')).toEqual(['kb-a'])
    expect(picker.props('multi')).toBe(false)
    picker.vm.$emit('change', ['kb-b'])
    await nextTick()
    expect(events()).toEqual([['config-changed', { kb_id: 'kb-b' }]])
  })
})

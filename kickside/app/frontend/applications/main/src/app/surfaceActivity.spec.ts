// @vitest-environment happy-dom

import { mount } from '@vue/test-utils'
import { defineComponent, h, toRef } from 'vue'
import { describe, expect, it } from 'vitest'
import { provideSurfaceActivity, useSurfaceActivity } from './surfaceActivity'

const Consumer = defineComponent({
  setup() {
    const active = useSurfaceActivity()
    return () => h('output', { 'data-active': String(active.value) })
  },
})

const Provider = defineComponent({
  props: { active: { type: Boolean, required: true } },
  setup(props) {
    provideSurfaceActivity(toRef(props, 'active'))
    return () => h(Consumer)
  },
})

describe('surface activity', () => {
  it('provides a reactive logical activity signal to retained app-owned surfaces', async () => {
    const wrapper = mount(Provider, { props: { active: false } })
    expect(wrapper.find('output').attributes('data-active')).toBe('false')

    await wrapper.setProps({ active: true })
    expect(wrapper.find('output').attributes('data-active')).toBe('true')
  })
})

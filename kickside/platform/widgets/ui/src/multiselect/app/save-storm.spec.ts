import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import { afterEach, expect, it, vi } from 'vitest'
import * as bridge from '@wippy-fe/webcomponent-vue'
import SchemaForm from './SchemaForm.vue'
import StructuredValueField from './StructuredValueField.vue'
import WcMount from '../../app/WcMount.vue'

afterEach(() => vi.restoreAllMocks())

it('does not emit JSON formatting changes, repeated input, or model echoes', async () => {
  const w = mount(StructuredValueField, { props: { kind: 'object', value: { a: 1, b: 2 } } })
  await w.get('textarea').setValue('{"b":2,"a":1}')
  expect(w.emitted('change')).toBeUndefined()
  await w.get('textarea').setValue('{"b":2,"a":3}')
  await w.get('textarea').trigger('input')
  expect(w.emitted('change')).toHaveLength(1)
  await w.setProps({ value: { a: 3, b: 2 } })
  await w.get('textarea').trigger('input')
  expect(w.emitted('change')).toHaveLength(1)
  expect((w.get('textarea').element as HTMLTextAreaElement).value).toBe('{"b":2,"a":3}')
})

it('suppresses unchanged picker notifications and prop echoes in primary and advanced fields', async () => {
  const props = ref({ schema: { properties: {
    prompt: { type: 'object', picker: 'wc-test-picker' },
    priority: { type: 'number', picker: 'wc-test-picker', group: 'advanced' },
  } }, config: { prompt: { text: 'old' }, priority: 1 } })
  const emit = vi.fn()
  vi.spyOn(bridge, 'useProps').mockReturnValue(props)
  vi.spyOn(bridge, 'useEvents').mockReturnValue(emit)
  const w = mount(SchemaForm, { global: { stubs: { WcMount: true } } })
  const controls = w.findAllComponents(WcMount)
  controls[0].vm.$emit('change', { prompt: { text: 'old' } })
  controls[1].vm.$emit('change', { priority: 1 })
  expect(emit).not.toHaveBeenCalled()
  controls[0].vm.$emit('change', { prompt: { text: 'new' } })
  await nextTick()
  props.value.config = { prompt: { text: 'new' }, priority: 1 }
  await nextTick()
  controls[0].vm.$emit('change', { prompt: { text: 'new' } })
  controls[1].vm.$emit('change', { priority: 2 })
  expect(emit).toHaveBeenCalledTimes(2)
  expect(emit.mock.calls[1]).toEqual(['config-changed', { prompt: { text: 'new' }, priority: 2 }])
})

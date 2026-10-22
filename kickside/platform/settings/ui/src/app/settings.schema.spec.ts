// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import SettingsForm from './SettingsForm.vue'

const schema = {
  type: 'object', required: ['rules'], properties: {
    rules: { type: 'array', items: {
      type: 'object', required: ['label', 'enabled', 'limit'], properties: {
        label: { type: 'string', minLength: 1, maxLength: 8, pattern: '^[a-z]+$' },
        enabled: { type: 'boolean' },
        limit: { type: 'integer', minimum: 1, maximum: 5 },
      },
    } },
  },
}
const valid = { rules: [{ label: 'alpha', enabled: true, limit: 2 }] }
const row = { namespace: 'test.preferences', key: 'rules', value_type: 'json', value: valid,
  default: valid, is_default: false, schema }

beforeEach(() => {
  vi.clearAllMocks()
  ;(globalThis as any).__api__ = { '/api/v1/settings': { success: true, settings: [{ ...row }] } }
})

async function form() {
  const wrapper = mount(SettingsForm, { props: { namespace: row.namespace } })
  await flushPromises()
  return wrapper
}

describe('Structured settings schema', () => {
  it.each([
    [[], 'Must be an object'],
    [null, 'Must be an object'],
    [{}, 'rules: Required'],
    [{ rules: {} }, 'rules: Must be an array'],
    [{ rules: [null] }, 'rules[0]: Must be an object'],
    [{ rules: [{}] }, 'rules[0].label: Required'],
    [{ rules: [{ ...valid.rules[0], label: 7 }] }, 'rules[0].label: Must be a string'],
    [{ rules: [{ ...valid.rules[0], label: '' }] }, 'rules[0].label: Must be at least 1 characters'],
    [{ rules: [{ ...valid.rules[0], label: 'toolonglabel' }] }, 'rules[0].label: Must be at most 8 characters'],
    [{ rules: [{ ...valid.rules[0], label: 'UPPER' }] }, 'rules[0].label: Does not match the required format'],
    [{ rules: [{ ...valid.rules[0], enabled: 'true' }] }, 'rules[0].enabled: Must be a boolean'],
    [{ rules: [{ ...valid.rules[0], limit: '2' }] }, 'rules[0].limit: Must be a number'],
    [{ rules: [{ ...valid.rules[0], limit: 1.5 }] }, 'rules[0].limit: Must be a whole number'],
    [{ rules: [{ ...valid.rules[0], limit: 0 }] }, 'rules[0].limit: Must be ≥ 1'],
    [{ rules: [{ ...valid.rules[0], limit: 6 }] }, 'rules[0].limit: Must be ≤ 5'],
  ])('refuses an invalid parsed draft %j', async (value, message) => {
    const wrapper = await form()
    await wrapper.get('textarea').setValue(JSON.stringify(value))
    expect(wrapper.get('.ks-field-err').text()).toBe(message)
    const save = wrapper.findAll('button').find(button => button.text() === 'Save')!
    expect(save.attributes('disabled')).toBeDefined()
    await save.trigger('click')
    expect(api.put).not.toHaveBeenCalled()
  })

  it('validates array items and describes their shape', async () => {
    ;(globalThis as any).__api__['/api/v1/settings'].settings = [{ ...row, value: [], schema: {
      type: 'array', items: { type: 'string', minLength: 1 },
    } }]
    const wrapper = await form()
    expect(wrapper.get('.ks-hint').text()).toContain('array')
    expect(wrapper.get('.ks-hint').text()).toContain('items: string · length 1–∞')
    await wrapper.get('textarea').setValue('[{}]')
    expect(wrapper.get('.ks-field-err').text()).toBe('[0]: Must be a string')
    await wrapper.get('textarea').setValue('["valid"]')
    expect(wrapper.find('.ks-field-err').exists()).toBe(false)
    await wrapper.findAll('button').find(button => button.text() === 'Save')!.trigger('click')
    expect(api.put).toHaveBeenCalledWith('/api/v1/settings', { namespace: row.namespace, key: row.key, value: ['valid'] })
  })

  it('describes required properties and nested types and constraints', async () => {
    const wrapper = await form()
    const hint = wrapper.get('.ks-hint').text()
    for (const text of ['object', 'required: rules', 'rules: array', 'items: object',
      'required: label, enabled, limit', 'label: string', 'length 1–8', 'pattern ^[a-z]+$',
      'enabled: boolean', 'limit: integer', 'range 1–5']) expect(hint).toContain(text)
  })

  it('reports malformed JSON while editing and saves a corrected parsed draft', async () => {
    const wrapper = await form()
    await wrapper.get('textarea').setValue('{')
    expect(wrapper.get('.ks-field-err').text()).toContain('JSON')
    expect(api.put).not.toHaveBeenCalled()
    const corrected = { rules: [{ label: 'beta', enabled: false, limit: 3 }], extra: 'allowed' }
    await wrapper.get('textarea').setValue(JSON.stringify(corrected))
    expect(wrapper.find('.ks-field-err').exists()).toBe(false)
    await wrapper.findAll('button').find(button => button.text() === 'Save')!.trigger('click')
    expect(api.put).toHaveBeenCalledWith('/api/v1/settings', { namespace: row.namespace, key: row.key, value: corrected })
  })

  it('allows omitted optional properties and enforces nested enums', async () => {
    ;(globalThis as any).__api__['/api/v1/settings'].settings = [{ ...row, value: {}, schema: {
      type: 'object', properties: { mode: { type: 'string', enum: ['fast', 'slow'] } },
    } }]
    const wrapper = await form()
    await wrapper.get('textarea').setValue('{"mode":"other"}')
    expect(wrapper.get('.ks-field-err').text()).toBe('mode: Must be one of: fast, slow')
    await wrapper.get('textarea').setValue('{ }')
    expect(wrapper.find('.ks-field-err').exists()).toBe(false)
  })
})


describe('Scalar settings schema controls', () => {
  it.each([
    ['number', '2', 'Must be ≥ 3'],
    ['string', 'a', 'Must be at least 3 characters'],
  ])('preserves %s constraints on a text control', async (type, value, message) => {
    ;(globalThis as any).__api__['/api/v1/settings'].settings = [{ ...row, value_type: 'string',
      value: 'initial', schema: { type, minimum: 3, minLength: 3 },
    }]
    const wrapper = await form()
    await wrapper.get('input').setValue(value)
    expect(wrapper.get('.ks-field-err').text()).toBe(message)
    await wrapper.get('input').setValue('1234')
    expect(wrapper.find('.ks-field-err').exists()).toBe(false)
  })
})

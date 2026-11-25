// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
// @vitest-environment happy-dom
import { expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import NodeConfigPanel from './NodeConfigPanel.vue'
import { registerBlocks } from '../domain/node-policy'

vi.mock('@wippy-fe/proxy', () => ({ api: { get: vi.fn(async () => ({ data: {} })) }, loadByTagName: vi.fn(async () => {}) }))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<i />' } }))

it('mounts a block picker with its declared extractor key and catalog source', async () => {
  registerBlocks([{
    id: 'kickside.docscout.blocks:extract', label: 'Extract document fields',
    config_schema: {
      type: 'object', required: ['extractor_id'],
      properties: { extractor_id: { type: 'string', title: 'Extractor', picker: 'wc-component-picker', source: '/api/v1/docscout' } },
    },
  }])
  const wrapper = mount(NodeConfigPanel, {
    props: {
      workflowId: 'flow', edge: null, note: null, catalog: [],
      node: { id: 'extract', kind: 'block', title: 'Extract document fields', ref: 'kickside.docscout.blocks:extract', config: { extractor_id: 'invoice-fields' } },
    },
    global: {
      stubs: {
        WcMount: {
          props: ['tag', 'schema', 'config', 'attrs'],
          template: '<button data-test="extractor-picker" :data-tag="tag" :data-schema="JSON.stringify(schema)" :data-config="JSON.stringify(config)" @click="$emit(\'change\', { extractor_id: \'invoice-fields-2\' })" />',
        },
        ConfigAssist: true,
      },
    },
  })

  const picker = wrapper.get('[data-test="extractor-picker"]')
  expect(picker.attributes('data-tag')).toBe('wc-component-picker')
  expect(JSON.parse(picker.attributes('data-schema') ?? '{}')).toEqual({ properties: {
    extractor_id: { type: 'string', title: 'Extractor', picker: 'wc-component-picker', source: '/api/v1/docscout', required: true },
  } })
  expect(JSON.parse(picker.attributes('data-config') ?? '{}')).toEqual({ extractor_id: 'invoice-fields' })

  await picker.trigger('click')
  expect(wrapper.emitted('update-node')!.at(-1)![0]).toEqual({ config: { extractor_id: 'invoice-fields-2' } })
})

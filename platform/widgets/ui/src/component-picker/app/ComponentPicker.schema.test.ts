// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
// @vitest-environment happy-dom
import { expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import ComponentPicker from './ComponentPicker.vue'

const props = ref<Record<string, unknown>>({
  schema: { properties: {
    pages: { type: 'object' },
    extractor_id: { title: 'Extractor', picker: 'wc-component-picker', source: '/api/v1/docscout' },
  } },
  // SchemaForm's established standalone input shape. The picker must reopen it
  // while writing the schema-owned key on future changes.
  config: '{"thread_id":"extractor-a"}',
})
const emit = vi.fn()

vi.mock('@iconify/vue', () => ({ Icon: { template: '<span />' } }))
vi.mock('../constants.ts', () => ({ useComponentProps: () => props, useComponentEvents: () => emit }))
vi.mock('@wippy-fe/proxy', () => ({ api: { get: vi.fn(), delete: vi.fn() }, on: vi.fn(() => vi.fn()), host: { handleError: vi.fn() } }))

it('stores a schema-keyed DocScout extractor, follows its permission-scoped catalog, and reopens legacy config', async () => {
  // DocScout's endpoint is already actor-scoped by Component. It lists registered
  // extractors, not Core threads, and returns display data under each row's meta.
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    if (url === '/api/v1/docscout') {
      return { data: { success: true, items: [{ component_id: 'extractor-a', meta: { title: 'Invoice fields', icon: 'tabler:file-search' } }], next_cursor: 'page+two==' } } as never
    }
    if (url === '/api/v1/docscout?cursor=page%2Btwo%3D%3D') {
      return { data: { success: true, items: [{ component_id: 'extractor-b', meta: { title: 'Contract fields' } }] } } as never
    }
    throw new Error(`Unexpected catalog request: ${url}`)
  })
  const wrapper = mount(ComponentPicker, {
    global: { stubs: { AnchoredPanel: { props: ['open'], template: '<div v-if="open"><slot /></div>' } } },
  })

  await wrapper.get('.cp').trigger('click')
  await flushPromises()

  expect(api.get).toHaveBeenCalledWith('/api/v1/docscout')
  expect(api.get).toHaveBeenCalledWith('/api/v1/docscout?cursor=page%2Btwo%3D%3D')
  expect(wrapper.text()).toContain('Invoice fields')
  expect(wrapper.text()).toContain('Contract fields')
  expect(wrapper.get('.cp-value').text()).toBe('Invoice fields')
  await wrapper.get('.cp-row-main').trigger('click')
  expect(emit).toHaveBeenLastCalledWith('config-changed', { extractor_id: 'extractor-a' })

  // Parent state persists the declared key and creates a fresh control when the
  // workflow panel is reopened.
  wrapper.unmount()
  props.value = {
    schema: props.value.schema,
    config: '{"extractor_id":"extractor-a"}',
  }
  const reopened = mount(ComponentPicker, {
    global: { stubs: { AnchoredPanel: { props: ['open'], template: '<div v-if="open"><slot /></div>' } } },
  })
  await reopened.get('.cp').trigger('click')
  await flushPromises()
  expect(reopened.get('.cp-value').text()).toBe('Invoice fields')
  reopened.unmount()
})

it('preserves a custom source request and follows its numeric offset pages', async () => {
  vi.clearAllMocks()
  props.value = {
    schema: { properties: { integration_id: { title: 'Integration', picker: 'wc-component-picker', source: '/api/v1/research/catalog?scope=mine' } } },
    config: '{"integration_id":"catalog-a"}',
  }
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    if (url === '/api/v1/research/catalog?scope=mine') return { data: { items: [{ component_id: 'catalog-a', meta: { title: 'My catalog' } }], next_offset: 20 } } as never
    if (url === '/api/v1/research/catalog?scope=mine&offset=20') return { data: { items: [{ component_id: 'catalog-b', meta: { title: 'Second catalog' } }] } } as never
    throw new Error(`Unexpected catalog request: ${url}`)
  })
  const wrapper = mount(ComponentPicker, {
    global: { stubs: { AnchoredPanel: { props: ['open'], template: '<div v-if="open"><slot /></div>' } } },
  })

  await wrapper.get('.cp').trigger('click')
  await flushPromises()
  expect(api.get).toHaveBeenCalledWith('/api/v1/research/catalog?scope=mine')
  expect(api.get).toHaveBeenCalledWith('/api/v1/research/catalog?scope=mine&offset=20')
  expect(wrapper.text()).toContain('Second catalog')
  wrapper.unmount()
})

it('keeps the standalone thread_id protocol for an ambiguous legacy multi-field schema', async () => {
  vi.clearAllMocks()
  props.value = {
    schema: { properties: {
      pages: { type: 'object', class: 'not-a-component-class' },
      note: { type: 'string', picker: 'wc-schema-form', class: 'also-not-a-component-class' },
    } },
    config: '{"thread_id":"legacy-thread"}',
  }
  vi.mocked(api.get).mockImplementation(async () => ({ data: { success: true, items: [{ id: 'legacy-thread', label: 'Existing thread' }] } }) as never)
  const wrapper = mount(ComponentPicker, {
    global: { stubs: { AnchoredPanel: { props: ['open'], template: '<div v-if="open"><slot /></div>' } } },
  })

  await wrapper.get('.cp').trigger('click')
  await flushPromises()
  expect(api.get).toHaveBeenCalledWith('/api/v1/threads?limit=100')
  expect(wrapper.get('.cp-value').text()).toBe('Existing thread')
  await wrapper.get('.cp-row-main').trigger('click')
  expect(emit).toHaveBeenLastCalledWith('config-changed', { thread_id: 'legacy-thread' })
  wrapper.unmount()
})

it('does not revive a legacy thread_id when an explicit schema-owned selection is cleared', async () => {
  vi.clearAllMocks()
  props.value = {
    schema: { properties: { extractor_id: { picker: 'wc-component-picker', class: 'kickside.docscout' } } },
    config: '{"extractor_id":null,"thread_id":"stale-thread"}',
  }
  vi.mocked(api.get).mockImplementation(async () => ({ data: { success: true, items: [{ id: 'stale-thread', label: 'Stale thread' }] } }) as never)
  const wrapper = mount(ComponentPicker, {
    global: { stubs: { AnchoredPanel: { props: ['open'], template: '<div v-if="open"><slot /></div>' } } },
  })

  await wrapper.get('.cp').trigger('click')
  await flushPromises()
  expect(wrapper.get('.cp-value').text()).toBe('Select…')
  wrapper.unmount()
})

it('uses the legacy thread_id field catalog and keeps the standalone selection key', async () => {
  vi.clearAllMocks()
  props.value = {
    schema: { properties: { thread_id: { source: '/api/v1/workflows/published' } } },
    meta: JSON.stringify({ thread_class: 'workflow', title: 'Workflow' }),
  }
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    if (url === '/api/v1/workflows/published') return { data: { items: [{ id: 'wf-published', label: 'Published workflow' }] } } as never
    throw new Error(`Unexpected catalog request: ${url}`)
  })
  const wrapper = mount(ComponentPicker, {
    global: { stubs: { AnchoredPanel: { props: ['open'], template: '<div v-if="open"><slot /></div>' } } },
  })

  await wrapper.get('.cp').trigger('click')
  await flushPromises()
  expect(api.get).toHaveBeenCalledWith('/api/v1/workflows/published')
  expect(wrapper.get('.cp-row-main').text()).toContain('Published workflow')
  await wrapper.get('.cp-row-main').trigger('click')
  expect(emit).toHaveBeenLastCalledWith('config-changed', { thread_id: 'wf-published' })
  wrapper.unmount()
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import * as wcVue from '@wippy-fe/webcomponent-vue'
import { api } from '@wippy-fe/proxy'
import ComponentPicker from './ComponentPicker.vue'

// The picker prompt is driven by the scoped field's title (carried in `meta`): a
// class labels its own prompt ("Select a <noun>…"). With no title the fallback is
// the neutral "Select…", never a domain-specific "chat".

function mountWith(props: Record<string, unknown>) {
  ;(globalThis as any).__props__ = props
  return mount(ComponentPicker)
}

describe('ComponentPicker placeholder', () => {
  beforeEach(() => { ;(globalThis as any).__props__ = { config: {} } })

  it('labels the prompt with the meta title noun', () => {
    const w = mountWith({ meta: JSON.stringify({ thread_class: 'automation', title: 'Automation' }) })
    expect(w.find('.cp-value').text()).toBe('Select a automation…')
    w.unmount()
  })

  it('falls back to a neutral prompt when no title is scoped', () => {
    const w = mountWith({ meta: JSON.stringify({ thread_class: 'kickside.knowledge.injection' }) })
    const text = w.find('.cp-value').text()
    expect(text).toBe('Select…')
    expect(text.toLowerCase()).not.toContain('chat')
    w.unmount()
  })

  it('honours an explicit placeholder over the derived noun', () => {
    const w = mountWith({ placeholder: 'Pick one', meta: JSON.stringify({ title: 'Automation' }) })
    expect(w.find('.cp-value').text()).toBe('Pick one')
    w.unmount()
  })

  it('hydrates a preselected value so the closed picker shows the row label', async () => {
    ;(globalThis as any).__api__ = {
      '/api/v1/threads': { items: [{ id: 'wh-1', label: 'Orders webhook', icon: 'tabler:webhook' }] },
    }
    const w = mountWith({
      config: JSON.stringify({ thread_id: 'wh-1' }),
      meta: JSON.stringify({ thread_class: 'kickside.webhooks', title: 'Webhook' }),
    })
    await flushPromises()
    expect(w.find('.cp-value').text()).toBe('Orders webhook')
    w.unmount()
  })

  it('names an unresolvable preselected webhook generically, never its raw id', async () => {
    ;(globalThis as any).__api__ = {
      '/api/v1/threads': { items: [{ id: 'wh-other', label: 'Some other hook', icon: 'tabler:webhook' }] },
    }
    const w = mountWith({
      config: JSON.stringify({ thread_id: 'wh-missing-123' }),
      meta: JSON.stringify({ thread_class: 'kickside.webhooks', title: 'Webhook' }),
    })
    await flushPromises()
    const text = w.find('.cp-value').text()
    expect(text).toBe('Untitled webhook')
    expect(text).not.toContain('wh-missing-123')
    w.unmount()
  })

  it('labels a listed row whose only label is its id generically', async () => {
    ;(globalThis as any).__api__ = {
      '/api/v1/threads': { items: [{ id: 'wh-9', label: 'wh-9', icon: 'tabler:webhook' }] },
    }
    const w = mountWith({ meta: JSON.stringify({ thread_class: 'kickside.webhooks', title: 'Webhook' }) })
    await w.find('.cp').trigger('click')
    await flushPromises()
    expect(w.find('.cp-row .cp-label').text()).toBe('Untitled webhook')
    w.unmount()
  })

  it('derives labels from raw thread attrs when the picker receives thread rows', async () => {
    ;(globalThis as any).__api__ = {
      '/api/v1/threads': {
        threads: [{
          id: 'wh-2',
          component_id: 'wh-2',
          attrs: JSON.stringify({ label: 'Signup webhook' }),
          component_icon: 'tabler:webhook',
        }],
      },
    }
    const w = mountWith({ meta: JSON.stringify({ thread_class: 'kickside.webhooks', title: 'Webhook' }) })
    await w.find('.cp').trigger('click')
    await flushPromises()
    expect(w.find('.cp-row .cp-label').text()).toBe('Signup webhook')
    w.unmount()
  })

  it('uses a field-declared published workflow catalog without a thread-class query', async () => {
    ;(globalThis as any).__api__ = {
      '/api/v1/workflows/published': { items: [{ id: 'wf-published', label: 'Published workflow', icon: 'tabler:route' }] },
    }
    ;(api.get as any).mockClear()
    const w = mountWith({
      schema: JSON.stringify({ properties: { thread_id: { source: '/api/v1/workflows/published' } } }),
      meta: JSON.stringify({ thread_class: 'workflow', title: 'Workflow' }),
    })
    await w.find('.cp').trigger('click')
    await flushPromises()
    expect(w.find('.cp-row .cp-label').text()).toBe('Published workflow')
    expect((api.get as any).mock.calls.some((call: unknown[]) => call[0] === '/api/v1/workflows/published')).toBe(true)
    expect((api.get as any).mock.calls.some((call: unknown[]) => String(call[0]).includes('thread_class=workflow'))).toBe(false)
    w.unmount()
  })

  it('mounts a declared create component and selects the created thread', async () => {
    ;(globalThis as any).__api__ = {
      '/api/v1/threads': { items: [] },
    }
    if (!customElements.get('x-create-webhook')) {
      customElements.define('x-create-webhook', class extends HTMLElement {
        connectedCallback() {
          this.dispatchEvent(new CustomEvent('created', { detail: { thread_id: 'wh-new', title: 'Orders hook' } }))
        }
      })
    }
    const w = mountWith({
      meta: JSON.stringify({
        thread_class: 'kickside.webhooks',
        title: 'Webhook',
        component: { create_ui: { tag_name: 'x-create-webhook', title: 'Create webhook' } },
      }),
    })
    await w.find('.cp').trigger('click')
    await flushPromises()
    // The affordance names the field noun: "+ Create new <noun>".
    expect(w.text()).toContain('Create new webhook')
    await w.find('.cp-create-btn').trigger('click')
    await flushPromises()
    w.element.querySelector('x-create-webhook')?.dispatchEvent(new CustomEvent('created', { detail: { thread_id: 'wh-new', title: 'Orders hook' } }))
    await flushPromises()
    expect(w.find('.cp-value').text()).toBe('Orders hook')
    w.unmount()
  })
})

// After a selection the trigger must keep showing the chosen name through the list
// reload it triggers — the selected id is briefly absent from the freshly loading
// `items`, and without the label cache the trigger would flash the placeholder.
describe('ComponentPicker label continuity', () => {
  beforeEach(() => { ;(globalThis as any).__props__ = { config: {} } })

  it('holds the selected label across a post-select reload, never the placeholder', async () => {
    ;(globalThis as any).__api__ = {
      '/api/v1/threads': { items: [
        { id: 'a', label: 'Alpha', icon: 'tabler:box' },
        { id: 'b', label: 'Beta', icon: 'tabler:box' },
      ] },
    }
    const w = mountWith({
      deleteEndpoint: '/api/v1/things',
      meta: JSON.stringify({ thread_class: 'kickside.things', title: 'Thing' }),
    })
    await w.find('.cp').trigger('click')
    await flushPromises()

    // Select Alpha, then reopen to reach the list controls.
    const rows = w.findAll('.cp-row')
    await rows[0].find('.cp-row-main').trigger('click')
    expect(w.find('.cp-value').text()).toBe('Alpha')
    await w.find('.cp').trigger('click')
    await flushPromises()

    // The reload the picker runs next returns an empty/slow list (Alpha not yet in it).
    ;(globalThis as any).__api__ = { '/api/v1/threads': { items: [] } }

    // Deleting Beta drives a real list reload while Alpha stays selected.
    const betaRow = w.findAll('.cp-row')[1]
    await betaRow.find('[data-test="cp-del"]').trigger('click')
    await betaRow.find('[data-test="cp-del-confirm"]').trigger('click')
    // Sample the trigger across the reload: it must always read Alpha, never the prompt.
    expect(w.find('.cp-value').text()).toBe('Alpha')
    expect(w.find('.cp-value').classes()).not.toContain('cp-ph')
    await flushPromises()
    expect(w.find('.cp-value').text()).toBe('Alpha')
    expect(w.find('.cp-value').classes()).not.toContain('cp-ph')
    w.unmount()
  })

  it('shows the placeholder only when there is genuinely no selection', async () => {
    ;(globalThis as any).__api__ = { '/api/v1/threads': { items: [] } }
    const w = mountWith({ meta: JSON.stringify({ thread_class: 'kickside.things', title: 'Thing' }) })
    await flushPromises()
    const v = w.find('.cp-value')
    expect(v.text()).toBe('Select a thing…')
    expect(v.classes()).toContain('cp-ph')
    w.unmount()
  })

  it('shows the created name immediately on inline create, never flashing the placeholder', async () => {
    ;(globalThis as any).__api__ = { '/api/v1/threads': { items: [] } }
    if (!customElements.get('x-create-thing')) {
      customElements.define('x-create-thing', class extends HTMLElement {})
    }
    const w = mountWith({
      meta: JSON.stringify({
        thread_class: 'kickside.things',
        title: 'Thing',
        component: { create_ui: { tag_name: 'x-create-thing', title: 'Create thing' } },
      }),
    })
    await w.find('.cp').trigger('click')
    await flushPromises()
    await w.find('.cp-create-btn').trigger('click')
    await flushPromises()
    // The create view reports a new instance; the reload it triggers returns an empty
    // list (the fresh row has not landed), yet the trigger must show the created name.
    w.element.querySelector('x-create-thing')?.dispatchEvent(
      new CustomEvent('created', { detail: { thread_id: 't-new', title: 'Fresh thing' } }),
    )
    await flushPromises()
    const v = w.find('.cp-value')
    expect(v.text()).toBe('Fresh thing')
    expect(v.classes()).not.toContain('cp-ph')
    w.unmount()
  })
})

// The picker is generic: it only offers per-row deletion when the field config (here
// via `delete-endpoint`) declares an endpoint. It knows nothing about what it deletes.
describe('ComponentPicker delete affordance', () => {
  beforeEach(() => {
    ;(globalThis as any).__props__ = { config: {} }
    ;(globalThis as any).__api__ = { '/api/v1/threads': { items: [{ id: 'wh-1', label: 'Orders', icon: 'tabler:webhook' }] } }
    ;(api.delete as any).mockClear()
  })

  it('shows no delete control without a delete endpoint', async () => {
    const w = mountWith({ meta: JSON.stringify({ thread_class: 'kickside.webhooks', title: 'Webhook' }) })
    await w.find('.cp').trigger('click')
    await flushPromises()
    expect(w.find('[data-test="cp-del"]').exists()).toBe(false)
    w.unmount()
  })

  it('deletes a row through the declared endpoint after confirm', async () => {
    const w = mountWith({
      deleteEndpoint: '/api/v1/webhooks',
      meta: JSON.stringify({ thread_class: 'kickside.webhooks', title: 'Webhook' }),
    })
    await w.find('.cp').trigger('click')
    await flushPromises()
    await w.find('[data-test="cp-del"]').trigger('click')
    await w.find('[data-test="cp-del-confirm"]').trigger('click')
    await flushPromises()
    expect((api.delete as any).mock.calls.some((c: unknown[]) => String(c[0]).includes('/api/v1/webhooks/wh-1'))).toBe(true)
    expect(w.find('[data-test="cp-del-err"]').exists()).toBe(false)
    w.unmount()
  })

  it('surfaces the gate message and keeps the row when delete is refused', async () => {
    ;(globalThis as any).__api__['/api/v1/webhooks/wh-1'] = { success: false, error: 'Webhook is in use by 2 data flows. Remove those first.' }
    const w = mountWith({
      deleteEndpoint: '/api/v1/webhooks',
      meta: JSON.stringify({ thread_class: 'kickside.webhooks', title: 'Webhook' }),
    })
    await w.find('.cp').trigger('click')
    await flushPromises()
    await w.find('[data-test="cp-del"]').trigger('click')
    await w.find('[data-test="cp-del-confirm"]').trigger('click')
    await flushPromises()
    expect(w.find('[data-test="cp-del-err"]').text()).toContain('in use by 2')
    expect(w.find('.cp-row').exists()).toBe(true)
    w.unmount()
  })

  it('reads the delete endpoint from the meta object too', async () => {
    const w = mountWith({ meta: JSON.stringify({ thread_class: 'kickside.webhooks', title: 'Webhook', delete_endpoint: '/api/v1/webhooks' }) })
    await w.find('.cp').trigger('click')
    await flushPromises()
    expect(w.find('[data-test="cp-del"]').exists()).toBe(true)
    w.unmount()
  })
})


it('selects and restores an exact catalog reference through the schema-declared value field', async () => {
  const emit = vi.fn()
  const events = vi.spyOn(wcVue, 'useEvents').mockReturnValue(emit)
  const ref = { kind: 'flow', id: 'wf-42', version: 3 }
  Object.assign(globalThis, { __api__: { '/api/v1/workflows/published': { items: [{ id: 'wf-42', label: 'My Workflow', flow_ref: ref }] } } })
  const schema = JSON.stringify({ properties: { flow_ref: { title: 'Workflow', picker: 'wc-component-picker', source: '/api/v1/workflows/published', value_field: 'flow_ref' } } })
  const wrapper = mountWith({ schema, config: JSON.stringify({ flow_ref: ref }) })
  await flushPromises()
  expect(wrapper.get('.cp-value').text()).toBe('My Workflow')
  await wrapper.get('.cp').trigger('click')
  await flushPromises()
  await wrapper.get('.cp-row-main').trigger('click')
  expect(emit).toHaveBeenCalledWith('config-changed', { flow_ref: ref })
  wrapper.unmount()
  events.mockRestore()
})


it('follows a catalog offset through an empty page before restoring the selection', async () => {
  const request = vi.spyOn(api, 'get')
    .mockResolvedValueOnce({data: {success: true, items: [], next_offset: 25}} as never)
    .mockResolvedValueOnce({data: {success: true, items: [{id: 'wf-later', label: 'Later Flow',
      flow_ref: {kind: 'flow', id: 'wf-later', version: 1}}]}} as never)
  const schema = JSON.stringify({properties: {flow_ref: {title: 'Workflow', picker: 'wc-component-picker',
    source: '/api/v1/workflows/published', value_field: 'flow_ref'}}})
  const wrapper = mountWith({schema, config: JSON.stringify({flow_ref: {kind: 'flow', id: 'wf-later', version: 1}})})
  await flushPromises()
  expect(wrapper.get('.cp-value').text()).toBe('Later Flow')
  expect(request).toHaveBeenCalledWith('/api/v1/workflows/published?offset=25')
  wrapper.unmount()
  request.mockRestore()
})

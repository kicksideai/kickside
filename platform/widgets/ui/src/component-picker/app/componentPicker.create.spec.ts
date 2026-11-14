import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import ComponentPicker from './ComponentPicker.vue'

// The generic create-path: a kind whose binding declares meta.component.create.view
// gets a "+ Create new <noun>" affordance (empty state + list footer). The picker
// reads the create view purely from the class via the create-view resolver — no
// per-kind code — mounts it, and on `created` refreshes + auto-selects the instance.
// A kind WITHOUT a create view shows no affordance (no regression).

// A stand-in for the declared create view: WcMount mounts a registered custom
// element, so a bare element suffices and can dispatch the `created` contract event.
if (!customElements.get('fake-create')) {
  customElements.define('fake-create', class extends HTMLElement {})
}

function mountWith(props: Record<string, unknown>) {
  ;(globalThis as any).__props__ = props
  return mount(ComponentPicker)
}

async function openAndSettle(w: ReturnType<typeof mount>) {
  await w.find('.cp').trigger('click')
  await flushPromises() // list load
  await flushPromises() // create-view resolve (fired after load)
  await nextTick()
}

describe('ComponentPicker create-path (generic)', () => {
  beforeEach(() => {
    ;(globalThis as any).__props__ = { config: {} }
    ;(globalThis as any).__api__ = {}
  })

  it('offers "+ Create new <noun>" when the class declares a create view', async () => {
    ;(globalThis as any).__api__ = {
      '/component-kinds/create-view': { success: true, create_view: { tag_name: 'fake-create', title: 'Widget' } },
      '/threads': { success: true, items: [] },
    }
    const w = mountWith({ meta: JSON.stringify({ thread_class: 'fake.kind', title: 'Widget' }) })
    await openAndSettle(w)

    const btn = w.find('[data-test="cp-create"]')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toContain('Create new widget')
    w.unmount()
  })

  it('shows the footer create affordance alongside a populated list', async () => {
    ;(globalThis as any).__api__ = {
      '/component-kinds/create-view': { success: true, create_view: { tag_name: 'fake-create', title: 'Widget' } },
      '/threads': { success: true, items: [{ id: 'a', label: 'Alpha', icon: 'tabler:box' }] },
    }
    const w = mountWith({ meta: JSON.stringify({ thread_class: 'fake.kind', title: 'Widget' }) })
    await openAndSettle(w)

    expect(w.findAll('.cp-row').length).toBe(1)
    expect(w.find('[data-test="cp-create-foot"]').exists()).toBe(true)
    w.unmount()
  })

  it('mounts the declared view and auto-selects the new instance on created', async () => {
    ;(globalThis as any).__api__ = {
      '/component-kinds/create-view': { success: true, create_view: { tag_name: 'fake-create', title: 'Widget' } },
      '/threads': { success: true, items: [] },
    }
    const w = mountWith({ meta: JSON.stringify({ thread_class: 'fake.kind', title: 'Widget' }) })
    await openAndSettle(w)

    await w.find('[data-test="cp-create"]').trigger('click')
    await flushPromises()
    await nextTick()

    const el = w.element.querySelector('fake-create') as HTMLElement
    expect(el).toBeTruthy()
    el.dispatchEvent(new CustomEvent('created', { detail: { id: 'new-1' } }))
    await flushPromises()
    await nextTick()

    // Auto-selected: the control shows the new instance. With no title on the created
    // event and no matching row yet, it names it generically rather than its raw id.
    expect(w.find('.cp-value').text()).toBe('Untitled widget')
    w.unmount()
  })

  it('shows no create affordance for a kind without a create view (no regression)', async () => {
    ;(globalThis as any).__api__ = {
      '/component-kinds/create-view': { success: true, create_view: null },
      '/threads': { success: true, items: [] },
    }
    const w = mountWith({ meta: JSON.stringify({ thread_class: 'plain.kind', title: 'Plain' }) })
    await openAndSettle(w)

    expect(w.find('[data-test="cp-create"]').exists()).toBe(false)
    expect(w.find('[data-test="cp-create-foot"]').exists()).toBe(false)
    w.unmount()
  })
})

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ComponentView from './ComponentView.vue'

describe('component overview', () => {
  it('shows readable details without exposing internal ids or object payloads', () => {
    const view = mount(ComponentView, { props: { entry: {
      id: 'internal-component-id', type: 'kickside.example_kind', name: 'Northwind delivery', status: 'active',
      meta: { description: 'Fictional delivery plan', execution: { token: 'private-object-marker' } },
    } } })
    expect(view.text()).toContain('Fictional delivery plan')
    expect(view.text()).toContain('EXAMPLE KIND')
    expect(view.text()).not.toContain('internal-component-id')
    expect(view.text()).not.toContain('private-object-marker')
    view.unmount()
  })
})

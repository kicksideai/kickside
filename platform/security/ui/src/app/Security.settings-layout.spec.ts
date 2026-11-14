// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import InputText from 'primevue/inputtext'

vi.mock('@wippy-fe/proxy', () => ({ api: { get: vi.fn(async () => ({ data: { success: true, scopes: [], policies: [], delegations: [] } })) }, host: {} }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useHostVisibilityRefresh: (load: () => unknown) => { void load() } }))
vi.mock('@widgets/app/WcMount.vue', () => ({ default: { template: '<div />' } }))
import Security from './Security.vue'

describe('Security settings surfaces', () => {
  it('uses the shared rail, state and form controls while retaining a role draft across tabs', async () => {
    const view = mount(Security)
    await flushPromises()
    expect(view.find('.kx-shell .kx-rail').exists()).toBe(true)
    expect(view.get('.kx-empty-title').text()).toBe('Roles')
    await view.get('.kx-empty button').trigger('click')
    const name = view.findAllComponents(InputText).find(input => input.attributes('placeholder') === 'Reviewer')!
    await name.setValue('Reviewers')
    await view.get('[role=tab][aria-controls$="_tabpanel_delegations"]').trigger('click')
    await flushPromises()
    expect(view.get('.ks-runas .kx-empty-title').text()).toBe('No active run-as permissions')
    await view.get('[role="tab"][data-pc-name="tab"]').trigger('click')
    await flushPromises()
    expect(name.props('modelValue')).toBe('Reviewers')
    view.unmount()
  })
})

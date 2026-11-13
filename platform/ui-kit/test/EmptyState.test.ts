// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import EmptyState from '../package/EmptyState.vue'

vi.mock('@iconify/vue', () => ({ Icon: { template: '<svg />' } }))

it('offers an accessible optional action and preserves a rich hint', async () => {
  const view = mount(EmptyState, {
    props: { icon: 'tabler:users', title: 'No users yet', cta: 'Create user' },
    slots: { hint: 'Invite someone to <b>your workspace</b>.' },
    global: { plugins: [PrimeVue] },
  })
  expect(view.get('.kx-empty-sub b').text()).toBe('your workspace')
  await view.get('button').trigger('click')
  expect(view.emitted('cta')).toEqual([[]])
  await view.setProps({ cta: undefined })
  expect(view.find('button').exists()).toBe(false)
  view.unmount()
})

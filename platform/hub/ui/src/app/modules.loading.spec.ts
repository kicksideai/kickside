// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PrimeVue from 'primevue/config'
import Modules from './modules.vue'

const fixture = vi.hoisted(() => ({
  get: vi.fn(), authStatus: vi.fn(), listDependencies: vi.fn(), fetchAllByKeyword: vi.fn(),
}))

vi.mock('@iconify/vue', () => ({ Icon: { template: '<svg />' } }))
vi.mock('@wippy-fe/proxy', () => ({
  api: { get: fixture.get }, host: {}, loadByTagName: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('@wippy-fe/webcomponent-vue', async () => {
  const { onMounted } = await import('vue')
  return { useHostVisibilityRefresh: (refresh: () => Promise<void>) => onMounted(refresh) }
})
vi.mock('../keeper-hub.ts', async importOriginal => ({
  ...await importOriginal<typeof import('../keeper-hub.ts')>(), keeperHub: () => fixture,
}))
vi.mock('./InstallDialog.vue', () => ({ default: { template: '<div />' } }))
vi.mock('./ModuleDetailView.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@widgets/app/AnchoredPanel.vue', () => ({ default: { template: '<div />' } }))

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(done => { resolve = done })
  return { promise, resolve }
}

function render() {
  return mount(Modules, { global: { plugins: [[PrimeVue, { unstyled: true }]] } })
}

describe('Modules initial loading', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fixture.authStatus.mockResolvedValue({ authenticated: false })
    fixture.listDependencies.mockResolvedValue({ dependencies: [], modules: [] })
    fixture.fetchAllByKeyword.mockResolvedValue([])
  })

  it('keeps a loader through account, Hub and inventory requests', async () => {
    const account = deferred<unknown>()
    const auth = deferred<unknown>()
    const dependencies = deferred<unknown>()
    const catalog = deferred<unknown>()
    fixture.get.mockReturnValue(account.promise)
    fixture.authStatus.mockReturnValue(auth.promise)
    fixture.listDependencies.mockReturnValue(dependencies.promise)
    fixture.fetchAllByKeyword.mockReturnValue(catalog.promise)
    const wrapper = render()
    const expectLoading = () => {
      expect(wrapper.get('[role="status"]').text()).toBe('Loading modules…')
      expect(wrapper.text()).not.toContain('No modules tagged')
    }

    expectLoading()
    account.resolve({ data: { success: true, security: { is_admin: true } } })
    await flushPromises()
    expectLoading()
    auth.resolve({ authenticated: false })
    await flushPromises()
    expectLoading()
    dependencies.resolve({ dependencies: [{ id: 'app:files', component: 'kickside/uploads',
      version: '1.0.0', installed: true }], modules: [] })
    await flushPromises()
    expectLoading()
    catalog.resolve([])
    await flushPromises()
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('kickside/uploads')
    wrapper.unmount()
  })

  it('shows an empty catalog only after the initial requests finish', async () => {
    fixture.get.mockResolvedValue({ data: { success: true, security: { is_admin: true } } })
    const wrapper = render()
    expect(wrapper.text()).not.toContain('No modules tagged')
    await flushPromises()
    expect(wrapper.text()).toContain('No modules tagged')
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('replaces loading with the access message for a non-administrator', async () => {
    fixture.get.mockResolvedValue({ data: { success: true, security: { is_admin: false } } })
    const wrapper = render()
    await flushPromises()
    expect(wrapper.text()).toContain('Admins only')
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(fixture.listDependencies).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('replaces loading with the catalog error when that request fails', async () => {
    fixture.get.mockResolvedValue({ data: { success: true, security: { is_admin: true } } })
    fixture.fetchAllByKeyword.mockRejectedValue(new Error('Catalog unavailable'))
    const wrapper = render()
    await flushPromises()
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Catalog unavailable')
    expect(wrapper.text()).not.toContain('No modules tagged')
    wrapper.unmount()
  })
})

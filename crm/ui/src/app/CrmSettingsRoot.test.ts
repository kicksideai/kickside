// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'

const propsRef = ref<Record<string, unknown>>({})
const emit = vi.fn()
const bootstrap = vi.fn()

vi.mock('@wippy-fe/webcomponent-vue', () => ({ useProps: () => propsRef, useEvents: () => emit }))
vi.mock('@wippy-fe/proxy', () => ({ api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }, host: { toast: vi.fn(), confirm: vi.fn() }, loadByTagName: vi.fn() }))
vi.mock('../crm-api', () => ({ bootstrap: (...args: unknown[]) => bootstrap(...args), crmErrorMessage: (_error: unknown, fallback: string) => fallback }))
vi.mock('@iconify/vue', () => ({ Icon: { props: ['icon'], template: '<i :data-icon="icon" />' } }))

const CrmSettingsRoot = (await import('./CrmSettingsRoot.vue')).default
const CrmSettingsStub = defineComponent({ name: 'CrmSettings', props: ['crmId', 'initial'], template: '<div data-test="model" />' })

describe('CRM settings root', () => {
  beforeEach(() => {
    propsRef.value = {}
    emit.mockReset()
    bootstrap.mockReset()
  })

  it('mounts the CRM data-model administration surface directly', async () => {
    bootstrap.mockResolvedValue({ success: true, crm_id: 'crm-9', workspace_label: 'GTM CRM', can_write: true, objects: [], attributes: [], views: [], pipelines: [] })
    const wrapper = mount(CrmSettingsRoot, { global: { stubs: { CrmSettings: CrmSettingsStub } } })
    await flushPromises()
    expect(wrapper.find('[data-test="model"]').exists()).toBe(true)
    expect(wrapper.find('nav').exists()).toBe(false)
  })

  it('shows the normal unprovisioned state before a workspace exists', async () => {
    bootstrap.mockResolvedValueOnce({ success: true, provisioned: false, can_create: false })
    const wrapper = mount(CrmSettingsRoot, { global: { stubs: { CrmSettings: CrmSettingsStub } } })
    await flushPromises()
    expect(wrapper.text()).toContain('No CRM workspace has been created yet.')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="model"]').exists()).toBe(false)
  })
})

// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'

const getSchema = vi.fn()
const applySchema = vi.fn()
const bootstrap = vi.fn()

vi.mock('../crm-api', () => ({
  bootstrap: (...args: unknown[]) => bootstrap(...args),
  getSchema: (...args: unknown[]) => getSchema(...args),
  applySchema: (...args: unknown[]) => applySchema(...args),
  readSettings: vi.fn().mockResolvedValue({}),
  writeSetting: vi.fn(),
  exportConfig: vi.fn(),
  importConfig: vi.fn(),
  crmErrorMessage: (_error: unknown, fallback: string) => fallback,
}))
vi.mock('@wippy-fe/proxy', () => ({ host: { toast: vi.fn(), confirm: vi.fn() } }))
vi.mock('@iconify/vue', () => ({ Icon: { props: ['icon'], template: '<i :data-icon="icon" />' } }))

const CrmSettings = (await import('./CrmSettings.vue')).default
const ObjectDialog = defineComponent({
  emits: ['save', 'close'],
  template: '<button data-test="save-object" @click="$emit(\'save\', { label: \'Tickets\', type: \'ticket\', icon: \'tabler:ticket\', titleLabel: \'Subject\' })">Save object</button>',
})

describe('CRM full-state schema editor', () => {
  beforeEach(() => {
    getSchema.mockReset()
    applySchema.mockReset()
    bootstrap.mockReset()
    bootstrap.mockResolvedValue({ workspace_label: 'GTM CRM' })
    const declaration = {
      objects: [{ type: 'company', label: 'Companies' }],
      attributes: [{ object_type: 'company', attr: 'display_name', data_type: 'text', label: 'Display name', config: { ui: { role: 'title' } } }],
      pipelines: [{ collection_id: 'companies', object_type: 'company', label: 'Companies', stages: [{ stage_id: 'active', label: 'Active' }] }],
      views: [{ view_id: 'company_all', object_type: 'company', name: 'All companies', layout: 'table', spec: { columns: ['display_name'] } }],
    }
    getSchema.mockResolvedValue({ revision: '12', declaration })
    applySchema.mockImplementation((_crmId: string, _revision: string, next: unknown) => Promise.resolve({ revision: '13', declaration: next }))
  })

  it('submits the complete desired declaration with optimistic revision control', async () => {
    const wrapper = mount(CrmSettings, {
      props: { crmId: 'crm-1', canWrite: true },
      global: { stubs: { SettingsObjectDialog: ObjectDialog, SettingsFieldDialog: true, SettingsPipelineDialog: true } },
    })
    await flushPromises()
    await wrapper.findAll('button').find((button) => button.text().includes('New object'))!.trigger('click')
    await wrapper.get('[data-test="save-object"]').trigger('click')
    await flushPromises()

    expect(applySchema).toHaveBeenCalledWith('crm-1', '12', expect.objectContaining({
      objects: expect.arrayContaining([expect.objectContaining({ type: 'company' }), expect.objectContaining({ type: 'ticket', label: 'Tickets' })]),
      attributes: expect.arrayContaining([
        expect.objectContaining({ object_type: 'company', attr: 'display_name' }),
        expect.objectContaining({ object_type: 'ticket', attr: 'subject', config: expect.objectContaining({ ui: expect.objectContaining({ role: 'title' }) }) }),
      ]),
      pipelines: expect.arrayContaining([expect.objectContaining({ collection_id: 'companies' })]),
      views: expect.arrayContaining([expect.objectContaining({ view_id: 'company_all' })]),
    }))
  })
})

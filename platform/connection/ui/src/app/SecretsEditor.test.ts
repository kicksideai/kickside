// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import {expect, it, vi, beforeEach} from 'vitest'
import {mount, flushPromises} from '@vue/test-utils'
import {api} from '@wippy-fe/proxy'
import {PrimeVuePlugin} from '@wippy-fe/theme/primevue-plugin'
import SecretsEditor from './SecretsEditor.vue'

vi.mock('@wippy-fe/webcomponent-vue', () => ({useProps: () => ({value: {}}), useEvents: () => vi.fn()}))
vi.mock('@wippy-fe/proxy', () => ({api: {get: vi.fn(), put: vi.fn()}}))
const options = {props: {connection: {component_id: 'example-connection', name: 'Example'}}, global: {plugins: [PrimeVuePlugin], stubs: {
  Dialog: {template: '<section><slot /><slot name="footer" /></section>'},
  Button: {props: ['label', 'disabled'], template: '<button :disabled="disabled">{{label}}</button>'},
}}}
beforeEach(() => {
  vi.mocked(api.get).mockResolvedValue({data: {success: true, context_revision: 4,
    secret_fields: [{path: ['api_key'], type: 'string'}], secrets: {api_key: {set: true}}}} as never)
  vi.mocked(api.put).mockResolvedValue({data: {success: true}} as never)
  vi.clearAllMocks()
})
it('shows presence and leaves replacement inputs empty', async () => {
  const wrapper = mount(SecretsEditor, options)
  await flushPromises()
  expect(wrapper.text()).toContain('Set')
  await wrapper.get('input[value="replace"]').setValue()
  expect((wrapper.get('input[type="password"]').element as HTMLInputElement).value).toBe('')
  expect(wrapper.html()).not.toContain('stored-secret-sentinel')
  wrapper.unmount()
})
it('sends only an explicit clear and the original revision', async () => {
  const saved = vi.fn()
  const wrapper = mount(SecretsEditor, {...options, props: {...options.props, onSaved: saved}})
  await flushPromises()
  await wrapper.get('input[value="clear"]').setValue()
  await wrapper.get('button[data-action="save-secrets"]').trigger('click')
  await flushPromises()
  expect(api.put).toHaveBeenCalledWith('/api/v1/connections/example-connection', {
    secrets: [{path: ['api_key'], clear: true}], expected_revision: 4,
  })
  expect(saved).toHaveBeenCalledTimes(1)
  wrapper.unmount()
})
it('sends a replacement as a new write and clears the input after saving', async () => {
  const wrapper = mount(SecretsEditor, options)
  await flushPromises()
  await wrapper.get('input[value="replace"]').setValue()
  await wrapper.get('input[type="password"]').setValue('replacement-sentinel')
  await wrapper.get('button[data-action="save-secrets"]').trigger('click')
  await flushPromises()
  expect(api.put).toHaveBeenCalledWith('/api/v1/connections/example-connection', {
    secrets: [{path: ['api_key'], value: 'replacement-sentinel'}], expected_revision: 4,
  })
  expect((wrapper.get('input[type="password"]').element as HTMLInputElement).value).toBe('')
  wrapper.unmount()
})
it('refuses malformed presence without rendering the returned value', async () => {
  vi.mocked(api.get).mockResolvedValue({data: {success: true, context_revision: 4,
    secret_fields: [{path: ['api_key'], type: 'string'}], secrets: {api_key: 'stored-secret-sentinel'}}} as never)
  const wrapper = mount(SecretsEditor, options)
  await flushPromises()
  expect(wrapper.text()).toContain('Credential presence is unavailable')
  expect(wrapper.html()).not.toContain('stored-secret-sentinel')
  wrapper.unmount()
})

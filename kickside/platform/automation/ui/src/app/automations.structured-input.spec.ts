import { beforeEach, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import Automations from './automations.vue'

beforeEach(() => {
  Object.assign(globalThis, {
    __props__: { config: {} },
    __realtime__: { on: vi.fn(() => vi.fn()) },
    __api__: {
      '/automations/types': { success: true, types: [{ id: 'fixture:task', title: 'Scheduled task', inputs: {
        properties: { schedule: { type: 'object', title: 'Schedule' }, targets: { type: 'array', title: 'Targets' } },
        required: ['schedule'],
      } }] },
      '/api/v1/automations': { success: true, automations: [] },
    },
  })
  vi.mocked(api.post).mockClear()
})

async function form() {
  const w = mount(Automations)
  await flushPromises()
  await w.findAll('button').find(b => /add automation/i.test(b.text()))!.trigger('click')
  await w.get('.kx-cat-card').trigger('click')
  await flushPromises()
  return w
}

it('submits declared objects and arrays as JSON values', async () => {
  const w = await form()
  const fields = w.findAll('.kx-field')
  await fields[0].get('input,textarea').setValue('{"type":"interval","expression":"1h"}')
  await fields[1].get('input,textarea').setValue('[{"kind":"agent","agent_id":"northwind"}]')
  await w.get('[data-testid="automations-install-create"]').trigger('click')
  await flushPromises()
  expect(api.post).toHaveBeenCalledWith('/api/v1/automations', {
    type: 'fixture:task', parent_id: undefined,
    input: { schedule: { type: 'interval', expression: '1h' }, targets: [{ kind: 'agent', agent_id: 'northwind' }] },
  })
  w.unmount()
})

it.each(['{bad', '[]', 'null', '"string"'])('keeps invalid object input %s editable and prevents submission', async value => {
  const w = await form()
  await w.get('.kx-field input,.kx-field textarea').setValue(value)
  await w.get('[data-testid="automations-install-create"]').trigger('click')
  await flushPromises()
  expect(api.post).not.toHaveBeenCalled()
  expect(w.text()).toContain('Schedule must be a JSON object.')
  expect((w.get('.kx-field input,.kx-field textarea').element as HTMLInputElement).value).toBe(value)
  w.unmount()
})

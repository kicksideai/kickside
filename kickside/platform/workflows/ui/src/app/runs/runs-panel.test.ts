// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { RunRow } from '../api/api'

vi.mock('@iconify/vue', () => ({ Icon: { template: '<span aria-hidden="true" />' } }))

const RunsPanel = (await import('./RunsPanel.vue')).default

const DialogStub = { template: '<div class="dialog-stub"><slot /></div>' }

function run(over: Partial<RunRow>): RunRow {
  return { run_id: '0190a3c1-run', flow_ref: { kind: 'flow', id: 'w1', version: 2 }, status: 'completed',
    started_at: '2026-10-06T12:00:00Z', ...over } as RunRow
}

function mountPanel(rows: RunRow[]) {
  return mount(RunsPanel, { props: { rows, loading: false, error: '' }, global: { stubs: { Dialog: DialogStub } } })
}

describe('RunsPanel', () => {
  it('lists a failed run with its recorded cause', () => {
    const wrapper = mountPanel([run({ status: 'failed',
      error: 'Node [0190a3c1-7e1f-7a00-8000-000000000001] failed: {"code":"NORTHWIND_STOCK_MISSING","message":"Northwind stock is missing"}' })])
    const cause = wrapper.get('.wf-runs-row .wf-runs-cause')
    expect(cause.text()).toBe('Northwind stock is missing')
    expect(cause.attributes('title')).toBe('Northwind stock is missing')
  })

  it('lists a completed run without a cause line', () => {
    const wrapper = mountPanel([run({ status: 'completed' })])
    expect(wrapper.find('.wf-runs-row').exists()).toBe(true)
    expect(wrapper.find('.wf-runs-cause').exists()).toBe(false)
  })
})

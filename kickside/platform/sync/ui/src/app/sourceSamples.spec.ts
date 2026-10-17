import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import { useSyncForm, type SyncForm } from './useSyncForm'

function form() {
  let value: SyncForm
  const wrapper = mount(defineComponent({ setup() {
    value = useSyncForm({ managed: false })
    return () => h('div')
  } }))
  return { wrapper, value: value! }
}
function select(value: SyncForm, thread: string, valid = true) {
  value.onTriggerChange({ spec: { v: 2, source: 'fixture:source', config: { thread_id: thread }, backfill: 'all' }, valid })
}

describe('Sync source samples', () => {
  beforeEach(() => { vi.mocked(api.post).mockClear() })

  it('requests the selected source and forwards its real samples and instance schema', async () => {
    const samples = [{ customer: { name: 'Sample record' } }]
    const schema = { type: 'object', properties: { customer: { type: 'object' } } }
    vi.mocked(api.post).mockResolvedValueOnce({ data: { success: true, samples, output_schema: schema } } as any)
    const { value } = form()
    select(value, 'selected')
    await flushPromises()
    expect(api.post).toHaveBeenCalledWith('/api/v1/automations/source-samples', {
      source: 'fixture:source', config: { thread_id: 'selected' }, limit: 1,
    })
    expect(JSON.parse(value.assistSamples.value)).toEqual(samples)
    expect(JSON.parse(value.assistSourceSchema.value)).toEqual(schema)
    select(value, 'selected', false)
    await flushPromises()
    expect(JSON.parse(value.assistSamples.value)).toEqual([])
  })

  it('does not read again when only the schedule changes', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { success: true, samples: [] } } as any)
    const { value } = form()
    select(value, 'selected')
    await flushPromises()
    value.onTriggerChange({ spec: { v: 2, source: 'fixture:source', config: { thread_id: 'selected' },
      schedule: { type: 'interval', expression: '2h' }, backfill: 'all' }, valid: true })
    await flushPromises()
    expect(api.post).toHaveBeenCalledTimes(1)
  })

  it('retains empty samples and exposes a failed read', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Source read denied'))
    const { value } = form()
    select(value, 'selected')
    await flushPromises()
    expect(JSON.parse(value.assistSamples.value)).toEqual([])
    expect(value.sampleError.value).toBe('Source read denied')
  })

  it('discards a response for a previously selected source', async () => {
    let resolveFirst!: (answer: any) => void
    vi.mocked(api.post).mockImplementationOnce(() => new Promise(resolve => { resolveFirst = resolve }))
    vi.mocked(api.post).mockResolvedValueOnce({ data: { success: true, samples: [{ title: 'Second source' }] } } as any)
    const { value } = form()
    select(value, 'first')
    await flushPromises()
    select(value, 'second')
    await flushPromises()
    resolveFirst({ data: { success: true, samples: [{ title: 'First source' }] } })
    await flushPromises()
    expect(JSON.parse(value.assistSamples.value)).toEqual([{ title: 'Second source' }])
  })
})

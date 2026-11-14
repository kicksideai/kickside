// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import Onboard from './Onboard.vue'

const harness = globalThis as unknown as {
  __realtimeHandlers__: unknown[]
  __emitRealtime__: (event: unknown) => void
}
interface Read {
  resolve: (value: { data: { upload: { status: string } } }) => void
  reject: (cause: Error) => void
}
let reads: Read[]
let active: number
let maxActive: number

function invalidate() {
  harness.__emitRealtime__({ event: 'component.meta.changed', component_id: 'uploads-owner', meta: { pending_count: 1 } })
}
async function drop(view: ReturnType<typeof mount>, count: number) {
  await view.get('.kn-drop').trigger('drop', { dataTransfer: {
    files: Array.from({ length: count }, (_, i) => new File(['document'], `file-${i}.txt`, { type: 'text/plain' })),
  } })
  await flushPromises()
}
async function finishReads() {
  for (let wave = 0; reads.length; wave++) {
    expect(wave).toBeLessThan(100)
    for (const read of reads.splice(0)) read.resolve({ data: { upload: { status: 'completed' } } })
    await flushPromises()
  }
}

describe('Knowledge onboarding pending status reads', () => {
  beforeEach(() => {
    harness.__realtimeHandlers__ = []
    reads = []
    active = maxActive = 0
    let uploaded = 0
    vi.mocked(api.post).mockReset().mockImplementation(async () => ({ data: {
      success: true, uuid: `upload-${++uploaded}`, component_id: 'uploads-owner',
    } }))
    vi.mocked(api.get).mockReset().mockImplementation(() => {
      active++
      maxActive = Math.max(maxActive, active)
      return new Promise<Awaited<ReturnType<typeof api.get>>>((resolve, reject) => {
        reads.push({ resolve, reject })
      }).finally(() => { active-- })
    })
  })

  it('bounds active reads and coalesces burst invalidations for fifty processing files', async () => {
    const view = mount(Onboard)
    await drop(view, 50)
    expect(active).toBeGreaterThan(0)
    expect(active).toBeLessThanOrEqual(4)
    for (let i = 0; i < 20; i++) invalidate()
    await flushPromises()
    expect(api.get).toHaveBeenCalledTimes(4)
    await finishReads()
    expect(maxActive).toBeLessThanOrEqual(4)
    expect(api.get).toHaveBeenCalledTimes(50)
    expect(view.findAll('.kn-file.ready')).toHaveLength(50)
  })

  it('reads the final state when an invalidation arrives during an older status request', async () => {
    const view = mount(Onboard)
    await drop(view, 1)
    invalidate()
    reads.shift()!.resolve({ data: { upload: { status: 'processing' } } })
    await flushPromises()
    expect(api.get).toHaveBeenCalledTimes(2)
    await finishReads()
    expect(view.findAll('.kn-file.ready')).toHaveLength(1)
  })

  it('keeps failures per file and admits new work after the failed pass', async () => {
    const view = mount(Onboard)
    await drop(view, 3)
    reads.shift()!.reject(new Error('status storage unavailable'))
    await finishReads()
    expect(view.findAll('.kn-file.error')).toHaveLength(1)
    expect(view.findAll('.kn-file.ready')).toHaveLength(2)
    expect(view.text()).toContain('status storage unavailable')
    await drop(view, 1)
    await finishReads()
    expect(view.findAll('.kn-file.ready')).toHaveLength(3)
    expect(api.get).toHaveBeenCalledTimes(4)
  })

  it('stops queued reads and unsubscribes when the wizard step unmounts', async () => {
    const view = mount(Onboard)
    await drop(view, 50)
    expect(api.get).toHaveBeenCalledTimes(4)
    invalidate()
    view.unmount()
    await finishReads()
    expect(api.get).toHaveBeenCalledTimes(4)
    expect(harness.__realtimeHandlers__).toHaveLength(0)
  })

  it('does not start a read for a file removed while waiting for a slot', async () => {
    const view = mount(Onboard)
    await drop(view, 6)
    await view.findAll('.kn-file-x')[5].trigger('click')
    await finishReads()
    expect(api.get).toHaveBeenCalledTimes(5)
    expect(view.findAll('.kn-file.ready')).toHaveLength(5)
  })
})

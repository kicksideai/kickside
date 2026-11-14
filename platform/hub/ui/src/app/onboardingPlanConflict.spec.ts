import { ref } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { keeperHub, type Api, type HubInstallPlan } from '../keeper-hub.ts'
import { useOnboardingInstallQueue } from './useOnboardingInstallQueue.ts'

const moved = { success: false, code: 'Conflict', error: 'registry moved since the plan was computed', details: { plan_version: 11, current_version: 12 } }
const conflict = (status = 409, body = moved) => ({ response: { status, data: body } })
const ready: { data: HubInstallPlan; status: number } = { data: { success: true, requirements: [], missing_requirements: [] }, status: 200 }
const projection = (current: boolean) => ({ data: { current, scope_name: 'security:group_set' }, status: 200 })

function fixture() {
  const installed = ref(new Set<string>())
  const candidates = ['acme/first', 'acme/second'].map(full_name => ({ full_name }))
  const parameters = [{ name: 'acme.second:target_db', value: 'app:db' }]
  const status = vi.fn(async () => projection(true))
  const plan = vi.fn(async (_body: unknown) => ready)
  const install = vi.fn(async (body: { component: string }) => {
    installed.value.add(body.component)
    return { data: { success: true }, status: 200 }
  })
  const api = { get: vi.fn(() => status()), post: vi.fn((url, body) => url.endsWith('/plan') ? plan(body) : install(body)) } as unknown as Api
  const error = ref('')
  const queue = useOnboardingInstallQueue({
    hub: keeperHub(api), installed, installedCount: ref(0), error,
    selectableCandidates: () => candidates.filter(item => !installed.value.has(item.full_name)),
    candidateKey: item => item.full_name!,
    candidateById: id => candidates.find(item => item.full_name === id) || null,
    queuedLabel: id => id,
    profileParameters: id => id === 'acme/second' ? parameters : undefined,
    loadInstalled: async () => {},
    apiMessage: cause => (cause as Error).message,
  })
  queue.addQueued(candidates.map(item => item.full_name))
  return { queue, status, plan, install, error, parameters, api }
}

afterEach(() => vi.useRealTimers())

describe('onboarding install projection currency', () => {
  it('waits for security before the first plan and after the preceding install', async () => {
    vi.useFakeTimers()
    const { queue, status, plan, install, error, parameters, api } = fixture()
    status.mockResolvedValueOnce(projection(false)).mockResolvedValueOnce(projection(true))
      .mockResolvedValueOnce(projection(false)).mockResolvedValueOnce(projection(false))
    const run = queue.startQueue()
    await flushPromises()
    expect(plan).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(250)
    expect(plan).toHaveBeenCalledTimes(1)
    expect(install).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(250)
    expect(plan).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(250)
    await run
    expect(queue.queueLedger.value.map(item => item.status)).toEqual(['installed', 'installed'])
    expect(queue.queue.value).toEqual([])
    expect(queue.queueCompleted.value).toBe(2)
    expect(error.value).toBe('')
    expect(plan.mock.calls.map(([body]) => body)).toEqual([
      { component: 'acme/first', run_migrations: true },
      { component: 'acme/second', run_migrations: true, parameters },
    ])
    expect(api.get).toHaveBeenCalledWith('/api/v1/security/projection')
  })

  it('reports a projection timeout without submitting the next plan', async () => {
    vi.useFakeTimers()
    const { queue, status, plan, install } = fixture()
    status.mockResolvedValueOnce(projection(true)).mockResolvedValue(projection(false))
    const run = queue.startQueue()
    await vi.advanceTimersByTimeAsync(15_000)
    await run
    expect(plan).toHaveBeenCalledTimes(1)
    expect(install).toHaveBeenCalledTimes(1)
    expect(queue.queueLedger.value[1].message).toBe('Security permissions do not become current after installation.')
    expect(queue.queue.value).toEqual(['acme/second'])
  })

  it('reports a failed status read without retrying it or requesting another plan', async () => {
    const { queue, status, plan } = fixture()
    status.mockResolvedValueOnce(projection(true)).mockRejectedValueOnce(new Error('Security status unavailable'))
    await queue.startQueue()
    expect(status).toHaveBeenCalledTimes(2)
    expect(plan).toHaveBeenCalledTimes(1)
    expect(queue.queueLedger.value[1].message).toBe('Security status unavailable')
  })

  it.each([
    conflict(),
    conflict(409, { ...moved, code: 'REQUIREMENTS_MISSING', error: 'Required settings are missing' }),
    conflict(409, { ...moved, error: 'plan inputs changed since it was computed' }),
    conflict(500),
    new Error(moved.error),
  ])('keeps planning failures visible without repeating a request: %j', async failure => {
    const { queue, plan, install } = fixture()
    plan.mockResolvedValueOnce(ready).mockRejectedValueOnce(failure)
    await queue.startQueue()
    expect(plan).toHaveBeenCalledTimes(2)
    expect(install).toHaveBeenCalledTimes(1)
    expect(queue.queueLedger.value.map(item => item.status)).toEqual(['installed', 'failed'])
    expect(queue.queue.value).toEqual(['acme/second'])
  })

  it('does not repeat a rejected install', async () => {
    const { queue, plan, install } = fixture()
    install.mockResolvedValueOnce({ data: { success: true }, status: 200 }).mockRejectedValueOnce(conflict())
    await queue.startQueue()
    expect(plan).toHaveBeenCalledTimes(2)
    expect(install).toHaveBeenCalledTimes(2)
    expect(queue.queueLedger.value[1].status).toBe('failed')
    expect(queue.queue.value).toEqual(['acme/second'])
  })
})

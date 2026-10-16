import { beforeEach, describe, expect, it, vi } from 'vitest'
import { host } from '@wippy-fe/proxy'
import { isRecord, reportHostError } from './hostError'

describe('host error boundary', () => {
  beforeEach(() => vi.clearAllMocks())

  it('validates records before reading response properties', () => {
    for (const value of [null, undefined, 'error', 401, []]) expect(isRecord(value)).toBe(false)
    expect(isRecord({ response: { status: 401 } })).toBe(true)
  })

  it('reports authentication errors with their original detail', () => {
    const error = { response: { status: 401 }, message: 'expired' }
    reportHostError(error)
    expect(host.handleError).toHaveBeenCalledWith('auth-expired', error)
  })

  it('reports other errors and safely normalizes thrown primitives', () => {
    const error = new Error('failed')
    reportHostError(error)
    expect(host.handleError).toHaveBeenLastCalledWith('other', error)
    reportHostError('failed')
    expect(host.handleError).toHaveBeenLastCalledWith('other', { message: 'failed' })
    reportHostError({ response: null })
    expect(host.handleError).toHaveBeenLastCalledWith('other', { response: null })
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'

const getMock = vi.fn()
const postMock = vi.fn()
vi.mock('@wippy-fe/proxy', () => ({ api: { get: getMock, post: postMock } }))

const { get, humanError, payloadErrorMessage, post, serverMessage } = await import('./http')

describe('workflow HTTP error boundary', () => {
  beforeEach(() => { getMock.mockReset(); postMock.mockReset() })

  it('renders canonical {code,message,details} errors by their user-facing message', () => {
    const failure = { code: 'automation_contract_invalid', message: 'This Flow no longer matches the event.', details: { field: 'record_id' } }
    expect(payloadErrorMessage(failure)).toBe('This Flow no longer matches the event.')
    expect(serverMessage({ response: { data: failure } })).toBe('This Flow no longer matches the event.')
    expect(humanError({ response: { data: failure } }, 'fallback')).toBe('This Flow no longer matches the event.')
  })

  it('unwraps a canonical error inside the response envelope without object leakage', async () => {
    const failure = { success: false, error: { code: 'input_invalid', message: 'Record id is required.', details: { field: 'record_id' } } }
    getMock.mockResolvedValueOnce({ data: failure })
    postMock.mockResolvedValueOnce({ data: failure })
    await expect(get('/state')).rejects.toThrow('Record id is required.')
    await expect(post('/apply', {})).rejects.toThrow('Record id is required.')
    expect(payloadErrorMessage(failure)).not.toContain('[object Object]')
  })

  it('keeps the stable code as the last useful fallback', () => {
    expect(payloadErrorMessage({ error: { code: 'flow_unavailable' } }, 'request failed')).toBe('flow_unavailable')
  })
})

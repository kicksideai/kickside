import { beforeEach, describe, expect, it } from 'vitest'
import { fetchWebhook, fetchWebhooks } from '../api'

const mock = () => (globalThis as any).__api_mock__.get
beforeEach(() => { mock().mockReset() })

describe('Webhook API pages', () => {
  it('continues through native cursors and resolves a selected row on a later page', async () => {
    const first = { webhook_id: 'first' }, last = { webhook_id: 'last' }
    mock().mockResolvedValueOnce({ data: { success: true, webhooks: [first], next_cursor: 'next & page' } })
      .mockResolvedValueOnce({ data: { success: true, webhooks: [last] } })
    expect(await fetchWebhook('last')).toEqual(last)
    expect(mock()).toHaveBeenNthCalledWith(2, '/api/v1/webhooks?cursor=next%20%26%20page')
  })

  it('surfaces a later page error instead of presenting a partial list', async () => {
    mock().mockResolvedValueOnce({ data: { success: true, webhooks: [], next_cursor: 'later' } })
      .mockResolvedValueOnce({ data: { success: false, error: 'page read failed' } })
    await expect(fetchWebhooks()).rejects.toThrow('page read failed')
  })
})

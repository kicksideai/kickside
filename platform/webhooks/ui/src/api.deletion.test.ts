import { expect, it, vi } from 'vitest'
import { api } from '@wippy-fe/proxy'
import { deleteWebhook } from './api'

vi.mock('@wippy-fe/proxy', () => ({api: {delete: vi.fn()}, host: {handleError: vi.fn()}}))

it.each([undefined, 'accepted-job'])('returns an accepted response with optional job handle %s', async job_id => {
  vi.mocked(api.delete).mockResolvedValue({data: {success: true, job_id}} as never)
  await expect(deleteWebhook('selected')).resolves.toEqual({job_id})
})
